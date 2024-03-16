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

    const orderResponse = Order.create({
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
}

export default new OrderController()
