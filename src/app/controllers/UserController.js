import { v4 } from 'uuid'
import * as Yup from 'yup'

import User from '../models/User'

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
}

export default new UserController()
