"""Plants router: CRUD for plant instances, photo upload, species typeahead, and lineage."""

import os
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.deps import get_current_user_id, get_db
from app.models.models import PlantInstance, PlantSpecies
from app.schemas.schemas import (
    LineageNode,
    NoteCreate,
    NoteRead,
    PlantCreate,
    PlantRead,
    PlantUpdate,
    SpeciesRead,
)

router = APIRouter()

UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")


# ---------------------------------------------------------------------------
# Species typeahead
# ---------------------------------------------------------------------------


@router.get("/species", response_model=List[SpeciesRead], summary="Search species catalogue")
def search_species(q: str = Query("", min_length=0), db: Session = Depends(get_db)) -> List[PlantSpecies]:
    """Typeahead search over the curated species catalogue.

    Returns up to 20 species whose **scientific name** or **common name** contains `q`
    (case-insensitive). Pass an empty `q` to list all species.
    Results can be linked to a plant instance via `species_id`.
    """
    pattern = f"%{q}%"
    return (
        db.query(PlantSpecies)
        .filter(
            PlantSpecies.scientific_name.ilike(pattern)
            | PlantSpecies.common_name.ilike(pattern)
        )
        .limit(20)
        .all()
    )


# ---------------------------------------------------------------------------
# Plant instance CRUD
# ---------------------------------------------------------------------------


@router.get("", response_model=List[PlantRead], summary="List my plants")
def list_my_plants(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> List[PlantInstance]:
    """Return all plant instances owned by the authenticated user."""
    return db.query(PlantInstance).filter(PlantInstance.owner_id == user_id).all()


@router.post("", response_model=PlantRead, status_code=status.HTTP_201_CREATED, summary="Add a plant to my library")
def create_plant(
    payload: PlantCreate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> PlantInstance:
    """Add a new plant to the authenticated user's library."""
    plant = PlantInstance(
        owner_id=user_id,
        origin_user_id=user_id,
        **payload.model_dump(),
    )
    db.add(plant)
    db.commit()
    db.refresh(plant)
    return plant


@router.get("/{plant_id}", response_model=PlantRead, summary="Get a plant by ID")
def get_plant(plant_id: int, db: Session = Depends(get_db)) -> PlantInstance:
    """Return a single plant instance by id (publicly readable)."""
    plant = db.get(PlantInstance, plant_id)
    if plant is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plant not found")
    return plant


@router.patch("/{plant_id}", response_model=PlantRead)
def update_plant(
    plant_id: int,
    payload: PlantUpdate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> PlantInstance:
    """Update fields on a plant instance the authenticated user owns."""
    plant = _get_owned_plant(plant_id, user_id, db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(plant, field, value)
    db.commit()
    db.refresh(plant)
    return plant


@router.delete("/{plant_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_plant(
    plant_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> None:
    """Delete a plant instance the authenticated user owns."""
    plant = _get_owned_plant(plant_id, user_id, db)
    db.delete(plant)
    db.commit()


@router.post("/{plant_id}/photo", response_model=PlantRead)
def upload_plant_photo(
    plant_id: int,
    file: UploadFile = File(...),
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> PlantInstance:
    """Replace the photo for a plant instance the authenticated user owns.

    The file is stored in ``api/uploads/`` and the URL is saved on the plant.
    """
    plant = _get_owned_plant(plant_id, user_id, db)
    ext = os.path.splitext(file.filename or "photo")[1] or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    dest = os.path.join(UPLOADS_DIR, filename)
    os.makedirs(UPLOADS_DIR, exist_ok=True)
    with open(dest, "wb") as fh:
        fh.write(file.file.read())
    plant.photo_url = f"/static/{filename}"
    db.commit()
    db.refresh(plant)
    return plant


# ---------------------------------------------------------------------------
# Lineage
# ---------------------------------------------------------------------------


@router.get(
    "/{plant_id}/lineage",
    response_model=LineageNode,
    summary="Get the full propagation lineage tree",
)
def get_lineage(plant_id: int, db: Session = Depends(get_db)) -> LineageNode:
    """Return the full propagation lineage tree rooted at the **origin ancestor** of this plant.

    The response is a nested tree of `LineageNode` objects:
    ```json
    {
      "id": 1, "common_name": "Monstera", "children": [
        { "id": 3, "common_name": "Monstera", "children": [...] }
      ]
    }
    ```
    Each node represents a plant instance. An edge from parent → child means
    a completed exchange produced that child plant. Rendered as an interactive
    tree on the web app at `/library/{id}/lineage`.
    """
    # Walk up to the origin ancestor
    plant = db.get(PlantInstance, plant_id)
    if plant is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plant not found")

    root_id = _find_root(plant, db)
    return _build_node(root_id, db)


# ---------------------------------------------------------------------------
# Notes (delegated to notes router but keeping the GET here for convenience)
# ---------------------------------------------------------------------------


def _get_owned_plant(plant_id: int, user_id: int, db: Session) -> PlantInstance:
    """Fetch a plant by id and assert the requesting user owns it.

    Raises 404 if not found, 403 if ownership check fails.
    """
    plant = db.get(PlantInstance, plant_id)
    if plant is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plant not found")
    if plant.owner_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your plant")
    return plant


def _find_root(plant: PlantInstance, db: Session) -> int:
    """Walk parent pointers until we reach the origin (a plant with no parent)."""
    visited = set()
    current = plant
    while current.parent_id is not None:
        if current.parent_id in visited:
            break  # guard against corrupt cycles
        visited.add(current.id)
        current = db.get(PlantInstance, current.parent_id)
        if current is None:
            break
    return current.id


def _build_node(plant_id: int, db: Session) -> LineageNode:
    """Recursively build a ``LineageNode`` tree for *plant_id* and its children."""
    plant = db.get(PlantInstance, plant_id)
    if plant is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plant not found")
    children = db.query(PlantInstance).filter(PlantInstance.parent_id == plant_id).all()
    return LineageNode(
        id=plant.id,
        owner_id=plant.owner_id,
        common_name=plant.common_name,
        nickname=plant.nickname,
        photo_url=plant.photo_url,
        children=[_build_node(child.id, db) for child in children],
    )
