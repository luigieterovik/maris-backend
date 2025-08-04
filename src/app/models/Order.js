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

  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    })

    this.belongsTo(models.Delivery, {
      foreignKey: 'deliveryId',
      as: 'delivery',
    })

    this.hasMany(models.Orders_Products, {
      foreignKey: 'orderId',
      as: 'orders_product',
    })
  }
}

export default Order
