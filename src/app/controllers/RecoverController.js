import * as Yup from 'yup'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'

import User from '../models/User'

import authConfig from '../../config/auth'

class RecoverController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string().email().required(),
    })

    if (!(await schema.isValid(req.body)))
      return res
        .status(401)
        .json({ error: 'Make sure your email or password are correct' })

    const { email } = req.body

    const user = await User.findOne({ where: { email } })

    if (user) {
      const token = jwt.sign({ email }, authConfig.secret, {
        expiresIn: '1h',
      })

      console.log(token)

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'eterowiczluigi@gmail.com',
          pass: 'fhdfwealpyvfamhb',
        },
      })

      const mailOptions = {
        from: 'eterowiczluigi@gmail.com',
        to: email,
        subject: `Maris's Boutik's — Password Reset`,
        html: `You requested a password reset. Click <a href="http://localhost:3000/account/reset/${token}">here</a> to reset your password.`,
      }

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error)
        }
      })
    }

    return res.status(200).json({
      message: `We have sent you an email with instructions for resetting your password`,
    })
  }
}

export default new RecoverController()