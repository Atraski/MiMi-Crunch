import { Router } from 'express'
import { login, me, resendOtp, signup, verifyEmail, sendPhoneOtp, verifyPhoneOtp } from '../controllers/authController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.post('/auth/signup', signup)
router.post('/auth/login', login)
router.post('/auth/verify-email', verifyEmail)
router.post('/auth/resend-otp', resendOtp)
router.post('/auth/send-phone-otp', sendPhoneOtp)
router.post('/auth/verify-phone-otp', verifyPhoneOtp)
router.get('/auth/me', authMiddleware, me)

export default router
