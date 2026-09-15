import models, { sequelize } from '../models/index.js'
import { calculateOrderTotal } from '../utils/pricing.js'
import { REDEEM_POINTS_COST, pointsEarnedFor } from '../utils/points.js'

const { Order, OrderItem, MenuItem, Booking, User } = models

export async function createOrder(req, res) {
  const { bookingId, items, guestName, guestEmail, redeemPoints } = req.body

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'items are required' })
  }

  const isGuest = !req.user
  if (isGuest && (!guestName || !guestEmail)) {
    return res.status(400).json({ message: 'guestName and guestEmail are required when not logged in' })
  }

  if (bookingId) {
    const where = isGuest ? { id: bookingId, user_id: null } : { id: bookingId, user_id: req.user.id }
    const booking = await Booking.findOne({ where })
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
      {
        user_id: req.user?.id || null,
        guest_name: isGuest ? guestName : null,
        guest_email: isGuest ? guestEmail : null,
        booking_id: bookingId || null,
        status: 'confirmed',
        total_price: totalPrice,
      },
      { transaction: t },
    )
    await OrderItem.bulkCreate(
      items.map((i) => ({ order_id: order.id, menu_item_id: i.menuItemId, quantity: i.quantity })),
      { transaction: t },
    )

    let pointsEarned = 0
    let pointsRedeemed = 0
    if (!isGuest) {
      const user = await User.findByPk(req.user.id, { transaction: t })
      if (redeemPoints && user.points >= REDEEM_POINTS_COST) {
        pointsRedeemed = REDEEM_POINTS_COST
      }
      pointsEarned = pointsEarnedFor(totalPrice)
      user.points = user.points - pointsRedeemed + pointsEarned
      await user.save({ transaction: t })
    }

    await t.commit()

    const fullOrder = await Order.findByPk(order.id, { include: [{ model: OrderItem, include: [MenuItem] }] })
    res.status(201).json({ order: fullOrder, pointsEarned, pointsRedeemed })
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

export async function listAllOrders(req, res) {
  const orders = await Order.findAll({
    include: [
      { model: User, attributes: ['id', 'name', 'email'] },
      { model: OrderItem, include: [MenuItem] },
    ],
    order: [['createdAt', 'DESC']],
  })
  res.json({ orders })
}
