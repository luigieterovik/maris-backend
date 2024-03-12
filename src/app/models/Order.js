import Sequelize, { Model } from 'sequelize'

class Order extends Model {
  static init(sequelize) {
    super.init(
      {
        userId: Sequelize.UUID,
        productId: Sequelize.INTEGER,
        quantity: Sequelize.INTEGER,
        status: Sequelize.STRING,
      },
      { sequelize },
    )

    return this
  }
}

export default Order
