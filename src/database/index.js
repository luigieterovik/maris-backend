import Sequelize from 'sequelize'

import configDatabase from '../config/database.js'

import User from '../app/models/User.js'
import Product from '../app/models/Product.js'
import Category from '../app/models/Category.js'
import Order from '../app/models/Order.js'
import PendingOrder from '../app/models/PendingOrder.js'

const models = [User, Product, Category, Order, PendingOrder]

class Database {
  constructor() {
    this.init()
  }

  init() {
    this.connection = new Sequelize(configDatabase.url)
    models
      .map((model) => model.init(this.connection))
      .map(
        (model) => model.associate && model.associate(this.connection.models),
      )
  }
}

export default new Database()
