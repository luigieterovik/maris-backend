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

console.log('TUDO CERTO')

routes.post('/users', UserController.store)
console.log('TUDO CERTO')
routes.post('/sessions', SessionController.store)
console.log('TUDO CERTO')
routes.post('/recover', RecoverController.store)
console.log('TUDO CERTO')
routes.post('/reset', UserController.updatePassword)

console.log('TUDO CERTO')
routes.post('/validate-token', SessionController.validateToken)

console.log('TUDO CERTO')
routes.post(
  '/webhook/mercadopago',
  NotificationController.handleMercadoPagoNotification,
)

routes.use(authMiddleware)

console.log("TUDO CERTO")
routes.post('/pay', PaymentController.mercadopago)
console.log("TUDO CERTO")
routes.post('/payStripe', PaymentController.stripe)
console.log("TUDO CERTO")
routes.post('/pix', PaymentController.pix)

console.log("TUDO CERTO")
routes.post('/catalog', upload.single('file'), ProductController.store)
console.log("TUDO CERTO")
routes.put('/catalog/:id', upload.single('file'), ProductController.update)
console.log("TUDO CERTO")
routes.get('/catalog', ProductController.index)

console.log("TUDO CERTO")
routes.post('/categories', upload.single('file'), CategoryController.store)
console.log("TUDO CERTO")
routes.get('/categories', CategoryController.index)
console.log("TUDO CERTO")
routes.put('/categories/:id', upload.single('file'), CategoryController.update)

console.log("TUDO CERTO")
routes.post('/orders', OrderController.store)
console.log("TUDO CERTO")
routes.get('/orders', OrderController.index)
console.log("TUDO CERTO")
routes.patch('/orders/:id', OrderController.update)

export default routes
