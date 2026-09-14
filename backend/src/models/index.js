import sequelize from '../config/database.js'
import User from './User.js'

const models = { User }

Object.values(models).forEach((model) => {
  if (model.associate) model.associate(models)
})

export { sequelize }
export default models
