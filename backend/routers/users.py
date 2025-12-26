from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models, schemas
from database import get_db
from routers.auth import get_current_user

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get("/me", response_model=schemas.UserOut)
def get_current_user_profile(
    current_user: models.User = Depends(get_current_user)
):
    return current_user

@router.put("/me", response_model=schemas.UserOut)
def update_current_user_profile(
    user_update: schemas.UserUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Update user fields if provided
    if user_update.username is not None:
        # Check if username is already taken by another user
        existing_user = db.query(models.User).filter(
            models.User.username == user_update.username,
            models.User.id != current_user.id
        ).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already taken")
        current_user.username = user_update.username
    
    if user_update.email is not None:
        # Check if email is already taken by another user
        existing_user = db.query(models.User).filter(
            models.User.email == user_update.email,
            models.User.id != current_user.id
        ).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already taken")
        current_user.email = user_update.email
    
    if user_update.profile_pic is not None:
        current_user.profile_pic = user_update.profile_pic
    
    db.commit()
    db.refresh(current_user)
    return current_user
