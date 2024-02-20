import { Router } from 'express'
import { v4 } from 'uuid'

import User from './app/models/User'

const routes = new Router()

routes.get('/', async (req, res) => {

  const user = await User.create({
    id: v4(),
    name: 'teste',
    email: 'teste@gmail.com',
    password_hash: 'l1j2k38sda912j3'
  })
  return res.json(user)
})

export default routes
