import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/database.js'

class Order extends Model {}

Order.init(
  {
    user_id: { type: DataTypes.INTEGER, allowNull: true },
    guest_name: { type: DataTypes.STRING, allowNull: true },
    guest_email: { type: DataTypes.STRING, allowNull: true },
    booking_id: { type: DataTypes.INTEGER, allowNull: true },
    status: {
      type: DataTypes.ENUM('confirmed', 'cancelled'),
      allowNull: false,
      defaultValue: 'confirmed',
    },
    total_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  },
  {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    underscored: true,
  },
)

export default Order
