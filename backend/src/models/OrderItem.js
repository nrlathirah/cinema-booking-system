import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/database.js'

class OrderItem extends Model {}

OrderItem.init(
  {
    order_id: { type: DataTypes.INTEGER, allowNull: false },
    menu_item_id: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
  },
  {
    sequelize,
    modelName: 'OrderItem',
    tableName: 'order_items',
    underscored: true,
  },
)

export default OrderItem
