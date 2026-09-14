import models, { sequelize } from '../models/index.js'

const { Hall, Seat } = models

export async function listHalls(req, res) {
  const halls = await Hall.findAll({ order: [['name', 'ASC']] })
  res.json({ halls })
}

export async function createHall(req, res) {
  const { name, rows, seatsPerRow } = req.body
  if (!name || !rows || !seatsPerRow) {
    return res.status(400).json({ message: 'name, rows and seatsPerRow are required' })
  }

  const rowLetters = Array.from({ length: rows }, (_, i) => String.fromCharCode(65 + i))

  const t = await sequelize.transaction()
  try {
    const hall = await Hall.create({ name, rows, seats_per_row: seatsPerRow }, { transaction: t })

    const seats = []
    for (const row of rowLetters) {
      for (let n = 1; n <= seatsPerRow; n++) {
        seats.push({
          hall_id: hall.id,
          seat_row: row,
          seat_number: n,
          type: row === 'A' ? 'premium' : 'standard',
        })
      }
    }
    await Seat.bulkCreate(seats, { transaction: t })
    await t.commit()

    res.status(201).json({ hall })
  } catch (err) {
    await t.rollback()
    res.status(500).json({ message: 'failed to create hall', error: err.message })
  }
}
