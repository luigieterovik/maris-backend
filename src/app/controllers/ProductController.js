import * as Yup from 'yup'

import Product from '../models/Product'
import Category from '../models/Category'

class ProductController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      description: Yup.string(),
      price: Yup.number().required(),
      categoryId: Yup.number(),
    })

    try {
      await schema.validateSync(req.body, { abortEarly: false })
    } catch (err) {
      return res.status(400).json({ error: err.errors })
    }

    const { filename: path } = req.file
    const { name, description, price, categoryId } = req.body

    const productResponse = await Product.create({
      name,
      description,
      price,
      path,
      categoryId,
    })

    if (!productResponse)
      return res.status(500).json({ error: 'Failed to create products' })

    return res.status(201).json(productResponse)
  }

  async index(req, res) {
    const products = await Product.findAll({
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['name'],
        },
      ],
    })

    return res.json(products)
  }
}

export default new ProductController()
