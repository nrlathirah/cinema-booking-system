import models from '../models/index.js'

const { Showtime, Hall, Seat, Booking } = models

export async function listShowtimes(req, res) {
  const showtimes = await Showtime.findAll({
    include: [{ model: Hall, attributes: ['id', 'name'] }],
    order: [['start_time', 'ASC']],
  })
  res.json({ showtimes })
}

export async function getShowtimeSeats(req, res) {
  const { id } = req.params

  const showtime = await Showtime.findByPk(id, { include: [Hall] })
  if (!showtime) {
    return res.status(404).json({ message: 'showtime not found' })
  }

  const seats = await Seat.findAll({
    where: { hall_id: showtime.hall_id },
    order: [
      ['seat_row', 'ASC'],
      ['seat_number', 'ASC'],
    ],
  })
  const bookings = await Booking.findAll({ where: { showtime_id: id, status: 'confirmed' } })
  const takenSeatIds = new Set(bookings.map((b) => b.seat_id))

  res.json({
    showtime,
    seats: seats.map((seat) => ({
      id: seat.id,
      seat_row: seat.seat_row,
      seat_number: seat.seat_number,
      type: seat.type,
      status: takenSeatIds.has(seat.id) ? 'taken' : 'available',
    })),
  })
}
