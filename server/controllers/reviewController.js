import Review from '../models/Review.js'
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js'

/** Public upload signature for review images only (folder: reviews). No auth required. */
const getReviewUploadSignature = (req, res) => {
  if (!isCloudinaryConfigured) {
    return res.status(500).json({ error: 'Upload not configured.' })
  }
  const timestamp = Math.round(Date.now() / 1000)
  const paramsToSign = { timestamp, folder: 'reviews' }
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET,
  )
  return res.json({
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  })
}

const createReview = async (req, res) => {
  try {
    const { productSlug, rating, content, imageUrl, profileImage, productImage, authorName } = req.body || {}
    const name = authorName ? String(authorName).trim() : ''
    const text = content ? String(content).trim() : ''
    const profile = profileImage ? String(profileImage).trim() : ''
    const product = productImage ? String(productImage).trim() : (imageUrl ? String(imageUrl).trim() : '')

    if (!productSlug) {
      return res.status(400).json({ error: 'Product is required.' })
    }
    if (!name) {
      return res.status(400).json({ error: 'Name is required.' })
    }
    const hasContent = !!text
    const hasProfile = !!profile
    const hasProduct = !!product
    if (!hasContent && !hasProfile && !hasProduct) {
      return res.status(400).json({
        error: 'Please add at least one: profile photo, product photo, or text review.',
      })
    }

    const numRating = Math.min(5, Math.max(1, Number(rating) || 1))
    const doc = await Review.create({
      productSlug: String(productSlug).trim(),
      rating: numRating,
      content: text || undefined,
      imageUrl: product || undefined,
      profileImage: profile || undefined,
      productImage: product || undefined,
      authorName: name,
    })
    return res.status(201).json(doc)
  } catch (err) {
    console.error('Review create error:', err)
    return res.status(500).json({ error: 'Failed to submit review.' })
  }
}

/** GET /api/reviews?productSlug=xxx — public: non-deleted; pinned = lifelong, else only last 7 days */
const listByProduct = async (req, res) => {
  try {
    const { productSlug } = req.query
    if (!productSlug) {
      return res.status(400).json({ error: 'productSlug is required.' })
    }
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const list = await Review.find({
      productSlug: String(productSlug).trim(),
      isDeleted: { $ne: true },
      $or: [
        { isPinned: true },
        { createdAt: { $gte: sevenDaysAgo } },
      ],
    })
      .sort({ isPinned: -1, createdAt: -1 })
      .lean()
    return res.json(list)
  } catch (err) {
    console.error('Review list error:', err)
    return res.status(500).json({ error: 'Failed to load reviews.' })
  }
}

/** GET /api/reviews/all — admin: all reviews grouped or flat with productSlug */
const listAll = async (req, res) => {
  try {
    const list = await Review.find({})
      .sort({ productSlug: 1, isPinned: -1, createdAt: -1 })
      .lean()
    return res.json(list)
  } catch (err) {
    console.error('Review listAll error:', err)
    return res.status(500).json({ error: 'Failed to load reviews.' })
  }
}

/** PATCH /api/reviews/:id — reply, pin, delete */
const updateReview = async (req, res) => {
  try {
    const { id } = req.params
    const { replyText, isPinned, isDeleted } = req.body || {}
    const updates = {}
    if (typeof replyText !== 'undefined') {
      updates.replyText = replyText ? String(replyText).trim() : ''
      updates.repliedAt = updates.replyText ? new Date() : null
    }
    if (typeof isPinned === 'boolean') updates.isPinned = isPinned
    if (typeof isDeleted === 'boolean') updates.isDeleted = isDeleted
    const doc = await Review.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true },
    ).lean()
    if (!doc) return res.status(404).json({ error: 'Review not found.' })
    return res.json(doc)
  } catch (err) {
    console.error('Review update error:', err)
    return res.status(500).json({ error: 'Failed to update review.' })
  }
}

export { createReview, listByProduct, listAll, updateReview, getReviewUploadSignature }
