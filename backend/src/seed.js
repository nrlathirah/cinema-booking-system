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

  const existingShowtimes = await Showtime.count()
  if (existingShowtimes === 0) {
    const now = new Date()
    await Showtime.bulkCreate([
      {
        movie_title: 'Dune: Part Three',
        hall_id: hall.id,
        poster_url: posterFor('Dune: Part Three'),
        genre: 'Sci-Fi',
        duration_minutes: 166,
        start_time: new Date(now.getTime() + 2 * 60 * 60 * 1000),
        end_time: new Date(now.getTime() + 4 * 60 * 60 * 1000 + 46 * 60 * 1000),
      },
      {
        movie_title: 'Dune: Part Three',
        hall_id: hall.id,
        poster_url: posterFor('Dune: Part Three'),
        genre: 'Sci-Fi',
        duration_minutes: 166,
        start_time: new Date(now.getTime() + 6 * 60 * 60 * 1000),
        end_time: new Date(now.getTime() + 8 * 60 * 60 * 1000 + 46 * 60 * 1000),
      },
      {
        movie_title: 'The Batman Continues',
        hall_id: hall.id,
        poster_url: posterFor('The Batman Continues'),
        genre: 'Action',
        duration_minutes: 148,
        start_time: new Date(now.getTime() + 5 * 60 * 60 * 1000),
        end_time: new Date(now.getTime() + 7 * 60 * 60 * 1000 + 28 * 60 * 1000),
      },
    ])
    console.log('seeded 3 showtimes')
  } else {
    console.log('showtimes already exist, skipping')
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
