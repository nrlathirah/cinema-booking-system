import models, { sequelize } from '../models/index.js'
import { clearSeatLock } from '../sockets/seatLocks.js'

const { Booking } = models

export async function createBooking(req, res) {
  const { showtimeId, seatIds } = req.body

  if (!showtimeId || !Array.isArray(seatIds) || seatIds.length === 0) {
    return res.status(400).json({ message: 'showtimeId and seatIds are required' })
  }

  const t = await sequelize.transaction()
  try {
    const bookings = await Promise.all(
      seatIds.map((seatId) =>
        Booking.create(
          { user_id: req.user.id, showtime_id: showtimeId, seat_id: seatId, status: 'confirmed' },
          { transaction: t },
        ),
      ),
    )
    await t.commit()

    const io = req.app.get('io')
    seatIds.forEach((seatId) => clearSeatLock(showtimeId, seatId))
    io.to(`showtime:${showtimeId}`).emit('seat:booked', { seatIds })

    res.status(201).json({ bookings })
  } catch (err) {
    await t.rollback()
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'one or more seats were already booked' })
    }
    res.status(500).json({ message: 'booking failed', error: err.message })
  }
}
