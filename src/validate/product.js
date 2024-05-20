import Joi from 'joi'

const productSchema = Joi.object({
  name: Joi.string().required().min(6),
  desc: Joi.string().min(3).max(1255),
  image: Joi.string(),
  categoryId: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string().required()
  ),
  price: Joi.number().min(0).required()
}).options({
  abortEarly: false
})
export default productSchema
