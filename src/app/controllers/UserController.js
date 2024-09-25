import { v4 } from 'uuid'
import * as Yup from 'yup'
import jwt from 'jsonwebtoken'

import authConfig from '../../config/auth.js'

import User from '../models/User.js'

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
      password: Yup.string().min(6).required(),
      admin: Yup.boolean(),
    })

    try {
      await schema.validateSync(req.body, { abortEarly: false })
    } catch (err) {
      return res.status(400).json({ error: err.errors })
    }

    const { name, email, password, admin } = req.body

    const emailExists = await User.findOne({ where: { email } })

    if (emailExists)
      return res.status(400).json({ error: 'Email already registered' })

    const user = await User.create({
      id: v4(),
      name,
      email,
      password,
      admin,
    })

    if (!user) return res.status(500).json({ error: 'Failed to create user' })

    return res.status(201).json({ id: user.id, name, email, admin })
  }

  async updatePassword(req, res) {
    const schema = Yup.object().shape({
      token: Yup.string().required(),
      password: Yup.string().required().min(6),
    })

    if (!(await schema.isValid(req.body))) {
      return res
        .status(401)
        .json({ error: 'Make sure your password is correct' })
    }

    const { token, password } = req.body

    console.log(token)

    try {
      const decoded = jwt.verify(token, authConfig.secret)

      const { email } = decoded

      const user = await User.findOne({ where: { email } })

      console.log(user)

      if (!user) return res.status(404).json({ error: 'User not found' })

      await user.updatePassword(password)

      return res.json({ message: 'Password reset successfully' })
    } catch (err) {
      console.log(err)
      return res.status(401).json({
        error: 'Invalid or expired token. Please, request password reset again',
      })
    }
  }
}

export default new UserController()
