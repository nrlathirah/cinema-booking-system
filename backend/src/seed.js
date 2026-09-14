import dotenv from 'dotenv'
dotenv.config()

import models, { sequelize } from './models/index.js'

const { Hall, Seat, Showtime } = models

const ROWS = ['A', 'B', 'C', 'D', 'E']
const SEATS_PER_ROW = 8

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
        start_time: new Date(now.getTime() + 2 * 60 * 60 * 1000),
        end_time: new Date(now.getTime() + 4 * 60 * 60 * 1000),
      },
      {
        movie_title: 'The Batman Continues',
        hall_id: hall.id,
        start_time: new Date(now.getTime() + 5 * 60 * 60 * 1000),
        end_time: new Date(now.getTime() + 7 * 60 * 60 * 1000),
      },
    ])
    console.log('seeded 2 showtimes')
  } else {
    console.log('showtimes already exist, skipping')
  }

  await sequelize.close()
}

seed().catch((err) => {
  console.error('seed failed:', err)
  process.exit(1)
})
