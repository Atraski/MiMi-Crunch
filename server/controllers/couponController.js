import mongoose from 'mongoose'
import Coupon from '../models/Coupon.js'

const normalizeCode = (v) => String(v || '').trim().toUpperCase()

/** True when MongoDB is connected and ready for queries. */
const isDbConnected = () => mongoose.connection.readyState === 1

const listCoupons = async (_req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ error: 'Service temporarily unavailable. Try again in a moment.' })
    }
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean()
    return res.json(coupons)
  } catch (err) {
    console.error('Coupon list error:', err)
    return res.status(500).json({ error: 'Failed to fetch coupons.' })
  }
}

/** Storefront: list only active, currently valid coupons (no sensitive fields). */
const getAvailableCoupons = async (_req, res) => {
  try {
    if (!isDbConnected()) {
      return res.json([])
    }
    const now = new Date()
    const coupons = await Coupon.find({ active: true })
      .select('code type value minOrder validFrom validUntil')
      .lean()
    const valid = coupons.filter((c) => {
      if (c.validFrom && new Date(c.validFrom) > now) return false
      if (c.validUntil && new Date(c.validUntil) < now) return false
      return true
    })
    return res.json(valid)
  } catch (err) {
    console.error('Available coupons error:', err)
    return res.status(500).json({ error: 'Failed to fetch offers.' })
  }
}

const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id).lean()
    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found.' })
    }
    return res.json(coupon)
  } catch (err) {
    console.error('Coupon fetch error:', err)
    return res.status(500).json({ error: 'Failed to fetch coupon.' })
  }
}

const createCoupon = async (req, res) => {
  try {
    const {
      code,
      type,
      value,
      minOrder,
      maxUses,
      validFrom,
      validUntil,
      active,
    } = req.body || {}
    if (!code || value == null) {
      return res.status(400).json({
        error: 'Code and value are required.',
      })
    }
    const finalCode = normalizeCode(code)
    const existing = await Coupon.findOne({ code: finalCode })
    if (existing) {
      return res.status(400).json({ error: 'A coupon with this code already exists.' })
    }
    const coupon = await Coupon.create({
      code: finalCode,
      type: type === 'fixed' ? 'fixed' : 'percentage',
      value: Number(value),
      minOrder: minOrder != null ? Number(minOrder) : undefined,
      maxUses: maxUses != null ? Number(maxUses) : undefined,
      validFrom: validFrom ? new Date(validFrom) : undefined,
      validUntil: validUntil ? new Date(validUntil) : undefined,
      active: active !== false,
    })
    return res.status(201).json(coupon)
  } catch (err) {
    console.error('Coupon create error:', err)
    return res.status(500).json({ error: 'Failed to create coupon.' })
  }
}

const updateCoupon = async (req, res) => {
  try {
    const updates = { ...req.body }
    if (updates.code) {
      updates.code = normalizeCode(updates.code)
    }
    if (updates.value != null) updates.value = Number(updates.value)
    if (updates.minOrder != null) updates.minOrder = Number(updates.minOrder)
    if (updates.maxUses != null) updates.maxUses = Number(updates.maxUses)
    if (updates.validFrom != null) updates.validFrom = new Date(updates.validFrom)
    if (updates.validUntil != null)
      updates.validUntil = new Date(updates.validUntil)
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true },
    ).lean()
    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found.' })
    }
    return res.json(coupon)
  } catch (err) {
    console.error('Coupon update error:', err)
    return res.status(500).json({ error: 'Failed to update coupon.' })
  }
}

const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id).lean()
    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found.' })
    }
    return res.json({ success: true })
  } catch (err) {
    console.error('Coupon delete error:', err)
    return res.status(500).json({ error: 'Failed to delete coupon.' })
  }
}

const validateCoupon = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.json({
        valid: false,
        error: 'Service temporarily unavailable. Try again in a moment.',
      })
    }
    const { code, subtotal } = req.body || {}
    const sub = Number(subtotal)
    if (!code || (sub !== 0 && !Number.isFinite(sub))) {
      return res.status(400).json({
        valid: false,
        error: 'Code and subtotal are required.',
      })
    }
    const coupon = await Coupon.findOne({
      code: normalizeCode(code),
    }).lean()
    if (!coupon) {
      return res.json({ valid: false, error: 'Invalid or expired code.' })
    }
    if (!coupon.active) {
      return res.json({ valid: false, error: 'This code is no longer active.' })
    }
    const now = new Date()
    if (coupon.validFrom && new Date(coupon.validFrom) > now) {
      return res.json({ valid: false, error: 'This code is not yet valid.' })
    }
    if (coupon.validUntil && new Date(coupon.validUntil) < now) {
      return res.json({ valid: false, error: 'This code has expired.' })
    }
    if (
      coupon.maxUses != null &&
      coupon.maxUses > 0 &&
      (coupon.usedCount || 0) >= coupon.maxUses
    ) {
      return res.json({ valid: false, error: 'This code has reached its use limit.' })
    }
    if (coupon.minOrder != null && coupon.minOrder > 0 && sub < coupon.minOrder) {
      return res.json({
        valid: false,
        error: `Minimum order amount is ₹${coupon.minOrder}.`,
      })
    }
    let discount = 0
    if (coupon.type === 'percentage') {
      discount = Math.round((sub * Number(coupon.value)) / 100)
    } else {
      discount = Math.min(Number(coupon.value), sub)
    }
    if (discount <= 0) {
      return res.json({ valid: false, error: 'Invalid or expired code.' })
    }
    return res.json({
      valid: true,
      code: coupon.code,
      discount,
      type: coupon.type,
      value: coupon.value,
    })
  } catch (err) {
    console.error('Coupon validate error:', err)
    return res.status(500).json({ valid: false, error: 'Failed to validate code.' })
  }
}

export {
  listCoupons,
  getAvailableCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
}
