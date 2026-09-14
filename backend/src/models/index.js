import sequelize from '../config/database.js'
import User from './User.js'
import Hall from './Hall.js'
import Seat from './Seat.js'
import Showtime from './Showtime.js'
import Booking from './Booking.js'
import MenuItem from './MenuItem.js'
import Order from './Order.js'
import OrderItem from './OrderItem.js'

const models = { User, Hall, Seat, Showtime, Booking, MenuItem, Order, OrderItem }

Hall.hasMany(Seat, { foreignKey: 'hall_id' })
Seat.belongsTo(Hall, { foreignKey: 'hall_id' })

Hall.hasMany(Showtime, { foreignKey: 'hall_id' })
Showtime.belongsTo(Hall, { foreignKey: 'hall_id' })

Showtime.hasMany(Booking, { foreignKey: 'showtime_id' })
Booking.belongsTo(Showtime, { foreignKey: 'showtime_id' })

Seat.hasMany(Booking, { foreignKey: 'seat_id' })
Booking.belongsTo(Seat, { foreignKey: 'seat_id' })

User.hasMany(Booking, { foreignKey: 'user_id' })
Booking.belongsTo(User, { foreignKey: 'user_id' })

User.hasMany(Order, { foreignKey: 'user_id' })
Order.belongsTo(User, { foreignKey: 'user_id' })

Booking.hasMany(Order, { foreignKey: 'booking_id' })
Order.belongsTo(Booking, { foreignKey: 'booking_id' })

Order.hasMany(OrderItem, { foreignKey: 'order_id' })
OrderItem.belongsTo(Order, { foreignKey: 'order_id' })

MenuItem.hasMany(OrderItem, { foreignKey: 'menu_item_id' })
OrderItem.belongsTo(MenuItem, { foreignKey: 'menu_item_id' })

export { sequelize }
export default models
