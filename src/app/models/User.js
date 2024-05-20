import Sequelize, { Model } from 'sequelize'
import bcrypt from 'bcrypt'

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
        admin: Sequelize.BOOLEAN,
      },
      { sequelize },
    )

    this.addHook('beforeSave', async (user) => {
      user.password_hash = await bcrypt.hash(user.password, 10)
    })

    return this
  }

  checkPassword(password) {
    return bcrypt.compare(password, this.password_hash)
  }

  async updatePassword(newPassword) {
    this.password_hash = await bcrypt.hash(newPassword, 10)
    await this.save()
  }

  static associate(models) {
    this.belongsToMany(models.Product, {
      through: 'Orders',
      as: 'products',
      foreignKey: 'userId',
    })
  }
}

export default User
