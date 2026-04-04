# GW Cloud AMS Engagement Estimator

**NTT DATA — Guidewire Practice**

Interactive estimator for Guidewire Cloud AMS engagements with persistent storage via Vercel Postgres.

---

## Stack

- React 18 + Vite 5 (frontend)
- Vercel Edge Functions (`/api/engagements.js`)
- Vercel Postgres / Neon (database — auto-provisioned)

---

## Deploy to Vercel (with Database)

### Step 1 — Push to GitHub

```bash
npm install
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_ORG/gw-ams-estimator.git
git push -u origin main
```

### Step 2 — Import in Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Framework: **Vite** (auto-detected)
3. Build command: `npm run build`
4. Output directory: `dist`
5. Click **Deploy**

### Step 3 — Add Vercel Postgres

1. In your Vercel project dashboard → **Storage** tab
2. Click **Create Database** → Choose **Postgres**
3. Name it (e.g. `gw-ams-db`) → Create
4. Click **Connect** → select your project → **Connect**

Vercel automatically sets `POSTGRES_URL` and related env vars.

### Step 4 — Redeploy

After connecting the database, trigger a redeploy:

```bash
git commit --allow-empty -m "connect db"
git push
```

The `engagements` table is created automatically on first API call.

---

## How Persistence Works

| Action | What happens |
|--------|-------------|
| **Save** | All slider/toggle/text state serialised to JSON → POST `/api/engagements` → upserted in Postgres |
| **Load** | GET `/api/engagements` fetches list → user picks one → state restored |
| **New** | Clears engagement ID so next Save creates a new record |
| **Delete** | DELETE `/api/engagements?id=xxx` removes the row |

---

## Local Development

```bash
npm install
npm run dev
```

For local DB testing, create `.env.local`:
```
POSTGRES_URL=postgresql://USER:PASS@HOST/DB?sslmode=require
```

---

## NTT DATA Branding

- Blue: `#003087`
- Red: `#E4002B`
