import * as Yup from 'yup'

import Order from '../models/'

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

    const { userId, productId, quantity } = req.body
    const order = { userId, productId, quantity, status: 'Pedido realizado' }

    const orderResponse = await Order.create(order)

    if (!orderResponse)
      return res.status(500).json({ error: 'Failed to create products' })

    return res.status(201).json(orderResponse)
  }

  async index(req, res) {
    const orders = await Order.findall({
      include: [
        {
          model: 
        }
      ]
    })
  }
}

export default OrderController
