import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/database.js'

class Showtime extends Model {}

Showtime.init(
  {
    movie_title: { type: DataTypes.STRING, allowNull: false },
    hall_id: { type: DataTypes.INTEGER, allowNull: false },
    start_time: { type: DataTypes.DATE, allowNull: false },
    end_time: { type: DataTypes.DATE, allowNull: false },
  },
  {
    sequelize,
    modelName: 'Showtime',
    tableName: 'showtimes',
    underscored: true,
  },
)

export default Showtime
