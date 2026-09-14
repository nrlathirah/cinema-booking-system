import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/database.js'

class Showtime extends Model {}

Showtime.init(
  {
    movie_title: { type: DataTypes.STRING, allowNull: false },
    hall_id: { type: DataTypes.INTEGER, allowNull: false },
    poster_url: { type: DataTypes.STRING, allowNull: true },
    genre: { type: DataTypes.STRING, allowNull: true },
    duration_minutes: { type: DataTypes.INTEGER, allowNull: true },
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
