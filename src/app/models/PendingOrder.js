import Sequelize, { Model } from 'sequelize'

class PendingOrder extends Model {
  static init(sequelize) {
    super.init(
      {
        external_reference: Sequelize.STRING,
        pendingDeliveryId: Sequelize.STRING,
      },
      {
        sequelize,
        createdAt: 'createdAt',
        updatedAt: false,
      },
    )

    return this
  }
}

export default PendingOrder
