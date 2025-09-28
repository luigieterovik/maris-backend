import * as Yup from 'yup'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import dotenv from 'dotenv'
import stripeLib from 'stripe'
import jwt from 'jsonwebtoken'

import PendingOrders from '../models/PendingOrders.js'
import PendingPayer from '../models/PendingPayer.js'
import PendingDelivery from '../models/PendingDelivery.js'

import { v4 } from 'uuid'

dotenv.config()

class PaymentController {
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
      statement_descriptor,
      payerData, // 👈 vem do front (mesmo shape do stripe)
      deliveryData, // 👈 vem do front (mesmo shape do stripe)
      userToken, // 👈 opcional, se quiser vincular userId como no stripe
    } = req.body

    console.log('PIX | body:', req.body)

    try {
      // 1) Cria preferência PIX (mantive seu padrão)
      const external_reference = v4()
      const body = {
        transaction_amount,
        description: title,
        payment_method_id: 'pix',
        payer, // Mercado Pago payer (nome/email/doc)
        payment_methods: {
          excluded_payment_methods: [
            { id: 'credit_card' },
            { id: 'debit_card' },
          ],
        },
        back_urls: {
          success: 'https://maris-frontend.vercel.app',
          failure: 'https://maris-frontend.vercel.app',
          pending: 'https://maris-frontend.vercel.app',
        },
        auto_return: 'approved',
        items,
        external_reference,
        statement_descriptor,
      }

      const requestOptions = { idempotencyKey: v4() }
      const paymentCreateResponse = await preference.create({
        body,
        requestOptions,
      })
      console.log('PIX | preference.create response:', paymentCreateResponse)

      // 2) Upsert do pagador (igual ao stripe)
      if (!payerData || !deliveryData) {
        return res
          .status(400)
          .json({ error: 'payerData e deliveryData são obrigatórios para PIX' })
      }

      const existingPayer = await PendingPayer.findOne({
        where: {
          name: payerData.fullName,
          cpf: payerData.cpf,
          email: payerData.email,
          phoneNumber: payerData.phoneNumber,
          recipient: deliveryData.recipient,
        },
      })

      let pendingPayerId
      if (existingPayer) {
        pendingPayerId = existingPayer.dataValues.id
      } else {
        const pendingPayerResponse = await PendingPayer.create({
          name: payerData.fullName,
          cpf: payerData.cpf,
          email: payerData.email,
          phoneNumber: payerData.phoneNumber,
          recipient: deliveryData.recipient,
        })
        pendingPayerId = pendingPayerResponse.dataValues.id
      }
      console.log(`PIX | PendingPayer ID: ${pendingPayerId}`)

      // 3) Cria entrega pendente (igual ao stripe; note o nome dos campos)
      const pendingDeliveryResponse = await PendingDelivery.create({
        idPayer: pendingPayerId,
        state: deliveryData.state,
        city: deliveryData.city,
        neighborhood: deliveryData.neighborhood,
        street: deliveryData.address, // no stripe você salvou como "street"
        houseNumber: deliveryData.houseNumber,
        cep: deliveryData.cep,
        complement: deliveryData.complement,
      })

      const pendingDeliveryId = pendingDeliveryResponse.dataValues.id
      console.log(`PIX | PendingDelivery ID: ${pendingDeliveryId}`)

      // 4) (opcional) pegar userId do token — mesmo padrão do stripe
      let userId
      if (userToken) {
        try {
          const tokenPayload = jwt.verify(userToken, process.env.JWT_SECRET)
          userId = tokenPayload.id
        } catch (err) {
          console.error('PIX | Token inválido/expirado:', err)
          // não barramos o fluxo; só seguimos sem userId
        }
      }

      // 5) Cria PendingOrder com a FK obrigatória ✅
      const pendingOrderResponse = await PendingOrders.create({
        external_reference,
        pendingDeliveryId, // 👈 AGORA NÃO É NULL
        email: body.payer?.email, // se quiser manter o email
        amount: transaction_amount,
        userId, // opcional
        status: 'PENDING',
        payment_provider: 'MERCADO_PAGO',
        payment_method: 'PIX',
      })

      if (!pendingOrderResponse) {
        return res.status(500).json({ message: 'Failed to save order' })
      }

      // 6) Retorno — você já retornava init_point; mantive
      return res.status(200).json(paymentCreateResponse.init_point)
    } catch (err) {
      console.log(
        'PIX | Erro:',
        err.paymentCreateResponse
          ? err.paymentCreateResponse.data
          : err.message,
      )
      return res.status(500).json({
        error: 'Failed to create PIX payment',
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

      console.log('Products: ' + JSON.stringify(products))

      const productsIds = products
        .map((product) => `id:${product.id}`)
        .join(';')

      const customer = await stripe.customers.create({
        email: req.body.customer_email,
      })

      const lineItems = products.map((product) => ({
        price_data: {
          currency: 'brl',
          product_data: {
            id: product.id,
            name: product.name,
            images: [product.image],
          },
          unit_amount: product.price * 100,
        },
        quantity: product.quantity,
      }))

      console.log('LINE ITEMS: ' + JSON.stringify(lineItems))

      const external_reference = v4()

      const session = await stripe.checkout.sessions.create({
        line_items: lineItems,
        payment_method_types: [req.body.method],
        mode: 'payment',
        success_url: 'https://maris-frontend.vercel.app',
        cancel_url: 'https://maris-frontend.vercel.app',
        customer: customer.id,
        metadata: {
          product_ids: productsIds,
          external_reference: external_reference,
        },
      })

      console.log('SESSION: ' + JSON.stringify(session))

      const { payerData } = req.body
      const { deliveryData } = req.body

      console.log('Payer data: ' + payerData)
      console.log('Delivery data: ' + deliveryData)

      const existingPayer = await PendingPayer.findOne({
        where: {
          name: payerData.fullName,
          cpf: payerData.cpf,
          email: payerData.email,
          phoneNumber: payerData.phoneNumber,
          recipient: deliveryData.recipient,
        },
      })

      let pendingPayerId

      if (existingPayer) {
        pendingPayerId = existingPayer.dataValues.id
      } else {
        const pendingPayerResponse = await PendingPayer.create({
          name: payerData.fullName,
          cpf: payerData.cpf,
          email: payerData.email,
          phoneNumber: payerData.phoneNumber,
          recipient: deliveryData.recipient,
        })

        pendingPayerId = pendingPayerResponse.dataValues.id
      }

      console.log(`PendingPayer ID: ${pendingPayerId}`)

      const pendingDeliveryResponse = await PendingDelivery.create({
        idPayer: pendingPayerId,
        state: deliveryData.state,
        city: deliveryData.city,
        neighborhood: deliveryData.neighborhood,
        street: deliveryData.address,
        houseNumber: deliveryData.houseNumber,
        cep: deliveryData.cep,
        complement: deliveryData.complement,
      })

      console.log(pendingDeliveryResponse)
      console.log(
        `PendingDelivery ID: ${pendingDeliveryResponse.dataValues.id}`,
      )

      const { userToken } = req.body

      console.log(userToken)

      let userId
      try {
        const tokenPayload = jwt.verify(userToken, process.env.JWT_SECRET)
        console.log(`Token payload: ${JSON.stringify(tokenPayload)}`)
        userId = tokenPayload.id
      } catch (err) {
        console.error('Token inválido ou expirado:', err)
        return null
      }

      const pendingOrderResponse = await PendingOrders.create({
        external_reference: external_reference,
        pendingDeliveryId: pendingDeliveryResponse.dataValues.id,
        userId,
      })

      console.log(
        `PENDING ORDER RESPONSE: ${JSON.stringify(pendingOrderResponse)}`,
      )

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
//   const pendingOrderResponse = await PendingOrders.create({
//     external_reference,
//     pendingDeliveryId,
//   })
// }

export default new PaymentController()
