from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.responses import FileResponse
import os
import shutil
from pathlib import Path
import uuid
from typing import Optional

import models, schemas
from database import get_db
from routers.auth import get_current_user
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/profile", tags=["Profile"])

UPLOAD_DIR = "uploads/profile_pics"
Path(UPLOAD_DIR).mkdir(parents=True, exist_ok=True)

@router.post("/upload-picture")
async def upload_profile_pic(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Generate a unique filename
    file_extension = file.filename.split('.')[-1]
    unique_filename = f"user_{current_user.id}_{uuid.uuid4().hex}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save the file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Update user's profile_pic in database
    current_user.profile_pic = f"/{file_path}"
    db.commit()
    
    return {"message": "Profile picture uploaded successfully", "file_path": f"/{file_path}"}

@router.get("/picture/{user_id}")
async def get_profile_pic(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user or not user.profile_pic:
        # Return default profile picture
        default_pic_path = "uploads/default-avatar.png"
        if not os.path.exists(default_pic_path):
            # Create a simple default avatar if it doesn't exist
            from PIL import Image, ImageDraw
            img = Image.new('RGB', (200, 200), color='#E5E7EB')
            draw = ImageDraw.Draw(img)
            # Draw a simple circle with initials
            draw.ellipse([20, 20, 180, 180], fill='#9CA3AF')
            draw.text([90, 90], "U", fill='white')
            img.save(default_pic_path)
        return FileResponse(default_pic_path)
    
    # Remove leading slash if present for file system path
    file_path = user.profile_pic.lstrip('/')
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Profile picture file not found")
    
    return FileResponse(file_path)

@router.delete("/picture")
async def delete_profile_pic(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Delete the file if it exists
    if current_user.profile_pic:
        file_path = current_user.profile_pic.lstrip('/')
        if os.path.exists(file_path):
            os.remove(file_path)
    
    # Update database
    current_user.profile_pic = None
    db.commit()
    
    return {"message": "Profile picture deleted successfully"}

@router.get("/me", response_model=schemas.UserOut)
def get_current_user_profile(current_user: models.User = Depends(get_current_user)):
    return current_user
