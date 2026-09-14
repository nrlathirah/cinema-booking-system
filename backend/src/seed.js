import dotenv from 'dotenv'
dotenv.config()

import bcrypt from 'bcrypt'
import models, { sequelize } from './models/index.js'

const { Hall, Seat, Showtime, MenuItem, User } = models

const ADMIN_EMAIL = 'admin@seatflow.test'
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
  await sequelize.sync()

  const [hall] = await Hall.findOrCreate({
    where: { name: 'Hall 1' },
    defaults: { rows: ROWS.length, seats_per_row: SEATS_PER_ROW },
  })

  const existingSeats = await Seat.count({ where: { hall_id: hall.id } })
  if (existingSeats === 0) {
    const seatRows = []
    for (const row of ROWS) {
      for (let n = 1; n <= SEATS_PER_ROW; n++) {
        seatRows.push({
          hall_id: hall.id,
          seat_row: row,
          seat_number: n,
          type: row === 'A' ? 'premium' : 'standard',
        })
      }
    }
    await Seat.bulkCreate(seatRows)
    console.log(`seeded ${seatRows.length} seats for ${hall.name}`)
  } else {
    console.log(`${hall.name} already has seats, skipping`)
  }

  const MOVIES = [
    { title: 'Dune: Part Three', genre: 'Sci-Fi', duration: 166, startHours: [2, 7] },
    { title: 'The Batman Continues', genre: 'Action', duration: 148, startHours: [3] },
    {
      title: 'The Lord of the Rings: The Fellowship of the Ring',
      genre: 'Fantasy',
      duration: 178,
      startHours: [1, 6],
    },
    { title: 'Spider-Verse: Beyond', genre: 'Animation', duration: 140, startHours: [4] },
    { title: 'Mission Impossible: Legacy', genre: 'Action', duration: 152, startHours: [5] },
    { title: 'The Grand Budapest Hotel II', genre: 'Comedy', duration: 105, startHours: [2] },
    { title: "Oppenheimer: Director's Cut", genre: 'Drama', duration: 201, startHours: [8] },
    { title: 'Avatar: The Deep Current', genre: 'Sci-Fi', duration: 192, startHours: [9] },
    { title: 'John Wick: Chapter 5', genre: 'Action', duration: 135, startHours: [10] },
    { title: 'Everything Everywhere: Reloaded', genre: 'Sci-Fi', duration: 139, startHours: [11] },
    { title: 'Past Lives Forever', genre: 'Drama', duration: 105, startHours: [3] },
  ]

  let addedSessions = 0
  for (const movie of MOVIES) {
    const alreadyExists = await Showtime.count({ where: { movie_title: movie.title } })
    if (alreadyExists > 0) continue

    const now = new Date()
    const rows = movie.startHours.map((hours) => {
      const start = new Date(now.getTime() + hours * 60 * 60 * 1000)
      const end = new Date(start.getTime() + movie.duration * 60 * 1000)
      return {
        movie_title: movie.title,
        hall_id: hall.id,
        poster_url: posterFor(movie.title),
        genre: movie.genre,
        duration_minutes: movie.duration,
        start_time: start,
        end_time: end,
      }
    })
    await Showtime.bulkCreate(rows)
    addedSessions += rows.length
  }
  console.log(
    addedSessions > 0
      ? `seeded ${addedSessions} showtime session(s) across the movie catalog`
      : 'movie catalog already up to date, skipping',
  )

  const removedTestMovie = await Showtime.destroy({ where: { movie_title: 'Test Movie' } })
  if (removedTestMovie > 0) {
    console.log('removed leftover "Test Movie" showtime')
  }

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
