"""SQLAlchemy ORM models for every entity in the Propagate data model.

Each class maps to a PostgreSQL table.  Relationships are declared with
``relationship()`` so that cross-table navigation works in Python; foreign
key constraints are also enforced at the DB level via Alembic migrations.
"""

from __future__ import annotations

import enum
from datetime import datetime
from typing import List, Optional

from sqlalchemy import (
    BigInteger,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


# ---------------------------------------------------------------------------
# Enum types (mirrored in Alembic migration as native PG enums)
# ---------------------------------------------------------------------------


class ListingType(str, enum.Enum):
    cutting = "cutting"
    seed = "seed"


class ListingStatus(str, enum.Enum):
    available = "available"
    reserved = "reserved"
    completed = "completed"
    cancelled = "cancelled"


class RequestStatus(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    declined = "declined"
    completed = "completed"
    cancelled = "cancelled"


class NoteVisibility(str, enum.Enum):
    private = "private"
    public = "public"


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------


class User(Base):
    """A registered gardener on the platform."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    lat: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    lng: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    plants: Mapped[List["PlantInstance"]] = relationship(
        "PlantInstance", back_populates="owner", foreign_keys="PlantInstance.owner_id"
    )
    listings: Mapped[List["Listing"]] = relationship("Listing", back_populates="owner")
    sent_requests: Mapped[List["Request"]] = relationship("Request", back_populates="requester")
    posts: Mapped[List["Post"]] = relationship("Post", back_populates="author")
    following: Mapped[List["Follow"]] = relationship(
        "Follow", back_populates="follower", foreign_keys="Follow.follower_id"
    )
    followers: Mapped[List["Follow"]] = relationship(
        "Follow", back_populates="followee", foreign_keys="Follow.followee_id"
    )


class PlantSpecies(Base):
    """Curated species / taxonomy record.  Optional; can remain empty in MVP."""

    __tablename__ = "plant_species"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    scientific_name: Mapped[str] = mapped_column(String(200), unique=True, nullable=False, index=True)
    common_name: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    instances: Mapped[List["PlantInstance"]] = relationship("PlantInstance", back_populates="species")


class PlantInstance(Base):
    """A specific plant owned by a user, optionally linked to a curated species.

    Lineage is modelled as a self-referencing parent pointer: ``parent_id``
    references the donor's ``PlantInstance`` row that produced this one.
    """

    __tablename__ = "plant_instances"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    owner_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    species_id: Mapped[Optional[int]] = mapped_column(
        BigInteger, ForeignKey("plant_species.id", ondelete="SET NULL"), nullable=True, index=True
    )
    common_name: Mapped[str] = mapped_column(String(200), nullable=False)
    variety: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    nickname: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    photo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    parent_id: Mapped[Optional[int]] = mapped_column(
        BigInteger, ForeignKey("plant_instances.id", ondelete="SET NULL"), nullable=True, index=True
    )
    origin_user_id: Mapped[Optional[int]] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    owner: Mapped["User"] = relationship("User", back_populates="plants", foreign_keys=[owner_id])
    species: Mapped[Optional["PlantSpecies"]] = relationship("PlantSpecies", back_populates="instances")
    parent: Mapped[Optional["PlantInstance"]] = relationship(
        "PlantInstance", back_populates="children", remote_side="PlantInstance.id"
    )
    children: Mapped[List["PlantInstance"]] = relationship("PlantInstance", back_populates="parent")
    listings: Mapped[List["Listing"]] = relationship("Listing", back_populates="plant_instance")
    plant_notes: Mapped[List["PlantNote"]] = relationship("PlantNote", back_populates="plant_instance")
    posts: Mapped[List["Post"]] = relationship("Post", back_populates="plant_instance")


class Listing(Base):
    """A marketplace offer to donate or barter a cutting or seed."""

    __tablename__ = "listings"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    owner_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    plant_instance_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("plant_instances.id", ondelete="CASCADE"), nullable=False, index=True
    )
    type: Mapped[ListingType] = mapped_column(Enum(ListingType, name="listing_type"), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    photo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    lat: Mapped[Optional[float]] = mapped_column(Float, nullable=True, index=True)
    lng: Mapped[Optional[float]] = mapped_column(Float, nullable=True, index=True)
    status: Mapped[ListingStatus] = mapped_column(
        Enum(ListingStatus, name="listing_status"),
        nullable=False,
        default=ListingStatus.available,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    owner: Mapped["User"] = relationship("User", back_populates="listings")
    plant_instance: Mapped["PlantInstance"] = relationship("PlantInstance", back_populates="listings")
    requests: Mapped[List["Request"]] = relationship(
        "Request", back_populates="listing", foreign_keys="Request.listing_id"
    )


class Request(Base):
    """A request from one user to claim (or barter for) a listing."""

    __tablename__ = "requests"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    listing_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, index=True
    )
    requester_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    offered_listing_id: Mapped[Optional[int]] = mapped_column(
        BigInteger, ForeignKey("listings.id", ondelete="SET NULL"), nullable=True
    )
    status: Mapped[RequestStatus] = mapped_column(
        Enum(RequestStatus, name="request_status"),
        nullable=False,
        default=RequestStatus.pending,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    listing: Mapped["Listing"] = relationship(
        "Listing", back_populates="requests", foreign_keys=[listing_id]
    )
    requester: Mapped["User"] = relationship("User", back_populates="sent_requests")
    exchange: Mapped[Optional["Exchange"]] = relationship(
        "Exchange", back_populates="request", uselist=False
    )
    thread: Mapped[List["Message"]] = relationship("Message", back_populates="request")


class Exchange(Base):
    """Completed exchange record linking donor and recipient plant instances.

    Creating this row also creates a new ``PlantInstance`` for the recipient
    with ``parent_id`` set to the donor's instance, forming the lineage tree.
    """

    __tablename__ = "exchanges"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    request_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("requests.id", ondelete="RESTRICT"), unique=True, nullable=False
    )
    donor_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    recipient_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    donor_plant_instance_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("plant_instances.id", ondelete="RESTRICT"), nullable=False
    )
    recipient_plant_instance_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("plant_instances.id", ondelete="RESTRICT"), nullable=False
    )
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    request: Mapped["Request"] = relationship("Request", back_populates="exchange")


class Message(Base):
    """A single message within a per-request thread."""

    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    request_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("requests.id", ondelete="CASCADE"), nullable=False, index=True
    )
    sender_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    body: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    request: Mapped["Request"] = relationship("Request", back_populates="thread")
    sender: Mapped["User"] = relationship("User")


class PlantNote(Base):
    """A care tip or observation attached to a specific plant instance."""

    __tablename__ = "plant_notes"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    plant_instance_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("plant_instances.id", ondelete="CASCADE"), nullable=False, index=True
    )
    author_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    body: Mapped[str] = mapped_column(Text, nullable=False)
    visibility: Mapped[NoteVisibility] = mapped_column(
        Enum(NoteVisibility, name="note_visibility"),
        nullable=False,
        default=NoteVisibility.private,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    plant_instance: Mapped["PlantInstance"] = relationship("PlantInstance", back_populates="plant_notes")
    author: Mapped["User"] = relationship("User")


class Post(Base):
    """A social feed post optionally linked to a specific plant instance."""

    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    author_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    plant_instance_id: Mapped[Optional[int]] = mapped_column(
        BigInteger, ForeignKey("plant_instances.id", ondelete="SET NULL"), nullable=True, index=True
    )
    body: Mapped[str] = mapped_column(Text, nullable=False)
    photo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    author: Mapped["User"] = relationship("User", back_populates="posts")
    plant_instance: Mapped[Optional["PlantInstance"]] = relationship(
        "PlantInstance", back_populates="posts"
    )


class Follow(Base):
    """Directional follow relationship between two users."""

    __tablename__ = "follows"
    __table_args__ = (UniqueConstraint("follower_id", "followee_id", name="uq_follows"),)

    follower_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    followee_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    follower: Mapped["User"] = relationship(
        "User", back_populates="following", foreign_keys=[follower_id]
    )
    followee: Mapped["User"] = relationship(
        "User", back_populates="followers", foreign_keys=[followee_id]
    )
