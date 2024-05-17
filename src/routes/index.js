import routerCategories from './categories.js'
import routerProducts from './product.js'
import { Router } from 'express'
import routerUser from './user.js'
import routerComment from './comment.js'
const routerInit = Router()

routerInit.use('/user', routerUser)
routerInit.use('/product', routerProducts)
routerInit.use('/category', routerCategories)
routerInit.use('/comment', routerComment)

export default routerInit
