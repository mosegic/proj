# MenuSaaS

Multi-tenant SaaS platform for restaurants to manage digital menus, catalog data, and scannable QR codes.

## Features

- **Restaurant onboarding** — Register with business name, logo, color theme, and custom URL slug
- **Merchant dashboard** — CRUD for categories, menu items, pricing, sold-out status, and visibility
- **Public mobile menu** — Lightweight, mobile-first menu pages for customers
- **QR code generation** — Branded PNG/SVG QR codes linking to table-specific menu URLs

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Backend | Next.js API Routes (Node.js) |
| Database | PostgreSQL via Prisma ORM |
| Auth | JWT sessions (jose + httpOnly cookies) |
| QR Codes | qrcode library (server-side PNG/SVG) |

## Database Schema

```
User ──< Restaurant ──< Category ──< MenuItem ──< MenuItemOption
                  └──< Table
```

Each restaurant is a tenant identified by a unique `slug` (e.g. `/menu/demo-cafe`).

## Getting Started

### 1. Start PostgreSQL

**Option A — Docker:**
```bash
docker compose up -d
```

**Option B — Prisma local dev server:**
```bash
npx prisma dev
```

Update `.env` with your connection string:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/menusaas"
JWT_SECRET="your-random-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Set up the database

```bash
npm run db:setup
```

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo Account

| Field | Value |
|-------|-------|
| Email | demo@menusaas.com |
| Password | demo1234 |
| Public menu | /menu/demo-cafe |

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/register` | Restaurant onboarding |
| `/login` | Merchant login |
| `/dashboard` | Admin overview |
| `/dashboard/categories` | Manage menu categories |
| `/dashboard/menu` | Manage dishes & pricing |
| `/dashboard/tables` | Tables & QR code generation |
| `/dashboard/settings` | Business settings & theme |
| `/menu/[slug]` | Public mobile menu |
| `/menu/[slug]/table/[n]` | Table-specific menu view |

## API Endpoints

- `POST /api/auth/register` — Create account + restaurant
- `POST /api/auth/login` — Sign in
- `GET /api/categories?restaurantId=` — List categories
- `POST /api/menu-items` — Create menu item
- `PATCH /api/menu-items/[id]` — Update item (price, sold-out, visibility)
- `GET /api/qr/[tableId]` — Generate QR code (PNG or SVG)
