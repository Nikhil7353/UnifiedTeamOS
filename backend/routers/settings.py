from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

import models, schemas
from database import get_db
from routers.auth import get_current_user

router = APIRouter(prefix="/api/settings", tags=["Settings"])

@router.get("/profile", response_model=schemas.UserOut)
def get_profile(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return current_user

@router.put("/profile", response_model=schemas.UserOut)
def update_profile(
    profile_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if profile_update.full_name is not None:
        current_user.full_name = profile_update.full_name
    if profile_update.username is not None:
        # Check if username is already taken
        existing = db.query(models.User).filter(
            models.User.username == profile_update.username,
            models.User.id != current_user.id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken")
        current_user.username = profile_update.username
    if profile_update.email is not None:
        # Check if email is already taken
        existing = db.query(models.User).filter(
            models.User.email == profile_update.email,
            models.User.id != current_user.id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already taken")
        current_user.email = profile_update.email
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/notifications", response_model=Dict[str, Any])
def get_notification_settings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # For now, return default settings - in a real app, these would be stored in the database
    return {
        "email": True,
        "desktop": True,
        "mentionsOnly": False,
        "taskReminders": True,
        "meetingReminders": True,
        "weeklyDigest": True
    }

@router.put("/notifications", response_model=Dict[str, Any])
def update_notification_settings(
    settings: Dict[str, bool],
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # For now, just return the settings - in a real app, these would be stored in the database
    return settings

@router.get("/preferences", response_model=Dict[str, Any])
def get_user_preferences(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Return user preferences like theme, language, etc.
    return {
        "theme": "light",
        "language": "en",
        "timezone": "UTC",
        "dateFormat": "MM/DD/YYYY",
        "timeFormat": "12h",
        "autoSave": True,
        "compactMode": False
    }

@router.put("/preferences", response_model=Dict[str, Any])
def update_user_preferences(
    preferences: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # For now, just return the preferences - in a real app, these would be stored in the database
    return preferences

@router.get("/security", response_model=Dict[str, Any])
def get_security_settings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return {
        "twoFactorEnabled": False,
        "sessionTimeout": 24, # hours
        "requirePasswordChange": False,
        "lastPasswordChange": current_user.created_at.isoformat() if current_user.created_at else None,
        "activeSessions": 1,
        "apiKeys": []
    }

@router.post("/security/enable-2fa")
def enable_two_factor(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # In a real app, this would generate and return a 2FA secret
    return {"message": "2FA setup initiated", "qrCode": "mock-qr-code"}

@router.post("/security/disable-2fa")
def disable_two_factor(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return {"message": "2FA disabled"}

@router.post("/security/change-password")
def change_password(
    password_data: Dict[str, str],
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    current_password = password_data.get("currentPassword")
    new_password = password_data.get("newPassword")
    
    if not current_password or not new_password:
        raise HTTPException(status_code=400, detail="Current and new passwords required")
    
    # In a real app, verify current password and hash the new password
    # For now, just return success
    return {"message": "Password changed successfully"}

@router.get("/api-keys", response_model=List[Dict[str, Any]])
def get_api_keys(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Return mock API keys - in a real app, these would be stored in the database
    return []

@router.post("/api-keys")
def create_api_key(
    key_data: Dict[str, str],
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    name = key_data.get("name")
    if not name:
        raise HTTPException(status_code=400, detail="API key name required")
    
    # In a real app, generate a real API key and store it
    mock_key = f"tk_{current_user.id}_{hash(name) % 1000000:06d}"
    
    return {
        "id": "mock-id",
        "name": name,
        "key": mock_key,
        "createdAt": "2024-01-01T00:00:00Z",
        "lastUsed": None
    }
