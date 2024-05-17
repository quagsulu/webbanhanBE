/* eslint-disable @stylistic/js/quotes */
import Joi from 'joi'
import JoiDate from '@joi/date'
// import { moviePriceSchema } from './MoviePrice'

const JoiExtended = Joi.extend(JoiDate)
const productSchema = JoiExtended.object({
  name: Joi.string().required().min(6).max(255).label('Name').messages({
    'string.empty': `{{ #label }} is 'required'`
  }),
  desc: Joi.string().min(3).max(1255).trim().strict(),
  image: Joi.string(),
  categoryId: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string().required()
  ),
  showTimes: Joi.array().items(Joi.string().allow('')).empty(Joi.array().length(0)),
  price: Joi.number().min(0).required()
}).options({
  abortEarly: false
})
export default productSchema
