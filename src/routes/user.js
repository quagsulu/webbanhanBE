
import { Router } from 'express'
import { isAdmin, verifyAccessToken } from '../middleware/verifyToken.js'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from '../middleware/multer.js'
import multer from 'multer'
import { blocked, deleteUser, forgotPassword, getAllUser, getDetailUser, getDetailUserById, login, register, resetPassword, unBlock, updateClient, updateUser, updateUserById } from '../controllers/users.js'
const routerUser = Router()

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  folder: 'AVATAR',
  allowedFormats: ['jpg', 'png', 'jpeg'],
  transformation: [{ with: 500, height: 500, crop: 'limit' }]
})
const upload = multer({
  storage: storage
})

routerUser.post('/register', upload.single('avatar'), register)
// routerUser.post('/googleSign', registerGoogle)
routerUser.post('/login', login)
routerUser.get('/', getAllUser)
routerUser.get('/userDetail', verifyAccessToken, getDetailUser)
routerUser.get('/:id', getDetailUserById)
routerUser.patch(
  '/updateUser',
  upload.single('avatar'),
  verifyAccessToken,
  updateUser
)
routerUser.patch(
  '/updateClient',
  upload.single('avatar'),
  verifyAccessToken,
  updateClient
)
routerUser.post('/forgotPassword', forgotPassword)
routerUser.put('/resetPassword', resetPassword)

routerUser.patch('/block/:id',verifyAccessToken, isAdmin,  blocked)
routerUser.patch('/unBlock/:id', unBlock)

routerUser.put('/:id', verifyAccessToken, isAdmin, updateUserById)
routerUser.delete('/:id', deleteUser)

export default routerUser
