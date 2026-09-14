import sequelize from '../config/database.js'
import User from './User.js'
import Hall from './Hall.js'
import Seat from './Seat.js'
import Showtime from './Showtime.js'
import Booking from './Booking.js'

const models = { User, Hall, Seat, Showtime, Booking }

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

export { sequelize }
export default models
