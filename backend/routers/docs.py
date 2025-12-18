from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models, schemas
from database import get_db
from routers.auth import get_current_user


router = APIRouter(prefix="/api/docs", tags=["Docs"])


@router.get("", response_model=List[schemas.DocumentOut])
def list_docs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.Document)
        .filter(models.Document.owner_id == current_user.id)
        .order_by(models.Document.updated_at.desc())
        .all()
    )


@router.post("", response_model=schemas.DocumentOut)
def create_doc(
    payload: schemas.DocumentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    doc = models.Document(owner_id=current_user.id, title=payload.title, content=payload.content)
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


@router.get("/{doc_id}", response_model=schemas.DocumentOut)
def get_doc(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    doc = (
        db.query(models.Document)
        .filter(models.Document.id == doc_id, models.Document.owner_id == current_user.id)
        .first()
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.put("/{doc_id}", response_model=schemas.DocumentOut)
def update_doc(
    doc_id: int,
    payload: schemas.DocumentUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    doc = (
        db.query(models.Document)
        .filter(models.Document.id == doc_id, models.Document.owner_id == current_user.id)
        .first()
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if payload.title is not None:
        doc.title = payload.title
    if payload.content is not None:
        doc.content = payload.content

    db.commit()
    db.refresh(doc)
    return doc


@router.delete("/{doc_id}")
def delete_doc(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    doc = (
        db.query(models.Document)
        .filter(models.Document.id == doc_id, models.Document.owner_id == current_user.id)
        .first()
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    db.delete(doc)
    db.commit()
    return {"deleted": True}


@router.get("/{doc_id}/comments", response_model=List[schemas.DocumentCommentOut])
def list_comments(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    doc = (
        db.query(models.Document)
        .filter(models.Document.id == doc_id, models.Document.owner_id == current_user.id)
        .first()
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    return (
        db.query(models.DocumentComment)
        .filter(models.DocumentComment.document_id == doc.id)
        .order_by(models.DocumentComment.id.asc())
        .all()
    )


@router.post("/{doc_id}/comments", response_model=schemas.DocumentCommentOut)
def add_comment(
    doc_id: int,
    payload: schemas.DocumentCommentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    doc = (
        db.query(models.Document)
        .filter(models.Document.id == doc_id, models.Document.owner_id == current_user.id)
        .first()
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    c = models.DocumentComment(document_id=doc.id, author_id=current_user.id, body=payload.body)
    db.add(c)
    db.commit()
    db.refresh(c)
    return c
