# Revenue Trend Mini-Project

Full-stack venue analytics app with a Rails API, PostgreSQL, and a Next.js dashboard.

This is a single repository containing both applications:

```text
backend/   Rails API, database migrations, seeds, and RSpec tests
frontend/  Next.js dashboard and admin UI
```

## Prerequisites

Install the following:

- Ruby 3.3.6 and Bundler 2.5 or newer (`backend/.ruby-version` pins Ruby 3.3.6)
- Node.js 20 or newer and npm
- PostgreSQL 14 or newer
- Git

On Ubuntu, PostgreSQL can be installed with `sudo apt install postgresql`. On macOS with Homebrew, use `brew install postgresql@16`.

On Windows, install Ruby with RubyInstaller, Node.js from nodejs.org, and PostgreSQL from postgresql.org. Run the commands below in PowerShell from the repository root.

## Fresh install

Clone the repository root, then install each application’s dependencies from the shared checkout:

```bash
git clone <https://github.com/aung-aung-scg/mini-revenue.git>
cd "mini-revenue"
bundle install --gemfile backend/Gemfile
npm install --prefix frontend
```

Start PostgreSQL (`sudo systemctl start postgresql` on Linux, `brew services start postgresql@16` on macOS, or start the PostgreSQL service on Windows). The checked-in database configuration expects a local `postgres` user with password `root`, and creates `mini-app_development` and `miniapp_test`.

If your local PostgreSQL credentials differ, update `backend/config/database.yml` or provide matching environment/database configuration before running Rails.

## Environment files

Create the local environment files from the checked-in examples:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

The backend example contains:

```text
JWT_SECRET=change-me-in-production
CORS_ORIGINS=http://localhost:3000
```

Use a long random `JWT_SECRET` outside local development. The frontend example contains `NEXT_PUBLIC_API_BASE_URL=http://localhost:3001`.

## Database and seed data

```bash
cd backend
bin/rails db:create
bin/rails db:migrate
bin/rails db:seed
```

The seed creates an admin using `ADMIN_EMAIL` and `ADMIN_PASSWORD`, plus current and previous week revenue entries.

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env` or in the shell before seeding. The seed does not provide a default password.

Return to the repository root when switching between applications:

```bash
cd ..
```
## Run locally

Start the backend in one terminal:

```bash
cd backend
bin/rails server -p 3001
```

Start the frontend in a second terminal:

```bash
cd frontend
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000/revenue-trend`. The frontend defaults to `http://localhost:3001`; set `NEXT_PUBLIC_API_BASE_URL` in `frontend/.env.local` to change it. Backend CORS can be configured with `CORS_ORIGINS`.

On Windows PowerShell, use the same commands from the repository root:

```powershell
cd backend
bin\rails server -p 3001

# In a second PowerShell terminal:
cd frontend
npm run dev
```

## API

`GET /api/v1/revenue_trends?start_date=YYYY-MM-DD` returns the selected Monday-to-Sunday week, the prior week, and summaries. `start_date` must be a Monday; a missing, malformed, or non-Monday date returns `422`.

Example:

```bash
curl "http://localhost:3001/api/v1/revenue_trends?start_date=2026-08-17"
```

Each period contains seven `days` records and a `summary` with `total_revenue`, `average_per_day`, and `total_covers`. Missing revenue entries are returned as zero-filled days.

Admin login is `POST /api/v1/admin/login`. It creates a secure HttpOnly session cookie. Revenue-entry CRUD and the trend endpoint require that authenticated session.

Set local credentials before seeding, then log in with those values:

```bash
curl -X POST http://localhost:3001/api/v1/admin/login \
	-H "Content-Type: application/json" \
	-d '{"email":"$ADMIN_EMAIL","password":"$ADMIN_PASSWORD"}'
```

Admin authentication uses the existing custom `AdminAuthenticatable` concern, bcrypt password hashing, and `JwtService`; Devise is not required. API clients may also send a Bearer token for non-browser integrations.

## Tests

```bash
cd backend
bundle exec rspec spec
```

On Windows, the repository-local binstub is also available:

```powershell
cd backend
bin\rspec spec
```

The backend suite includes login coverage, successful/empty/invalid trend queries, and unauthorized/authorized admin CRUD requests. Model schema comments can be refreshed with:

```bash
cd backend
bundle exec annotate --models
```

Run frontend tests and the production build from the root checkout with:

```bash
npm test --prefix frontend
npm run build --prefix frontend
```

Build and type-check the frontend with:

```bash
cd frontend
npm run build
```

To start the production frontend after building:

```bash
cd frontend
npm run start
```

The frontend development server runs on port `3000`; the Rails API runs on port `3001`.

## Main routes

- `/revenue-trend`: authenticated revenue chart with comparison, series visibility, KPI cards, event markers, and PNG export
- `/admin/login`: admin authentication
- `/admin/revenue-entries`: admin revenue-entry CRUD

## Stack

- Backend: Rails 8 API-only, PostgreSQL, RSpec, bcrypt, JWT, rack-cors
- Frontend: Next.js 15, TypeScript, Tailwind CSS, Chart.js, react-chartjs-2

