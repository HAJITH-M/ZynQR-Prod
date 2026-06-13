# ZynQR — Backend (ZynQR-Server)

Dynamic QR code management platform — backend API.

Built with **Go · Gin · GORM · PostgreSQL · Redis**. It powers the full product: user identity (email/password + Google OAuth + 2FA), dynamic QR codes with live scan analytics, static QR generation, a contact inbox, and per-IP rate limiting. The same codebase runs as a standalone server or as a Vercel serverless function.

> This README documents the backend. It also includes an overview of the **[React frontend](#frontend-zynqr-client)** (`ZynQR-Client`) and how the two connect, so the whole project is covered in one place.

---

## Table of Contents

- [What is ZynQR](#what-is-zynqr)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Data Models](#data-models)
- [Runtime Modes](#runtime-modes)
- [Architecture](#architecture)
- [API Reference](#api-reference)
- [Dynamic QR Flow](#dynamic-qr-flow)
- [Auth & Session Flow](#auth--session-flow)
- [Google OAuth Flow](#google-oauth-flow)
- [Rate Limiting](#rate-limiting)
- [Configuration](#configuration)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Frontend (ZynQR-Client)](#frontend-zynqr-client)
- [Security Notes](#security-notes)
- [Production Checklist](#production-checklist)

---

## What is ZynQR

ZynQR lets users create and manage two kinds of QR codes:

- **Dynamic QR** — the QR image encodes a stable ZynQR link (`/qr/<id>`). When scanned, the backend looks up the code and **redirects** to its current destination URL. The owner can change the destination, toggle analytics, or deactivate the code at any time without reprinting it. Each scan can be recorded with IP, user agent, and approximate geolocation.
- **Static QR** — the destination is encoded directly into the QR image. No redirect, no scan tracking; useful for offline/permanent payloads.

Around this sit a full auth system, a dashboard API (analytics, activity, sessions, security audit), and a contact form.

---

## Features

| Category | Details |
|---|---|
| **Auth methods** | Email/password · Google OAuth 2.0 · optional email-OTP two-factor (2FA) |
| **Sessions** | DB-backed · rotating refresh tokens (hashed) · HttpOnly cookie · revocation + "log out all" |
| **Account security** | Email verification · password change/reset via OTP · security audit log · delete account |
| **Dynamic QR** | Create / update / delete / list · public redirect · activity log · per-code analytics toggle |
| **Scan analytics** | Per-scan rows (IP · user agent · city/country) · scan counts · summary, growth & frequency endpoints |
| **Static QR** | Create / list / delete · payload encoded directly into the image (no tracking) |
| **Contact** | Public contact form that emails a configured inbox |
| **Rate limiting** | Per-IP Redis limiter — tuned per route group (auth, contact, QR writes) |
| **Geolocation** | Uses platform-provided geo headers (Vercel) when present; falls back to an external IP-geo API |
| **Dual runtime** | Standalone server (`cmd/api/main.go`) and Vercel serverless (`api/index.go`) from one codebase |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Go 1.25 |
| HTTP framework | Gin (`github.com/gin-gonic/gin`) |
| ORM | GORM (`gorm.io/gorm`) + Postgres driver |
| Database | PostgreSQL |
| Cache / OTP / rate limiting | Redis (`github.com/redis/go-redis/v9`) |
| Auth tokens | JWT (`github.com/golang-jwt/jwt/v5`) |
| OAuth | Google OAuth 2.0 (`golang.org/x/oauth2`) |
| QR generation | `github.com/skip2/go-qrcode` |
| User-agent parsing | `github.com/mileusna/useragent` |
| Logging | `go.uber.org/zap` |
| Email | SMTP (custom mailer package) |
| Config | `github.com/joho/godotenv` (local) + `os.Getenv` |
| Serverless | Vercel (`@vercel/go`) |

---

## Project Structure

```
ZynQR-Server/
├── api/index.go                       # Vercel serverless entry point
├── app/app.go                         # Shared bootstrap (sync.Once): env, Redis, DB, migrations, routes
├── cmd/api/main.go                    # Standalone server entry point
├── internal/
│   ├── config/
│   │   ├── authconfig/                # Google OAuth2 config
│   │   ├── env/env.go                 # Env var loader (godotenv fallback in dev)
│   │   ├── mailConfig/                # SMTP config
│   │   └── redisConfig/               # Redis client init
│   ├── errors/                        # Typed domain errors (mapped to HTTP status)
│   ├── handler/
│   │   ├── authHandler/               # Register, login, 2FA, password, sessions, profile
│   │   ├── oAuthHandler/              # Google login + callback + token refresh
│   │   ├── qrHandler/                 # Dynamic QR CRUD, redirect, analytics
│   │   ├── staticQrHandler/           # Static QR create/list/delete
│   │   └── contactHandler/            # Contact form submission
│   ├── middleware/
│   │   ├── clientip/                  # Vercel-aware real client IP resolution
│   │   ├── cors/                      # CORS policy
│   │   ├── logger/                    # Structured access logging (zap)
│   │   ├── middlewareAuth/            # JWT + DB session validation
│   │   ├── rateLimiter/               # Per-IP Redis limiter (fail-closed & fail-open)
│   │   └── setup.go                   # Middleware registration order
│   ├── model/
│   │   ├── AuthModel/                 # User, AuthenticationMethod, Session, UserToken, SecurityAuditLog
│   │   ├── QrModel/                   # QrDetails, QrScan, QrActivityLog
│   │   └── staticqr/                  # StaticQr
│   ├── repository/                    # GORM queries, inserts, transactions
│   ├── router/
│   │   ├── router.go                  # Mounts /qr/:id and /api/v1 groups
│   │   ├── authRoutes.go              # /api/v1/auth
│   │   ├── qrRoutes.go                # /api/v1/qr
│   │   ├── staticQrRoutes.go          # /api/v1/static-qr
│   │   └── contactRoutes.go           # /api/v1/contact
│   └── service/                       # Business logic (auth, oauth, qr, staticQr, contact, rateLimiter)
├── migrations/                        # GORM AutoMigrate (auth + QR + static QR) — run on bootstrap
├── pkg/
│   ├── database/                      # PostgreSQL connection (sync.Once guarded)
│   ├── logger/                        # Logger setup
│   ├── mailer/                        # Verification, OTP & contact emails
│   ├── redis/                         # OTP, attempts, rate-limit primitives
│   ├── tokenJWT/                      # JWT generation + validation
│   └── utils/                         # Crypto/hashing, validation error formatter, password hashing
├── dockerfile                         # Container build
└── vercel.json                        # Routes all traffic to api/index.go
```

---

## Data Models

Migrated automatically on bootstrap via GORM `AutoMigrate`:

| Model | Purpose |
|---|---|
| `User` | Account identity and profile |
| `AuthenticationMethod` | Per-user provider rows (password / google), stores OAuth refresh token |
| `Session` | Active login sessions; stores hashed refresh token, IP, device, expiry |
| `UserToken` | Single-use tokens (e.g. email verification) |
| `SecurityAuditLog` | Login, logout, password change, OAuth and session events |
| `QrDetails` | Dynamic QR: destination URL, status, scan count, analytics flag, QR image |
| `QrScan` | One row per recorded scan (IP, user agent, city, country) |
| `QrActivityLog` | Human-readable activity feed (created / scanned / updated) |
| `StaticQr` | Static QR codes (payload encoded directly into the image) |

---

## Runtime Modes

Both runtimes share the same routes, handlers, services, and repositories. `app/app.go` wires everything up **once** via `sync.Once` — env load, Redis, PostgreSQL, migrations, Gin engine, middleware, and routes. Only the entry point differs.

| | Server | Serverless (Vercel) |
|---|---|---|
| Entry point | `cmd/api/main.go` | `api/index.go` |
| HTTP lifecycle | `http.ListenAndServe(":8000")` | Managed by Vercel |
| Connections | Persistent | Reused across warm instances |
| Cold starts | None | Possible after inactivity |

---

## Architecture

```
HTTP Request
      │
      ▼
[ Entry Point ]   cmd/api/main.go (server) · api/index.go (serverless)
      │
      ▼
[ app.Handler() ] Bootstrapped once via sync.Once
      │
      ▼
[ Middleware ]    Recovery · Client IP · Access Logger · CORS · (Rate limiter / Auth per route)
      │
      ▼
[ Handler ]       Parse · validate · map domain errors → HTTP status
      │
      ▼
[ Service ]       Business logic · tokens · QR/scan logic · Redis ops
      │
      ▼
[ Repository ]    GORM queries · transactions (no business logic)
      │
      ▼
[ PostgreSQL ]   [ Redis ]
```

- **Handler** — parses/validates input and maps errors; never touches the DB directly.
- **Service** — all business logic; no HTTP knowledge.
- **Repository** — GORM queries and transactions only.
- Multi-step writes are wrapped in transactions; all init is `sync.Once` guarded.

---

## API Reference

**Base URL:** `/api/v1` · Public scan redirect lives at the root: `GET /qr/:id`.

### Auth — `/api/v1/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | — | Create account, send verification email |
| `GET`  | `/verification-email?token=` | — | Verify email (redirects to frontend) |
| `POST` | `/login` | — | Email + password login; may require 2FA |
| `POST` | `/login/2fa` | — | Complete login with emailed OTP |
| `POST` | `/refresh` | cookie | Rotate tokens (revokes old session) |
| `POST` | `/logout` | cookie | Revoke current session, clear cookie |
| `POST` | `/change-password` | — | Change password (verifies current) |
| `POST` | `/forgot-password` | — | Send reset OTP |
| `POST` | `/forgot-password-verify` | — | Verify reset OTP |
| `POST` | `/forgot-password-update` | — | Set new password |
| `GET`  | `/google` | — | Redirect to Google consent |
| `GET`  | `/google/callback` | — | Exchange code, create/link account, set cookie |
| `POST` | `/google/refresh` | — | Refresh Google access token |
| `GET`  | `/me` | JWT | Current user profile |
| `PATCH`| `/me` | JWT | Update profile |
| `PATCH`| `/two-factor` | JWT | Enable/disable 2FA |
| `GET`  | `/sessions` | JWT | List active sessions |
| `POST` | `/sessions/:sessionId/revoke` | JWT | Revoke a session |
| `POST` | `/logout-all` | JWT | Revoke all sessions |
| `GET`  | `/security-audit-log` | JWT | Security event history |
| `POST` | `/delete-account` | JWT | Delete the account |

### Dynamic QR — `/api/v1/qr` (JWT required)

| Method | Endpoint | Description |
|---|---|---|
| `GET`  | `/get` | List the user's QR codes |
| `GET`  | `/activity` | Recent QR activity feed |
| `GET`  | `/scans/:id` | Raw scan rows for a code |
| `GET`  | `/analytics/summary` | Aggregate analytics |
| `GET`  | `/analytics/growth` | Scan growth over time |
| `GET`  | `/analytics/scan-frequency/:id` | Per-code scan frequency |
| `POST` | `/create` | Create a dynamic QR (rate limited) |
| `PUT`  | `/update/:id` | Update destination/status/name (rate limited) |
| `DELETE` | `/delete` | Delete a QR (rate limited) |

### Static QR — `/api/v1/static-qr` (JWT required)

| Method | Endpoint | Description |
|---|---|---|
| `GET`  | `/list` | List static QR codes |
| `POST` | `/create` | Create a static QR (rate limited) |
| `DELETE` | `/:id` | Delete a static QR (rate limited) |

### Contact — `/api/v1/contact`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `` | Submit the contact form (rate limited, fail-open) |

### Public

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/qr/:id` | Resolve a dynamic QR and redirect to its destination |
| `GET` | `/` | Health/identity banner |

---

## Dynamic QR Flow

```
GET /qr/:id  (public scan)
  → Resolve client IP + geo (platform headers, else external IP-geo lookup)
  → Load QR by id
      not found  → 302 redirect to QR_NOT_FOUND_PAGE_URL
      not active → 302 redirect to INACTIVE_QR_PAGE_URL
  → If analytics enabled:
        increment scan_count, insert qr_scans row, append activity log
  → 302 redirect to destination_url
```

Creating a code (`POST /api/v1/qr/create`) generates a UUID, builds the scan URL from `PUBLIC_SCAN_URL`, encodes it to a PNG data URL, and stores the record as `active`.

---

## Auth & Session Flow

```
Login → bcrypt verify → (optional 2FA via emailed OTP)
      → issue access JWT + refresh token
      → store SHA-hashed refresh token as a session row (IP + device)
      ← access_token + HttpOnly refresh cookie

Refresh → validate cookie → look up session by token hash
        → revoke old session, issue new access + refresh pair
        ← new access_token + new cookie

Logout → revoke session → clear cookie
```

- The raw refresh token is **never stored** — only its hash.
- Each refresh **rotates** the token, so a stolen token is invalidated on next legitimate use.
- The refresh cookie is `HttpOnly` and scoped to the refresh path.
- Every protected request re-checks that the JWT maps to a **live DB session** (supports revocation).

---

## Google OAuth Flow

```
GET /google → redirect to Google consent
GET /google/callback
  → exchange code → fetch Google profile
  → existing google method?   → log in
    else email already exists? → link google method to the account
    else                       → create new user + google method
  → issue ZynQR JWT + session (same as password login)
```

The Google access token is used once to fetch profile info; the Google refresh token is stored on the authentication method.

---

## Rate Limiting

Per-IP counters in Redis (1-minute window), tuned per route group:

| Route group | Limit / min | On Redis failure |
|---|---|---|
| `/api/v1/auth` (POST flows) | 6 | Fail-closed (rejects) |
| `/api/v1/contact` | 5 | Fail-open (allows) |
| QR & static QR **writes** | 120 | Fail-closed |
| QR & static QR **reads** | unlimited | — (dashboard issues many concurrent queries) |

---

## Configuration

Env vars are read via `os.Getenv`. Locally, a `.env` file is loaded automatically; in production (when `APP_ENV` is set) the platform injects them and `.env` loading is skipped.

```env
# App
APP_ENV=development            # development | production
APP_NAME=ZynQR
GIN_MODE=debug                 # debug | release
PORT=8000

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=zynqr_db
DB_SSLMODE=disable             # require in production

# Redis
REDIS_ADDR=localhost:6379
REDIS_USERNAME=
REDIS_PASSWORD=
REDIS_DB=0

# JWT
JWT_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

# Google OAuth
CLIENT_ID=your_google_client_id
CLIENT_SECRET=your_google_client_secret
REDIRECT_URL=http://localhost:8000/api/v1/auth/google/callback
FRONTEND_URL=http://localhost:5178   # React app origin (post-callback redirect target)

# Email (SMTP)
SMTP_FROM=noreply@example.com
SMTP_PASSWORD=smtp_password
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_URL=http://localhost:8000
CONTACT_INBOX_EMAIL=support@example.com   # receives /api/v1/contact submissions

# QR scanning & geolocation
PUBLIC_SCAN_URL=http://localhost:8000              # origin used to build /qr/<id> links
INACTIVE_QR_PAGE_URL=http://localhost:5178/link-inactive
QR_NOT_FOUND_PAGE_URL=http://localhost:5178/qr-not-found
IP_GEO_API_BASE_URL=https://ipapi.co              # lookup URL is {base}/{ip}/json/
```

> See `.env.example` for the authoritative list.

---

## Getting Started

**Prerequisites:** Go 1.25+ · PostgreSQL · Redis

```bash
cd ZynQR-Server

cp .env.example .env          # then fill in real values
go mod download

# Run (migrations run automatically on startup)
go run ./cmd/api/main.go      # http://localhost:8000
```

A quick check once it's running:

```bash
curl http://localhost:8000/            # identity banner
```

---

## Deployment

### Vercel (serverless)

`api/index.go` and `vercel.json` are already in the repo.

1. Set all env vars in **Vercel → Project Settings → Environment Variables**.
   - `REDIRECT_URL` → `https://your-api.vercel.app/api/v1/auth/google/callback`
   - `FRONTEND_URL` → your deployed frontend origin
   - `PUBLIC_SCAN_URL` → your API origin (used in `/qr/<id>` links)
   - Use a managed PostgreSQL (e.g. [Neon](https://neon.tech)) and Redis (e.g. [Upstash](https://upstash.com)).
2. Add the callback URL to **Google Cloud Console → Authorized redirect URIs**.
3. Deploy:

```bash
vercel --prod
```

### Docker

```bash
docker build -t zynqr-server -f dockerfile .
docker run --env-file .env -p 8000:8000 zynqr-server
```

---

## Frontend (ZynQR-Client)

The companion React SPA lives in `../ZynQR-Client` and talks to this API via `VITE_API_URL` (which must include `/api/v1`).

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite |
| Routing | React Router |
| Data fetching | TanStack Query + Axios |
| Styling | Tailwind CSS |
| PWA | `vite-plugin-pwa` (installable, offline app shell) |

**Page areas:**

- **Landing** — home, features, pricing, contact, API overview.
- **Auth** — login, register, forgot password, OAuth callback, email verified.
- **Dashboard** — overview, my QRs, create dynamic/static QR, QR analytics (global & per-code), recent activity, security & privacy, notifications, API keys, user guide, API docs, change password.
- **Public** — QR not found, inactive link (the redirect targets for `/qr/:id`).

**Frontend env (`ZynQR-Client/.env`):**

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_PUBLIC_APP_URL=http://localhost:5178
VITE_GITHUB_REPO_URL=https://github.com/your-org/zynqr
```

> Only `VITE_`-prefixed values reach the browser bundle and are public by design — never put secrets there. All real secrets stay in this backend.

---

## Security Notes

| Concern | Approach |
|---|---|
| Token storage | Refresh tokens stored as hashes only |
| XSS | Refresh token in `HttpOnly`, path-scoped cookie |
| Token theft | Refresh rotation invalidates stolen tokens on next use |
| Session revocation | Every request validates the JWT against a live DB session |
| OTP abuse | Attempt lockout + cooldown tracked in Redis |
| Brute force | Per-IP Redis rate limiter on auth and write routes |
| OAuth account safety | Existing-account email links to the account instead of silently merging |
| Partial writes | Multi-step DB operations wrapped in GORM transactions |

> **Hardening still recommended before calling production-ready:** validate dynamic-QR destination URLs (block non-`http(s)` schemes to prevent open redirects), drive CORS from env, set `Secure` cookies in production, add security headers, and tighten OAuth `state` handling. See the project notes for the full list.

---

## Production Checklist

- [ ] Strong, unique `JWT_SECRET` and `JWT_REFRESH_SECRET`
- [ ] `APP_ENV=production` and `GIN_MODE=release`
- [ ] `DB_SSLMODE=require`
- [ ] CORS restricted to your real frontend origin
- [ ] `Secure=true` on cookies (HTTPS)
- [ ] `REDIRECT_URL` registered in Google Cloud Console
- [ ] `PUBLIC_SCAN_URL`, `FRONTEND_URL`, `INACTIVE_QR_PAGE_URL`, `QR_NOT_FOUND_PAGE_URL` point to deployed domains
- [ ] Managed PostgreSQL + Redis reachable from the runtime
- [ ] Secrets stored in the platform's env settings (never committed)
