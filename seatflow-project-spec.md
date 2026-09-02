# SeatFlow — Cinema Seat Booking + F&B Ordering System

## Overview
A fullstack web application for booking cinema seats and ordering food & beverages, with real-time seat availability updates to prevent double-booking.

## Tech Stack
- **Frontend:** Vue.js 3 (Composition API), Pinia, Tailwind CSS, Socket.io-client
- **Backend:** Node.js, Express.js, Socket.io, JWT + bcrypt for auth
- **Database:** PostgreSQL, Sequelize ORM
- **Testing:** Vitest
- **DevOps:** GitHub Actions (CI/CD)
- **Deployment:** Netlify/Vercel (frontend), Render (backend), Neon or Supabase (PostgreSQL)

## Features

### Auth
- Register/login with JWT-based sessions
- Password hashing with bcrypt
- Roles: `admin`, `customer`

### Cinema Seat Booking
- Showtime listing (movie, time, hall)
- Interactive seat map with available / selected / taken states
- Real-time seat lock via WebSocket — seat selection is broadcast live to all users to prevent double-booking
- Booking hold-timer — seat is locked temporarily during checkout, auto-released if not completed
- Booking confirmation flow

### F&B Ordering
- Menu management (add/edit item, categories, combo sets)
- Order flow: browse menu → cart → confirm order
- Option to bundle F&B order with a seat booking

### Admin Panel
- Manage showtimes, seat layout, and menu items
- View all bookings and orders

### Reporting (optional)
- Basic dashboard: booking volume, most-ordered items, seat utilization

## Database Schema (draft)
- `users` (id, name, email, password_hash, role)
- `showtimes` (id, movie_title, hall_id, start_time, end_time)
- `seats` (id, hall_id, seat_row, seat_number, type)
- `bookings` (id, user_id, showtime_id, seat_id, status, created_at)
- `menu_items` (id, name, category, price, is_combo)
- `orders` (id, user_id, booking_id (nullable), status, total_price, created_at)
- `order_items` (id, order_id, menu_item_id, quantity)

Key design note: use a database transaction with a unique constraint on `(showtime_id, seat_id)` in `bookings` to prevent race-condition double-booking under concurrent requests.

## Testing & Quality
- Unit tests for booking conflict logic and price calculation
- GitHub Actions to run tests on push and auto-deploy on merge to main
- README written as a case study covering the problem, approach, and key technical challenges (e.g. concurrency handling)
