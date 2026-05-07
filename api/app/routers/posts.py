"""Posts router: create posts and read the personalized feed."""

import os
import uuid
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.deps import get_current_user_id, get_db
from app.models.models import Follow, Post
from app.schemas.schemas import PostCreate, PostRead

router = APIRouter()

UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")


@router.post("", response_model=PostRead, status_code=status.HTTP_201_CREATED)
def create_post(
    payload: PostCreate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> Post:
    """Publish a new feed post, optionally tagging a plant instance."""
    post = Post(author_id=user_id, **payload.model_dump())
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@router.post("/{post_id}/photo", response_model=PostRead)
def upload_post_photo(
    post_id: int,
    file: UploadFile = File(...),
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> Post:
    """Attach a photo to a post the authenticated user authored."""
    post = db.get(Post, post_id)
    if post is None or post.author_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    ext = os.path.splitext(file.filename or "photo")[1] or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    dest = os.path.join(UPLOADS_DIR, filename)
    os.makedirs(UPLOADS_DIR, exist_ok=True)
    with open(dest, "wb") as fh:
        fh.write(file.file.read())
    post.photo_url = f"/static/{filename}"
    db.commit()
    db.refresh(post)
    return post


@router.get(
    "/feed",
    response_model=List[PostRead],
    summary="Get my personalized feed",
)
def get_feed(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> List[Post]:
    """Return paginated posts from the authenticated user and users they follow."""
    followee_ids = [
        row.followee_id
        for row in db.query(Follow.followee_id).filter(Follow.follower_id == user_id).all()
    ]
    author_ids = [user_id] + followee_ids
    offset = (page - 1) * page_size
    return (
        db.query(Post)
        .filter(Post.author_id.in_(author_ids))
        .order_by(Post.created_at.desc())
        .offset(offset)
        .limit(page_size)
        .all()
    )


@router.get("/user/{target_user_id}", response_model=List[PostRead])
def get_user_posts(
    target_user_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> List[Post]:
    """Return paginated posts by a specific user (public profile view)."""
    offset = (page - 1) * page_size
    return (
        db.query(Post)
        .filter(Post.author_id == target_user_id)
        .order_by(Post.created_at.desc())
        .offset(offset)
        .limit(page_size)
        .all()
    )
