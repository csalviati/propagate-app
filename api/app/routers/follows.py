"""Follows router: follow / unfollow users and list followers / following."""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.deps import get_current_user_id, get_db
from app.models.models import Follow, User
from app.schemas.schemas import FollowRead, UserRead

router = APIRouter()


@router.post("/{target_user_id}", response_model=FollowRead, status_code=status.HTTP_201_CREATED)
def follow_user(
    target_user_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> Follow:
    """Follow *target_user_id*.  Idempotent: returns existing record if already following."""
    if target_user_id == user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot follow yourself")
    if db.get(User, target_user_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    existing = db.get(Follow, (user_id, target_user_id))
    if existing:
        return existing
    follow = Follow(follower_id=user_id, followee_id=target_user_id)
    db.add(follow)
    db.commit()
    db.refresh(follow)
    return follow


@router.delete("/{target_user_id}", status_code=status.HTTP_204_NO_CONTENT)
def unfollow_user(
    target_user_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> None:
    """Unfollow *target_user_id*."""
    follow = db.get(Follow, (user_id, target_user_id))
    if follow is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not following this user")
    db.delete(follow)
    db.commit()


@router.get("/users/{target_user_id}/followers", response_model=List[UserRead])
def list_followers(target_user_id: int, db: Session = Depends(get_db)) -> List[User]:
    """Return users who follow *target_user_id*."""
    follows = db.query(Follow).filter(Follow.followee_id == target_user_id).all()
    return [db.get(User, f.follower_id) for f in follows if db.get(User, f.follower_id)]


@router.get("/users/{target_user_id}/following", response_model=List[UserRead])
def list_following(target_user_id: int, db: Session = Depends(get_db)) -> List[User]:
    """Return users that *target_user_id* follows."""
    follows = db.query(Follow).filter(Follow.follower_id == target_user_id).all()
    return [db.get(User, f.followee_id) for f in follows if db.get(User, f.followee_id)]
