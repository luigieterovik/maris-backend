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
}

export default Orders_Products
