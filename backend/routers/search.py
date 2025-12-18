from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_

import models, schemas
from database import get_db
from routers.auth import get_current_user


router = APIRouter(prefix="/api/search", tags=["Search"])


@router.get("", response_model=schemas.SearchResults)
def unified_search(
    q: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = (q or "").strip()
    if not query:
        return {"q": q, "tasks": [], "messages": [], "documents": [], "emails": []}

    like = f"%{query}%"

    tasks = (
        db.query(models.Task)
        .filter(models.Task.assigned_user_id == current_user.id)
        .filter(or_(models.Task.title.ilike(like), models.Task.description.ilike(like)))
        .limit(20)
        .all()
    )

    messages = (
        db.query(models.Message)
        .filter(models.Message.sender_id == current_user.id)
        .filter(models.Message.content.ilike(like))
        .order_by(models.Message.timestamp.desc())
        .limit(20)
        .all()
    )

    documents = (
        db.query(models.Document)
        .filter(models.Document.owner_id == current_user.id)
        .filter(or_(models.Document.title.ilike(like), models.Document.content.ilike(like)))
        .order_by(models.Document.updated_at.desc())
        .limit(20)
        .all()
    )

    emails = (
        db.query(models.EmailMessage)
        .join(models.EmailAccount, models.EmailMessage.account_id == models.EmailAccount.id)
        .filter(models.EmailAccount.user_id == current_user.id)
        .filter(or_(models.EmailMessage.subject.ilike(like), models.EmailMessage.body_preview.ilike(like)))
        .order_by(models.EmailMessage.id.desc())
        .limit(20)
        .all()
    )

    return {
        "q": q,
        "tasks": tasks,
        "messages": messages,
        "documents": documents,
        "emails": emails,
    }
