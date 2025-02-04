import Sequelize, { Model } from 'sequelize'

class Payer extends Model {
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
        updatedAt: false,
        tableName: 'Payer',
      },
    )

    return this
  }
}

export default Payer
