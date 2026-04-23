import express from 'express'
import { saveOTP, verifyOTP } from '../utils/otpStore.js'
import { sendOTPviaSMS } from '../services/smsService.js'

const router = express.Router()

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString()

const isValidIndianPhone = (phone) => /^[6-9]\d{9}$/.test(phone)

// Rate limiting — one OTP per number per 60 seconds
const otpCooldown = new Map()
const isOnCooldown = (phone) => {
  const lastSent = otpCooldown.get(phone)
  if (!lastSent) return false
  return Date.now() - lastSent < 60_000
}

// POST /api/otp/send
// Body: { phone: "9876543210" }
router.post('/send', async (req, res) => {
  const { phone } = req.body

  if (!phone || !isValidIndianPhone(phone)) {
    return res.status(400).json({
      success: false,
      message: 'Valid 10-digit Indian mobile number daalo (6-9 se shuru hona chahiye).',
    })
  }

  if (isOnCooldown(phone)) {
    return res.status(429).json({
      success: false,
      message: 'OTP abhi bheja gaya hai. 60 seconds baad dobara try karo.',
    })
  }

  const otp = generateOTP()
  saveOTP(phone, otp)

  const result = await sendOTPviaSMS(phone, otp)

  if (!result.success) {
    return res.status(500).json({ success: false, message: result.message })
  }

  // Cooldown sirf tab set karo jab SMS successfully bhej diya
  otpCooldown.set(phone, Date.now())

  return res.json({
    success: true,
    message: `OTP bheja gaya ${phone} pe. 10 minutes mein valid hai.`,
  })
})

// POST /api/otp/verify
// Body: { phone: "9876543210", otp: "123456" }
router.post('/verify', (req, res) => {
  const { phone, otp } = req.body

  if (!phone || !otp) {
    return res.status(400).json({
      success: false,
      message: 'Phone aur OTP dono chahiye.',
    })
  }

  const result = verifyOTP(phone, otp)

  if (!result.success) {
    return res.status(400).json(result)
  }

  return res.json({
    success: true,
    message: 'Phone verify ho gaya! ✅',
    phoneVerified: true,
  })
})

export default router
