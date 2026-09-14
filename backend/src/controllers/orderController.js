import models, { sequelize } from '../models/index.js'
import { calculateOrderTotal } from '../utils/pricing.js'

const { Order, OrderItem, MenuItem, Booking } = models

export async function createOrder(req, res) {
  const { bookingId, items } = req.body

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'items are required' })
  }

  if (bookingId) {
    const booking = await Booking.findOne({ where: { id: bookingId, user_id: req.user.id } })
    if (!booking) {
      return res.status(404).json({ message: 'booking not found' })
    }
  }

  const menuItems = await MenuItem.findAll({ where: { id: items.map((i) => i.menuItemId) } })
  const menuItemsById = Object.fromEntries(menuItems.map((m) => [m.id, m]))

  let totalPrice
  try {
    totalPrice = calculateOrderTotal(items, menuItemsById)
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }

  const t = await sequelize.transaction()
  try {
    const order = await Order.create(
      { user_id: req.user.id, booking_id: bookingId || null, status: 'confirmed', total_price: totalPrice },
      { transaction: t },
    )
    await OrderItem.bulkCreate(
      items.map((i) => ({ order_id: order.id, menu_item_id: i.menuItemId, quantity: i.quantity })),
      { transaction: t },
    )
    await t.commit()

    const fullOrder = await Order.findByPk(order.id, { include: [{ model: OrderItem, include: [MenuItem] }] })
    res.status(201).json({ order: fullOrder })
  } catch (err) {
    await t.rollback()
    res.status(500).json({ message: 'order failed', error: err.message })
  }
}

export async function listMyOrders(req, res) {
  const orders = await Order.findAll({
    where: { user_id: req.user.id },
    include: [{ model: OrderItem, include: [MenuItem] }],
    order: [['createdAt', 'DESC']],
  })
  res.json({ orders })
}
