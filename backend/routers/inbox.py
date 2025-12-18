from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone

import models, schemas
from database import get_db
from routers.auth import get_current_user

router = APIRouter(prefix="/api/inbox", tags=["Inbox"])


def _fmt_relative(dt: Optional[datetime]) -> str:
    if not dt:
        return "—"
    # Prefer UTC-aware math; fall back safely
    now = datetime.now(timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    delta = now - dt
    seconds = max(0, int(delta.total_seconds()))
    if seconds < 60:
        return f"{seconds}s ago"
    minutes = seconds // 60
    if minutes < 60:
        return f"{minutes}m ago"
    hours = minutes // 60
    if hours < 24:
        return f"{hours}h ago"
    days = hours // 24
    return f"{days}d ago"


@router.get("", response_model=schemas.InboxList)
def list_inbox(
    source: str = "all",
    q: str = "",
    unread: bool = False,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    q_norm = (q or "").strip().lower()

    pins = (
        db.query(models.InboxPin)
        .filter(models.InboxPin.user_id == current_user.id)
        .all()
    )
    pinned_lookup = {(p.source, p.source_id): True for p in pins}

    items: List[schemas.InboxItemOut] = []

    # Chat messages
    if source in ("all", "chat"):
        if not unread:
            msgs = (
                db.query(models.Message)
                .join(models.Channel, models.Message.channel_id == models.Channel.id)
                .join(models.ChannelMember, models.ChannelMember.channel_id == models.Channel.id)
                .filter(models.ChannelMember.user_id == current_user.id)
                .order_by(models.Message.timestamp.desc())
                .limit(200)
                .all()
            )
            for m in msgs:
                title = f"New message in #{m.channel.name}" if getattr(m, "channel", None) else "New message"
                preview = m.content or ""
                if q_norm and (q_norm not in (title + " " + preview).lower()):
                    continue
                items.append(
                    schemas.InboxItemOut(
                        id=f"chat:{m.id}",
                        source="chat",
                        source_id=m.id,
                        title=title,
                        preview=preview,
                        meta={
                            "channel": getattr(m.channel, "name", ""),
                            "by": getattr(getattr(m, "sender", None), "username", "Member"),
                            "at": _fmt_relative(m.timestamp),
                        },
                        unread=False,
                        pinned=bool(pinned_lookup.get(("chat", m.id))),
                        tags=["message"],
                    )
                )

    # Notifications
    if source in ("all", "notification"):
        notif_q = db.query(models.Notification).filter(models.Notification.user_id == current_user.id)
        if unread:
            notif_q = notif_q.filter(models.Notification.is_read == False)
        notifs = notif_q.order_by(models.Notification.created_at.desc()).limit(200).all()
        for n in notifs:
            title = n.title or "Notification"
            preview = n.preview or ""
            if q_norm and (q_norm not in (title + " " + preview).lower()):
                continue
            items.append(
                schemas.InboxItemOut(
                    id=f"notification:{n.id}",
                    source="notification",
                    source_id=n.id,
                    title=title,
                    preview=preview,
                    meta={
                        "by": "System",
                        "at": _fmt_relative(n.created_at),
                    },
                    unread=not bool(n.is_read),
                    pinned=bool(pinned_lookup.get(("notification", n.id))),
                    tags=[n.type] if n.type else [],
                )
            )

    # Email threads
    if source in ("all", "email"):
        # Threads from all accounts owned by current user
        threads = (
            db.query(models.EmailThread)
            .join(models.EmailAccount, models.EmailThread.account_id == models.EmailAccount.id)
            .filter(models.EmailAccount.user_id == current_user.id)
            .order_by(models.EmailThread.updated_at.desc())
            .limit(200)
            .all()
        )
        for t in threads:
            unread_count = (
                db.query(models.EmailMessage)
                .filter(models.EmailMessage.thread_id == t.id, models.EmailMessage.is_read == False)
                .count()
            )
            is_unread = unread_count > 0
            if unread and not is_unread:
                continue
            title = t.subject or "(no subject)"
            preview = t.snippet or ""
            if q_norm and (q_norm not in (title + " " + preview).lower()):
                continue
            items.append(
                schemas.InboxItemOut(
                    id=f"email:{t.id}",
                    source="email",
                    source_id=t.id,
                    title=title,
                    preview=preview,
                    meta={
                        "by": t.last_from or "",
                        "at": _fmt_relative(t.updated_at),
                    },
                    unread=is_unread,
                    pinned=bool(pinned_lookup.get(("email", t.id))),
                    tags=["email"],
                )
            )

    # Tasks
    if source in ("all", "task"):
        tasks = db.query(models.Task).order_by(models.Task.id.desc()).limit(200).all()
        for t in tasks:
            title = f"Task: {t.title}" if t.title else "Task"
            preview = t.description or ""
            if q_norm and (q_norm not in (title + " " + preview).lower()):
                continue
            # Tasks currently have no read/unread concept in backend.
            if unread:
                continue
            items.append(
                schemas.InboxItemOut(
                    id=f"task:{t.id}",
                    source="task",
                    source_id=t.id,
                    title=title,
                    preview=preview,
                    meta={
                        "by": "System",
                        "at": "—",
                    },
                    unread=False,
                    pinned=bool(pinned_lookup.get(("task", t.id))),
                    tags=[t.status] if t.status else [],
                )
            )

    # Sort pinned first, then by meta.at (already relative), so prefer original insert order.
    items.sort(key=lambda x: (not x.pinned, x.id))

    # Pagination
    total = len(items)
    page = items[skip : skip + limit]

    unread_count = sum(1 for it in items if it.unread)
    pinned_count = sum(1 for it in items if it.pinned)

    return {
        "items": page,
        "total": total,
        "unread_count": unread_count,
        "pinned_count": pinned_count,
    }


@router.put("/{source}/{source_id}/pin", response_model=schemas.InboxItemPinOut)
def set_pin(
    source: str,
    source_id: int,
    payload: schemas.InboxItemPinUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if source not in ("notification", "email", "task", "chat"):
        raise HTTPException(status_code=400, detail="Unsupported source")

    existing = (
        db.query(models.InboxPin)
        .filter(
            models.InboxPin.user_id == current_user.id,
            models.InboxPin.source == source,
            models.InboxPin.source_id == source_id,
        )
        .first()
    )

    should_pin = bool(payload.pinned)

    if should_pin and not existing:
        rec = models.InboxPin(user_id=current_user.id, source=source, source_id=source_id)
        db.add(rec)
        db.commit()
    elif (not should_pin) and existing:
        db.delete(existing)
        db.commit()

    return {"source": source, "source_id": source_id, "pinned": should_pin}


@router.put("/{source}/{source_id}/read", response_model=schemas.InboxItemReadOut)
def set_read(
    source: str,
    source_id: int,
    payload: schemas.InboxItemReadUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    is_read = bool(payload.is_read)

    if source == "notification":
        n = (
            db.query(models.Notification)
            .filter(models.Notification.id == source_id, models.Notification.user_id == current_user.id)
            .first()
        )
        if not n:
            raise HTTPException(status_code=404, detail="Notification not found")
        n.is_read = is_read
        db.commit()
        return {"source": source, "source_id": source_id, "is_read": is_read}

    if source == "email":
        # thread_id
        thread = (
            db.query(models.EmailThread)
            .join(models.EmailAccount, models.EmailThread.account_id == models.EmailAccount.id)
            .filter(models.EmailThread.id == source_id, models.EmailAccount.user_id == current_user.id)
            .first()
        )
        if not thread:
            raise HTTPException(status_code=404, detail="Thread not found")

        db.query(models.EmailMessage).filter(models.EmailMessage.thread_id == thread.id).update(
            {"is_read": is_read}
        )
        db.commit()
        return {"source": source, "source_id": source_id, "is_read": is_read}

    raise HTTPException(status_code=400, detail="Read/unread not supported for this source")


@router.put("/read/all")
def mark_all_read(
    source: str = "all",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if source in ("all", "notification"):
        db.query(models.Notification).filter(
            models.Notification.user_id == current_user.id,
            models.Notification.is_read == False,
        ).update({"is_read": True})

    if source in ("all", "email"):
        # Mark all messages as read for all accounts owned by user
        msg_q = (
            db.query(models.EmailMessage)
            .join(models.EmailAccount, models.EmailMessage.account_id == models.EmailAccount.id)
            .filter(models.EmailAccount.user_id == current_user.id, models.EmailMessage.is_read == False)
        )
        msg_q.update({"is_read": True})

    db.commit()
    return {"ok": True}
