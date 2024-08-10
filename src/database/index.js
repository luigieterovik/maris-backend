import Sequelize from 'sequelize'

import configDatabase from '../config/database'

import User from '../app/models/User'
import Product from '../app/models/Product'
import Category from '../app/models/Category'
import Order from '../app/models/Order'
import PendingOrder from '../app/models/PendingOrder'

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
