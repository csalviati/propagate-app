"""FastAPI application entry point for the Propogate API."""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from fastapi.staticfiles import StaticFiles
from app.config import settings

# ---------------------------------------------------------------------------
# Tag metadata — each tag maps to a router and appears as a section in /docs
# ---------------------------------------------------------------------------

TAGS_METADATA = [
    {
        "name": "auth",
        "description": (
            "Register, log in, and retrieve the current user. "
            "Successful login/register returns a **JWT access token** — include it "
            "on all protected requests as `Authorization: Bearer <token>`."
        ),
    },
    {
        "name": "users",
        "description": "Read public user profiles.",
    },
    {
        "name": "plants",
        "description": (
            "A gardener's personal plant library. Each **plant instance** is a "
            "specific plant owned by a user. When a cutting is exchanged, a new "
            "plant instance is created with `parent_id` pointing at the donor's "
            "plant — forming the propagation lineage tree."
        ),
    },
    {
        "name": "species",
        "description": (
            "Typeahead search over the curated plant species catalogue. "
            "Results can be optionally linked to a plant instance via `species_id`."
        ),
    },
    {
        "name": "notes",
        "description": (
            "Care tips and observations attached to a specific plant instance. "
            "Notes can be **private** (owner-only) or **public** (visible to all)."
        ),
    },
    {
        "name": "listings",
        "description": (
            "Marketplace listings for cuttings and seeds. Listings are always free — "
            "either a donation or a barter. Supports proximity-based search via the "
            "`near=lat,lng,radius_km` query parameter."
        ),
    },
    {
        "name": "requests",
        "description": (
            "Exchange request lifecycle: `pending → accepted → completed`. "
            "Completing a request automatically creates a new plant instance for the "
            "recipient with a lineage link to the donor's plant."
        ),
    },
    {
        "name": "messages",
        "description": (
            "Per-request message threads. Each exchange request has its own thread "
            "accessible to the requester and listing owner. Poll `GET /requests/{id}/messages` "
            "every few seconds to receive new messages."
        ),
    },
    {
        "name": "posts",
        "description": (
            "Social feed posts. A post can optionally tag a plant instance. "
            "`GET /posts/feed` returns paginated posts from the authenticated user "
            "and everyone they follow."
        ),
    },
    {
        "name": "follows",
        "description": "Follow and unfollow other gardeners. Drives the social feed.",
    },
    {
        "name": "meta",
        "description": "Health check and API metadata.",
    },
]

app = FastAPI(
    title="Propogate API",
    version="0.1.0",
    description=(
        "## Propogate — Plant Barter & Donation Marketplace\n\n"
        "A free marketplace for gardeners to exchange cuttings and seeds, "
        "share care tips, and trace the living **propagation lineage** of every plant.\n\n"
        "### Authentication\n"
        "Most write endpoints require a JWT bearer token. "
        "Call `POST /auth/register` or `POST /auth/login` to get a token, "
        "then click **Authorize** (🔒) at the top of this page and paste it in.\n\n"
        "### Lineage model\n"
        "Every plant is a row in `plant_instances`. When an exchange completes, "
        "a new row is created for the recipient with `parent_id` pointing at the "
        "donor's plant. The full tree is returned by `GET /plants/{id}/lineage`."
    ),
    openapi_tags=TAGS_METADATA,
    contact={
        "name": "Propogate",
        "url": "http://localhost:3000",
    },
    license_info={
        "name": "MIT",
    },
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve locally uploaded files from /static/<filename>
UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=UPLOADS_DIR), name="static")


@app.get("/health", tags=["meta"], summary="Liveness check")
def health() -> dict:
    """Return a simple liveness payload confirming the API is up."""
    return {"status": "ok", "service": "propogate-api"}


# Routers registered after app creation to avoid circular imports
from app.routers import auth, users, plants, listings, requests, messages, notes, posts, follows  # noqa: E402

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(plants.router, prefix="/plants", tags=["plants", "species", "notes"])
app.include_router(listings.router, prefix="/listings", tags=["listings", "requests"])
app.include_router(requests.router, prefix="/requests", tags=["requests"])
app.include_router(messages.router, prefix="/requests", tags=["messages"])
app.include_router(notes.router, prefix="/plants", tags=["notes"])
app.include_router(posts.router, prefix="/posts", tags=["posts"])
app.include_router(follows.router, prefix="/follows", tags=["follows"])


def custom_openapi() -> dict:
    """Extend the generated OpenAPI schema with a BearerAuth security scheme.

    This makes the 🔒 Authorize button in Swagger UI accept a JWT token that
    is then automatically sent as ``Authorization: Bearer <token>`` on every
    request made from the docs UI.
    """
    if app.openapi_schema:
        return app.openapi_schema
    schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
        tags=TAGS_METADATA,
    )
    schema.setdefault("components", {})
    schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": (
                "Paste the `access_token` returned by `POST /auth/login` or "
                "`POST /auth/register`. It will be sent as "
                "`Authorization: Bearer <token>` on every request."
            ),
        }
    }
    # Apply BearerAuth as the default security requirement for every operation
    for path_item in schema.get("paths", {}).values():
        for operation in path_item.values():
            if isinstance(operation, dict):
                operation.setdefault("security", [{"BearerAuth": []}])
    app.openapi_schema = schema
    return schema


app.openapi = custom_openapi  # type: ignore[method-assign]
