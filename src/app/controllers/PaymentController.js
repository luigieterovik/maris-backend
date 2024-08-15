import * as Yup from 'yup'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import dotenv from 'dotenv'
import stripeLib from 'stripe'
import PendingOrder from '../models/PendingOrder'

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
    const client = new MercadoPagoConfig({
      accessToken: process.env.ACCESS_TOKEN_MERCADOPAGO,
    })

    const preference = new Preference(client)

    const {
      transaction_amount,
      title,
      payer,
      items,
      external_reference,
      statement_descriptor,
    } = req.body

    console.log('Dados recebidos do frontend:', req.body)

    try {
      const body = {
        transaction_amount,
        description: title,
        payment_method_id: 'pix',
        payer,
        payment_methods: {
          excluded_payment_methods: [
            { id: 'credit_card' },
            { id: 'debit_card' },
          ],
        },
        back_urls: {
          success: 'http://localhost:3000',
          failure: 'http://localhost:3000',
          pending: 'http://localhost:3000',
        },
        auto_return: 'approved',
        items,
        external_reference,
        statement_descriptor,
      }

      const requestOptions = {
        idempotencyKey: v4(),
      }

      const paymentCreateResponse = await preference.create({
        body,
        requestOptions,
      })

      console.log('Resposta do Mercado Pago:', paymentCreateResponse)

      const pendingOrderResponse = await PendingOrder.create({
        external_reference: body.external_reference,
        email: body.payer.email,
      })

      if (!pendingOrderResponse)
        return res.status(500).json({ message: 'Failed to save order' })

      return res.status(200).json(paymentCreateResponse.init_point)
    } catch (err) {
      console.log(
        'Erro:',
        err.paymentCreateResponse
          ? err.paymentCreateResponse.data
          : err.message,
      ) // Log do erro detalhado
      return res.status(500).json({
        error: 'Failed to create payment',
        details: err.paymentCreateResponse
          ? err.paymentCreateResponse.data
          : err.message,
      })
    }
  }

  async stripe(req, res) {
    try {
      const stripe = stripeLib(process.env.ACCESS_TOKEN_STRIPE)

      // Criação do cliente no Stripe com o e-mail fornecido
      const customer = await stripe.customers.create({
        email: req.body.customer_email,
      })

      const { products } = req.body

      let productsIds = ''

      for (let i = 0; i < products.length; i++) {
        if (i >= 1) productsIds += ','
        productsIds += String(products[i].id)
      }

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
        payment_method_types: [req.body.method],
        mode: 'payment',
        success_url: 'http://localhost:3000',
        cancel_url: 'http://localhost:3000',
        customer: customer.id,
        metadata: {
          product_ids: productsIds,
        },
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
