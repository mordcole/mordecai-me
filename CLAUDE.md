# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Start the backend server (local):**
```
node index.js
```
Server runs on port 3001. Falls back to an in-memory counter if PostgreSQL is unavailable locally.

**Run the portfolio dev server:**
```
cd react-source/portfolio-app/client
npm run dev       # live reload at localhost:5173
npm run build     # compile to public/ for deployment
```

**After any change to the portfolio React source, rebuild before committing:**
```
cd react-source/portfolio-app/client && npm run build
```
The compiled output in `public/` is what gets deployed — forgetting to rebuild means the live site won't reflect the changes.

## Architecture

A personal portfolio site with an embedded full-stack counter app, deployed on a VPS behind Nginx with SSL.

### Backend (`index.js`)
Express.js API on port 3001 with two database connections:
- **PostgreSQL** (local, `counter_db`): Stores the counter value in a `counts` table with a single row (`id=1`). Falls back to an in-memory variable if Postgres is unavailable.
- **MongoDB Atlas** (`logs_db`): Append-only action log using Mongoose (`Log` model with `action` + `timestamp`).

Routes:
- `GET /count` — returns counter value + last 5 logs.
- `POST /increment` — increments counter, writes log entry.

The frontend fetches `/api/count` and `/api/increment`. Nginx strips `/api` and proxies to port 3001.

### React Source (`react-source/`)
Two Vite/React apps with source code:
- `react-source/portfolio-app/client/` — the personal homepage. Builds to `public/`.
- `react-source/counter-app/client/` — the counter app frontend. Its pre-built output lives in `counter-app-frontend/`.

The portfolio app's `vite.config.js` includes a dev-only plugin that serves `counter-app-frontend/` at `/counter` so the link works during local development.

### Deployed Static Files
- `public/` — compiled portfolio homepage, served by Nginx at `/`
- `counter-app-frontend/` — compiled counter app, served by Nginx at `/counter`

Both directories are committed to the repo so the VPS only needs to `git pull` and copy files — no build step required on the server.

## Deployment Workflow

The live site runs on a VPS at mordecai.me. The deploy process:

```bash
# On the VPS:
cd ~/mordecai-me && git pull
sudo cp -r public/* /var/www/html/
sudo cp -r counter-app-frontend/* /var/www/counter/
# Restart backend only if index.js changed:
pm2 restart counter-api
```

**VPS structure:**
- `~/mordecai-me/` — the cloned repo
- `/var/www/html/` — Nginx serves this at `/`
- `/var/www/counter/` — Nginx serves this at `/counter`
- PM2 process `counter-api` runs `~/mordecai-me/index.js`
- PM2 process `static-site` runs `~/static-site-api/index.js` (separate, leave alone)

**VPS Nginx config** proxies `/api/` → `http://localhost:3001/` (strips `/api`), which is why the frontend uses `/api/count` not `/count`.

## VPS Environment
The VPS has its own `.env` at `~/mordecai-me/.env` — not committed, must be maintained manually. Keep in sync with local `.env` except credentials may differ. After rotating MongoDB Atlas credentials, update `.env` on both machines.

## PostgreSQL Setup (local)
Postgres runs via Homebrew (`postgresql@16`). If the counter app needs a real DB locally:
```bash
brew services restart postgresql@16
psql -d postgres
```
```sql
CREATE USER counter_user WITH PASSWORD '***REMOVED***';
CREATE DATABASE counter_db OWNER counter_user;
\c counter_db
CREATE TABLE counts (id SERIAL PRIMARY KEY, value INTEGER DEFAULT 0);
INSERT INTO counts (value) VALUES (0);
```
