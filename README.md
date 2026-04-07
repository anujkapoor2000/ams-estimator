# GW Cloud AMS Engagement Estimator

**NTT DATA — Guidewire Practice**

Interactive estimator for Guidewire Cloud AMS engagements with persistent storage
via Neon Postgres + Vercel Serverless Functions.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 |
| API | Vercel Serverless Functions (`/api/engagements.js`) |
| Database | Neon Postgres (serverless) via `@neondatabase/serverless` |

---

## One-time Setup: Neon Database

### Step 1 — Create a free Neon project

1. Go to [neon.tech](https://neon.tech) → Sign up (free)
2. Create a new project → choose a region close to your users
3. Copy the **Connection string** from the dashboard:
   ```
   postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
   ```

### Step 2 — Add DATABASE_URL to Vercel

1. In your Vercel project → **Settings** → **Environment Variables**
2. Add:
   - **Name:** `DATABASE_URL`
   - **Value:** your Neon connection string (above)
   - **Environments:** Production, Preview, Development

### Step 3 — Deploy

```bash
git add .
git commit -m "chore: neon db"
git push
```

The `engagements` table is created automatically on the first API call.
No migrations needed.

---

## Local Development

Create `.env.local` in the project root:

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
```

Then:

```bash
npm install
npm run dev
```

The `/api` routes are served by Vercel CLI locally if you use `vercel dev`,
or you can test them independently with a tool like Postman.

---

## API Endpoints

| Method | URL | Purpose |
|--------|-----|---------|
| `GET` | `/api/engagements` | List all saved engagements (summary) |
| `GET` | `/api/engagements?id=xxx` | Fetch one full engagement payload |
| `POST` | `/api/engagements` | Save / update an engagement |
| `DELETE` | `/api/engagements?id=xxx` | Delete an engagement |

---

## How Persistence Works

| Action | Behaviour |
|--------|-----------|
| **Save** | All sliders, toggles, rates, client name etc. serialised to JSON → POST to Neon |
| **Load** | Lists all saved engagements → user picks one → full state restored |
| **New** | Clears current ID so next Save creates a new record |
| **Delete** | Removes the row from Neon |

---

## NTT DATA Branding

- Primary blue: `#003087`
- Red accent: `#E4002B`
