from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models, schemas
from database import get_db
from routers.auth import get_current_user
from services.email_integration_service import EmailIntegrationService


router = APIRouter(prefix="/api/email", tags=["Email"])


@router.get("/accounts", response_model=List[schemas.EmailAccountOut])
def list_accounts(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.EmailAccount)
        .filter(models.EmailAccount.user_id == current_user.id)
        .order_by(models.EmailAccount.id.desc())
        .all()
    )


@router.post("/accounts", response_model=schemas.EmailAccountOut)
def create_account(
    payload: schemas.EmailAccountCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    acct = models.EmailAccount(user_id=current_user.id, **payload.dict())
    db.add(acct)
    db.commit()
    db.refresh(acct)
    return acct


@router.post("/accounts/{account_id}/sync", response_model=schemas.EmailSyncResult)
def sync_account(
    account_id: int,
    limit: int = 25,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    acct = (
        db.query(models.EmailAccount)
        .filter(models.EmailAccount.id == account_id, models.EmailAccount.user_id == current_user.id)
        .first()
    )
    if not acct:
        raise HTTPException(status_code=404, detail="Account not found")

    try:
        imported = EmailIntegrationService(db).sync_inbox(acct, limit=limit)
        return {"imported": imported}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/accounts/{account_id}/test")
def test_account(
    account_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    acct = (
        db.query(models.EmailAccount)
        .filter(models.EmailAccount.id == account_id, models.EmailAccount.user_id == current_user.id)
        .first()
    )
    if not acct:
        raise HTTPException(status_code=404, detail="Account not found")

    svc = EmailIntegrationService(db)
    try:
        svc.test_imap(acct)
        svc.test_smtp(acct)
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/accounts/{account_id}")
def delete_account(
    account_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    acct = (
        db.query(models.EmailAccount)
        .filter(models.EmailAccount.id == account_id, models.EmailAccount.user_id == current_user.id)
        .first()
    )
    if not acct:
        raise HTTPException(status_code=404, detail="Account not found")

    db.delete(acct)
    db.commit()
    return {"deleted": True}


@router.get("/accounts/{account_id}/threads", response_model=List[schemas.EmailThreadOut])
def list_threads(
    account_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    acct = (
        db.query(models.EmailAccount)
        .filter(models.EmailAccount.id == account_id, models.EmailAccount.user_id == current_user.id)
        .first()
    )
    if not acct:
        raise HTTPException(status_code=404, detail="Account not found")

    return (
        db.query(models.EmailThread)
        .filter(models.EmailThread.account_id == acct.id)
        .order_by(models.EmailThread.updated_at.desc())
        .all()
    )


@router.get("/accounts/{account_id}/threads/paged", response_model=schemas.EmailThreadList)
def list_threads_paged(
    account_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    acct = (
        db.query(models.EmailAccount)
        .filter(models.EmailAccount.id == account_id, models.EmailAccount.user_id == current_user.id)
        .first()
    )
    if not acct:
        raise HTTPException(status_code=404, detail="Account not found")

    base = db.query(models.EmailThread).filter(models.EmailThread.account_id == acct.id)
    total = base.count()

    thread_ids = [t.id for t in base.order_by(models.EmailThread.updated_at.desc()).offset(skip).limit(limit).all()]
    items = []
    if thread_ids:
        items = (
            db.query(models.EmailThread)
            .filter(models.EmailThread.id.in_(thread_ids))
            .order_by(models.EmailThread.updated_at.desc())
            .all()
        )

    unread_count = (
        db.query(models.EmailMessage)
        .join(models.EmailThread, models.EmailMessage.thread_id == models.EmailThread.id)
        .filter(models.EmailThread.account_id == acct.id, models.EmailMessage.is_read == False)
        .count()
    )

    return {"items": items, "total": total, "unread_count": unread_count}


@router.get("/threads/{thread_id}/messages", response_model=List[schemas.EmailMessageOut])
def list_thread_messages(
    thread_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    thread = (
        db.query(models.EmailThread)
        .join(models.EmailAccount, models.EmailThread.account_id == models.EmailAccount.id)
        .filter(models.EmailThread.id == thread_id, models.EmailAccount.user_id == current_user.id)
        .first()
    )
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")

    return (
        db.query(models.EmailMessage)
        .filter(models.EmailMessage.thread_id == thread.id)
        .order_by(models.EmailMessage.id.asc())
        .all()
    )


@router.get("/threads/{thread_id}/messages/paged", response_model=schemas.EmailMessageList)
def list_thread_messages_paged(
    thread_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    thread = (
        db.query(models.EmailThread)
        .join(models.EmailAccount, models.EmailThread.account_id == models.EmailAccount.id)
        .filter(models.EmailThread.id == thread_id, models.EmailAccount.user_id == current_user.id)
        .first()
    )
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")

    base = db.query(models.EmailMessage).filter(models.EmailMessage.thread_id == thread.id)
    total = base.count()
    items = base.order_by(models.EmailMessage.id.asc()).offset(skip).limit(limit).all()
    unread_count = base.filter(models.EmailMessage.is_read == False).count()

    return {"items": items, "total": total, "unread_count": unread_count}


@router.put("/messages/{message_id}/read", response_model=schemas.EmailMessageOut)
def mark_message_read(
    message_id: int,
    payload: schemas.EmailMessageReadUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    msg = (
        db.query(models.EmailMessage)
        .join(models.EmailAccount, models.EmailMessage.account_id == models.EmailAccount.id)
        .filter(models.EmailMessage.id == message_id, models.EmailAccount.user_id == current_user.id)
        .first()
    )
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")

    msg.is_read = bool(payload.is_read)
    db.commit()
    db.refresh(msg)
    return msg


@router.post("/accounts/{account_id}/send", response_model=schemas.EmailSendResult)
def send_email(
    account_id: int,
    payload: schemas.EmailSendRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    acct = (
        db.query(models.EmailAccount)
        .filter(models.EmailAccount.id == account_id, models.EmailAccount.user_id == current_user.id)
        .first()
    )
    if not acct:
        raise HTTPException(status_code=404, detail="Account not found")

    try:
        EmailIntegrationService(db).send_email(
            acct,
            to_email=payload.to_email,
            subject=payload.subject,
            body=payload.body,
            is_html=payload.is_html,
        )
        return {"sent": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
