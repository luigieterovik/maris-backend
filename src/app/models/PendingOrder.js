import Sequelize, { Model } from 'sequelize'

class PendingOrder extends Model {
  static init(sequelize) {
    super.init(
      {
        external_reference: Sequelize.STRING,
        email: Sequelize.STRING,
      },
      { sequelize },
    )

    return this
  }
}

export default PendingOrder
