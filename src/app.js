import express from 'express'
import routes from './routes.js'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'
import NotificationController from './app/controllers/NotificationController.js'

import './database/index.js'

const allowedOrigins = [
  'https://maris-frontend.vercel.app',
  /^https:\/\/[a-z0-9-]+\.ngrok-free\.app$/i,
]

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true)

    const ok = allowedOrigins.some((allowed) => {
      return allowed instanceof RegExp ? allowed.test(origin) : allowed === origin
    })

    console.log(origin)
    console.log(ok)

    if (ok) {
      cb(null, true)
    } else {
      cb(new Error('Not allowed CORS'))
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'ngrok-skip-browser-warning',
  ],
  credentials: true,
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

class App {
  constructor() {
    this.app = express()

    this.app.use(cors(corsOptions))

    this.app.post(
      '/webhook/stripe',
      express.raw({ type: 'application/json' }),
      NotificationController.handleStripeNotification,
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
