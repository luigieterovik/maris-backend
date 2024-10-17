import Sequelize, { Model } from 'sequelize'

class PendingDelivery extends Model {
  static init(sequelize) {
    super.init(
      {
        idPayer: Sequelize.INTEGER,
        state: Sequelize.STRING,
        city: Sequelize.STRING,
        neighborhood: Sequelize.STRING,
        street: Sequelize.STRING,
        houseNumber: Sequelize.STRING,
        cep: Sequelize.STRING,
        complement: Sequelize.STRING,
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

export default PendingDelivery
