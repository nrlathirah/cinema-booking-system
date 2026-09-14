import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/database.js'

class MenuItem extends Model {}

MenuItem.init(
  {
    name: { type: DataTypes.STRING, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    is_combo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    image_url: { type: DataTypes.STRING, allowNull: true },
  },
  {
    sequelize,
    modelName: 'MenuItem',
    tableName: 'menu_items',
    underscored: true,
  },
)

export default MenuItem
