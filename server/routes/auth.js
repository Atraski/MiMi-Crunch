import { Router } from 'express'
import { login, me, resendOtp, signup, verifyEmail, sendEmailLoginOtp, verifyEmailLoginOtp } from '../controllers/authController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.post('/auth/signup', signup)
router.post('/auth/login', login)
router.post('/auth/verify-email', verifyEmail)
router.post('/auth/resend-otp', resendOtp)
router.post('/auth/send-email-login-otp', sendEmailLoginOtp)
router.post('/auth/verify-email-login-otp', verifyEmailLoginOtp)
router.get('/auth/me', authMiddleware, me)

export default router
