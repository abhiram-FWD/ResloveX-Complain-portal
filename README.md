# ResolveX — Public Complaint Portal

MERN stack + Socket.io accountability-driven complaint portal.

## What Makes ResolveX Different

- **Responsibility Lock** — no silent forwarding
- **Soft-Close** — citizen verifies before closure
- **Per-Stage Delay** — see time at each officer's desk
- **Officer Scorecard** — public performance visible to all
- **Live Updates** — Socket.io real-time status changes

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Socket.io-client + Recharts |
| Backend | Node.js + Express + Socket.io |
| Database | MongoDB Atlas |
| Storage | Cloudinary |
| Deploy | Vercel + Render |

## Setup

```bash
# Backend
cd Backend && npm install && cp .env.example .env && npm run dev

# Frontend
cd Frontend && npm install && cp .env.example .env && npm run dev
```

## Deploy

- **Frontend → Vercel**: set `VITE_API_URL` env var to your Render URL
- **Backend → Render**: set all env vars from `Backend/.env.example`
- **Database → MongoDB Atlas**: whitelist `0.0.0.0/0` for Render's dynamic IPs
