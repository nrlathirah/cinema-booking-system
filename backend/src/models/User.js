import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/database.js'

class User extends Model {
  toJSON() {
    const values = { ...this.get() }
    delete values.password_hash
    return values
  }
}

User.init(
  {
    name: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM('admin', 'customer'),
      allowNull: false,
      defaultValue: 'customer',
    },
    points: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    underscored: true,
  },
)

export default User
