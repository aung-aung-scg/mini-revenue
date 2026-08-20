# Revenue Trend Mini-Project

Full-stack venue analytics application with a Rails API, PostgreSQL, and a Next.js dashboard.

This is a single repository containing both applications:

```text
backend/   Rails API, database migrations, seeds, and RSpec tests
frontend/  Next.js dashboard and admin UI
```

## Prerequisites

Install the following:

* Ruby 3.3.6 and Bundler 2.5 or newer (`backend/.ruby-version` pins Ruby 3.3.6)
* Node.js 20 or newer and npm
* PostgreSQL 14 or newer
* Git

### Ubuntu

Install PostgreSQL with:

```bash
sudo apt install postgresql
```

### macOS

Using Homebrew:

```bash
brew install postgresql@16
```

### Windows

Install:

* Ruby with RubyInstaller
* Node.js from nodejs.org
* PostgreSQL from postgresql.org

Run the commands below in PowerShell from the repository root.

## Fresh install

Clone the repository and install dependencies for both applications:

```bash
git clone https://github.com/aung-aung-scg/mini-revenue.git
cd mini-revenue

bundle install --gemfile backend/Gemfile
npm install --prefix frontend
```

Start PostgreSQL:

```bash
# Linux
sudo systemctl start postgresql

# macOS
brew services start postgresql@16
```

On Windows, start the PostgreSQL service using the Windows Services application.

The checked-in database configuration expects a local `postgres` user with password `root` and creates:

* `mini-app_development`
* `miniapp_test`

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

Use a long random `JWT_SECRET` outside local development.

The frontend example contains:

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

For local development, the default values are sufficient.

## Production deployment on Render

The Rails API can be deployed to Render with a PostgreSQL database.

### Backend environment variables

Configure the following environment variables in the Render Rails API service:

```text
DATABASE_URL=<Render PostgreSQL>
SECRET_KEY_BASE=<secure random value>
JWT_SECRET=<long random secret>
CORS_ORIGINS=your origin
ADMIN_EMAIL=<admin email>
ADMIN_PASSWORD=<admin password>
```

Do not commit production secrets to the repository.

### PostgreSQL

Create a PostgreSQL database in Render and connect it to the Rails API using `DATABASE_URL`.

After deployment, run the database migrations:

```bash
bin/rails db:migrate
```

To create the initial admin account and sample revenue data:

```bash
bin/rails db:seed
```

The seed creates:

* An admin account using `ADMIN_EMAIL` and `ADMIN_PASSWORD`
* Current-week revenue entries
* Previous-week revenue entries

The seed does not provide a default production password.

### Frontend deployment

For the Next.js application, configure:

```text
NEXT_PUBLIC_API_BASE_URL=https://your-rails-api.onrender.com
```

The exact value should be the public URL of the deployed Rails API.

The Rails API `CORS_ORIGINS` environment variable must allow the deployed frontend URL:

```text
CORS_ORIGINS=https://your-frontend.vercel.app
```

### Production verification

After deployment, verify the following:

1. The frontend loads successfully.
2. Admin login works.
3. The revenue trend page loads revenue data.
4. Revenue comparison and chart functionality work correctly.
5. Admin revenue-entry CRUD works.
6. Unauthorized API requests return `401`.
7. The Rails API can connect successfully to the Render PostgreSQL database.

## Database and seed data

For local development:

```bash
cd backend

bin/rails db:create
bin/rails db:migrate
bin/rails db:seed
```

The seed creates an admin using `ADMIN_EMAIL` and `ADMIN_PASSWORD`, plus current and previous week revenue entries.

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env` or in the shell before seeding.

The seed does not provide a default password.

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
npm run dev
```

Open:

```text
http://localhost:3000/revenue-trend
```

The frontend defaults to:

```text
http://localhost:3001
```

Set `NEXT_PUBLIC_API_BASE_URL` in `frontend/.env.local` to change the API URL.

Backend CORS can be configured with `CORS_ORIGINS`.

### Windows PowerShell

Run the backend:

```powershell
cd backend
bin\rails server -p 3001
```

In a second PowerShell terminal:

```powershell
cd frontend
npm run dev
```

The frontend development server runs on port `3000`, while the Rails API runs on port `3001`.

## API

### Revenue trends

```text
GET /api/v1/revenue_trends?start_date=YYYY-MM-DD
```

The endpoint returns:

* The selected Monday-to-Sunday week
* The previous week
* Revenue summaries for both periods
* Seven daily records for each period

`start_date` must be a Monday.

A missing, malformed, or non-Monday date returns:

```text
422 Unprocessable Entity
```

Example:

```bash
curl "http://localhost:3001/api/v1/revenue_trends?start_date=2026-08-17"
```

Each period contains seven `days` records and a `summary` containing:

* `total_revenue`
* `average_per_day`
* `total_covers`

Missing revenue entries are returned as zero-filled days.

### Admin authentication

Admin login:

```text
POST /api/v1/admin/login
```

Example:

```bash
curl -X POST http://localhost:3001/api/v1/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"'$ADMIN_EMAIL'","password":"'$ADMIN_PASSWORD'"}'
```

Admin login creates a secure HttpOnly session cookie.

Revenue-entry CRUD and the revenue trend endpoint require an authenticated admin session.

Admin authentication uses the existing custom `AdminAuthenticatable` concern, bcrypt password hashing, and `JwtService`. Devise is not required.

API clients may also send a Bearer token for non-browser integrations.

## Tests

### Backend

Run the backend RSpec suite:

```bash
cd backend
bundle exec rspec spec
```

On Windows, the repository-local binstub is also available:

```powershell
cd backend
bin\rspec spec
```

The backend test suite includes:

* Admin login
* Authentication and authorization
* Successful revenue trend queries
* Empty revenue trend queries
* Invalid trend queries
* Unauthorized admin requests
* Authorized admin CRUD requests

### Model annotations

Model schema comments can be refreshed with:

```bash
cd backend
bundle exec annotate --models
```

### Frontend

Run frontend tests from the repository root:

```bash
npm test --prefix frontend
```

Build the frontend:

```bash
npm run build --prefix frontend
```

Alternatively, from the frontend directory:

```bash
cd frontend
npm run build
```

To start the production frontend after building:

```bash
cd frontend
npm run start
```

## Main routes

### Frontend

* `/revenue-trend` — authenticated revenue chart with comparison, series visibility, KPI cards, event markers, and PNG export
* `/admin/login` — admin authentication
* `/admin/revenue-entries` — admin revenue-entry CRUD

### Backend

* `POST /api/v1/admin/login` — admin authentication
* `GET /api/v1/revenue_trends` — revenue trend data
* Admin revenue-entry CRUD endpoints — authenticated admin operations

## Stack

### Backend

* Rails 8 API-only
* PostgreSQL
* RSpec
* bcrypt
* JWT
* rack-cors

### Frontend

* Next.js 15
* TypeScript
* Tailwind CSS
* Chart.js
* react-chartjs-2
