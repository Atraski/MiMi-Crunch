import { Router } from 'express'
import {
  addWishlistItem,
  createUser,
  getProfile,
  loginWithEmail,
  sendEmailOtp,
  updateUser,
  verifyEmailOtp,
  verifyLoginOtp,
} from '../controllers/userController.js'

const router = Router()

router.post('/users', createUser)
router.get('/users/:id/profile', getProfile)
router.patch('/users/:id', updateUser)
router.post('/users/:id/email/send-otp', sendEmailOtp)
router.post('/users/:id/email/verify', verifyEmailOtp)
router.post('/users/login', loginWithEmail)
router.post('/users/login/verify', verifyLoginOtp)
router.post('/users/:id/wishlist', addWishlistItem)

export default router
