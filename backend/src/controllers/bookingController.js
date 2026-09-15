import models, { sequelize } from '../models/index.js'
import { clearSeatLock } from '../sockets/seatLocks.js'
import { REDEEM_POINTS_COST, pointsEarnedFor } from '../utils/points.js'

const { Booking, User, Showtime, Seat } = models

export async function createBooking(req, res) {
  const { showtimeId, seatIds, guestName, guestEmail, redeemPoints } = req.body

  if (!showtimeId || !Array.isArray(seatIds) || seatIds.length === 0) {
    return res.status(400).json({ message: 'showtimeId and seatIds are required' })
  }

  const isGuest = !req.user
  if (isGuest && (!guestName || !guestEmail)) {
    return res.status(400).json({ message: 'guestName and guestEmail are required when not logged in' })
  }

  const seats = await Seat.findAll({ where: { id: seatIds } })
  if (seats.length !== seatIds.length) {
    return res.status(404).json({ message: 'one or more seats not found' })
  }
  const totalAmount = seats.reduce((sum, seat) => sum + Number(seat.price), 0)

  const t = await sequelize.transaction()
  try {
    const bookings = await Promise.all(
      seatIds.map((seatId) =>
        Booking.create(
          {
            user_id: req.user?.id || null,
            guest_name: isGuest ? guestName : null,
            guest_email: isGuest ? guestEmail : null,
            showtime_id: showtimeId,
            seat_id: seatId,
            status: 'confirmed',
          },
          { transaction: t },
        ),
      ),
    )

    let pointsEarned = 0
    let pointsRedeemed = 0
    if (!isGuest) {
      const user = await User.findByPk(req.user.id, { transaction: t })
      if (redeemPoints && user.points >= REDEEM_POINTS_COST) {
        pointsRedeemed = REDEEM_POINTS_COST
      }
      pointsEarned = pointsEarnedFor(totalAmount)
      user.points = user.points - pointsRedeemed + pointsEarned
      await user.save({ transaction: t })
    }

    await t.commit()

    const io = req.app.get('io')
    seatIds.forEach((seatId) => clearSeatLock(showtimeId, seatId))
    io.to(`showtime:${showtimeId}`).emit('seat:booked', { seatIds })

    res.status(201).json({ bookings, pointsEarned, pointsRedeemed })
  } catch (err) {
    await t.rollback()
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'one or more seats were already booked' })
    }
    res.status(500).json({ message: 'booking failed', error: err.message })
  }
}

export async function listMyBookings(req, res) {
  const bookings = await Booking.findAll({
    where: { user_id: req.user.id },
    include: [
      { model: Showtime, attributes: ['id', 'movie_title', 'poster_url', 'start_time'] },
      { model: Seat, attributes: ['id', 'seat_row', 'seat_number'] },
    ],
    order: [['createdAt', 'DESC']],
  })
  res.json({ bookings })
}

export async function listAllBookings(req, res) {
  const bookings = await Booking.findAll({
    include: [
      { model: User, attributes: ['id', 'name', 'email'] },
      { model: Showtime, attributes: ['id', 'movie_title', 'start_time'] },
      { model: Seat, attributes: ['id', 'seat_row', 'seat_number'] },
    ],
    order: [['createdAt', 'DESC']],
  })
  res.json({ bookings })
}
