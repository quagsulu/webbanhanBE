import express from 'express'


import { CloudinaryStorage } from 'multer-storage-cloudinary'
import multer from 'multer'
import cloudinary from '../middleware/multer.js'
import { create, getAll, getAllSoftDelete, getDetail, getProductByCategory, remove, restore, searchProduct, softDelete, update } from '../controllers/products.js'
const routerProducts = express.Router()
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  folder: 'AVATAR',
  allowedFormats: ['jpg', 'png', 'jpeg'],
  transformation: [{ with: 500, height: 500, crop: 'limit' }]
})
const upload = multer({
  storage: storage
})



routerProducts.get('/', getAll)
routerProducts.get('/product/cate', getProductByCategory)
routerProducts.get('/search', searchProduct)
routerProducts.get('/softdelete', getAllSoftDelete)
routerProducts.get('/:id', getDetail)
routerProducts.patch('/:id', upload.single('image'), update)
// routerProducts.patch('/:id',  update)
routerProducts.post('/', upload.single('image'), create)
routerProducts.delete('/:id', remove)
routerProducts.patch('/softdelete/:id', softDelete)
routerProducts.patch('/restore/:id', restore)

export default routerProducts
