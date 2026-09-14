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

export async function createShowtime(req, res) {
  const { movieTitle, hallId, startTime, endTime, posterUrl, backdropUrl, genre, durationMinutes } = req.body
  if (!movieTitle || !hallId || !startTime || !endTime) {
    return res.status(400).json({ message: 'movieTitle, hallId, startTime and endTime are required' })
  }

  const hall = await Hall.findByPk(hallId)
  if (!hall) {
    return res.status(404).json({ message: 'hall not found' })
  }

  const showtime = await Showtime.create({
    movie_title: movieTitle,
    hall_id: hallId,
    start_time: startTime,
    end_time: endTime,
    poster_url: posterUrl || null,
    backdrop_url: backdropUrl || null,
    genre: genre || null,
    duration_minutes: durationMinutes || null,
  })
  res.status(201).json({ showtime })
}

export async function updateShowtime(req, res) {
  const { id } = req.params
  const showtime = await Showtime.findByPk(id)
  if (!showtime) {
    return res.status(404).json({ message: 'showtime not found' })
  }

  const { movieTitle, hallId, startTime, endTime, posterUrl, backdropUrl, genre, durationMinutes } = req.body
  await showtime.update({
    ...(movieTitle !== undefined && { movie_title: movieTitle }),
    ...(hallId !== undefined && { hall_id: hallId }),
    ...(startTime !== undefined && { start_time: startTime }),
    ...(endTime !== undefined && { end_time: endTime }),
    ...(posterUrl !== undefined && { poster_url: posterUrl }),
    ...(backdropUrl !== undefined && { backdrop_url: backdropUrl }),
    ...(genre !== undefined && { genre }),
    ...(durationMinutes !== undefined && { duration_minutes: durationMinutes }),
  })
  res.json({ showtime })
}

export async function deleteShowtime(req, res) {
  const { id } = req.params
  const deleted = await Showtime.destroy({ where: { id } })
  if (!deleted) {
    return res.status(404).json({ message: 'showtime not found' })
  }
  res.status(204).send()
}
