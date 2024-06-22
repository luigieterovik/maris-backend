import Sequelize, { Model } from 'sequelize'
class Product extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        description: Sequelize.STRING,
        price: Sequelize.DECIMAL,
        offer: Sequelize.BOOLEAN,
        path: Sequelize.STRING,
        url: {
          type: Sequelize.VIRTUAL,
          get() {
            return `https://maris-backend-production.up.railway.app/product-file/${this.path}`
          },
        },
      },
      { sequelize },
    )

    return this
  }

  static associate(models) {
    this.belongsTo(models.Category, {
      foreignKey: 'categoryId',
      as: 'category',
    })

    this.belongsToMany(models.User, {
      through: 'Orders',
      as: 'users',
      foreignKey: 'productId',
    })
  }
}

export default Product
