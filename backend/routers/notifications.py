from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

import models, schemas
from database import get_db
from routers.auth import get_current_user
from services.notification_service import NotificationService

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

@router.get("", response_model=schemas.NotificationList)
def get_notifications(
    skip: int = 0,
    limit: int = 50,
    unread: bool = False,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's notifications with pagination"""
    service = NotificationService(db)
    items = service.get_notifications(
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        unread_only=unread
    )
    total = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id
    ).count()
    
    unread_count = service.get_unread_count(current_user.id)
    
    return {
        "items": items,
        "total": total,
        "unread_count": unread_count
    }

@router.get("/unread/count", response_model=int)
def get_unread_count(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get count of unread notifications"""
    return NotificationService(db).get_unread_count(current_user.id)

@router.put("/{notification_id}/read", response_model=schemas.NotificationOut)
def mark_notification_read(
    notification_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a notification as read"""
    return NotificationService(db).mark_as_read(notification_id, current_user.id)

@router.put("/read/all", status_code=status.HTTP_204_NO_CONTENT)
def mark_all_read(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark all notifications as read"""
    db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return None

@router.get("/preferences", response_model=schemas.UserPreferenceOut)
def get_preferences(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's notification preferences"""
    service = NotificationService(db)
    prefs = service.get_user_preferences(current_user.id)
    if not prefs:
        # Create default preferences if they don't exist
        return service.update_preferences(
            current_user.id,
            schemas.UserPreferenceUpdate()
        )
    return prefs

@router.put("/preferences", response_model=schemas.UserPreferenceOut)
def update_preferences(
    preferences: schemas.UserPreferenceUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user's notification preferences"""
    return NotificationService(db).update_preferences(current_user.id, preferences)
