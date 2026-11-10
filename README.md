# Wanderlast — Travel Booking Webapp

## Description

**Wanderlast** is a full-stack travel booking platform where travelers can browse curated destinations, search for their next trip, and book travel packages instantly. The project is split into two applications:

- **Frontend** — a Next.js (App Router) website: landing page with an interactive search and a featured-destinations carousel, a destination catalog with detail pages, a booking flow, a user profile with travel statistics, and an admin dashboard for managing the travel packages.
- **Backend** (`wanderlast-server`) — a separate Express.js REST API that owns the MongoDB database (`destination`, `booking` collections) and secures every booking and admin operation behind **JWT authentication** (better-auth access tokens verified against the app's JWKS).

Registered users can book any listed package — each booking is stamped server-side with the owner's account, so nobody can create, view, or cancel another user's trips. Only the site admin can add, edit, or delete destinations; those actions are gated twice (in the Next.js app and again in the Express API).

## Technologies Used

### Frontend

| Technology | Purpose |
| --- | --- |
| [Next.js](https://nextjs.org) (App Router, Turbopack) | React framework — server components, route handlers, streaming with Suspense |
| [React](https://react.dev) + TypeScript | Component library with end-to-end type safety |
| [Tailwind CSS](https://tailwindcss.com) v4 | Config-less styling with CSS-variable theming |
| [Base UI](https://base-ui.com) (shadcn-style primitives) | Accessible dialogs, dropdowns, buttons, comboboxes |
| [better-auth](https://www.better-auth.com) + jwt plugin | Email/password auth, sessions, and JWT access tokens (JWKS endpoint) |
| Sonner | Toast notifications |
| ESLint + `tsc` | Linting and type checking |

### Backend

| Technology | Purpose |
| --- | --- |
| [Express.js](https://expressjs.com) | REST API server (port 8000) |
| [MongoDB](https://www.mongodb.com) (official Node driver) | Database for destinations, bookings, and auth data |
| [jose](https://github.com/panva/jose) | JWT verification against the frontend's remote JWKS |
| cors + dotenv | Cross-origin access for the frontend and env-based configuration |

## Main Features

- **Interactive homepage search** — search live destinations and your own bookings directly from the hero section.
- **Featured destinations carousel** — a rotating spotlight of the latest travel packages on the landing page.
- **Destination catalog & detail pages** — browse all packages via `GET /destinations`, open each one for an overview, highlights, pricing, and a departure-date picker.
- **Instant booking flow** — "Book Now" books a trip through `POST /booking`; the server stamps every booking with the logged-in user's id, email, booking ref, and status.
- **My Bookings** — the bookings page streams only *your* trips (`GET /my-bookings/:email`), with per-booking cancel (`DELETE /my-bookings/:id`, ownership enforced in the query) and details view.
- **Profile with travel statistics** — total bookings, total spent, upcoming trips, and countries visited computed from your live bookings.
- **Admin-only package management** — Add/Edit/Delete destination buttons appear only for the admin account; requests flow through Next.js route handlers (`/api/admin/destinations*`) and are re-verified by the Express API's `verifyToken` + `verifyAdmin` middleware.
- **JWT-secured API** — better-auth issues short-lived access tokens; the Express backend validates every protected request against the published JWKS, with a session-token fallback for robustness.
- **Auth pages** — sign up / log in / log out with protected routes (bookings, profile, add-destination).

