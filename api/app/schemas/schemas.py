"""Pydantic schemas for all API request and response payloads."""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr

from app.models.models import ListingStatus, ListingType, NoteVisibility, RequestStatus


# ---------------------------------------------------------------------------
# User
# ---------------------------------------------------------------------------


class UserBase(BaseModel):
    """Fields shared across user read/write operations."""

    email: EmailStr
    display_name: str
    bio: Optional[str] = None
    city: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None


class UserCreate(UserBase):
    """Payload for registering a new user."""

    password: str


class UserRead(UserBase):
    """Public user profile returned from the API."""

    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------


class LoginRequest(BaseModel):
    """Credentials for email/password login."""

    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """JWT access token returned on successful auth."""

    access_token: str
    token_type: str = "bearer"


# ---------------------------------------------------------------------------
# PlantSpecies
# ---------------------------------------------------------------------------


class SpeciesRead(BaseModel):
    """Curated species record."""

    id: int
    scientific_name: str
    common_name: Optional[str] = None

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# PlantInstance
# ---------------------------------------------------------------------------


class PlantCreate(BaseModel):
    """Payload for adding a plant to the user's library."""

    common_name: str
    variety: Optional[str] = None
    nickname: Optional[str] = None
    notes: Optional[str] = None
    species_id: Optional[int] = None


class PlantUpdate(BaseModel):
    """Partial update for a plant instance."""

    common_name: Optional[str] = None
    variety: Optional[str] = None
    nickname: Optional[str] = None
    notes: Optional[str] = None
    species_id: Optional[int] = None


class PlantRead(BaseModel):
    """Plant instance returned from the API."""

    id: int
    owner_id: int
    species_id: Optional[int] = None
    common_name: str
    variety: Optional[str] = None
    nickname: Optional[str] = None
    notes: Optional[str] = None
    photo_url: Optional[str] = None
    parent_id: Optional[int] = None
    origin_user_id: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class LineageNode(BaseModel):
    """A single node in the lineage tree with nested children."""

    id: int
    owner_id: int
    common_name: str
    nickname: Optional[str] = None
    photo_url: Optional[str] = None
    children: List["LineageNode"] = []

    model_config = {"from_attributes": True}


LineageNode.model_rebuild()


# ---------------------------------------------------------------------------
# Listing
# ---------------------------------------------------------------------------


class ListingCreate(BaseModel):
    """Payload for creating a new listing."""

    plant_instance_id: int
    type: ListingType
    title: str
    description: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None


class ListingUpdate(BaseModel):
    """Partial update for a listing."""

    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ListingStatus] = None


class ListingRead(BaseModel):
    """Listing returned from the API."""

    id: int
    owner_id: int
    plant_instance_id: int
    type: ListingType
    title: str
    description: Optional[str] = None
    photo_url: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    status: ListingStatus
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Request
# ---------------------------------------------------------------------------


class RequestCreate(BaseModel):
    """Payload for submitting a request on a listing."""

    message: Optional[str] = None
    offered_listing_id: Optional[int] = None


class RequestRead(BaseModel):
    """Request returned from the API."""

    id: int
    listing_id: int
    requester_id: int
    message: Optional[str] = None
    offered_listing_id: Optional[int] = None
    status: RequestStatus
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Message
# ---------------------------------------------------------------------------


class MessageCreate(BaseModel):
    """Payload for sending a message in a request thread."""

    body: str


class MessageRead(BaseModel):
    """Message returned from the API."""

    id: int
    request_id: int
    sender_id: int
    body: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# PlantNote
# ---------------------------------------------------------------------------


class NoteCreate(BaseModel):
    """Payload for adding a care note to a plant."""

    body: str
    visibility: NoteVisibility = NoteVisibility.private


class NoteRead(BaseModel):
    """Plant note returned from the API."""

    id: int
    plant_instance_id: int
    author_id: int
    body: str
    visibility: NoteVisibility
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Post
# ---------------------------------------------------------------------------


class PostCreate(BaseModel):
    """Payload for creating a feed post."""

    body: str
    plant_instance_id: Optional[int] = None


class PostRead(BaseModel):
    """Feed post returned from the API."""

    id: int
    author_id: int
    plant_instance_id: Optional[int] = None
    body: str
    photo_url: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Follow
# ---------------------------------------------------------------------------


class FollowRead(BaseModel):
    """Follow relationship record."""

    follower_id: int
    followee_id: int
    created_at: datetime

    model_config = {"from_attributes": True}
