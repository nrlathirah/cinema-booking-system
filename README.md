# Kinora

[![CI](https://github.com/nrlathirah/cinema-booking-system/actions/workflows/ci.yml/badge.svg)](https://github.com/nrlathirah/cinema-booking-system/actions/workflows/ci.yml)

A fullstack cinema booking system: pick a showtime, select seats on a live seat map, and order food & drinks — either bundled with your booking or on their own. Built to explore a problem that's easy to get *almost* right and expensive to get wrong: making sure two people can never buy the same seat.

## The problem

Cinema seat booking looks simple until multiple people hit "confirm" on the same seat within the same second. A naive implementation — check if the seat is free, then insert the booking — has a race condition: two requests can both pass the check before either one writes to the database, and you end up with two customers holding tickets for one seat.

On top of that, users expect to *see* seats disappear in real time as other people pick them, not just find out at checkout that their choice is gone.

## Approach

The system separates two related but distinct concerns:

**1. Live seat selection (UX, not a source of truth).** When a user clicks a seat, the browser emits a Socket.io event. The server holds a short-lived, in-memory lock (`showtimeId:seatId → socket, 2-minute timer`) and broadcasts `seat:locked` to everyone viewing that showtime. Other clients immediately grey out the seat. If the user closes the tab, disconnects, or lets the 2-minute hold expire, the lock is released and broadcast as free again. This layer exists purely to make the UI feel live — it is **not** what actually prevents double-booking.

**2. Booking confirmation (the actual guarantee).** When a user confirms, the server runs the inserts inside a database transaction against a table with a **unique constraint on `(showtime_id, seat_id)`**. If two confirm requests for the same seat race each other, Postgres itself rejects the second insert — no amount of application-level checking can be raced past a DB constraint. The loser gets a `409` and the seat map refreshes.

This split matters: the socket layer can be laggy, buggy, or briefly wrong without any real consequence, because it's cosmetic. The constraint is the only thing that has to be correct, and it's enforced by the database engine rather than by application logic — which is what makes it correct under concurrency.

I verified this directly by firing 5 simultaneous booking requests for the same seat from a script (not sequential retries — genuinely concurrent). Exactly 1 succeeded; the other 4 were rejected with `409`.

## Key technical challenges

- **Preventing double-booking under concurrency** — described above. This was the core problem the project was built around.
- **Real-time UX without a shared source of truth** — the in-memory socket lock is per-process and intentionally not persisted; it's a courtesy to the UI, and the DB constraint is the only thing that has to survive a server restart or a race.
- **Bundling two independent flows** — an F&B order can optionally attach to a seat booking (`orders.booking_id`, nullable) without the ordering flow depending on booking having happened first. Users can order food with no booking at all.
- **Role-gated admin actions** on top of the same REST API used by customers (JWT payload carries `role`; middleware checks it per-route) rather than a separate admin service.

## Features

- **Auth** — register/login (JWT + bcrypt), `admin` / `customer` roles
- **Real movie data** — showtimes are backed by [TMDB](https://www.themoviedb.org/) (real poster, backdrop, genre, runtime), with a graceful placeholder fallback when no API key is set
- **Seat booking** — poster-grid showtime browser, interactive seat map with priced standard/premium seats, live seat locking over Socket.io, transactional booking with a DB-level uniqueness guarantee
- **F&B ordering** — browse menu by category, cart, checkout, optional bundling with a seat booking
- **Mock checkout** — a dummy payment step (pre-filled fake card, simulated processing delay) in front of both seat and F&B checkout; this is a portfolio project, so no real payment gateway is wired up
- **My Bookings** — logged-in customers can see their past seat bookings and F&B orders
- **Admin panel** — manage halls (seat layout is generated automatically from rows × seats-per-row), showtimes, and menu items; view all bookings/orders and a reporting dashboard (seat utilization, most-ordered items)
- **CI** — GitHub Actions runs the test suite and a production build on every push/PR to `main`

## Tech stack

| | |
|---|---|
| Frontend | Vue 3 (Composition API), Pinia, Vue Router, Tailwind CSS, Socket.io-client |
| Backend | Node.js, Express, Socket.io, Sequelize, JWT, bcrypt |
| Database | PostgreSQL (Neon) |
| Movie data | [TMDB API](https://www.themoviedb.org/) |
| Testing | Vitest |
| CI | GitHub Actions |

## Project structure

```
backend/
  src/
    models/        Sequelize models + associations
    controllers/    request handlers
    routes/         Express routers
    middleware/      JWT auth + role guards
    sockets/         Socket.io handlers + the seat-lock manager
    utils/           pure helpers (e.g. order price calculation)
  tests/             Vitest unit tests
frontend/
  src/
    views/          pages
    views/admin/    admin-only pages
    stores/         Pinia stores (auth, cart)
    services/       API client + socket client
```

## Getting started

Requires a PostgreSQL database (this project uses a free [Neon](https://neon.com) instance).

### Backend

```sh
cd backend
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET, and (optionally) TMDB_API_KEY
npm install
npm run seed            # creates a hall + seats, a real-movie catalog, menu items, and an admin account
npm run dev
```

The seed script also creates an admin account (`admin@kinora.test` / `admin12345`) so you can access `/admin` right away. Without a [TMDB API key](https://www.themoviedb.org/settings/api) the seeded showtimes fall back to placeholder posters — everything still works, just without real movie art.

### Frontend

```sh
cd frontend
npm install
npm run dev
```

The dev server runs on `http://localhost:5173` and proxies `/api` and `/socket.io` to the backend on `http://localhost:5000`.

### Tests

```sh
cd backend
npm test
```

## What I'd do next

- Cancellation flow for bookings/orders (the unique constraint is currently permanent — no seat can be re-booked after a cancellation, since that flow doesn't exist yet)
- A real payment gateway (the current checkout is an intentional dummy step — see [Features](#features))
- Move the in-memory seat-lock map to Redis so it survives a backend restart and works across multiple server instances
- Deploy: frontend to Netlify/Vercel, backend to Render, both wired to auto-deploy on merge to `main`
