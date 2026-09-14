import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/database.js'

class Booking extends Model {}

Booking.init(
  {
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    showtime_id: { type: DataTypes.INTEGER, allowNull: false },
    seat_id: { type: DataTypes.INTEGER, allowNull: false },
    status: {
      type: DataTypes.ENUM('confirmed', 'cancelled'),
      allowNull: false,
      defaultValue: 'confirmed',
    },
  },
  {
    sequelize,
    modelName: 'Booking',
    tableName: 'bookings',
    underscored: true,
    // DB-level guard against double-booking under concurrent requests: two
    // simultaneous inserts for the same (showtime, seat) race past any
    // application-level check, but only one can satisfy this constraint.
    indexes: [{ unique: true, fields: ['showtime_id', 'seat_id'], name: 'unique_seat_per_showtime' }],
  },
)

export default Booking
