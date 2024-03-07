import * as Yup from 'yup'

import Product from '../models/Product'

class ProductController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      description: Yup.string(),
      price: Yup.number().required(),
    })

    try {
      await schema.validateSync(req.body, { abortEarly: false })
    } catch (err) {
      return res.status(400).json({ error: err.errors })
    }

    const { filename: path } = req.file
    const { name, description, price } = req.body

    const product = await Product.create({
      name,
      description,
      price,
      path,
    })

    if (!product)
      return res.status(500).json({ error: 'Failed to create user' })

    return res.status(201).json(product)
  }

  async index(req, res) {
    const products = await Product.findAll()

    return res.json(products)
  }
}

export default new ProductController()
