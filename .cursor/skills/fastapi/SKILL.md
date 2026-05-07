---
name: fastapi
description: Best practices for the Python FastAPI + SQLAlchemy backend used in Propagate.
---

# FastAPI Best Practices

## Project conventions

- All API code lives in `api/app/`.
- Models: `api/app/models/models.py` — SQLAlchemy ORM with `Mapped` / `mapped_column`.
- Schemas: `api/app/schemas/schemas.py` — Pydantic v2 request/response models.
- Routers: `api/app/routers/<domain>.py` — one file per resource.
- Config: `api/app/config.py` — `pydantic_settings.BaseSettings` reading from `.env`.
- DB session: injected via `Depends(get_db)` from `api/app/deps.py`.
- Auth: `Depends(get_current_user_id)` returns the authenticated user's int id.

## Key rules

1. **Python 3.9 compatibility**: use `Optional[X]` and `List[X]` from `typing`, not `X | None` or `list[X]` union syntax.  Use `from __future__ import annotations` at the top of every model file.
2. Always activate `.venv` before running API commands: `api/.venv/bin/uvicorn app.main:app --reload`.
3. Run `alembic upgrade head` after adding or changing models.
4. Never commit `.env`; use `.env.example` as template.
5. Seed data lives in `api/scripts/seed.py`.
6. `passlib[bcrypt]` requires `bcrypt==4.0.1` to avoid a `__about__` attribute error.

## Common patterns

```python
# Standard router endpoint
@router.get("/{resource_id}", response_model=ResourceRead)
def get_resource(resource_id: int, db: Session = Depends(get_db)) -> Resource:
    """Return a resource by id."""
    obj = db.get(Resource, resource_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Not found")
    return obj

# Owner-only mutation guard
def _get_owned(id: int, user_id: int, db: Session) -> Resource:
    obj = db.get(Resource, id)
    if obj is None:
        raise HTTPException(404, "Not found")
    if obj.owner_id != user_id:
        raise HTTPException(403, "Forbidden")
    return obj
```
