import Sequelize, { Model } from 'sequelize'

class Orders_Products extends Model {
  static init(sequelize) {
    super.init(
      {
        orderId: Sequelize.INTEGER,
        productId: Sequelize.INTEGER,
        quantity: Sequelize.INTEGER,
        unitPrice: Sequelize.DECIMAL,
      },
      { sequelize },
    )

    return this
  }

  static associate(models) {
    this.belongsTo(models.Order, {
      foreignKey: 'orderId',
      as: 'order',
    })

    this.belongsTo(models.Product, {
      foreignKey: 'productId',
      as: 'product',
    })
  }

}

export default Orders_Products
