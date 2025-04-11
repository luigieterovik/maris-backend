import * as Yup from 'yup'

import Category from '../models/Category.js'
import User from '../models/User.js'

import crypto from 'crypto'
import {
  S3Client,
  PutObjectCommand,
  CreateBucketCommand,
  DeleteObjectCommand,
  DeleteBucketCommand,
  paginateListObjectsV2,
  GetObjectCommand,
} from '@aws-sdk/client-s3'

import s3 from '../../config/aws-s3.js'

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

    const fileKey =
      crypto.randomBytes(32).toString('hex') + '-' + req.file.originalname

    const awsFilesFolder = 'categories'

    const s3params = {
      Bucket: process.env.BUCKET_NAME,
      Key: `${awsFilesFolder}/${fileKey}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    }

    const s3command = new PutObjectCommand(s3params)
    const awsResponse = await s3.send(s3command)
    console.log(awsResponse)

    const categoryExists = await Category.findOne({ where: { name } })

    if (categoryExists)
      return res.status(400).json({ error: 'Category already registered' })

    const { filename: path } = req.file

    const category = await Category.create({
      name,
      path: `https://${process.env.BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/${awsFilesFolder}/${fileKey}`,
    })

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

    const schema = Yup.object().shape({ name: Yup.string() })

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

  async delete(req, res) {
    const { admin: isAdmin } = await User.findByPk(req.userId)
    if (!isAdmin)
      return res
        .status(401)
        .json({ message: 'User is not authorized to access this resource' })

    const { id } = req.params
    const categoryExists = await Category.findByPk(id)

    if (!categoryExists)
      return res.status(400).json({ message: 'Category not found' })

    const deleteResponse = await Category.destroy({ where: { id } })

    if (!deleteResponse)
      return res.status(500).json({ error: 'Failed to delete category' })

    return res.status(200).json({ message: 'Category deleted successfully' })
  }
}

export default new CategoryController()
