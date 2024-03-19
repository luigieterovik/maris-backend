import * as Yup from 'yup'

import Order from '../models/Order'
import User from '../models/User'
import Product from '../models/Product'
import Category from '../models/Category'

class OrderController {
  async store(req, res) {
    const schema = Yup.object().shape({
      productId: Yup.number().required(),
      quantity: Yup.number().required(),
    })

    try {
      await schema.validate(req.body, { abortEarly: false })
    } catch (err) {
      return res.status(400).json({ error: err.errors })
    }

    const { userId } = req
    const { productId, quantity } = req.body

    const product = await Product.findByPk(productId)
    if (!product) return res.status(401).json({ error: 'Product not found' })

    const total = product.price * quantity

    const orderResponse = await Order.create({
      userId,
      productId,
      quantity,
      status: 'Pedido realizado',
      total,
    })

    if (!orderResponse)
      return res.status(500).json({ error: 'Failed to create order' })

    return res.status(201).json(orderResponse)
  }

  async index(req, res) {
    const orders = await Order.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email'],
        },
        {
          model: Product,
          as: 'product',
          attributes: ['name', 'price', 'path'],
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['name'],
            },
          ],
        },
      ],
    })

    return res.json(orders)
  }

  async update(req, res) {
    const { admin: isAdmin } = await User.findByPk(req.userId)
    if (!isAdmin)
      return res
        .status(401)
        .json({ message: 'User is not authorized to access this resource' })

    const schema = Yup.object().shape({
      status: Yup.string(),
    })

    try {
      schema.validateSync(req.body, { abortEarly: false })
    } catch (err) {
      return res.status(400).json({ error: err.errors })
    }

    const { id } = req.params
    const { status } = req.body

    const orderExists = await Order.findOne({ where: { id } })
    if (!orderExists)
      return res.status(400).json({ error: 'Order does not exists' })

    const updateResponse = await Order.update({ status }, { where: { id } })

    if (!updateResponse)
      return res.status(500).json({ error: 'Failed to update order' })

    return res.status(200).json({ message: 'Status updated successfully' })
  }
}

export default new OrderController()
