import dotenv from 'dotenv'
dotenv.config()

import bcrypt from 'bcrypt'
import models, { sequelize } from './models/index.js'
import { fetchMovieFromTMDB } from './utils/tmdb.js'

const { Hall, Seat, Showtime, MenuItem, User } = models

const ADMIN_EMAIL = 'admin@kinora.test'
const ADMIN_PASSWORD = 'admin12345'

const ROWS = ['A', 'B', 'C', 'D', 'E']
const SEATS_PER_ROW = 8

function posterFor(movieTitle) {
  const slug = movieTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return `https://picsum.photos/seed/${slug}/400/600`
}

function imageFor(itemName) {
  const slug = itemName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return `https://picsum.photos/seed/${slug}/300/300`
}

async function seed() {
  await sequelize.sync({ alter: true })

  const [hall] = await Hall.findOrCreate({
    where: { name: 'Hall 1' },
    defaults: { rows: ROWS.length, seats_per_row: SEATS_PER_ROW },
  })

  const STANDARD_PRICE = 15.0
  const PREMIUM_PRICE = 25.0

  const existingSeats = await Seat.count({ where: { hall_id: hall.id } })
  if (existingSeats === 0) {
    const seatRows = []
    for (const row of ROWS) {
      for (let n = 1; n <= SEATS_PER_ROW; n++) {
        const type = row === 'A' ? 'premium' : 'standard'
        seatRows.push({
          hall_id: hall.id,
          seat_row: row,
          seat_number: n,
          type,
          price: type === 'premium' ? PREMIUM_PRICE : STANDARD_PRICE,
        })
      }
    }
    await Seat.bulkCreate(seatRows)
    console.log(`seeded ${seatRows.length} seats for ${hall.name}`)
  } else {
    console.log(`${hall.name} already has seats, skipping`)
  }

  await Seat.update({ price: PREMIUM_PRICE }, { where: { hall_id: hall.id, type: 'premium' } })
  await Seat.update({ price: STANDARD_PRICE }, { where: { hall_id: hall.id, type: 'standard' } })

  const OLD_PLACEHOLDER_TITLES = [
    'Dune: Part Three',
    'The Batman Continues',
    'Spider-Verse: Beyond',
    'Mission Impossible: Legacy',
    'The Grand Budapest Hotel II',
    "Oppenheimer: Director's Cut",
    'Avatar: The Deep Current',
    'John Wick: Chapter 5',
    'Everything Everywhere: Reloaded',
    'Past Lives Forever',
    'Test Movie',
  ]
  const removedPlaceholders = await Showtime.destroy({ where: { movie_title: OLD_PLACEHOLDER_TITLES } })
  if (removedPlaceholders > 0) {
    console.log(`removed ${removedPlaceholders} old fictional/placeholder showtime(s)`)
  }

  const MOVIES = [
    { title: 'Dune: Part Two', genre: 'Sci-Fi', duration: 166, startHours: [1, 4, 7, 10] },
    { title: 'The Batman', genre: 'Action', duration: 176, startHours: [2, 5, 8, 11] },
    {
      title: 'The Lord of the Rings: The Fellowship of the Ring',
      genre: 'Fantasy',
      duration: 178,
      startHours: [1, 5, 9],
    },
    {
      title: 'The Lord of the Rings: The Two Towers',
      genre: 'Fantasy',
      duration: 179,
      startHours: [2, 6, 10],
    },
    {
      title: 'The Lord of the Rings: The Return of the King',
      genre: 'Fantasy',
      duration: 201,
      startHours: [3, 7, 11],
    },
    { title: 'Spider-Man: Across the Spider-Verse', genre: 'Animation', duration: 140, startHours: [1, 4, 7, 10] },
    {
      title: 'Mission: Impossible - Dead Reckoning Part One',
      genre: 'Action',
      duration: 163,
      startHours: [2, 5, 8],
    },
    { title: 'The Grand Budapest Hotel', genre: 'Comedy', duration: 100, startHours: [1, 3, 6, 9] },
    { title: 'Oppenheimer', genre: 'Drama', duration: 180, startHours: [2, 6, 10] },
    { title: 'Avatar: The Way of Water', genre: 'Sci-Fi', duration: 192, startHours: [1, 5, 9] },
    { title: 'John Wick: Chapter 4', genre: 'Action', duration: 169, startHours: [3, 7, 11] },
    { title: 'Everything Everywhere All at Once', genre: 'Sci-Fi', duration: 139, startHours: [2, 4, 8] },
    { title: 'Past Lives', genre: 'Drama', duration: 105, startHours: [1, 6, 10] },
  ]

  let addedSessions = 0
  let tmdbHits = 0
  for (const movie of MOVIES) {
    const tmdbData = await fetchMovieFromTMDB(movie.title)
    if (tmdbData?.posterUrl) tmdbHits++

    const posterUrl = tmdbData?.posterUrl || posterFor(movie.title)
    const backdropUrl = tmdbData?.backdropUrl || posterUrl
    const genre = tmdbData?.genre || movie.genre
    const duration = tmdbData?.durationMinutes || movie.duration
    const overview = tmdbData?.overview || null
    const rating = tmdbData?.rating || null
    const tmdbId = tmdbData?.tmdbId || null
    const tagline = tmdbData?.tagline || null
    const releaseDate = tmdbData?.releaseDate || null
    const ageRating = tmdbData?.ageRating || null

    // Refresh metadata on any sessions already seeded for this movie.
    await Showtime.update(
      {
        poster_url: posterUrl,
        backdrop_url: backdropUrl,
        genre,
        duration_minutes: duration,
        overview,
        rating,
        tmdb_id: tmdbId,
        tagline,
        release_date: releaseDate,
        age_rating: ageRating,
      },
      { where: { movie_title: movie.title } },
    )

    // Top up sessions rather than skip/recreate: existing rows may already be
    // referenced by bookings, so they're never deleted — only new time slots
    // beyond what's already seeded get added.
    const existingCount = await Showtime.count({ where: { movie_title: movie.title } })
    const missingHours = movie.startHours.slice(existingCount)
    if (missingHours.length > 0) {
      const now = new Date()
      const rows = missingHours.map((hours) => {
        const start = new Date(now.getTime() + hours * 60 * 60 * 1000)
        const end = new Date(start.getTime() + duration * 60 * 1000)
        return {
          movie_title: movie.title,
          hall_id: hall.id,
          poster_url: posterUrl,
          backdrop_url: backdropUrl,
          genre,
          overview,
          rating,
          tmdb_id: tmdbId,
          tagline,
          release_date: releaseDate,
          age_rating: ageRating,
          duration_minutes: duration,
          start_time: start,
          end_time: end,
        }
      })
      await Showtime.bulkCreate(rows)
      addedSessions += rows.length
    }
  }
  console.log(
    addedSessions > 0
      ? `seeded ${addedSessions} showtime session(s) across the movie catalog`
      : 'movie catalog already up to date, skipping',
  )
  console.log(
    process.env.TMDB_API_KEY
      ? `TMDB matched ${tmdbHits}/${MOVIES.length} movies`
      : 'TMDB_API_KEY not set — using placeholder posters (see backend/.env.example)',
  )

  const showtimesMissingPoster = await Showtime.findAll({ where: { poster_url: null } })
  for (const s of showtimesMissingPoster) {
    await s.update({ poster_url: posterFor(s.movie_title) })
  }
  if (showtimesMissingPoster.length > 0) {
    console.log(`backfilled poster_url for ${showtimesMissingPoster.length} showtime(s)`)
  }

  const existingMenuItems = await MenuItem.count()
  if (existingMenuItems === 0) {
    const menuItems = [
      { name: 'Popcorn (Salted)', category: 'popcorn', price: 12.9, is_combo: false },
      { name: 'Popcorn (Caramel)', category: 'popcorn', price: 14.9, is_combo: false },
      { name: 'Coca-Cola', category: 'drinks', price: 7.5, is_combo: false },
      { name: 'Mineral Water', category: 'drinks', price: 4.5, is_combo: false },
      { name: 'Nachos with Cheese', category: 'snacks', price: 15.9, is_combo: false },
      { name: 'Popcorn + Drink Combo', category: 'combo', price: 18.9, is_combo: true },
    ]
    await MenuItem.bulkCreate(menuItems.map((item) => ({ ...item, image_url: imageFor(item.name) })))
    console.log('seeded 6 menu items')
  } else {
    console.log('menu items already exist, skipping')
  }

  const menuItemsMissingImage = await MenuItem.findAll({ where: { image_url: null } })
  for (const item of menuItemsMissingImage) {
    await item.update({ image_url: imageFor(item.name) })
  }
  if (menuItemsMissingImage.length > 0) {
    console.log(`backfilled image_url for ${menuItemsMissingImage.length} menu item(s)`)
  }

  const oldAdmin = await User.findOne({ where: { email: 'admin@seatflow.test' } })
  if (oldAdmin) {
    await oldAdmin.update({ email: ADMIN_EMAIL })
    console.log(`renamed admin email to ${ADMIN_EMAIL}`)
  }

  const existingAdmin = await User.findOne({ where: { email: ADMIN_EMAIL } })
  if (!existingAdmin) {
    const password_hash = await bcrypt.hash(ADMIN_PASSWORD, 10)
    await User.create({ name: 'Admin', email: ADMIN_EMAIL, password_hash, role: 'admin' })
    console.log(`seeded admin user (${ADMIN_EMAIL} / ${ADMIN_PASSWORD})`)
  } else {
    console.log('admin user already exists, skipping')
  }

  await sequelize.close()
}

seed().catch((err) => {
  console.error('seed failed:', err)
  process.exit(1)
})
