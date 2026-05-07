"""Requests router: accept, decline, cancel, complete exchanges."""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.deps import get_current_user_id, get_db
from app.models.models import Exchange, Listing, ListingStatus, PlantInstance, Request, RequestStatus
from app.schemas.schemas import RequestRead

router = APIRouter()


@router.get("/{request_id}", response_model=RequestRead)
def get_request(
    request_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> Request:
    """Return a single request the authenticated user is party to."""
    req = _get_accessible_request(request_id, user_id, db)
    return req


@router.get("", response_model=List[RequestRead])
def list_my_requests(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> List[Request]:
    """Return all requests where the authenticated user is either the requester or listing owner."""
    from app.models.models import Listing  # local to avoid circular
    owned_listing_ids = [l.id for l in db.query(Listing).filter(Listing.owner_id == user_id).all()]
    return (
        db.query(Request)
        .filter(
            (Request.requester_id == user_id) | (Request.listing_id.in_(owned_listing_ids))
        )
        .order_by(Request.created_at.desc())
        .all()
    )


@router.post("/{request_id}/accept", response_model=RequestRead)
def accept_request(
    request_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> Request:
    """Accept a pending request on a listing the authenticated user owns.

    Sets the request status to *accepted* and the listing status to *reserved*.
    """
    req = _get_pending_request(request_id, db)
    listing = db.get(Listing, req.listing_id)
    if listing is None or listing.owner_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your listing")
    req.status = RequestStatus.accepted
    listing.status = ListingStatus.reserved
    db.commit()
    db.refresh(req)
    return req


@router.post("/{request_id}/decline", response_model=RequestRead)
def decline_request(
    request_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> Request:
    """Decline a pending request on a listing the authenticated user owns."""
    req = _get_pending_request(request_id, db)
    listing = db.get(Listing, req.listing_id)
    if listing is None or listing.owner_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your listing")
    req.status = RequestStatus.declined
    db.commit()
    db.refresh(req)
    return req


@router.post("/{request_id}/cancel", response_model=RequestRead)
def cancel_request(
    request_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> Request:
    """Cancel a pending or accepted request.  Either party may cancel."""
    req = _get_accessible_request(request_id, user_id, db)
    if req.status not in (RequestStatus.pending, RequestStatus.accepted):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot cancel a completed or declined request")
    if req.status == RequestStatus.accepted:
        # Restore listing to available
        listing = db.get(Listing, req.listing_id)
        if listing:
            listing.status = ListingStatus.available
    req.status = RequestStatus.cancelled
    db.commit()
    db.refresh(req)
    return req


@router.post(
    "/{request_id}/complete",
    response_model=RequestRead,
    summary="Complete an exchange (creates lineage edge)",
    responses={
        400: {"description": "Request must be in `accepted` status"},
        403: {"description": "Only the listing owner can complete"},
    },
)
def complete_request(
    request_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> Request:
    """Complete an accepted exchange.

    - Creates a new ``PlantInstance`` for the recipient with ``parent_id``
      pointing at the donor's plant, recording the lineage edge.
    - Writes an ``Exchange`` row.
    - Marks the listing *completed* and the request *completed*.

    Only the listing owner (donor) can trigger completion.
    """
    req = db.get(Request, request_id)
    if req is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

    listing = db.get(Listing, req.listing_id)
    if listing is None or listing.owner_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your listing")
    if req.status != RequestStatus.accepted:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Request must be accepted before completing")

    donor_plant = db.get(PlantInstance, listing.plant_instance_id)
    if donor_plant is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Donor plant not found")

    # Create the recipient's new plant instance (the lineage child)
    recipient_plant = PlantInstance(
        owner_id=req.requester_id,
        common_name=donor_plant.common_name,
        variety=donor_plant.variety,
        species_id=donor_plant.species_id,
        parent_id=donor_plant.id,
        origin_user_id=donor_plant.origin_user_id or donor_plant.owner_id,
    )
    db.add(recipient_plant)
    db.flush()  # get recipient_plant.id

    exchange = Exchange(
        request_id=req.id,
        donor_id=user_id,
        recipient_id=req.requester_id,
        donor_plant_instance_id=donor_plant.id,
        recipient_plant_instance_id=recipient_plant.id,
    )
    db.add(exchange)

    req.status = RequestStatus.completed
    listing.status = ListingStatus.completed

    db.commit()
    db.refresh(req)
    return req


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _get_accessible_request(request_id: int, user_id: int, db: Session) -> Request:
    """Fetch a request the authenticated user is party to (requester or listing owner)."""
    req = db.get(Request, request_id)
    if req is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    listing = db.get(Listing, req.listing_id)
    if req.requester_id != user_id and (listing is None or listing.owner_id != user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return req


def _get_pending_request(request_id: int, db: Session) -> Request:
    """Fetch a request and assert it is in *pending* status."""
    req = db.get(Request, request_id)
    if req is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    if req.status != RequestStatus.pending:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Request is not pending")
    return req
