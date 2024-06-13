import * as Yup from 'yup'
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'
import dotenv from 'dotenv'
import stripeLib from 'stripe'
import request from 'request'

import { v4 } from 'uuid'

dotenv.config()

class PaymentController {
  async mercadopago(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      quantity: Yup.number().required(),
      unit_price: Yup.number().required(),
    })

    try {
      await schema.validateSync(req.body, { abortEarly: false })
    } catch (err) {
      return res.status(400).json({ error: err.errors })
    }

    const { title, quantity, unit_price } = req.body

    const client = new MercadoPagoConfig({
      accessToken: process.env.ACCESS_TOKEN_MERCADOPAGO,
    })

    try {
      const body = {
        items: [
          {
            title,
            quantity,
            unit_price,
            currency_id: 'BRL',
          },
        ],
        back_urls: {
          success: 'http://localhost:3000',
          failure: 'http://localhost:3000',
          pending: 'http://localhost:3000',
        },
        auto_return: 'approved',
      }

      const preference = new Preference(client)
      const result = await preference.create({ body })

      if (result && result.id) {
        return res.status(200).json({
          id: result.id,
        })
      } else {
        return res.status(500).json({
          error: 'Failed to create preference',
        })
      }
    } catch (err) {
      console.log(err)
      return res.status(500).json({
        error: 'Failed to create preference',
      })
    }
  }

  async pix(req, res) {
    try {
      const options = {
        method: 'POST',
        url: 'https://api.mercadopago.com/v1/payments',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          Authorization: 'Bearer ' + process.env.ACCESS_TOKEN_MERCADOPAGO,
          'X-Idempotency-Key': v4(),
        },
        body: JSON.stringify({
          transaction_amount: req.body.transaction_amount,
          description: req.body.title,
          payment_method_id: 'pix',
          payer: {
            email: req.body.payer.email,
            identification: {
              type: 'CPF',
              number: '49512657880',
            },
          },
        }),
      }

      request(options, function (error, response, body) {
        if (error) throw new Error(error)
        console.log(JSON.parse(body))
        return res.status(200).json(JSON.parse(body))
      })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: 'Failed to create payment' })
    }
  }

  async handleNotification(req, res) {
    const notification = req.body
    console.log('Received notification:', notification)

    res.status(200).send('Notification received')
  }

  async stripe(req, res) {
    try {
      const stripe = stripeLib(process.env.ACCESS_TOKEN_STRIPE)

      const { products } = req.body

      const lineItems = products.map((product) => ({
        price_data: {
          currency: 'brl',
          product_data: {
            name: product.name,
            images: [product.image],
          },
          unit_amount: product.price * 100,
        },
        quantity: product.quantity,
      }))

      const session = await stripe.checkout.sessions.create({
        line_items: lineItems,
        mode: 'payment',
        success_url: 'http://localhost:3000',
        cancel_url: 'http://localhost:3000',
      })

      return res.status(200).json({ id: session.id })
    } catch (error) {
      console.error('Error creating Stripe checkout session:', error)
      return res
        .status(500)
        .json({ error: 'Failed to create Stripe checkout session' })
    }
  }
}

export default new PaymentController()
