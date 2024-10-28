import Sequelize, { Model } from 'sequelize'

class PendingPayer extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        cpf: Sequelize.STRING,
        email: Sequelize.STRING,
        phoneNumber: Sequelize.STRING,
        recipient: Sequelize.STRING,
      },
      {
        sequelize,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
        tableName: 'PendingPayer',
      },
    )

    return this
  }
}

export default PendingPayer
