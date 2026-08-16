# WFH Attendance

A work-from-home attendance product: employees clock in with a live photo and
their location, and HRD gets a real-time dashboard to monitor it. Personal
full-stack project — NestJS + Prisma/MySQL backend, Next.js frontend, no
Docker.

**Live demo:** [wfh-attendance.qsaifudin.com](https://wfh-attendance.qsaifudin.com)

## Features

**Employee**
- Clock in once per day with a live camera photo and geolocation
- Personal attendance history with date-range and status filters
- Profile with an optional avatar (drag-to-reposition, pinch/slider zoom)

**HRD / Admin**
- Dashboard: KPIs, a daily present/late chart, department breakdown, filterable
  by date range and department
- Employee & department master data (create, edit, activate/deactivate)
- Attendance list: view-only, with search, filters, and a detail view (photo,
  timestamp, map, notes)
- Configurable late-tolerance cutoff and whether location is required
- Live updates — a new clock-in appears on the admin dashboard instantly over
  a WebSocket

**Both sides**
- Role-based access control
- Swagger/OpenAPI docs
- Responsive (sidebar + table on desktop, bottom nav + cards on mobile)
- Unit tests on both sides

## Stack

| | |
|---|---|
| Backend | NestJS 11, Prisma, MySQL, Zod (via `nestjs-zod`), Socket.IO, JWT auth |
| Frontend | Next.js 16 (App Router, Turbopack), TanStack Query, React Hook Form + Zod, Tailwind, Recharts |
| File storage | A separately deployed helper service — the one real microservice boundary here; everything else is a modular monolith |

## Running locally

Prerequisites: Node 20+, a local MySQL server.

```bash
mysql -u root -e "CREATE DATABASE wfh_attendance CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

cd backend
cp .env.example .env      # edit DATABASE_URL if needed
npm install
npx prisma migrate deploy
npm run seed               # departments, demo accounts, ~30 days of history
npm run start:dev          # Swagger at :PORT/api

cd ../frontend
cp .env.example .env.local # JWT_SECRET must match the backend's
npm install
npm run dev                
```

For the camera/geolocation flow on a phone, plain HTTP won't work (both APIs
require a secure context) — use `npm run dev:https` and open
`https://<your-machine-ip>:3000` instead.

## Demo accounts

Shown on the login page (click a card to sign in). Password is the same for all:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@attendance.com` | `attendance123` |
| Employee | `saifudin@attendance.com` | `attendance123` |
| Employee (deactivated) | `nadia@attendance.com` | `attendance123` |

## Testing

```bash
cd backend && npm test     # ~39 tests
cd frontend && npm test    # camera/geolocation hooks, form schemas
```
