import * as Yup from 'yup'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import dotenv from 'dotenv'
import stripeLib from 'stripe'
import request from 'request'
import nodemailer from 'nodemailer'

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
      return res
        .status(500)
        .json([{ error: 'Failed to create payment' }, { err }])
    }
  }

  async handleMercadoPagoNotification(req, res) {
    const notification = req.body

    if (
      notification.action === 'payment.created' ||
      notification.action === 'payment.updated'
    ) {
      const paymentId = notification.data.id

      // Obter os detalhes do pagamento usando a API do Mercado Pago
      const client = new MercadoPagoConfig({
        accessToken: process.env.ACCESS_TOKEN_MERCADOPAGO,
      })

      try {
        const payment = await client.get(`/v1/payments/${paymentId}`)

        if (payment.status === 'approved') {
          // Registrar os dados no banco de dados
          // Exemplo: savePayment(payment);

          console.log('Pagamento aprovado:', payment)
        }
      } catch (err) {
        console.error('Erro ao obter detalhes do pagamento:', err)
      }
    }

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

      const customer = await stripe.customers.create({
        metadata: {
          userId: req.body.userId,
        },
      })

      const session = await stripe.checkout.sessions.create({
        line_items: lineItems,
        payment_method_types: [req.body.method],
        mode: 'payment',
        success_url: 'http://localhost:3000',
        cancel_url: 'http://localhost:3000',
        customer: customer.id,
        customer_email: req.body.customer_email,
      })

      console.log(session)

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

          stripe.customers
            .retrieve(paymentIntentSucceeded)
            .then((costumer) => {
              console.log(costumer)
              console.log('data', paymentIntentSucceeded)
            })
            .catch((err) => console.log(err.message))
          savePayment()

          console.log('Payment intent succeeded:', paymentIntentSucceeded)
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

async function savePayment(paymentData) {
  try {
    console.log('Pagamento registrado com sucesso!')
    console.log(paymentData)
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
