import { fn, col } from 'sequelize'
import models from '../models/index.js'

const { Showtime, Hall, Booking, OrderItem, MenuItem } = models

export async function getSummary(req, res) {
  const totalBookings = await Booking.count({ where: { status: 'confirmed' } })

  const showtimes = await Showtime.findAll({ include: [Hall] })
  const bookingCounts = await Booking.findAll({
    attributes: ['showtime_id', [fn('COUNT', col('id')), 'count']],
    where: { status: 'confirmed' },
    group: ['showtime_id'],
  })
  const bookingCountByShowtime = Object.fromEntries(
    bookingCounts.map((b) => [b.showtime_id, Number(b.get('count'))]),
  )

  const seatUtilization = showtimes.map((s) => {
    const capacity = s.Hall.rows * s.Hall.seats_per_row
    const booked = bookingCountByShowtime[s.id] || 0
    return {
      showtimeId: s.id,
      movieTitle: s.movie_title,
      capacity,
      booked,
      utilizationRate: capacity > 0 ? booked / capacity : 0,
    }
  })

  const itemCounts = await OrderItem.findAll({
    attributes: ['menu_item_id', [fn('SUM', col('quantity')), 'totalQuantity']],
    group: ['menu_item_id'],
    order: [[fn('SUM', col('quantity')), 'DESC']],
    limit: 5,
  })
  const menuItems = await MenuItem.findAll({ where: { id: itemCounts.map((i) => i.menu_item_id) } })
  const menuItemsById = Object.fromEntries(menuItems.map((m) => [m.id, m]))

  const mostOrderedItems = itemCounts.map((i) => ({
    menuItemId: i.menu_item_id,
    name: menuItemsById[i.menu_item_id]?.name || 'Unknown item',
    totalQuantity: Number(i.get('totalQuantity')),
  }))

  res.json({ totalBookings, seatUtilization, mostOrderedItems })
}
