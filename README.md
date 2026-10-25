# Saasno Frontend

Admin panel frontend for **Saasno** — a role-based access management system covering APIs, menus, roles, positions, and users, built with Next.js 16 (App Router, Turbopack) and TypeScript.

Pairs with [`saasno-backend`](../saasno-backend), a Spring Boot service. This app never talks to the backend directly from the browser — every request goes through Next.js API routes (`src/app/api/*`) which attach the session/auth header server-side, so the backend URL and bearer token are never exposed to the client.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack), React 19, TypeScript
- **Styling:** Tailwind CSS v4
- **Realtime:** Socket.IO client (notifications)
- **Font:** Inter (self-hosted via `next/font/google`)
- **Icons:** lucide-react

## Prerequisites

- Node.js 22+
- The [`saasno-backend`](../saasno-backend) service running and reachable
- Redis is only required by the backend, not this app

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to `/login`.

## Environment Variables

None of these are required for local development — every one has a working default that points at `localhost`. Set them explicitly for staging/production.

| Variable | Default | Description |
|---|---|---|
| `SAASNO_FRONTEND_BACKEND_URL` | `http://localhost:8000` | Base URL of the backend API, used server-side only |
| `SAASNO_FRONTEND_KEY_CSRF` | random per dev process | HMAC signing key for the CSRF double-submit token. **Required in production** — the app throws at request time if unset when `NODE_ENV=production` |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server (Turbopack) on port 3000 |
| `npm run build` | Production build (standalone output) |
| `npm start` | Run the production build via the custom `server.js` wrapper |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Type-check with `tsc --noEmit` |
| `npm test` | Unit tests (Node's built-in test runner, `src/**/*.test.ts`; needs Node 22.18+/24) |

## Project Structure

```
src/
  app/              Routes (App Router)
    (admin)/         Authenticated pages — dashboard + system/* (api, menu, role, user, position, configuration, role-api, role-menu, position-role)
    (public)/        Login + landing page
    api/              Next.js API routes that proxy to the backend
  component/         One folder per feature, mirroring app/(admin)/system/*
  service/           fetch() wrappers per feature, called from components
  context/          React context: CSRF token, auth user, modal, loading state
  hooks/            useContentLoading — local inline-loading state for data fetches
  type/             Shared TypeScript types + per-feature filter types
  utils/            endpointUtils, csrfUtils, responseApiUtils, securityUtils, etc.
  proxy.ts          Next.js middleware — session gate, CSRF cookie issuance, CORS + security headers, rate limiting
```

## Auth & Security

- **Session:** an httpOnly `sn_dc` cookie holds the backend session id; `src/proxy.ts` (Next's middleware, renamed in Next 16) redirects unauthenticated requests to `/login` for pages and returns `401` for API routes.
- **CSRF:** double-submit pattern — an httpOnly `__Host-sn_csrf_sid` cookie plus an `x-csrf-token` header, HMAC-verified server-side (`csrfFilter` in `src/utils/csrfUtils.ts`) on every mutating request.
- **CSP:** a per-request nonce is generated in `proxy.ts` and threaded through to Next's own rendered `<script>`/`<link>` tags, so `script-src` can stay nonce-restricted instead of falling back to `unsafe-inline`.
- **Loading UX:** navigation clicks trigger a full-screen modal (`LoadingCircleContext`) immediately; each page's own data fetch uses a separate inline `LoadingContent` component (`useContentLoading` hook) so the two never overlap.

- **Password recovery:** `/forgot-password` asks for the account email and calls the backend, which emails a one-time link to `/reset-password?token=…`. Both are public pages (and `/api/password/*` public routes, CSRF-checked and rate-limited per IP).
- **Forced password change:** when the backend marks a session `passwordChangeRequired` (new user, admin reset, or expired password), login goes to `/change-password`; `UserContext` also redirects there, because every other API answers `403` until the password is changed.
- **Password rules:** length/complexity are checked in the browser (`src/utils/passwordPolicyUtils.ts`) before the password is hashed with SHA-256 — the backend never sees the plain password. The rules come from the backend (`/api/password/policy`).
- **Health:** `GET /api/health` returns `200 {"status":"UP"}` only when the frontend and the backend (with its dependencies) are up, else `503`.
- **Branding:** the application name, brand colour and logo come from the backend (`/api/public/app-setting`) and are read on the server for every page (`src/utils/appSettingServer.ts`, `app/layout.tsx`), so pages are rendered per request. The colour is two CSS variables (`--brand-hue`, `--brand-chroma`) set on `<html>`; admins change them at **System > Application**. If the backend is slow or down, the defaults are used.
- **Profile picture:** upload/remove on the Profile page (`AvatarEditor`); shown in the header. Files are checked in the browser first (`imageUploadUtils`), and again by the backend.
- **Two-step recovery codes:** shown once after enabling two-step verification (and when regenerated, on the Security page); at login, "Lost your phone? Use a recovery code" accepts one instead of the 6-digit code.
- **Maintenance:** **System > Maintenance** shows how much old data there is, runs the cleanup now (all of it, or one kind of data with the button on its own card), and can delete every download job; the download tray has "Clear all" for a user's own list.
- **Maintenance mode:** switched at **System > Maintenance** (who may keep working, message, optional end time). While it is on, everyone else gets `503` from the backend; `handleResponseApi`/`handleResponseTable` send them to `/maintenance`, which polls `/api/maintenance-status` every 20 seconds and moves on to the login page as soon as maintenance is over. The login page shows a banner and the people who can still work see a banner above every page.
- **Search:** the box beside the bell (or **Ctrl+K** / Cmd+K from any page) opens a palette that lists the pages in the user's menus; typing filters at every key, arrows and Enter (or a click) open the page. The matching is in `src/utils/searchUtils.ts`. A notification that carries a link opens that page when clicked; one without a link opens its details.
- **CI:** the `test` job in `.github/workflows/ghcr.yml` runs lint, typecheck, tests and the build on every pull request, on pushes to `main`/`UAT`, and before an image is built.

## Deployment

`Dockerfile` builds a standalone Next.js image (multi-stage, non-root user) and runs it via a custom `server.js` that adds structured file logging to `/data/logs/com/saasno/frontend`. `docker-compose.yml` expects two external Docker networks, `saasno-frontend` and `saasno-backend`, shared with the backend's compose file.

## License

All rights reserved — see [`LICENSE`](./LICENSE).
