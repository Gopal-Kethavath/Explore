# Hyderabad Weekends

A read-only catalog of weekend trips around Hyderabad. FastAPI serves the places, and a React app handles search, filters, and the detail page.

Drive times are typical estimates from Tank Bund, not live traffic. Ratings are editorial. Photographs are from Wikimedia Commons and stay under their original licenses.

## Layout

- `backend/` — FastAPI, SQLAlchemy, Alembic, and the seed file
- `frontend/` — Vite, React, TypeScript, TanStack Query, Tailwind
- `docker-compose.yml` — Postgres and the API. The static frontend is an optional profile

## Run it locally

Docker runs Postgres and the API. The frontend stays on the Vite dev server so reloads stay fast.

```bash
docker compose up --build
```

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` to `http://localhost:8000`.

API docs: `http://localhost:8000/docs`. Health: `http://localhost:8000/api/v1/health`.

To serve the built frontend from nginx as well:

```bash
docker compose --profile web up --build
```

That build talks to `http://localhost:8000`. Open `http://localhost:8080`.

### Without Docker

You need PostgreSQL 16 or newer, because search uses `ILIKE` and a trigram index.

```bash
cd backend
python -m venv .venv
```

Windows:

```bash
.venv\Scripts\activate
copy .env.example .env
```

macOS and Linux:

```bash
source .venv/bin/activate
cp .env.example .env
```

Then:

```bash
pip install -r requirements.txt
alembic upgrade head
python -m app.seed.seed
uvicorn app.main:app --reload
```

Then start the frontend as above. `backend/.env.example` matches the Compose database URL: `postgresql+psycopg://weekend:weekend@localhost:5432/weekend`.

The seed is safe to run again. It updates places by slug.

## API

All routes are under `/api/v1` and only published places are returned.

- `GET /health`
- `GET /categories`
- `GET /places` — `q`, `category`, `region` (`in-city`, `half-day`, `weekend`), repeatable `tag`, `max_distance_km`, `max_drive_minutes`, `ticketed`, `featured`, `sort` (`featured`, `distance`, `rating`, `name`), `page`, `page_size` (max 50). The explore page also sends `entry=free` or `entry=ticket`, which the app turns into `ticketed`.
- `GET /places/{slug}`

List responses look like `{ "items": [], "total": 0, "page": 1, "page_size": 12 }`.

There is no write API in this version. Change copy in `backend/app/seed/places.json`, then run the seed again.

## Frontend

Filters live in the URL (`/explore?category=heritage&max_distance_km=25`), so a search can be shared. Server data is cached with TanStack Query. The map is Leaflet and OpenStreetMap, loaded only on the place page.

Set `VITE_API_URL` when the API is on another origin. Leave it empty in development.

## Deploy

Lowest-ops split for a solo project:

1. Database: Neon or Supabase Postgres. Run `alembic upgrade head`, then `python -m app.seed.seed`, with `DATABASE_URL` pointing at that database.
2. API: Render or Railway, using `backend/Dockerfile`. Set `DATABASE_URL` and `CORS_ORIGINS` to the frontend origin. The container runs migrations and the seed on start.
3. Frontend: Cloudflare Pages or Netlify from `frontend/`. Set `VITE_API_URL` to the API origin at build time.

One-box alternative: a small VPS running `docker compose --profile web up -d`, with Caddy or nginx in front for HTTPS. You patch the server yourself.

Before you call it production: migrations on deploy, the `/api/v1/health` check, secrets only in environment variables, and `is_published` left false for anything that should stay hidden.

## Not in this version

Accounts, saved places, reviews, bookings, and an admin UI. Add those after the public catalog is solid.
