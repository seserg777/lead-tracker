# Lead Tracker

Mini CRM for leads: **Next.js (App Router)** frontend, **NestJS** API, **MySQL** via **MikroORM**, **Turborepo** monorepo. Comments support list + create only (no update/delete in API).

## Requirements

- Node.js 20+ (22 recommended)
- npm 10+
- MySQL 8 (local or Docker)

## Environment variables

| Location | Variable | Description |
|----------|----------|-------------|
| [apps/backend/.env.example](apps/backend/.env.example) | `PORT` | API port (default `3101`) |
| | `DATABASE_*` | MySQL host, port, user, password, database name |
| | `CORS_ORIGIN` | Allowed browser origins (comma-separated), e.g. `http://localhost:3100` |
| [apps/frontend/.env.example](apps/frontend/.env.example) | `NEXT_PUBLIC_API_URL` | API base URL **without** trailing slash, e.g. `http://localhost:3101` |

Copy examples:

```bash
copy apps\backend\.env.example apps\backend\.env
copy apps\frontend\.env.example apps\frontend\.env.local
```

The committed [apps/backend/.env.example](apps/backend/.env.example) is set up for **OpenServer / OSPanel**: host `mysql-8.0.local`, database `lead-tracker`, user `root`, **empty password**. Adjust if your MySQL differs. Set `NEXT_PUBLIC_API_URL` in `apps/frontend/.env.local` to match the API URL.

## Phase A — local development (no Docker)

### 1. Database

Create an empty database named `lead-tracker` (hyphen requires backticks in MySQL):

```sql
CREATE DATABASE `lead-tracker` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Install dependencies

From the repository root:

```bash
npm install
```

### 3. Migrations (backend)

```bash
cd apps/backend
npm run migration:up
cd ../..
```

### 4. Run API and UI

From the repository root (runs both apps via Turborepo):

```bash
npm run dev
```

Or in two terminals:

```bash
cd apps/backend && npm run dev
```

```bash
cd apps/frontend && npm run dev
```

Defaults: API [http://localhost:3101](http://localhost:3101), UI [http://localhost:3100](http://localhost:3100). Swagger/OpenAPI: [http://localhost:3101/api/docs](http://localhost:3101/api/docs).

### 5. Quick API checks (curl)

Replace host/port if needed.

**List leads**

```bash
curl -s "http://localhost:3101/api/leads?page=1&limit=10"
```

**Create lead**

```bash
curl -s -X POST "http://localhost:3101/api/leads" -H "Content-Type: application/json" -d "{\"name\":\"Acme\",\"status\":\"NEW\"}"
```

**Add comment** (use a real `LEAD_ID`)

```bash
curl -s -X POST "http://localhost:3101/api/leads/LEAD_ID/comments" -H "Content-Type: application/json" -d "{\"text\":\"First note\"}"
```

## Phase B — Docker

From the repository root:

```bash
docker compose up --build
```

- MySQL: port `3306` (user `root`, password `root`, database `lead_tracker`)
- API: [http://localhost:3101](http://localhost:3101), Swagger [http://localhost:3101/api/docs](http://localhost:3101/api/docs)
- UI: [http://localhost:3000](http://localhost:3000)

The backend container runs migrations on startup, then starts Nest.

`NEXT_PUBLIC_API_URL` for the frontend image is set at build time to `http://localhost:3101` so the browser can reach the API on the host.

## Production build (without Docker)

**Backend**

```bash
npm run build --workspace=backend
node apps/backend/dist/main.js
```

Run migrations before or after deploy:

```bash
cd apps/backend && npm run migration:up:prod
```

**Frontend**

```bash
npm run build --workspace=frontend
npm run start --workspace=frontend
```

The frontend uses Next `output: "standalone"` for a minimal Node deployment (see [docker/frontend.Dockerfile](docker/frontend.Dockerfile)).

## HTTP errors (API contract)

- **400** — validation / bad input (`class-validator` + `ValidationPipe`)
- **404** — lead not found (or nested resource when the parent lead is missing)

## Tests

Unit/e2e tests are optional for this assignment. Backend e2e sample: `npm run test:e2e --workspace=backend` (requires a running MySQL configured in `apps/backend/.env`).

## Identifier type

Primary keys are **auto-increment unsigned integers** for `lead` and `comment` (`comment.lead_id` FK).
