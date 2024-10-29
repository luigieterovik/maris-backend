import Sequelize, { Model } from 'sequelize'

class PendingOrders extends Model {
  static init(sequelize) {
    super.init(
      {
        external_reference: Sequelize.STRING,
        pendingDeliveryId: Sequelize.STRING,
        userId: Sequelize.UUID,
      },
      {
        sequelize,
        createdAt: 'createdAt',
        updatedAt: false,
        tableName: 'PendingOrders',
      },
    )

    return this
  }
}

export default PendingOrders
