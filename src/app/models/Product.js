import Sequelize, { Model } from 'sequelize'

class Product extends Model {
    static init(sequelize) {
        super.init({
            name: Sequelize.STRING,
            description: Sequelize.STRING,
            price: Sequelize.DECIMAL,
            path: Sequelize.STRING,
            url: {
                type: Sequelize.VIRTUAL,
                get() {
                    return `http://localhost:3001/product-file/${this.path}`
                }
            }
        }, { sequelize })
    }
}

export default Product