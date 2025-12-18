from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models, schemas
from database import get_db
from routers.auth import get_current_user


router = APIRouter(prefix="/api/whiteboard", tags=["Whiteboard"])


@router.get("/boards", response_model=List[schemas.WhiteboardBoardOut])
def list_boards(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return (
        db.query(models.WhiteboardBoard)
        .filter(models.WhiteboardBoard.created_by_id == current_user.id)
        .order_by(models.WhiteboardBoard.updated_at.desc())
        .all()
    )


@router.post("/boards", response_model=schemas.WhiteboardBoardOut)
def create_board(
    payload: schemas.WhiteboardBoardCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    b = models.WhiteboardBoard(title=payload.title, created_by_id=current_user.id)
    db.add(b)
    db.commit()
    db.refresh(b)
    return b


@router.get("/boards/{board_id}/strokes", response_model=List[schemas.WhiteboardStrokeOut])
def list_strokes(
    board_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    b = db.query(models.WhiteboardBoard).filter(models.WhiteboardBoard.id == board_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Board not found")

    if b.created_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    return (
        db.query(models.WhiteboardStroke)
        .filter(models.WhiteboardStroke.board_id == board_id)
        .order_by(models.WhiteboardStroke.id.asc())
        .all()
    )


@router.post("/boards/{board_id}/strokes", response_model=schemas.WhiteboardStrokeOut)
def add_stroke(
    board_id: int,
    payload: schemas.WhiteboardStrokeCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    b = db.query(models.WhiteboardBoard).filter(models.WhiteboardBoard.id == board_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Board not found")

    if b.created_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    s = models.WhiteboardStroke(board_id=board_id, author_id=current_user.id, stroke_data=payload.stroke_data)
    db.add(s)
    db.commit()
    db.refresh(s)
    return s
