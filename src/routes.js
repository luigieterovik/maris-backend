import { Router } from 'express'
import multer from 'multer'
import multerConfig from './config/multer.js'

import authMiddleware from './app/middlewares/auth.js'

import UserController from './app/controllers/UserController.js'
import SessionController from './app/controllers/SessionController.js'
import ProductController from './app/controllers/ProductController.js'
import CategoryController from './app/controllers/CategoryController.js'
import OrderController from './app/controllers/OrderController.js'
import RecoverController from './app/controllers/RecoverController.js'
import PaymentController from './app/controllers/PaymentController.js'
import NotificationController from './app/controllers/NotificationController.js'

const upload = multer(multerConfig)

const routes = new Router()

routes.get('/', (req, res) => {
  return res.json({ message: 'Hello API' })
})

routes.post('/users', UserController.store)
routes.post('/sessions', SessionController.store)
routes.post('/recover', RecoverController.store)
routes.post('/reset', UserController.updatePassword)
routes.get('/catalog', ProductController.index)
routes.get('/categories', CategoryController.index)

routes.post('/validate-token', SessionController.validateToken)

routes.post(
  '/webhook/mercadopago',
  NotificationController.handleMercadoPagoNotification,
)

routes.use(authMiddleware)

routes.post('/payStripe', PaymentController.stripe)
routes.post('/pix', PaymentController.pix)

routes.post('/catalog', upload.single('file'), ProductController.store)
routes.put('/catalog/:id', upload.single('file'), ProductController.update)

routes.post('/categories', upload.single('file'), CategoryController.store)
routes.put('/categories/:id', upload.single('file'), CategoryController.update)
routes.delete('/categories/:id', CategoryController.delete)

routes.post('/orders', OrderController.store)
routes.get('/orders', OrderController.index)
routes.patch('/orders/:id', OrderController.update)

export default routes
