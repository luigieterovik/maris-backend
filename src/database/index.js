import Sequelize from 'sequelize'

import configDatabase from '../config/database.js'

import User from '../app/models/User.js'
import Product from '../app/models/Product.js'
import Category from '../app/models/Category.js'
import Order from '../app/models/Order.js'
import PendingOrders from '../app/models/PendingOrders.js'
import Payer from '../app/models/Payer.js'
import Delivery from '../app/models/Delivery.js'
import PendingDelivery from '../app/models/PendingDelivery.js'
import Orders_Products from '../app/models/Orders_Products.js'
import PendingPayer from '../app/models/PendingPayer.js'

const models = [
  User,
  Product,
  Category,
  Order,
  PendingOrders,
  Payer,
  Orders_Products,
  Delivery,
  PendingDelivery,
  PendingPayer,
]

class Database {
  constructor() {
    this.init()
  }

  init() {
    this.connection = new Sequelize(configDatabase)
    models
      .map((model) => model.init(this.connection))
      .map(
        (model) => model.associate && model.associate(this.connection.models),
      )
  }
}

export default new Database()
