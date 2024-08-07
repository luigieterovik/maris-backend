import * as Yup from 'yup'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import mercadopago from 'mercadopago'
import dotenv from 'dotenv'
import stripeLib from 'stripe'
import axios from 'axios'
import nodemailer from 'nodemailer'

import { v4 } from 'uuid'
const mercadopago = require('mercadopago')

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
    mercadopago.configure({
      access_token: process.env.ACCESS_TOKEN_MERCADOPAGO,
    })

    const {
      transaction_amount,
      title,
      payer,
      external_reference,
      statement_descriptor,
    } = req.body

    try {
      const preferenceData = {
        items: [
          {
            title: title,
            quantity: 1,
            unit_price: transaction_amount,
            currency_id: 'BRL',
          },
        ],
        payer,
        external_reference,
        statement_descriptor,
        back_urls: {
          success: 'http://localhost:3000',
          failure: 'http://localhost:3000',
          pending: 'http://localhost:3000',
        },
        auto_return: 'approved',
        payment_methods: {
          excluded_payment_methods: [{ id: 'credit_card' }],
          excluded_payment_types: [{ id: 'credit_card' }],
        },
        transaction_amount,
      }

      const preference = await mercadopago.preferences.create(preferenceData)

      console.log('Resposta do Mercado Pago:', preference.body)

      return res.status(200).json(preference.body)
    } catch (err) {
      console.log('Erro:', err.response ? err.response.data : err.message)
      return res.status(500).json({
        error: 'Failed to create payment',
        details: err.response ? err.response.data : err.message,
      })
    }
  }

  async handleMercadoPagoNotification(req, res) {
    const notification = req.body
    console.log(notification)

    if (
      notification.action === 'payment.created' ||
      notification.action === 'payment.updated'
    ) {
      const paymentId = notification.data.id

      try {
        const paymentResponse = await axios.get(
          `https://api.mercadopago.com/v1/payments/${paymentId}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.ACCESS_TOKEN_MERCADOPAGO}`,
            },
          },
        )

        const payment = paymentResponse.data

        if (payment.status === 'approved') {
          // Aqui você pode processar o pagamento aprovado, salvar no banco de dados, etc.
          console.log('Pagamento aprovado:', payment)

          // Enviar email ao usuário
          const userEmail = payment.payer.email
          console.log('Email do usuário:', userEmail)
          // Implementar lógica de envio de email aqui
        }
      } catch (err) {
        console.error(
          'Erro ao obter detalhes do pagamento:',
          err.response ? err.response.data : err.message,
        )
      }
    }

    res.status(200).send('Notification received')
  }

  async stripe(req, res) {
    try {
      const stripe = stripeLib(process.env.ACCESS_TOKEN_STRIPE)

      // Criação do cliente no Stripe com o e-mail fornecido
      const customer = await stripe.customers.create({
        email: req.body.customer_email,
      })

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
        payment_method_types: [req.body.method],
        mode: 'payment',
        success_url: 'http://localhost:3000',
        cancel_url: 'http://localhost:3000',
        customer: customer.id,
      })

      return res.status(200).json({ id: session.id })
    } catch (error) {
      console.error('Error creating Stripe checkout session:', error)
      return res
        .status(500)
        .json({ error: 'Failed to create Stripe checkout session' })
    }
  }

  async handleStripeNotification(req, res) {
    const stripe = stripeLib(process.env.ACCESS_TOKEN_STRIPE)
    const sig = req.headers['stripe-signature']
    let event

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET,
      )

      switch (event.type) {
        case 'payment_intent.succeeded': {
          const paymentIntentSucceeded = event.data.object

          const customer = await stripe.customers.retrieve(
            paymentIntentSucceeded.customer,
          )
          const customerEmail = customer.email

          await savePayment(customerEmail)

          break
        }

        case 'payment_intent.payment_failed': {
          const paymentIntentFailed = event.data.object
          await sendFailureEmail(paymentIntentFailed)
          console.log('Payment intent failed:', paymentIntentFailed)
          break
        }

        default:
          console.log(`Unhandled event type ${event.type}`)
      }
    } catch (err) {
      console.error('Erro ao processar webhook do Stripe:', err)
      return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    res.status(200).send('Notification received')
  }
}

async function savePayment(userEmail) {
  try {
    console.log('Pagamento registrado com sucesso!')
  } catch (err) {
    console.error('Erro ao registrar pagamento:', err)
  }
}

async function sendFailureEmail(paymentData) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: paymentData.receipt_email,
      subject: 'Maris Boutiks — Erro+',
      text: `Olá, houve um erro ao processar seu pagamento. Por favor, tente novamente.`,
    }

    await transporter.sendMail(mailOptions)
    console.log('E-mail de falha de pagamento enviado com sucesso!')
  } catch (err) {
    console.error('Erro ao enviar e-mail de falha de pagamento:', err)
  }
}

export default new PaymentController()
