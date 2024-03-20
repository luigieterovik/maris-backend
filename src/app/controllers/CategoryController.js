import * as Yup from 'yup'

import Category from '../models/Category'
import User from '../models/User'

class CategoryController {
  async store(req, res) {
    const { admin: isAdmin } = await User.findByPk(req.userId)
    if (!isAdmin)
      return res
        .status(401)
        .json({ message: 'User is not authorized to access this resource' })

    const schema = Yup.object().shape({ name: Yup.string().required() })

    try {
      await schema.validateSync(req.body, { abortEarly: false })
    } catch (err) {
      return res.status(400).json({ error: err.errors })
    }

    const { name } = req.body

    const categoryExists = await Category.findOne({ where: { name } })

    if (categoryExists)
      return res.status(400).json({ error: 'Category already registered' })

    const { filename: path } = req.file

    const category = await Category.create({ name, path })

    if (!category)
      return res.status(500).json({ message: 'Failed to create category' })

    return res.status(201).json({ id: category.id, name })
  }

  async index(req, res) {
    const categories = await Category.findAll()

    return res.json(categories)
  }

  async update(req, res) {
    const { admin: isAdmin } = await User.findByPk(req.userId)
    if (!isAdmin)
      return res
        .status(401)
        .json({ message: 'User is not authorized to access this resource' })

    const schema = Yup.object().shape({ name: Yup().string() })

    try {
      schema.validateSync(req.body, { abortEarly: false })
    } catch (err) {
      return res.status(400).json({ error: err.errors })
    }

    const { id } = req.params
    const categoryExists = await Category.findByPk(id)

    if (!categoryExists)
      return res.status(400).json({ message: 'Category not found' })

    let path
    if (req.file) path = req.file.filename

    const { name } = req.body

    const updateResponse = await Category.update(
      { name, path },
      { where: { id } },
    )

    if (!updateResponse)
      return res.status(500).json({ error: 'Failed to update category' })

    return res.status(200).json({ message: 'Category updated successfully' })
  }
}

export default new CategoryController()
