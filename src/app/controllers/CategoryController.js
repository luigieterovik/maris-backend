import * as Yup from 'yup'

import Category from '../models/Category'

class CategoryController {
  async store (req, res) {
    const schema = Yup.object().shape({ name: Yup.string().required() })

    try {
      await schema.validateSync(req.body, { abortEarly: false })
    } catch (err) {
      return res.status(400).json({ error: err.errors })
    }

    const { name } = req.body

    const categoryExists = await Category.findOne({ where: { name } })

    if (categoryExists) return res.status(400).json({ error: 'Category already registered' })

    const category = await Category.create({ name })

    if (!category) return res.status(500).json({ message: 'Failed to create category' })

    return res.status(201).json({ id: category.id, name })
  }

  async index (req, res) {
    const categories = await Category.findAll()

    return res.json(categories)
  }
}

export default new CategoryController()
