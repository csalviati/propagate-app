"""Listings router: create, browse, update, and delete marketplace listings."""

import math
import os
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.deps import get_current_user_id, get_db
from app.models.models import Listing, ListingStatus, ListingType, PlantInstance
from app.schemas.schemas import ListingCreate, ListingRead, ListingUpdate, RequestCreate, RequestRead

router = APIRouter()

UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")


@router.post("", response_model=ListingRead, status_code=status.HTTP_201_CREATED)
def create_listing(
    payload: ListingCreate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> Listing:
    """Create a new listing referencing a plant instance the authenticated user owns."""
    plant = db.get(PlantInstance, payload.plant_instance_id)
    if plant is None or plant.owner_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Plant not found or not owned by you",
        )
    listing = Listing(owner_id=user_id, **payload.model_dump())
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing


@router.get(
    "",
    response_model=List[ListingRead],
    summary="Browse available listings",
)
def browse_listings(
    q: Optional[str] = Query(None, description="Search title or description"),
    type: Optional[ListingType] = Query(None, description="Filter by `cutting` or `seed`"),
    near: Optional[str] = Query(
        None,
        description="Proximity filter as `lat,lng,radius_km` — e.g. `37.77,-122.41,25`",
        example="37.77,-122.41,25",
    ),
    db: Session = Depends(get_db),
) -> List[Listing]:
    """Return available listings with optional text, type, and proximity filters.

    - **q**: case-insensitive substring match on title and description
    - **type**: `cutting` or `seed`
    - **near**: `lat,lng,radius_km` — returns only listings within *radius_km* kilometres
      of the reference point using the Haversine formula. Listings without coordinates
      are always included.
    """
    query = db.query(Listing).filter(Listing.status == ListingStatus.available)
    if q:
        pattern = f"%{q}%"
        query = query.filter(Listing.title.ilike(pattern) | Listing.description.ilike(pattern))
    if type:
        query = query.filter(Listing.type == type)

    results = query.order_by(Listing.created_at.desc()).all()

    if near:
        parts = near.split(",")
        if len(parts) == 3:
            try:
                ref_lat, ref_lng, radius_km = float(parts[0]), float(parts[1]), float(parts[2])
                results = [r for r in results if _within_radius(r, ref_lat, ref_lng, radius_km)]
            except ValueError:
                pass  # malformed near param: ignore filter

    return results


@router.get("/{listing_id}", response_model=ListingRead)
def get_listing(listing_id: int, db: Session = Depends(get_db)) -> Listing:
    """Return a single listing by id."""
    listing = db.get(Listing, listing_id)
    if listing is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    return listing


@router.patch("/{listing_id}", response_model=ListingRead)
def update_listing(
    listing_id: int,
    payload: ListingUpdate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> Listing:
    """Update title, description, or status on a listing the authenticated user owns."""
    listing = _get_owned_listing(listing_id, user_id, db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(listing, field, value)
    db.commit()
    db.refresh(listing)
    return listing


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_listing(
    listing_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> None:
    """Delete a listing the authenticated user owns."""
    listing = _get_owned_listing(listing_id, user_id, db)
    db.delete(listing)
    db.commit()


@router.post("/{listing_id}/photo", response_model=ListingRead)
def upload_listing_photo(
    listing_id: int,
    file: UploadFile = File(...),
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> Listing:
    """Upload / replace a photo for a listing the authenticated user owns."""
    listing = _get_owned_listing(listing_id, user_id, db)
    ext = os.path.splitext(file.filename or "photo")[1] or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    dest = os.path.join(UPLOADS_DIR, filename)
    os.makedirs(UPLOADS_DIR, exist_ok=True)
    with open(dest, "wb") as fh:
        fh.write(file.file.read())
    listing.photo_url = f"/static/{filename}"
    db.commit()
    db.refresh(listing)
    return listing


# ---------------------------------------------------------------------------
# Requests sub-resource (lives on /listings/{id}/requests)
# ---------------------------------------------------------------------------

from app.models.models import Request  # noqa: E402 (avoids circular import at top)
from app.schemas.schemas import RequestCreate, RequestRead  # noqa: E402


@router.post(
    "/{listing_id}/requests",
    response_model=RequestRead,
    status_code=status.HTTP_201_CREATED,
    summary="Request a listing",
    responses={
        400: {"description": "Listing not available, or requester is the owner"},
        404: {"description": "Listing not found"},
    },
)
def create_request(
    listing_id: int,
    payload: RequestCreate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> "Request":
    """Submit a request to claim (or barter for) a listing.

    Optionally include `offered_listing_id` to propose a barter — offering one
    of your own listings in exchange.

    The listing owner will see this in their inbox and can `accept`, `decline`,
    or let it remain `pending`.
    """
    listing = db.get(Listing, listing_id)
    if listing is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    if listing.owner_id == user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot request your own listing")
    if listing.status != ListingStatus.available:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Listing is not available")

    request = Request(
        listing_id=listing_id,
        requester_id=user_id,
        message=payload.message,
        offered_listing_id=payload.offered_listing_id,
    )
    db.add(request)
    db.commit()
    db.refresh(request)
    return request


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _get_owned_listing(listing_id: int, user_id: int, db: Session) -> Listing:
    """Fetch a listing by id and assert the requesting user owns it."""
    listing = db.get(Listing, listing_id)
    if listing is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    if listing.owner_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your listing")
    return listing


def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Return the great-circle distance in kilometres between two lat/lng points."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng / 2) ** 2
    return R * 2 * math.asin(math.sqrt(a))


def _within_radius(listing: Listing, ref_lat: float, ref_lng: float, radius_km: float) -> bool:
    """Return True if *listing* has coordinates and falls within *radius_km* of the reference point."""
    if listing.lat is None or listing.lng is None:
        return True  # include listings without coordinates
    return _haversine_km(ref_lat, ref_lng, listing.lat, listing.lng) <= radius_km
