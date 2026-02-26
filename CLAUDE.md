# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Start the backend server:**
```
node index.js
```
Server runs on port 3001. There is no `npm start` script; run Node directly.

No lint or test commands are configured (`npm test` exits with an error by design).

## Architecture

This is a capstone prep project demonstrating a full-stack app with two databases, deployed behind Nginx.

### Backend (`index.js`)
Express.js API with two simultaneous database connections:
- **PostgreSQL** (local, `counter_db`): Stores the authoritative counter value in a `counts` table with a single row (`id=1`).
- **MongoDB Atlas** (`logs_db`): Stores an append-only action log using Mongoose (`Log` model with `action` + `timestamp`).

Routes:
- `GET /count` — reads counter from Postgres, fetches last 5 logs from Mongo, returns both.
- `POST /increment` — increments counter in Postgres, writes a log entry to Mongo.

**Important:** A `.env` file exists with all credentials, but `index.js` does not call `require('dotenv').config()`, so credentials are currently hardcoded directly in the file. `dotenv` is listed as a dependency.

### Frontend (`counter-app-frontend/`)
Pre-built Vite/React app (compiled assets only — no source files present). The built output is served by Nginx at the `/counter` path. The HTML entry point references assets from `/counter/assets/`.

### Static Portfolio (`public/` and `portfolio/`)
Simple single-page HTML portfolio. Both directories contain identical files (`index.html`, `index.nginx-debian.html`). Nginx serves this at the root `/` path.

### Expected Nginx Routing
- `/` → `public/` (portfolio page)
- `/counter` → `counter-app-frontend/` (React SPA)
- API calls from the frontend hit the Node backend at port 3001 (proxied or direct)

## PostgreSQL Setup
The database and user must exist before starting the server:
```sql
CREATE USER counter_user WITH PASSWORD '***REMOVED***';
CREATE DATABASE counter_db OWNER counter_user;
\c counter_db
CREATE TABLE counts (id SERIAL PRIMARY KEY, value INTEGER DEFAULT 0);
INSERT INTO counts (value) VALUES (0);
```
