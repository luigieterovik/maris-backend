import Sequelize, { Model } from 'sequelize'

class Delivery extends Model {
  static init(sequelize) {
    super.init(
      {
        id: Sequelize.INTEGER,
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

export default Delivery
