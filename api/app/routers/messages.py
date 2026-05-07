"""Messages router: per-request thread get and post."""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.deps import get_current_user_id, get_db
from app.models.models import Listing, Message, Request
from app.schemas.schemas import MessageCreate, MessageRead

router = APIRouter()


@router.get("/{request_id}/messages", response_model=List[MessageRead])
def get_messages(
    request_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> List[Message]:
    """Return all messages in the thread for *request_id*.

    Only the requester and the listing owner may read messages.
    """
    _assert_party(request_id, user_id, db)
    return (
        db.query(Message)
        .filter(Message.request_id == request_id)
        .order_by(Message.created_at.asc())
        .all()
    )


@router.post("/{request_id}/messages", response_model=MessageRead, status_code=status.HTTP_201_CREATED)
def send_message(
    request_id: int,
    payload: MessageCreate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> Message:
    """Append a message to the thread for *request_id*.

    Only the requester and the listing owner may post messages.
    """
    _assert_party(request_id, user_id, db)
    msg = Message(request_id=request_id, sender_id=user_id, body=payload.body)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


def _assert_party(request_id: int, user_id: int, db: Session) -> None:
    """Raise 403 unless *user_id* is the requester or listing owner for *request_id*."""
    req = db.get(Request, request_id)
    if req is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    listing = db.get(Listing, req.listing_id)
    if req.requester_id != user_id and (listing is None or listing.owner_id != user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
