import axios from 'axios'
import nodemailer from 'nodemailer'
import stripeLib from 'stripe'

import PendingOrders from '../models/PendingOrders.js'
import PendingDelivery from '../models/PendingDelivery.js'
import PendingPayer from '../models/PendingPayer.js'
import Order from '../models/Order.js'
import Delivery from '../models/Delivery.js'
import Orders_Products from '../models/Orders_Products.js'
import Payer from '../models/Payer.js'
import User from '../models/User.js'

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

          const userId = getUserIdByEmail(customerEmail)

          const items =
            searchResponse.data.results[0]?.additional_info?.items || []

          console.log(items)

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

          // // const customer = await stripe.customers.retrieve(
          // //   paymentIntentSucceeded.customer,
          // // )
          // // const customerEmail = customer.email

          // // const productDetailsString = customer.metadata.product_ids
          // // const productsArray = productDetailsString.split(';')

          // console.log(productDetailsString)

          // const externalReference = customer.metadata.external_reference
          // console.log(
          //   '________________________-EXTERNAL REFERENCE STRIPE CUSTOMER: ' +
          //     externalReference,
          // ) // EXTERNAL REFERENCE

          const paymentIntentId = paymentIntentSucceeded.id

          let stringProductsIds
          let checkoutSession
          try {
            const sessions = await stripe.checkout.sessions.list({
              payment_intent: paymentIntentId,
            })

            if (sessions.data.length > 0) {
              checkoutSession = sessions.data[0]

              stringProductsIds = checkoutSession.metadata.product_ids
            } else {
              console.log('Nenhuma sessão encontrada para o Payment Intent')
            }
          } catch (error) {
            console.error('Erro ao buscar sessão:', error)
          }

          console.log(
            `CHECKOUT SESSION: ${JSON.stringify(checkoutSession, null, 2)}`,
          )

          const lineItems = await stripe.checkout.sessions.listLineItems(
            checkoutSession.id,
          )

          console.log('_________LINE ITEMS 2:')
          lineItems.data.forEach((item, index) => {
            console.log(`Item ${index + 1}:`, JSON.stringify(item, null, 2))
          })

          const foundPendingOrder = await PendingOrders.findOne({
            where: {
              external_reference: checkoutSession.metadata.external_reference,
            },
          })

          console.log('FOUND PENDING ORDER:')
          console.log(foundPendingOrder)
          console.log(JSON.stringify(foundPendingOrder))

          const foundPendingDelivery = await PendingDelivery.findOne({
            where: {
              id: foundPendingOrder.pendingDeliveryId,
            },
          })

          console.log('FOUND PENDING DEVLIERY:')
          console.log(foundPendingDelivery)
          console.log(JSON.stringify(foundPendingDelivery))

          const foundPendingPayer = await PendingPayer.findOne({
            where: {
              id: foundPendingDelivery.idPayer,
            },
          })

          console.log('FOUND PENDING PAYER:')
          console.log(foundPendingPayer)
          console.log(JSON.stringify(foundPendingPayer))

          const createPayer = await Payer.create({
            name: foundPendingPayer.name,
            cpf: foundPendingPayer.cpf,
            email: foundPendingPayer.email,
            phoneNumber: foundPendingPayer.phoneNumber,
            recipient: foundPendingPayer.recipient,
          })

          console.log('Created Payer' + JSON.stringify(createPayer))

          const createdDelivery = await Delivery.create({
            idPayer: createPayer.dataValues.id,
            state: foundPendingDelivery.state,
            city: foundPendingDelivery.city,
            neighborhood: foundPendingDelivery.neighborhood,
            street: foundPendingDelivery.street,
            houseNumber: foundPendingDelivery.houseNumber,
            cep: foundPendingDelivery.cep,
            complement: foundPendingDelivery.complement,
          })

          console.log('Created Delivery' + JSON.stringify(createdDelivery))

          const createdOrder = await Order.create({
            userId: foundPendingOrder.userId,
            deliveryId: createdDelivery.dataValues.id,
            status: 'Pedido realizado',
            total: checkoutSession.amount_total / 100,
          })

          console.log(`Created Order: ${JSON.stringify(createdOrder)}`)

          const productsIds = stringProductsIds
            .split(';')
            .map((item) => parseInt(item.split(':')[1], 10))

          console.log(productsIds)

          console.log('Orders_Products logs: ')

          async function processOrder(lineItems, createdOrder, productsIds) {
            for (let index = 0; index < lineItems.data.length; index++) {
              const item = lineItems.data[index]

              const createdOrdersProducts = await Orders_Products.create({
                orderId: createdOrder.dataValues.id,
                productId: productsIds[index],
                quantity: item.quantity,
                unitPrice: item.amount_total,
              })

              console.log(`Created Orders_Products: ${createdOrdersProducts}`)
            }
          }

          processOrder(lineItems, createdOrder, productsIds).catch(
            console.error,
          )

          // const products = []

          // productsArray.forEach((productString) => {
          //   const details = productString.split(',')

          //   const productObject = details.reduce((acc, detail) => {
          //     const [key, value] = detail.split(':')
          //     if (key === 'id') acc.id = value
          //     if (key === 'qt') acc.quantity = parseInt(value, 10)
          //     if (key === 'pc') acc.price = parseInt(value, 10)
          //     return acc
          //   }, {})

          //   products.push(productObject)
          // })

          // console.log(products)

          // const user = await User.findOne({
          //   where: { email: customerEmail },
          //   attributes: ['id'],
          // })

          // const userId = user ? user.get('id') : null

          // console.log(user)
          // console.log(userId)

          // await processOrder(products, userId)
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
      userId: orderData.userId,
      productId: orderData.productId,
      quantity: orderData.quantity,
      status: 'Aprovado',
      total: orderData.total,
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

async function getUserIdByEmail(email) {
  const user = await User.findOne({
    where: { email },
    attributes: ['id'],
  })

  const userId = user ? user.get('id') : null

  console.log(user)
  console.log(userId)

  if (
    !userId ||
    !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      userId,
    )
  ) {
    console.error('Invalid or missing userId:', userId)
    return null
  }

  return userId
}

async function processOrder(items, userId) {
  for (const item of items) {
    const unitPrice = parseFloat(item.price)
    const quantity = parseInt(item.quantity)

    if (isNaN(unitPrice) || isNaN(quantity)) {
      console.error(`Invalid price or quantity for item ${item.id}`)
      continue
    }

    const orderData = {
      userId,
      productId: item.id,
      quantity,
      status: 'Aprovado',
      total: unitPrice * quantity,
    }

    await savePayment(orderData)
  }
}

export default new NotificationController()
