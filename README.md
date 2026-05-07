# Propagate

A barter and donation marketplace for gardeners to exchange plant cuttings and seeds — and trace the living lineage of every propagation.

## Tech Stack

| Layer | Tech |
|-------|------|
| Web | Next.js 16 (App Router) + TypeScript + Tailwind |
| API | Python FastAPI + SQLAlchemy + Alembic |
| DB | PostgreSQL 16 (local, via Homebrew) |
| Auth | JWT (passlib/bcrypt + python-jose) |

---

## Prerequisites

- **Node.js** ≥ 18 with npm (`node -v`, `npm -v`)
- **Python 3.9+** (`python3 --version`)
- **Homebrew** (`brew -v`)
- **PostgreSQL 16** — installed and started (see below)

---

## Local setup

### 1. PostgreSQL

```bash
# Install (skip if already installed)
brew install postgresql@16

# Start service (restarts at login)
brew services start postgresql@16

# Create DB user and database
psql -U $(whoami) postgres -c "CREATE USER propogate WITH PASSWORD 'propogate';"
psql -U $(whoami) postgres -c "CREATE DATABASE propogate_dev OWNER propogate;"
psql -U $(whoami) postgres -c "GRANT ALL PRIVILEGES ON DATABASE propogate_dev TO propogate;"
```

### 2. API

```bash
cd api

# Create virtualenv and install dependencies
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt

# Copy env file (already pre-filled for local dev)
cp .env.example .env

# Run migrations
.venv/bin/alembic upgrade head

# (Optional) Seed sample data
.venv/bin/python scripts/seed.py

# Start dev server
.venv/bin/uvicorn app.main:app --reload --port 8000
```

API is now running at **http://localhost:8000**  
Interactive docs: **http://localhost:8000/docs**

### 3. Web

```bash
cd web

# Copy env file
cp .env.local.example .env.local

# Install dependencies
npm install

# Start dev server
npm run dev
```

Web app is now running at **http://localhost:3000**

---

## Smoke test

1. Visit http://localhost:8000/health — should return `{"status":"ok"}`
2. Register two accounts at http://localhost:3000/register
3. As User A: add a plant → create a listing
4. As User B: visit the marketplace → request the listing
5. As User A: go to Inbox → accept → mark complete
6. User B's library now shows the new plant with User A's plant as parent
7. Click "View propagation lineage" on either plant — tree shows the A→B edge
8. User B follows User A; User A creates a post — User B sees it in /feed

---

## Project structure

```
propagate-app/
├── api/                    FastAPI service
│   ├── app/
│   │   ├── config.py       Pydantic settings
│   │   ├── db.py           SQLAlchemy engine + Base
│   │   ├── deps.py         FastAPI dependencies (get_db, get_current_user_id)
│   │   ├── main.py         App factory + router registration
│   │   ├── models/         SQLAlchemy ORM models
│   │   ├── routers/        One file per resource domain
│   │   └── schemas/        Pydantic request/response schemas
│   ├── alembic/            Migrations
│   ├── scripts/seed.py     Dev seed data
│   ├── uploads/            Local photo storage (gitignored)
│   ├── requirements.txt
│   └── .env.example
│
├── web/                    Next.js frontend
│   ├── src/
│   │   ├── app/            App Router pages
│   │   ├── components/     Shared UI (Nav)
│   │   ├── contexts/       AuthContext
│   │   └── lib/api.ts      Typed API client
│   └── .env.local.example
│
└── docs/
    └── propogate-marketplace-plan.md
```

---

## Environment variables

### `api/.env`

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql+psycopg://propogate:propogate@localhost:5432/propogate_dev` | PostgreSQL connection |
| `JWT_SECRET` | change me | Secret key for JWT signing |
| `JWT_ALGORITHM` | `HS256` | JWT algorithm |
| `JWT_EXPIRE_MINUTES` | `10080` | Token lifetime (7 days) |

### `web/.env.local`

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | API base URL used by the browser |
