import mongoose from 'mongoose'

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, trim: true, required: true, uppercase: true },
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage',
    },
    value: { type: Number, required: true, min: 0 },
    minOrder: { type: Number, min: 0 },
    maxUses: { type: Number, min: 0 },
    usedCount: { type: Number, default: 0 },
    validFrom: { type: Date },
    validUntil: { type: Date },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
)

const Coupon =
  mongoose.models.Coupon || mongoose.model('Coupon', couponSchema)

export default Coupon
