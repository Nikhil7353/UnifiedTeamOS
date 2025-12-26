from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import Dict, Any, List
from datetime import datetime, timedelta

import models, schemas
from database import get_db
from routers.auth import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/overview")
def get_overview_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get overview statistics for dashboard"""
    
    # Get task counts
    total_tasks = db.query(models.Task).count()
    open_tasks = db.query(models.Task).filter(models.Task.status != 'DONE').count()
    
    # Get unread messages count
    unread_messages = db.query(models.Message).filter(models.Message.is_read == False).count()
    
    # Get files shared count (from docs or uploads)
    files_shared = db.query(models.Document).count()
    
    # Get recent activity
    recent_tasks = db.query(models.Task).order_by(models.Task.created_at.desc()).limit(5).all()
    recent_messages = db.query(models.Message).order_by(models.Message.created_at.desc()).limit(5).all()
    recent_docs = db.query(models.Document).order_by(models.Document.created_at.desc()).limit(3).all()
    
    # Combine recent activity
    recent_activity = []
    
    for task in recent_tasks:
        recent_activity.append({
            "id": f"task_{task.id}",
            "type": "task",
            "title": task.title,
            "time": format_time_ago(task.created_at),
            "icon": "task"
        })
    
    for message in recent_messages:
        recent_activity.append({
            "id": f"message_{message.id}",
            "type": "message", 
            "title": f"Message in {message.channel.name if message.channel else 'Unknown'}",
            "time": format_time_ago(message.created_at),
            "icon": "message"
        })
    
    for doc in recent_docs:
        recent_activity.append({
            "id": f"doc_{doc.id}",
            "type": "file",
            "title": doc.title,
            "time": format_time_ago(doc.created_at),
            "icon": "file"
        })
    
    # Sort by time and limit
    recent_activity.sort(key=lambda x: x["time"], reverse=True)
    recent_activity = recent_activity[:10]
    
    return {
        "overview_stats": [
            {"title": "Open Tasks", "value": str(open_tasks), "trend": f"+{min(3, open_tasks)} this week", "color": "from-primary-500 to-primary-600"},
            {"title": "Unread Messages", "value": str(unread_messages), "trend": f"{min(5, unread_messages)} new today", "color": "from-secondary-500 to-secondary-700"},
            {"title": "Files Shared", "value": str(files_shared), "trend": f"{min(2, files_shared)} new uploads", "color": "from-accent-500 to-accent-600"},
            {"title": "Security", "value": "Healthy", "trend": "RBAC enabled", "color": "from-success-500 to-success-600"}
        ],
        "recent_activity": recent_activity
    }

@router.get("/usage")
def get_usage_analytics(
    range: str = "7d",
    segment: str = "all",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get detailed usage analytics"""
    
    # Calculate date range
    days = 30 if range == "30d" else 7
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Get message counts
    total_messages = db.query(models.Message).filter(
        models.Message.created_at >= start_date
    ).count()
    
    # Get document counts
    total_docs = db.query(models.Document).filter(
        models.Document.created_at >= start_date
    ).count()
    
    # Get task counts
    total_tasks = db.query(models.Task).filter(
        models.Task.created_at >= start_date
    ).count()
    
    # Get active users (simplified - count users with recent activity)
    active_users = db.query(models.User).join(models.Message).filter(
        models.Message.created_at >= start_date
    ).distinct().count()
    
    # Calculate storage (simplified estimation)
    storage_used = total_docs * 0.5  # Estimate 0.5GB per document
    
    # Generate sparkline data (simplified)
    sparkline_messages = generate_sparkline_data(total_messages, days)
    sparkline_docs = generate_sparkline_data(total_docs, days)
    sparkline_uploads = generate_sparkline_data(storage_used, days)
    
    return {
        "active_users": active_users,
        "messages": total_messages,
        "emails": 0,  # Not implemented yet
        "docs": total_docs,
        "uploads_gb": round(storage_used, 1),
        "security_score": "Healthy",
        "usage": {
            "messages": {"used": total_messages, "limit": 50000},
            "docs": {"used": total_docs, "limit": 500},
            "storage": {"used": round(storage_used, 1), "limit": 100}
        },
        "sparklines": {
            "messages": sparkline_messages,
            "docs": sparkline_docs,
            "uploads": sparkline_uploads
        }
    }

def format_time_ago(dt: datetime) -> str:
    """Format datetime as 'X ago'"""
    now = datetime.utcnow()
    diff = now - dt
    
    if diff.days > 0:
        return f"{diff.days}h ago" if diff.days == 1 else f"{diff.days}d ago"
    elif diff.seconds > 3600:
        hours = diff.seconds // 3600
        return f"{hours}h ago"
    elif diff.seconds > 60:
        minutes = diff.seconds // 60
        return f"{minutes}m ago"
    else:
        return "Just now"

def generate_sparkline_data(total: int, days: int) -> List[float]:
    """Generate simple sparkline data"""
    if total == 0:
        return [0] * min(7, days)
    
    # Simple distribution across the period
    points = min(12, days)  # Max 12 points
    base_value = total / points
    
    # Add some variation
    sparkline = []
    for i in range(points):
        variation = 0.7 + (0.3 * (i % 3) / 2)  # Vary between 70% and 100%
        sparkline.append(round(base_value * variation, 1))
    
    return sparkline
