"""Seed script: populates the development database with sample data.

Run from api/ with:
    .venv/bin/python scripts/seed.py
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from passlib.context import CryptContext
from app.db import SessionLocal
from app.models.models import (
    Follow,
    Listing,
    ListingStatus,
    ListingType,
    PlantInstance,
    PlantNote,
    PlantSpecies,
    NoteVisibility,
    Post,
    User,
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def seed() -> None:
    """Insert sample users, species, plants, listings, notes, and posts."""
    db = SessionLocal()
    try:
        # ---- Species ----
        monstera = PlantSpecies(scientific_name="Monstera deliciosa", common_name="Swiss Cheese Plant")
        pothos = PlantSpecies(scientific_name="Epipremnum aureum", common_name="Pothos")
        db.add_all([monstera, pothos])
        db.flush()

        # ---- Users ----
        alice = User(
            email="alice@example.com",
            password_hash=pwd_context.hash("password"),
            display_name="Alice",
            city="San Francisco",
            lat=37.7749,
            lng=-122.4194,
        )
        bob = User(
            email="bob@example.com",
            password_hash=pwd_context.hash("password"),
            display_name="Bob",
            city="Oakland",
            lat=37.8044,
            lng=-122.2712,
        )
        db.add_all([alice, bob])
        db.flush()

        # ---- Plants ----
        alice_monstera = PlantInstance(
            owner_id=alice.id,
            species_id=monstera.id,
            common_name="Monstera",
            nickname="Big Leaf",
            origin_user_id=alice.id,
        )
        bob_pothos = PlantInstance(
            owner_id=bob.id,
            species_id=pothos.id,
            common_name="Pothos",
            nickname="Vine King",
            origin_user_id=bob.id,
        )
        db.add_all([alice_monstera, bob_pothos])
        db.flush()

        # ---- Listings ----
        listing = Listing(
            owner_id=alice.id,
            plant_instance_id=alice_monstera.id,
            type=ListingType.cutting,
            title="Monstera cutting — rooted!",
            description="Happy to share a healthy cutting from my big leaf Monstera.",
            lat=37.7749,
            lng=-122.4194,
            status=ListingStatus.available,
        )
        db.add(listing)

        # ---- Notes ----
        note = PlantNote(
            plant_instance_id=alice_monstera.id,
            author_id=alice.id,
            body="Prefers indirect bright light. Water when top inch of soil is dry.",
            visibility=NoteVisibility.public,
        )
        db.add(note)

        # ---- Posts ----
        post = Post(
            author_id=alice.id,
            plant_instance_id=alice_monstera.id,
            body="My Monstera finally put out a new fenestrated leaf! 🌿",
        )
        db.add(post)

        # ---- Follows ----
        follow = Follow(follower_id=bob.id, followee_id=alice.id)
        db.add(follow)

        db.commit()
        print("Seed complete.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
