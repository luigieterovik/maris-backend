import crypto from 'crypto'

import dotenv from 'dotenv'
dotenv.config()

const secret = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex')

export default {
  secret,
  expiresIn: 10,
}
