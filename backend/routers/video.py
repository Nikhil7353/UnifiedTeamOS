from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy import or_

import models, schemas
from database import get_db
from routers.auth import get_current_user


router = APIRouter(prefix="/api/video", tags=["Video"])


@router.get("/calls", response_model=List[schemas.VideoCallOut])
def list_calls(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return (
        db.query(models.VideoCall)
        .outerjoin(models.VideoCallParticipant, models.VideoCallParticipant.call_id == models.VideoCall.id)
        .filter(
            or_(
                models.VideoCall.created_by_id == current_user.id,
                models.VideoCallParticipant.user_id == current_user.id,
            )
        )
        .order_by(models.VideoCall.id.desc())
        .distinct()
        .all()
    )


@router.post("/calls", response_model=schemas.VideoCallOut)
def create_call(
    payload: schemas.VideoCallCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    call = models.VideoCall(name=payload.name, created_by_id=current_user.id, is_active=True)
    db.add(call)
    db.commit()
    db.refresh(call)
    return call


@router.post("/calls/{call_id}/join", response_model=schemas.VideoCallParticipantOut)
def join_call(
    call_id: int,
    payload: schemas.VideoJoinUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    call = db.query(models.VideoCall).filter(models.VideoCall.id == call_id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")

    p = (
        db.query(models.VideoCallParticipant)
        .filter(models.VideoCallParticipant.call_id == call_id, models.VideoCallParticipant.user_id == current_user.id)
        .first()
    )
    if not p:
        p = models.VideoCallParticipant(call_id=call_id, user_id=current_user.id)
        db.add(p)

    p.video_enabled = bool(payload.video_enabled)
    p.audio_enabled = bool(payload.audio_enabled)

    db.commit()
    db.refresh(p)
    return p


@router.post("/calls/{call_id}/leave")
def leave_call(
    call_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    p = (
        db.query(models.VideoCallParticipant)
        .filter(models.VideoCallParticipant.call_id == call_id, models.VideoCallParticipant.user_id == current_user.id)
        .first()
    )
    if p:
        db.delete(p)
        db.commit()
    return {"left": True}


@router.get("/calls/{call_id}/participants", response_model=List[schemas.VideoCallParticipantOut])
def list_participants(
    call_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    call = db.query(models.VideoCall).filter(models.VideoCall.id == call_id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")

    allowed = call.created_by_id == current_user.id
    if not allowed:
        allowed = (
            db.query(models.VideoCallParticipant)
            .filter(models.VideoCallParticipant.call_id == call_id, models.VideoCallParticipant.user_id == current_user.id)
            .first()
            is not None
        )
    if not allowed:
        raise HTTPException(status_code=403, detail="Not allowed")

    return (
        db.query(models.VideoCallParticipant)
        .filter(models.VideoCallParticipant.call_id == call_id)
        .order_by(models.VideoCallParticipant.id.asc())
        .all()
    )
