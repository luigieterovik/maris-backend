import axios from 'axios'
import nodemailer from 'nodemailer'
import stripeLib from 'stripe'
import { Payment } from 'mercadopago'

import PendingOrders from '../models/PendingOrder'
import Order from '../models/Order'
import User from '../models/User'

class NotificationController {
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
          console.log('Pagamento aprovado:', payment)

          const externalReference = payment.external_reference
          const customer = await PendingOrders.findOne({
            where: { external_reference: externalReference },
            attributes: ['email'],
          })

          const customerEmail = customer ? customer.get('email') : null

          console.log('Customer EMAIL:', customerEmail)

          console.log(externalReference)
          console.log('CUstomer EMAIL::::::' + customerEmail)

          const searchResponse = await axios.get(
            'https://api.mercadopago.com/v1/payments/search',
            {
              headers: {
                Authorization: `Bearer ${process.env.ACCESS_TOKEN_MERCADOPAGO}`,
              },
              params: {
                external_reference: externalReference,
              },
            },
          )
          console.log(
            'MERCADO PAGO EXTERNAL_REFERENCE SEARCH:',
            JSON.stringify(searchResponse.data, null, 2),
          )

          const user = await User.findOne({
            where: { email: customerEmail },
            attributes: ['id'],
          })

          const userId = user ? user.get('id') : null

          const items =
            searchResponse.data.results[0]?.additional_info?.items || []

          async function processOrder(items, userId) {
            for (const item of items) {
              const orderData = {
                userId,
                productId: item.id,
                quantity: item.quantity,
                status: 'Aprovado',
                total: parseFloat(item.unit_price) * parseInt(item.quantity),
              }

              await savePayment(orderData)
            }
          }

          await processOrder(items, userId)
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

async function savePayment(orderData) {
  try {
    const response = await Order.create({
      userId: 'be83a3c1-2ac0-44da-90d1-5521e61dba3e',
      productId: 1,
      quantity: 1,
      status: 'Aprovado',
      total: 1.0,
    })

    console.log(response)

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
      subject: 'Maris Boutiks — Erro',
      text: `Olá, houve um erro ao processar seu pagamento. Por favor, tente novamente.`,
    }

    await transporter.sendMail(mailOptions)
    console.log('E-mail de falha de pagamento enviado com sucesso!')
  } catch (err) {
    console.error('Erro ao enviar e-mail de falha de pagamento:', err)
  }
}

export default new NotificationController()
