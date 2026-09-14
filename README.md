# MenuSaaS

Multi-tenant SaaS platform for restaurants to manage digital menus, catalog data, and scannable QR codes.

## Features

- **Restaurant onboarding** — Register with business name, logo, color theme, and custom URL slug
- **Merchant dashboard** — CRUD for categories, menu items, pricing, sold-out status, and visibility
- **Public mobile menu** — Lightweight, mobile-first menu pages for customers
- **QR code generation** — Branded PNG/SVG QR codes linking to table-specific menu URLs
- **Subscriptions** — One-month free trial, Business Standard, and Business Elite plans
- **Elite translations** — Native category and menu-item translations for multilingual public menus

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
PAYSTACK_SECRET_KEY="sk_test_..."
PAYSTACK_STANDARD_MONTHLY_PLAN_CODE="PLN_..."
PAYSTACK_STANDARD_ANNUAL_PLAN_CODE="PLN_..."
PAYSTACK_ELITE_MONTHLY_PLAN_CODE="PLN_..."
PAYSTACK_ELITE_ANNUAL_PLAN_CODE="PLN_..."
PAYSTACK_STANDARD_MONTHLY_AMOUNT_KOBO="1500000"
PAYSTACK_STANDARD_ANNUAL_AMOUNT_KOBO="15000000"
PAYSTACK_ELITE_MONTHLY_AMOUNT_KOBO="4500000"
PAYSTACK_ELITE_ANNUAL_AMOUNT_KOBO="45000000"
```

Subscription pricing is configured as:

| Plan | Price |
|------|-------|
| Free | 1 month trial |
| Business Standard | ₦15,000/month |
| Business Elite | ₦45,000/month |
| Business Standard | ₦150,000/year |
| Business Elite | ₦450,000/year |

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
| `/dashboard/billing` | Paystack subscription management |
| `/menu/[slug]` | Public mobile menu |
| `/menu/[slug]/table/[n]` | Table-specific menu view |

## API Endpoints

- `POST /api/auth/register` — Create account + restaurant
- `POST /api/auth/login` — Sign in
- `GET /api/categories?restaurantId=` — List categories
- `POST /api/menu-items` — Create menu item
- `PATCH /api/menu-items/[id]` — Update item (price, sold-out, visibility)
- `GET /api/qr/[tableId]` — Generate QR code (PNG or SVG)
- `POST /api/paystack/initialize` — Start a Paystack subscription checkout
- `GET /api/paystack/verify/[reference]` — Verify a completed payment
- `POST /api/paystack/webhook` — Process signed Paystack subscription events
- `POST /api/translations` — Create or update an Elite-only category or menu-item translation

Public menus accept an optional language query parameter, for example
`/menu/demo-cafe?lang=fr` or `/menu/demo-cafe/table/1?lang=sw`. If a translation is
not available, the original menu text is displayed.
