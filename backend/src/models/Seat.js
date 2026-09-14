import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/database.js'

class Seat extends Model {}

Seat.init(
  {
    hall_id: { type: DataTypes.INTEGER, allowNull: false },
    seat_row: { type: DataTypes.STRING, allowNull: false },
    seat_number: { type: DataTypes.INTEGER, allowNull: false },
    type: {
      type: DataTypes.ENUM('standard', 'premium'),
      allowNull: false,
      defaultValue: 'standard',
    },
  },
  {
    sequelize,
    modelName: 'Seat',
    tableName: 'seats',
    underscored: true,
    indexes: [{ unique: true, fields: ['hall_id', 'seat_row', 'seat_number'] }],
  },
)

export default Seat
