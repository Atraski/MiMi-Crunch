import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import {
  getCachedUser,
  setCachedUser,
  deleteCachedUser,
} from '../config/redis.js'
import generateOtp from '../utils/otp.js'
import { sendVerificationEmail } from '../utils/email.js'

const JWT_SECRET = process.env.JWT_SECRET || 'mimi-crunch-secret-change-in-production'
const SALT_ROUNDS = 10
const OTP_EXPIRY_MS = 10 * 60 * 1000 // 10 minutes

const toSafeUser = (user) => {
  const u = typeof user.toObject === 'function' ? user.toObject() : { ...user }
  delete u.password
  delete u.emailOtp
  delete u.emailOtpExpiresAt
  return u
}

const sendOtpToUser = async (user) => {
  const code = generateOtp()
  user.emailOtp = code
  user.emailOtpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MS)
  await user.save()
  await sendVerificationEmail({ to: user.email, code })
}

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body || {}
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' })
    }
    const emailNorm = String(email).trim().toLowerCase()
    const existing = await User.findOne({ email: emailNorm })
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' })
    }
    const hashed = await bcrypt.hash(String(password), SALT_ROUNDS)
    const user = await User.create({
      name: name ? String(name).trim() : '',
      email: emailNorm,
      password: hashed,
      emailVerified: false,
    })
    await sendOtpToUser(user)
    const userId = user._id.toString()
    return res.status(201).json({
      needsVerification: true,
      userId,
      email: user.email,
    })
  } catch (err) {
    console.error('Signup error:', err)
    return res.status(500).json({ error: 'Failed to create account.' })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body || {}
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' })
    }
    const emailNorm = String(email).trim().toLowerCase()
    const user = await User.findOne({ email: emailNorm })
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }
    const match = await bcrypt.compare(String(password), user.password)
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }
    const safe = toSafeUser(user)
    const userId = user._id.toString()
    await setCachedUser(userId, safe)
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' })
    return res.json({ user: safe, token })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ error: 'Failed to sign in.' })
  }
}

export const verifyEmail = async (req, res) => {
  try {
    const { userId, code } = req.body || {}
    if (!userId || !code) {
      return res.status(400).json({ error: 'UserId and verification code are required.' })
    }
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found.' })
    }
    if (!user.emailOtp || !user.emailOtpExpiresAt) {
      return res.status(400).json({ error: 'No OTP pending. Request a new code.' })
    }
    if (user.emailOtp !== String(code).trim()) {
      return res.status(400).json({ error: 'Invalid verification code.' })
    }
    if (user.emailOtpExpiresAt < new Date()) {
      return res.status(400).json({ error: 'Code expired. Request a new code.' })
    }
    user.emailVerified = true
    user.emailOtp = undefined
    user.emailOtpExpiresAt = undefined
    await user.save()
    await deleteCachedUser(userId)
    const safe = toSafeUser(user)
    await setCachedUser(userId, safe)
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' })
    return res.json({ user: safe, token })
  } catch (err) {
    console.error('Verify email error:', err)
    return res.status(500).json({ error: 'Verification failed.' })
  }
}

export const resendOtp = async (req, res) => {
  try {
    const { userId } = req.body || {}
    if (!userId) {
      return res.status(400).json({ error: 'UserId is required.' })
    }
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found.' })
    }
    await sendOtpToUser(user)
    return res.json({ success: true, email: user.email })
  } catch (err) {
    console.error('Resend OTP error:', err)
    return res.status(500).json({ error: 'Failed to send code.' })
  }
}

export const me = async (req, res) => {
  try {
    const userId = req.auth.userId;

    // 1. Pehle Redis check karo (Fastest)
    if (process.env.REDIS_URL) {
      try {
        const cached = await getCachedUser(userId);
        if (cached) {
          console.log("Redis Cache hit for user:", userId);
          return res.json(cached);
        }
      } catch (redisErr) {
        console.warn("Redis issue, falling back to DB...");
      }
    }

    // 2. Agar cache miss hua ya Redis nahi hai, toh DB se lo
    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const safe = toSafeUser(user);

    // 3. Naya data Redis mein set kar do agli baar ke liye
    if (process.env.REDIS_URL) {
      await setCachedUser(userId, safe).catch(() => {});
    }

    return res.json(safe);
  } catch (err) {
    console.error('Me error:', err);
    return res.status(500).json({ error: 'Failed to load profile.' });
  }
};
