"""Notes router: care tips and observations on plant instances."""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.deps import get_current_user_id, get_db
from app.models.models import NoteVisibility, PlantInstance, PlantNote
from app.schemas.schemas import NoteCreate, NoteRead

router = APIRouter()


@router.post("/{plant_id}/notes", response_model=NoteRead, status_code=status.HTTP_201_CREATED)
def create_note(
    plant_id: int,
    payload: NoteCreate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> PlantNote:
    """Add a care note to a plant instance.

    Any authenticated user may add a public note to any plant.  Private notes
    are limited to the plant's owner.
    """
    plant = db.get(PlantInstance, plant_id)
    if plant is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plant not found")
    if payload.visibility == NoteVisibility.private and plant.owner_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the plant owner can add private notes",
        )
    note = PlantNote(plant_instance_id=plant_id, author_id=user_id, **payload.model_dump())
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.get("/{plant_id}/notes", response_model=List[NoteRead])
def list_notes(
    plant_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> List[PlantNote]:
    """Return notes for a plant.

    Private notes are filtered to only those authored by the requesting user.
    """
    plant = db.get(PlantInstance, plant_id)
    if plant is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plant not found")

    query = db.query(PlantNote).filter(PlantNote.plant_instance_id == plant_id)
    if plant.owner_id != user_id:
        # Non-owners see only public notes
        query = query.filter(PlantNote.visibility == NoteVisibility.public)
    return query.order_by(PlantNote.created_at.desc()).all()
