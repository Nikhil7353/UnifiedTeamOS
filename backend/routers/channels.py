from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models, schemas
from routers.auth import get_current_user

router = APIRouter(prefix="/api/channels", tags=["Channels"])


@router.get("", response_model=List[schemas.ChannelOut])
def list_channels(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Return channels the user can see: public OR where they are a member
    member_channel_ids = [
        m.channel_id for m in db.query(models.ChannelMember).filter(models.ChannelMember.user_id == current_user.id).all()
    ]
    channels = (
        db.query(models.Channel)
        .filter(
            (models.Channel.is_private == False) | (models.Channel.id.in_(member_channel_ids))
        )
        .all()
    )
    return channels


@router.post("", response_model=schemas.ChannelOut)
def create_channel(
    channel: schemas.ChannelCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    existing = db.query(models.Channel).filter(models.Channel.name == channel.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Channel name already exists")

    new_channel = models.Channel(name=channel.name, is_private=channel.is_private)
    db.add(new_channel)
    db.commit()
    db.refresh(new_channel)

    # Add creator as member
    membership = models.ChannelMember(user_id=current_user.id, channel_id=new_channel.id, role="owner")
    db.add(membership)
    db.commit()

    return new_channel


@router.get("/{channel_id}", response_model=schemas.ChannelOut)
def get_channel(channel_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    channel = db.query(models.Channel).filter(models.Channel.id == channel_id).first()
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    return channel


@router.post("/{channel_id}/join", response_model=schemas.ChannelMemberOut)
def join_channel(channel_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    channel = db.query(models.Channel).filter(models.Channel.id == channel_id).first()
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")

    existing = (
        db.query(models.ChannelMember)
        .filter(models.ChannelMember.channel_id == channel_id, models.ChannelMember.user_id == current_user.id)
        .first()
    )
    if existing:
        return existing

    membership = models.ChannelMember(user_id=current_user.id, channel_id=channel_id, role="member")
    db.add(membership)
    db.commit()
    db.refresh(membership)
    return membership


@router.post("/{channel_id}/invite", response_model=schemas.ChannelMemberOut)
def invite_user_to_channel(
    channel_id: int,
    username: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    channel = db.query(models.Channel).filter(models.Channel.id == channel_id).first()
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")

    # Only owners can invite
    inviter_membership = (
        db.query(models.ChannelMember)
        .filter(models.ChannelMember.channel_id == channel_id, models.ChannelMember.user_id == current_user.id)
        .first()
    )
    if not inviter_membership or inviter_membership.role != "owner":
        raise HTTPException(status_code=403, detail="Only channel owners can invite")

    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    existing = (
        db.query(models.ChannelMember)
        .filter(models.ChannelMember.channel_id == channel_id, models.ChannelMember.user_id == user.id)
        .first()
    )
    if existing:
        return existing

    membership = models.ChannelMember(user_id=user.id, channel_id=channel_id, role="member")
    db.add(membership)
    db.commit()
    db.refresh(membership)
    return membership


@router.post("/join/by-name", response_model=schemas.ChannelMemberOut)
def join_channel_by_name(
    name: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    channel = db.query(models.Channel).filter(models.Channel.name == name).first()
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")

    if channel.is_private:
        # Require invitation/owner for private; for now just block auto-join
        raise HTTPException(status_code=403, detail="Private channel – request access")

    existing = (
        db.query(models.ChannelMember)
        .filter(models.ChannelMember.channel_id == channel.id, models.ChannelMember.user_id == current_user.id)
        .first()
    )
    if existing:
        return existing

    membership = models.ChannelMember(user_id=current_user.id, channel_id=channel.id, role="member")
    db.add(membership)
    db.commit()
    db.refresh(membership)
    return membership


@router.delete("/{channel_id}/leave")
def leave_channel(channel_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    membership = (
        db.query(models.ChannelMember)
        .filter(models.ChannelMember.channel_id == channel_id, models.ChannelMember.user_id == current_user.id)
        .first()
    )
    if not membership:
        raise HTTPException(status_code=404, detail="Not a member of this channel")

    db.delete(membership)
    db.commit()
    return {"message": "Left channel"}

