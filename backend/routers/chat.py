from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Set
import re
import os
import uuid
from datetime import datetime

import models, schemas
from database import get_db
from routers.auth import get_current_user
from services.notification_service import create_mention_notifications
from services.email_service import EmailService

router = APIRouter(prefix="/api/chat", tags=["Chat"])

# 1. GET MESSAGES FOR A CHANNEL
@router.get("/channels/{channel_id}/messages", response_model=List[schemas.MessageOut])
def get_channel_messages(
    channel_id: int,
    limit: int = Query(50, description="Number of messages to retrieve"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if user is a member of this channel
    membership = db.query(models.ChannelMember).filter(
        models.ChannelMember.channel_id == channel_id,
        models.ChannelMember.user_id == current_user.id
    ).first()

    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this channel")

    # Get messages for this channel ordered by timestamp (newest first)
    messages = db.query(models.Message).filter(
        models.Message.channel_id == channel_id
    ).order_by(
        models.Message.timestamp.desc()
    ).limit(limit).all()

    # Reverse to show oldest first in chat
    return list(reversed(messages))

# 2. SEND MESSAGE TO CHANNEL
def find_mentions(text: str) -> Set[str]:
    """Find all @mentions in the message text"""
    # Matches @username in the message
    mention_pattern = r'@(\w+)'
    return set(re.findall(mention_pattern, text))

@router.post("/channels/{channel_id}/messages", response_model=schemas.MessageOut)
async def send_channel_message(
    channel_id: int,
    message: schemas.MessageCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks = None
):
    # Check if user is a member of this channel
    membership = db.query(models.ChannelMember).filter(
        models.ChannelMember.channel_id == channel_id,
        models.ChannelMember.user_id == current_user.id
    ).first()

    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this channel")

    new_message = models.Message(
        content=message.content,
        message_type=message.message_type or "text",
        thread_id=message.thread_id,
        sender_id=current_user.id,
        channel_id=channel_id
    )

    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    # Process mentions in the background
    if message.content:
        mentioned_usernames = find_mentions(message.content)
        if mentioned_usernames:
            # Eager load the sender relationship
            new_message.sender = current_user
            background_tasks.add_task(
                create_mention_notifications,
                db,
                new_message,
                list(mentioned_usernames)
            )

    return new_message

# 3. UPLOAD FILE TO CHANNEL
@router.post("/channels/{channel_id}/files")
def upload_file_to_channel(
    channel_id: int,
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if user is a member of this channel
    membership = db.query(models.ChannelMember).filter(
        models.ChannelMember.channel_id == channel_id,
        models.ChannelMember.user_id == current_user.id
    ).first()

    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this channel")

    # Validate file size (max 10MB)
    if file.size > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 10MB")

    # Validate file type
    allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain']
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="File type not allowed")

    # Create uploads directory if it doesn't exist
    upload_dir = "uploads"
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)

    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(upload_dir, unique_filename)

    # Save file
    with open(file_path, "wb") as buffer:
        content = file.file.read()
        buffer.write(content)

    # Create file record in database
    file_record = models.FileAttachment(
        filename=file.filename,
        file_url=f"/uploads/{unique_filename}",
        file_size=len(content),
        file_type=file.content_type,
        uploader_id=current_user.id
    )

    db.add(file_record)
    db.commit()
    db.refresh(file_record)

    return {
        "id": file_record.id,
        "filename": file_record.filename,
        "file_url": file_record.file_url,
        "file_size": file_record.file_size,
        "file_type": file_record.file_type,
        "uploaded_at": file_record.uploaded_at
    }