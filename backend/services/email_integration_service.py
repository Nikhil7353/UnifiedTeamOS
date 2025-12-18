from __future__ import annotations

import imaplib
import smtplib
from email.message import EmailMessage as PyEmailMessage
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.parser import BytesParser
from email.policy import default
from typing import List, Optional

from sqlalchemy.orm import Session

import models


def _safe_decode_header(value: str | None) -> str:
    return (value or "").strip()


def _extract_body_preview(msg) -> str:
    try:
        if msg.is_multipart():
            for part in msg.walk():
                ctype = (part.get_content_type() or "").lower()
                disp = (part.get("Content-Disposition") or "").lower()
                if "attachment" in disp:
                    continue
                if ctype in ("text/plain", "text/html"):
                    payload = part.get_payload(decode=True)
                    if payload:
                        text = payload.decode(part.get_content_charset() or "utf-8", errors="replace")
                        text = " ".join(text.split())
                        return text[:500]
        payload = msg.get_payload(decode=True)
        if payload:
            text = payload.decode(msg.get_content_charset() or "utf-8", errors="replace")
            text = " ".join(text.split())
            return text[:500]
    except Exception:
        return ""
    return ""


class EmailIntegrationService:
    def __init__(self, db: Session):
        self.db = db

    def test_imap(self, account: models.EmailAccount) -> None:
        if not account.imap_host or not account.imap_username or not account.imap_password:
            raise ValueError("IMAP settings missing")

        imap = imaplib.IMAP4_SSL(account.imap_host, account.imap_port)
        try:
            imap.login(account.imap_username, account.imap_password)
            imap.select("INBOX")
        finally:
            try:
                imap.logout()
            except Exception:
                pass

    def test_smtp(self, account: models.EmailAccount) -> None:
        if not account.smtp_host or not account.smtp_username or not account.smtp_password:
            raise ValueError("SMTP settings missing")

        with smtplib.SMTP(account.smtp_host, account.smtp_port) as server:
            if account.smtp_use_tls:
                server.starttls()
            server.login(account.smtp_username, account.smtp_password)

    def sync_inbox(self, account: models.EmailAccount, limit: int = 25) -> int:
        if not account.imap_host or not account.imap_username or not account.imap_password:
            raise ValueError("IMAP settings missing")

        imap = imaplib.IMAP4_SSL(account.imap_host, account.imap_port)
        try:
            imap.login(account.imap_username, account.imap_password)
            imap.select("INBOX")

            typ, data = imap.search(None, "ALL")
            if typ != "OK" or not data or not data[0]:
                return 0

            ids = data[0].split()
            newest = list(reversed(ids))[: max(1, limit)]

            imported = 0
            for uid in newest:
                typ, msg_data = imap.fetch(uid, "(RFC822)")
                if typ != "OK" or not msg_data:
                    continue

                raw = msg_data[0][1]
                if not raw:
                    continue

                parsed = BytesParser(policy=default).parsebytes(raw)

                message_id = _safe_decode_header(parsed.get("Message-ID"))
                if message_id:
                    exists = (
                        self.db.query(models.EmailMessage)
                        .filter(models.EmailMessage.account_id == account.id, models.EmailMessage.message_id == message_id)
                        .first()
                    )
                    if exists:
                        continue

                subject = _safe_decode_header(parsed.get("Subject"))
                from_addr = _safe_decode_header(parsed.get("From"))
                to_addr = _safe_decode_header(parsed.get("To"))
                date_hdr = _safe_decode_header(parsed.get("Date"))
                preview = _extract_body_preview(parsed)

                thread_key = message_id or _safe_decode_header(parsed.get("In-Reply-To"))
                if not thread_key:
                    thread_key = f"subj:{subject.lower()}"

                thread = (
                    self.db.query(models.EmailThread)
                    .filter(models.EmailThread.account_id == account.id, models.EmailThread.thread_key == thread_key)
                    .first()
                )

                if not thread:
                    thread = models.EmailThread(
                        account_id=account.id,
                        thread_key=thread_key,
                        subject=subject,
                        snippet=preview,
                        last_from=from_addr,
                    )
                    self.db.add(thread)
                    self.db.flush()

                email_msg = models.EmailMessage(
                    account_id=account.id,
                    thread_id=thread.id,
                    message_id=message_id or None,
                    subject=subject,
                    from_email=from_addr,
                    to_email=to_addr,
                    date_raw=date_hdr,
                    body_preview=preview,
                    is_read=False,
                )
                self.db.add(email_msg)

                thread.subject = thread.subject or subject
                thread.snippet = preview or thread.snippet
                thread.last_from = from_addr or thread.last_from

                imported += 1

            self.db.commit()
            return imported
        finally:
            try:
                imap.logout()
            except Exception:
                pass

    def send_email(
        self,
        account: models.EmailAccount,
        to_email: str,
        subject: str,
        body: str,
        is_html: bool = False,
    ) -> None:
        if not account.smtp_host or not account.smtp_username or not account.smtp_password:
            raise ValueError("SMTP settings missing")

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = account.from_email or account.smtp_username
        msg["To"] = to_email

        mime = MIMEText(body, "html" if is_html else "plain")
        msg.attach(mime)

        with smtplib.SMTP(account.smtp_host, account.smtp_port) as server:
            if account.smtp_use_tls:
                server.starttls()
            server.login(account.smtp_username, account.smtp_password)
            server.send_message(msg)
