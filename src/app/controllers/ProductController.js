import * as Yup from 'yup'

import Product from '../models/Product.js'
import User from '../models/User.js'
import Category from '../models/Category.js'

import {
  S3Client,
  PutObjectCommand,
  CreateBucketCommand,
  DeleteObjectCommand,
  DeleteBucketCommand,
  paginateListObjectsV2,
  GetObjectCommand,
} from '@aws-sdk/client-s3'

import crypto from 'crypto'

import s3 from '../../config/aws-s3.js'

class ProductController {
  async store(req, res) {
    const { admin: isAdmin } = await User.findByPk(req.userId)
    if (!isAdmin)
      return res
        .status(401)
        .json({ message: 'User is not authorized to access this resource' })

    const schema = Yup.object().shape({
      name: Yup.string().required(),
      description: Yup.string(),
      price: Yup.number().required(),
      categoryId: Yup.number(),
      offer: Yup.bool(),
    })

    try {
      await schema.validateSync(req.body, { abortEarly: false })
    } catch (err) {
      return res.status(400).json({ error: err.errors })
    }

    const { filename: path } = req.file
    const { name, description, price, categoryId, offer } = req.body

    console.log(req.file)

    const fileKey =
      crypto.randomBytes(32).toString('hex') + '-' + req.file.originalname

    const s3params = {
      Bucket: process.env.BUCKET_NAME,
      Key: fileKey,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    }

    const s3command = new PutObjectCommand(s3params)
    const awsResponse = await s3.send(s3command)
    console.log(awsResponse)

    const productResponse = await Product.create({
      name,
      description,
      price,
      path: `https://${process.env.BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/${fileKey}`,
      categoryId,
      offer,
    })

    if (!productResponse)
      return res.status(500).json({ error: 'Failed to create product' })

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

  async update(req, res) {
    const { admin: isAdmin } = await User.findByPk(req.userId)
    if (!isAdmin)
      return res
        .status(401)
        .json({ message: 'User is not authorized to access this resource' })

    const schema = Yup.object().shape({
      name: Yup.string(),
      description: Yup.string(),
      price: Yup.number(),
      categoryId: Yup.number(),
      offer: Yup.bool(),
    })

    try {
      await schema.validateSync(req.body, { abortEarly: false })
    } catch (err) {
      return res.status(400).json({ error: err.errors })
    }

    const { id } = req.params
    const productExists = await Product.findByPk(id)

    if (!productExists)
      return res.status(400).json({ message: 'Product not found' })

    let path
    if (req.file) path = req.file.filename

    const { name, description, price, categoryId, offer } = req.body

    const updateResponse = await Product.update(
      {
        name,
        description,
        price,
        categoryId,
        offer,
        path,
      },
      { where: { id } },
    )

    if (!updateResponse)
      return res.status(500).json({ error: 'Failed to update product' })

    return res.status(200).json({ message: 'Product updated successfully' })
  }
}

export default new ProductController()
