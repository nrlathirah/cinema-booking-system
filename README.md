# SeatFlow — Cinema Seat Booking + F&B Ordering

Fullstack web app for booking cinema seats and ordering food & beverages, with real-time seat availability to prevent double-booking.

See [seatflow-project-spec.md](./seatflow-project-spec.md) for the full project spec.

## Structure

- `frontend/` — Vue 3 (Composition API), Pinia, Vue Router, Tailwind CSS, Socket.io-client
- `backend/` — Node.js, Express, Socket.io, Sequelize (PostgreSQL), JWT + bcrypt

## Getting Started

### Backend

```sh
cd backend
cp .env.example .env   # fill in your DATABASE_URL
npm run dev
```

### Frontend

```sh
cd frontend
npm run dev
```

Frontend dev server runs on `http://localhost:5173` and proxies `/api` requests to the backend on `http://localhost:5000`.
