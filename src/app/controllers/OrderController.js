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
      await schema.validateSync(req.body, { abortEarly: false })
    } catch (err) {
      return res.status(400).json({ error: err.errors })
    }

    const { productId, quantity } = req.body

    const { dataValues } = await Product.findOne({
      attributes: ['price'],
      where: { id: productId },
    })

    const subTotal = dataValues.price * quantity

    const order = {
      userId: req.userId,
      productId,
      quantity,
      status: 'Pedido realizado',
      subTotal,
    }

    const orderResponse = await Order.create(order)

    if (!orderResponse)
      return res.status(500).json({ error: 'Failed to create products' })

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
