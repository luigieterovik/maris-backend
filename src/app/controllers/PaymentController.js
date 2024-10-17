import * as Yup from 'yup'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import dotenv from 'dotenv'
import stripeLib from 'stripe'
import PendingOrder from '../models/PendingOrder.js'

import { v4 } from 'uuid'

dotenv.config()

class PaymentController {
  async pix(req, res) {
    const client = new MercadoPagoConfig({
      accessToken: process.env.ACCESS_TOKEN_MERCADOPAGO,
    })

    const preference = new Preference(client)

    const { transaction_amount, title, payer, items, statement_descriptor } =
      req.body

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
        external_reference: v4(),
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
      )
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

      const { products } = req.body

      let productsIds = ''

      for (let i = 0; i < products.length; i++) {
        if (i >= 1) productsIds += ';'
        productsIds +=
          'id:' +
          products[i].id +
          ',qt:' +
          products[i].quantity +
          ',pc:' +
          products[i].price
      }

      const customer = await stripe.customers.create({
        email: req.body.customer_email,
        metadata: {
          product_ids: productsIds,
          external_reference: v4(),
        },
      })

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
          external_reference: v4(),
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

// async function createPendingOrder(external_reference, pendingDeliveryId) {
//   const pendingOrderResponse = await PendingOrder.create({
//     external_reference,
//     pendingDeliveryId,
//   })
// }

export default new PaymentController()
