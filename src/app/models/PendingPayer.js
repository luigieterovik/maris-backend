import Sequelize, { Model } from 'sequelize'

class PendingPayer extends Model {
  static init(sequelize) {
    super.init(
      {
        id: Sequelize.INTEGER
        name: Sequelize.STRING
        cpf: Sequelize.STRING,
        email: Sequelize.STRING,
        phoneNumber: Sequelize.STRING,
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

export default PendingPayer
