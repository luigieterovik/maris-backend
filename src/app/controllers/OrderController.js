import * as Yup from 'yup'

class OrderController {
  async store(req, res) {
    const schema = Yup.object().shape({
      userId: Yup.number().required(),
      productId: Yup.number().required(),
      quantity: Yup.number().required(),
    })

    try {
      await schema.validateSync(req.body, { abortEarly: false })
    } catch (err) {
      return res.status(400).json({ error: err.errors })
    }

    return res
  }
}

export default OrderController
