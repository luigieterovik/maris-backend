import { Router } from 'express'
import multer from 'multer'
import multerConfig from './config/multer'

import authMiddleware from './app/middlewares/auth'

import UserController from './app/controllers/UserController'
import SessionController from './app/controllers/SessionController'
import ProductController from './app/controllers/ProductController'
import CategoryController from './app/controllers/CategoryController'
import OrderController from './app/controllers/OrderController'
import RecoverController from './app/controllers/RecoverController'

const upload = multer(multerConfig)

const routes = new Router()

routes.get('/', (req, res) => {
  return res.json({ message: 'Hello API' })
})

routes.post('/users', UserController.store)
routes.post('/sessions', SessionController.store)
routes.post('/recover', RecoverController.store)

routes.use(authMiddleware)

routes.post('/catalog', upload.single('file'), ProductController.store)
routes.put('/catalog/:id', upload.single('file'), ProductController.update)
routes.get('/catalog', ProductController.index)

routes.post('/categories', upload.single('file'), CategoryController.store)
routes.get('/categories', CategoryController.index)
routes.put('/categories:/id', upload.single('file'), CategoryController.update)

routes.post('/orders', OrderController.store)
routes.get('/orders', OrderController.index)
routes.patch('/orders/:id', OrderController.update)

export default routes
