import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/database.js'

class Hall extends Model {}

Hall.init(
  {
    name: { type: DataTypes.STRING, allowNull: false },
    rows: { type: DataTypes.INTEGER, allowNull: false },
    seats_per_row: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    modelName: 'Hall',
    tableName: 'halls',
    underscored: true,
  },
)

export default Hall
