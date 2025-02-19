import Sequelize, { Model } from 'sequelize'
class Product extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        description: Sequelize.STRING,
        price: Sequelize.DECIMAL,
        offerPercentage: Sequelize.BOOLEAN,
        path: Sequelize.STRING,
        categoryId: Sequelize.INTEGER,
        url: {
          type: Sequelize.VIRTUAL,
          get() {
            return `http://localhost:3001/product-file/${this.path}`
          },
        },
      },
      { sequelize, tableName: 'Products' },
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
