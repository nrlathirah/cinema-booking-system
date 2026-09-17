import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/database.js'

class Showtime extends Model {}

Showtime.init(
  {
    movie_title: { type: DataTypes.STRING, allowNull: false },
    hall_id: { type: DataTypes.INTEGER, allowNull: false },
    poster_url: { type: DataTypes.STRING, allowNull: true },
    backdrop_url: { type: DataTypes.STRING, allowNull: true },
    genre: { type: DataTypes.STRING, allowNull: true },
    overview: { type: DataTypes.TEXT, allowNull: true },
    rating: { type: DataTypes.DECIMAL(3, 1), allowNull: true },
    tmdb_id: { type: DataTypes.INTEGER, allowNull: true },
    tagline: { type: DataTypes.STRING, allowNull: true },
    release_date: { type: DataTypes.DATEONLY, allowNull: true },
    age_rating: { type: DataTypes.STRING, allowNull: true },
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
