import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema(
  {
    productSlug: { type: String, trim: true, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    content: { type: String, trim: true, required: true },
    imageUrl: { type: String, trim: true },
    authorName: { type: String, trim: true },
    isPinned: { type: Boolean, default: false },
    replyText: { type: String, trim: true },
    repliedAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
)

reviewSchema.index({ productSlug: 1, isDeleted: 1 })
reviewSchema.index({ isPinned: -1, createdAt: -1 })

const Review =
  mongoose.models.Review || mongoose.model('Review', reviewSchema)

export default Review
