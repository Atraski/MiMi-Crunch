import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    password: { type: String }, // hashed; used for email+password login
    emailVerified: { type: Boolean, default: false },
    emailOtp: { type: String },
    emailOtpExpiresAt: { type: Date },
    address: { type: String, trim: true },
    wishlist: [{ type: String, trim: true }],
  },
  { timestamps: true },
)

const User = mongoose.models.User || mongoose.model('User', userSchema)

export default User
