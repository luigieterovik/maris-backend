import Sequelize, { Model } from 'sequelize'

class Order extends Model {
  static init(sequelize) {
    super.init(
      {
        userId: Sequelize.UUID,
        productId: Sequelize.INTEGER,
        quantity: Sequelize.INTEGER,
        status: Sequelize.STRING,
        total: Sequelize.DECIMAL,
      },
      { sequelize },
    )

    return this
  }

  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    })
    this.belongsTo(models.Product, {
      foreignKey: 'productId',
      as: 'product',
    })
  }
}

export default Order
