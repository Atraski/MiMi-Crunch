import User from '../models/User.js'
import { deleteCachedUser } from '../config/redis.js'
import generateOtp from '../utils/otp.js'
// FIX: Named import curly braces ke saath
import { sendVerificationEmail } from '../utils/email.js'

const createUser = async (req, res) => {
  try {
    const { name, phone, email, address } = req.body || {}
    const user = await User.create({ name, phone, email, address })
    return res.status(201).json(user)
  } catch (err) {
    console.error('User create error:', err)
    return res.status(500).json({ error: 'Failed to create user.' })
  }
}

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean()
    if (!user) {
      return res.status(404).json({ error: 'User not found.' })
    }
    const displayName =
      user.name && user.phone && user.email && user.emailVerified
        ? user.name
        : 'MiMiCrunch User'
    return res.json({ ...user, displayName })
  } catch (err) {
    console.error('User profile error:', err)
    return res.status(500).json({ error: 'Failed to load profile.' })
  }
}

const updateUser = async (req, res) => {
  try {
    const { name, phone, email, address } = req.body || {}
    if (!name || !phone || !email) {
      return res
        .status(400)
        .json({ error: 'Name, phone, and email are required.' })
    }
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found.' })
    }
    const emailChanged = email && email !== user.email
    user.name = name
    user.phone = phone
    user.email = email
    user.address = address

    if (emailChanged) {
      const code = generateOtp()
      user.emailVerified = false
      user.emailOtp = code
      user.emailOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000)
      // Function call remains same as utility is now named
      await sendVerificationEmail({ to: email, code })
    }

    await user.save()
    await deleteCachedUser(req.params.id)
    const displayName =
      user.name && user.phone && user.email && user.emailVerified
        ? user.name
        : 'MiMiCrunch User'
    return res.json({ ...user.toObject(), displayName })
  } catch (err) {
    console.error('User update error:', err)
    return res.status(500).json({ error: 'Failed to update user.' })
  }
}

const sendEmailOtp = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found.' })
    }
    if (!user.email) {
      return res.status(400).json({ error: 'Email is required.' })
    }
    const code = generateOtp()
    user.emailVerified = false
    user.emailOtp = code
    user.emailOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000)
    await sendVerificationEmail({ to: user.email, code })
    await user.save()
    return res.json({ success: true })
  } catch (err) {
    console.error('Email OTP error:', err)
    return res.status(500).json({ error: 'Failed to send OTP.' })
  }
}

const verifyEmailOtp = async (req, res) => {
  try {
    const { code } = req.body || {}
    if (!code) {
      return res.status(400).json({ error: 'OTP code is required.' })
    }
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found.' })
    }
    if (!user.emailOtp || !user.emailOtpExpiresAt) {
      return res.status(400).json({ error: 'No OTP pending.' })
    }
    if (user.emailOtp !== code) {
      return res.status(400).json({ error: 'Invalid OTP.' })
    }
    if (user.emailOtpExpiresAt < new Date()) {
      return res.status(400).json({ error: 'OTP expired.' })
    }
    user.emailVerified = true
    user.emailOtp = undefined
    user.emailOtpExpiresAt = undefined
    await user.save()
    return res.json({ emailVerified: true, userId: user._id })
  } catch (err) {
    console.error('Email verify error:', err)
    return res.status(500).json({ error: 'Failed to verify email.' })
  }
}

const loginWithEmail = async (req, res) => {
  try {
    const { email } = req.body || {}
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' })
    }
    let user = await User.findOne({ email }).lean()
    if (!user) {
      user = await User.create({ email })
      user = user.toObject()
    }
    const code = generateOtp()
    await User.findByIdAndUpdate(user._id, {
      emailVerified: false,
      emailOtp: code,
      emailOtpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
    })
    await sendVerificationEmail({ to: email, code })
    return res.json({ success: true, userId: user._id })
  } catch (err) {
    console.error('Login OTP error:', err)
    return res.status(500).json({ error: 'Failed to send login OTP.' })
  }
}

const verifyLoginOtp = async (req, res) => {
  try {
    const { userId, code } = req.body || {}
    if (!userId || !code) {
      return res.status(400).json({ error: 'UserId and code are required.' })
    }
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found.' })
    }
    if (!user.emailOtp || !user.emailOtpExpiresAt) {
      return res.status(400).json({ error: 'No OTP pending.' })
    }
    if (user.emailOtp !== code) {
      return res.status(400).json({ error: 'Invalid OTP.' })
    }
    if (user.emailOtpExpiresAt < new Date()) {
      return res.status(400).json({ error: 'OTP expired.' })
    }
    user.emailVerified = true
    user.emailOtp = undefined
    user.emailOtpExpiresAt = undefined
    await user.save()
    return res.json({ emailVerified: true, userId: user._id })
  } catch (err) {
    console.error('Login verify error:', err)
    return res.status(500).json({ error: 'Failed to verify login OTP.' })
  }
}

const addWishlistItem = async (req, res) => {
  try {
    const { productId } = req.body || {}
    if (!productId) {
      return res.status(400).json({ error: 'productId is required.' })
    }
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found.' })
    }
    if (!user.name || !user.phone || !user.email || !user.emailVerified) {
      return res.status(403).json({
        error:
          'Profile incomplete. Add name, phone, and verify email to use wishlist.',
        displayName: 'MiMiCrunch User',
      })
    }

    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId)
      await user.save()
    }
    return res.json({ wishlist: user.wishlist })
  } catch (err) {
    console.error('Wishlist update error:', err)
    return res.status(500).json({ error: 'Failed to update wishlist.' })
  }
}

export {
  createUser,
  getProfile,
  updateUser,
  sendEmailOtp,
  verifyEmailOtp,
  loginWithEmail,
  verifyLoginOtp,
  addWishlistItem,
}