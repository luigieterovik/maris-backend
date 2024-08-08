import express from 'express'
import routes from './routes'
import { resolve } from 'path'
import cors from 'cors'
import PaymentController from './app/controllers/PaymentController'

import './database'

const corsOptions = {
  origin: 'https://maris-frontend.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}

class App {
  constructor() {
    this.app = express()

    this.app.use(cors(corsOptions))

    this.app.post(
      '/webhook/stripe',
      express.raw({ type: 'application/json' }),
      PaymentController.handleStripeNotification,
    )

    this.middlewares()
    this.routes()
  }

  middlewares() {
    this.app.use(express.json())
    this.app.use(
      '/product-file',
      express.static(resolve(__dirname, '..', 'uploads')),
    )

    this.app.use(
      '/category-file',
      express.static(resolve(__dirname, '..', 'uploads')),
    )
  }

  routes() {
    this.app.use(routes)
  }
}

export default new App().app
