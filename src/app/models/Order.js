import Sequelize, { Model } from 'sequelize'

class Order extends Model {
  static init(sequelize) {
    super.init(
      {
        userId: Sequelize.UUID,
        deliveryId: Sequelize.INTEGER,
        status: Sequelize.STRING,
        total: Sequelize.DECIMAL,
      },
      { sequelize, tableName: 'Orders' },
    )

    return this
  }
}

export default Order
