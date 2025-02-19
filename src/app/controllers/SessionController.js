import * as Yup from 'yup'
import jwt from 'jsonwebtoken'

import User from '../models/User.js'

import authConfig from '../../config/auth.js'

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string().email().required(),
      password: Yup.string().required(),
    })

    if (!(await schema.isValid(req.body)))
      return res
        .status(401)
        .json({ error: 'Make sure your email or password are correct' })

    const { email, password } = req.body

    const user = await User.findOne({
      where: { email },
    })

    if (!user)
      return res
        .status(401)
        .json({ error: 'Make sure your email or password are correct' })

    if (!(await user.checkPassword(password)))
      return res
        .status(401)
        .json({ error: 'Make sure your email or password are correct' })

    return res.status(200).json({
      name: user.name.split(' ')[0],
      token: jwt.sign({ id: user.id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    })
  }

  async validateToken(req, res) {
    const { token } = req.body

    console.log('TOKEN' + token)

    if (!token) {
      return res.status(400).json({ error: 'Token is required' })
    }

    jwt.verify(token, authConfig.secret, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid token' })
      }

      console.log(decoded)

      return res.status(200).json({ valid: true })
    })
  }
}

export default new SessionController()
