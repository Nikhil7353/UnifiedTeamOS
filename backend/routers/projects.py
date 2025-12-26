from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models, schemas
from database import get_db
from routers.auth import get_current_user

router = APIRouter(prefix="/api/projects", tags=["Projects"])

@router.get("", response_model=List[schemas.ProjectOut])
def list_projects(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.Project)
        .filter(models.Project.owner_id == current_user.id)
        .order_by(models.Project.created_at.desc())
        .all()
    )

@router.post("", response_model=schemas.ProjectOut)
def create_project(
    payload: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    project = models.Project(
        owner_id=current_user.id,
        name=payload.name,
        description=payload.description
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@router.get("/{project_id}", response_model=schemas.ProjectOut)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    project = (
        db.query(models.Project)
        .filter(models.Project.id == project_id, models.Project.owner_id == current_user.id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.put("/{project_id}", response_model=schemas.ProjectOut)
def update_project(
    project_id: int,
    payload: schemas.ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    project = (
        db.query(models.Project)
        .filter(models.Project.id == project_id, models.Project.owner_id == current_user.id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if payload.name is not None:
        project.name = payload.name
    if payload.description is not None:
        project.description = payload.description

    db.commit()
    db.refresh(project)
    return project

@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    project = (
        db.query(models.Project)
        .filter(models.Project.id == project_id, models.Project.owner_id == current_user.id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    db.delete(project)
    db.commit()
    return {"deleted": True}

# Project Cards/Tasks
@router.get("/{project_id}/cards", response_model=List[schemas.ProjectCardOut])
def list_project_cards(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Verify project ownership
    project = (
        db.query(models.Project)
        .filter(models.Project.id == project_id, models.Project.owner_id == current_user.id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return (
        db.query(models.ProjectCard)
        .filter(models.ProjectCard.project_id == project_id)
        .order_by(models.ProjectCard.order.asc())
        .all()
    )

@router.post("/{project_id}/cards", response_model=schemas.ProjectCardOut)
def create_project_card(
    project_id: int,
    payload: schemas.ProjectCardCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Verify project ownership
    project = (
        db.query(models.Project)
        .filter(models.Project.id == project_id, models.Project.owner_id == current_user.id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Get next order value
    max_order = db.query(models.ProjectCard).filter(
        models.ProjectCard.project_id == project_id
    ).order_by(models.ProjectCard.order.desc()).first()
    next_order = (max_order.order + 1) if max_order else 1

    card = models.ProjectCard(
        project_id=project_id,
        title=payload.title,
        description=payload.description,
        status=payload.status or "todo",
        priority=payload.priority or "medium",
        assignee_id=payload.assignee_id,
        due_date=payload.due_date,
        order=next_order
    )
    db.add(card)
    db.commit()
    db.refresh(card)
    return card

@router.put("/cards/{card_id}", response_model=schemas.ProjectCardOut)
def update_project_card(
    card_id: int,
    payload: schemas.ProjectCardUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    card = (
        db.query(models.ProjectCard)
        .join(models.Project)
        .filter(
            models.ProjectCard.id == card_id,
            models.Project.owner_id == current_user.id
        )
        .first()
    )
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    if payload.title is not None:
        card.title = payload.title
    if payload.description is not None:
        card.description = payload.description
    if payload.status is not None:
        card.status = payload.status
    if payload.priority is not None:
        card.priority = payload.priority
    if payload.assignee_id is not None:
        card.assignee_id = payload.assignee_id
    if payload.due_date is not None:
        card.due_date = payload.due_date
    if payload.order is not None:
        card.order = payload.order

    db.commit()
    db.refresh(card)
    return card

@router.delete("/cards/{card_id}")
def delete_project_card(
    card_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    card = (
        db.query(models.ProjectCard)
        .join(models.Project)
        .filter(
            models.ProjectCard.id == card_id,
            models.Project.owner_id == current_user.id
        )
        .first()
    )
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    db.delete(card)
    db.commit()
    return {"deleted": True}
