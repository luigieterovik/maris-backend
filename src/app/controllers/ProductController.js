import * as Yup from 'yup'

class ProductController {
    async store(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            description: Yup.string(),
            price: Yup.number().required()
        })

        try {
            await schema.validateSync(req.body, { abortEarly: false })
        } catch(err) {
            return res.status(400).json({ error: err.errors })
        }

        return res.json({ ok: true })
    }
}

export default new ProductController()