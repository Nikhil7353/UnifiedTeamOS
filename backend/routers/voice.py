from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy import or_

import models, schemas
from database import get_db
from routers.auth import get_current_user


router = APIRouter(prefix="/api/voice", tags=["Voice"])


@router.get("/rooms", response_model=List[schemas.VoiceRoomOut])
def list_rooms(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return (
        db.query(models.VoiceRoom)
        .outerjoin(models.VoiceRoomParticipant, models.VoiceRoomParticipant.room_id == models.VoiceRoom.id)
        .filter(
            or_(
                models.VoiceRoom.created_by_id == current_user.id,
                models.VoiceRoomParticipant.user_id == current_user.id,
            )
        )
        .order_by(models.VoiceRoom.id.desc())
        .distinct()
        .all()
    )


@router.post("/rooms", response_model=schemas.VoiceRoomOut)
def create_room(
    payload: schemas.VoiceRoomCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    room = models.VoiceRoom(name=payload.name, created_by_id=current_user.id, is_active=True)
    db.add(room)
    db.commit()
    db.refresh(room)
    return room


@router.post("/rooms/{room_id}/join", response_model=schemas.VoiceRoomParticipantOut)
def join_room(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    room = db.query(models.VoiceRoom).filter(models.VoiceRoom.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    existing = (
        db.query(models.VoiceRoomParticipant)
        .filter(models.VoiceRoomParticipant.room_id == room_id, models.VoiceRoomParticipant.user_id == current_user.id)
        .first()
    )
    if existing:
        return existing

    p = models.VoiceRoomParticipant(room_id=room_id, user_id=current_user.id)
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


@router.post("/rooms/{room_id}/leave")
def leave_room(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    p = (
        db.query(models.VoiceRoomParticipant)
        .filter(models.VoiceRoomParticipant.room_id == room_id, models.VoiceRoomParticipant.user_id == current_user.id)
        .first()
    )
    if not p:
        return {"left": True}

    db.delete(p)
    db.commit()
    return {"left": True}


@router.get("/rooms/{room_id}/participants", response_model=List[schemas.VoiceRoomParticipantOut])
def list_participants(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    room = db.query(models.VoiceRoom).filter(models.VoiceRoom.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    allowed = room.created_by_id == current_user.id
    if not allowed:
        allowed = (
            db.query(models.VoiceRoomParticipant)
            .filter(models.VoiceRoomParticipant.room_id == room_id, models.VoiceRoomParticipant.user_id == current_user.id)
            .first()
            is not None
        )
    if not allowed:
        raise HTTPException(status_code=403, detail="Not allowed")

    return (
        db.query(models.VoiceRoomParticipant)
        .filter(models.VoiceRoomParticipant.room_id == room_id)
        .order_by(models.VoiceRoomParticipant.id.asc())
        .all()
    )
