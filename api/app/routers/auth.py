"""Authentication router: register, login, logout, and current-user endpoints."""

from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import settings
from app.db import SessionLocal
from app.deps import get_current_user_id, get_db
from app.models.models import User
from app.schemas.schemas import LoginRequest, TokenResponse, UserCreate, UserRead

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _hash_password(password: str) -> str:
    """Return bcrypt hash of the given plaintext password."""
    return pwd_context.hash(password)


def _verify_password(plain: str, hashed: str) -> bool:
    """Return True if *plain* matches the stored *hashed* password."""
    return pwd_context.verify(plain, hashed)


def _create_token(user_id: int) -> str:
    """Encode a signed JWT with the user's id as the *sub* claim."""
    expire = datetime.utcnow() + timedelta(minutes=settings.jwt_expire_minutes)
    return jwt.encode(
        {"sub": str(user_id), "exp": expire},
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
    )


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new account",
    responses={409: {"description": "Email already registered"}},
)
def register(payload: UserCreate, db: Session = Depends(get_db)) -> TokenResponse:
    """Create a new gardener account and return a JWT access token.

    Use the returned `access_token` as a Bearer token on all protected endpoints:
    `Authorization: Bearer <access_token>`

    - **409** if the email address is already in use.
    """
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    user = User(
        email=payload.email,
        password_hash=_hash_password(payload.password),
        display_name=payload.display_name,
        bio=payload.bio,
        city=payload.city,
        lat=payload.lat,
        lng=payload.lng,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return TokenResponse(access_token=_create_token(user.id))


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Log in with email and password",
    responses={401: {"description": "Invalid credentials"}},
)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    """Authenticate with email and password and return a JWT access token.

    - **401** on invalid credentials (wrong email or password).
    """
    user: Optional[User] = db.query(User).filter(User.email == payload.email).first()
    if user is None or not _verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return TokenResponse(access_token=_create_token(user.id))


@router.get("/me", response_model=UserRead, summary="Get the authenticated user's profile")
def me(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)) -> User:
    """Return the full profile of the currently authenticated user.

    Requires a valid Bearer token in the `Authorization` header.
    """
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user
