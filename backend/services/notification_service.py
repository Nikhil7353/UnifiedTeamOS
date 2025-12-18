import os
from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
import models, schemas
from database import get_db
from services.email_service import EmailService
from services.ws_manager import notification_ws_manager

class NotificationService:
    def __init__(self, db: Session):
        self.db = db

    def create_notification(self, notification: schemas.NotificationCreate) -> models.Notification:
        db_notification = models.Notification(**notification.dict())
        self.db.add(db_notification)
        self.db.commit()
        self.db.refresh(db_notification)

        try:
            notification_ws_manager.send_to_user_sync(
                db_notification.user_id,
                {
                    "type": "notification.created",
                    "data": {
                        "id": db_notification.id,
                        "user_id": db_notification.user_id,
                        "type": db_notification.type,
                        "source_id": db_notification.source_id,
                        "source_type": db_notification.source_type,
                        "title": db_notification.title,
                        "preview": db_notification.preview,
                        "is_read": db_notification.is_read,
                        "created_at": db_notification.created_at.isoformat() if db_notification.created_at else None,
                    },
                },
            )
        except Exception:
            pass
        
        # Get user with preferences
        user = self.db.query(models.User).options(
            joinedload(models.User.preferences)
        ).get(notification.user_id)
        
        # Send email notification if enabled
        if (user and hasattr(user, 'preferences') and 
            user.preferences and user.preferences.email_notifications and 
            hasattr(user, 'email') and user.email):
            email_service = EmailService()
            email_service.send_notification_email(
                to_email=user.email,
                subject=f"New notification: {notification.title}",
                html_content=f"""
                <h2>{notification.title}</h2>
                <p>{notification.preview}</p>
                <p>Log in to your account to view the full notification.</p>
                """
            )
            
        return db_notification

    def get_notifications(
        self, 
        user_id: int, 
        skip: int = 0, 
        limit: int = 50,
        unread_only: bool = False
    ) -> List[models.Notification]:
        query = self.db.query(models.Notification).filter(
            models.Notification.user_id == user_id
        )
        
        if unread_only:
            query = query.filter(models.Notification.is_read == False)
            
        return query.order_by(
            models.Notification.created_at.desc()
        ).offset(skip).limit(limit).all()

    def mark_as_read(self, notification_id: int, user_id: int) -> models.Notification:
        notification = self.db.query(models.Notification).filter(
            models.Notification.id == notification_id,
            models.Notification.user_id == user_id
        ).first()
        
        if not notification:
            raise HTTPException(status_code=404, detail="Notification not found")
            
        notification.is_read = True
        self.db.commit()
        self.db.refresh(notification)
        return notification

    def get_unread_count(self, user_id: int) -> int:
        return self.db.query(models.Notification).filter(
            models.Notification.user_id == user_id,
            models.Notification.is_read == False
        ).count()

    def get_user_preferences(self, user_id: int) -> Optional[models.UserPreference]:
        return self.db.query(models.UserPreference).filter(
            models.UserPreference.user_id == user_id
        ).first()

    def update_preferences(
        self, 
        user_id: int, 
        preferences: schemas.UserPreferenceUpdate
    ) -> models.UserPreference:
        db_prefs = self.get_user_preferences(user_id)
        
        if not db_prefs:
            db_prefs = models.UserPreference(user_id=user_id, **preferences.dict())
            self.db.add(db_prefs)
        else:
            for key, value in preferences.dict().items():
                setattr(db_prefs, key, value)
        
        self.db.commit()
        self.db.refresh(db_prefs)
        return db_prefs


def create_mention_notifications(db: Session, message: models.Message, mentioned_usernames: List[str]):
    notification_service = NotificationService(db)
    
    for username in mentioned_usernames:
        user = db.query(models.User).options(
            joinedload(models.User.preferences)
        ).filter(models.User.username == username).first()
        
        if user:
            # Check if mentions are muted
            if (hasattr(user, 'preferences') and user.preferences and 
                hasattr(user.preferences, 'mute_mentions_until') and 
                user.preferences.mute_mentions_until and 
                user.preferences.mute_mentions_until > datetime.utcnow()):
                continue
                
            notification = schemas.NotificationCreate(
                user_id=user.id,
                type="mention",
                source_id=message.id,
                source_type="message",
                title=f"You were mentioned by {message.sender.username}",
                preview=message.content[:200] if message.content else ""
            )
            notification_service.create_notification(notification)
