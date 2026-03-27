import mongoose from 'mongoose'

const recipeSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, required: true },
    slug: { type: String, trim: true, required: true, unique: true },
    excerpt: { type: String, trim: true },
    contentHtml: { type: String, trim: true },
    coverImage: { type: String, trim: true },
    gallery: [{ type: String, trim: true }],
    videoUrl: { type: String, trim: true },
    productSlug: { type: String, trim: true }, // linked product
    time: { type: String, trim: true }, // e.g. "20 mins", "30 min" – shown on recipe cards
    tags: [{ type: String, trim: true }],
    source: {
      type: String,
      enum: ['official', 'community'],
      default: 'official',
    },
    approvalStatus: {
      type: String,
      enum: ['approved', 'pending', 'rejected'],
      default: 'approved',
    },
    submittedBy: { type: String, trim: true },
    submitterEmail: { type: String, trim: true },
    published: { type: Boolean, default: true },
    metaTitle: { type: String, trim: true, default: '' },
    metaDescription: { type: String, trim: true, default: '' },
    schemaMarkup: { type: String, trim: true, default: '' },
  },
  { timestamps: true, suppressReservedKeysWarning: true },
)

const Recipe = mongoose.models.Recipe || mongoose.model('Recipe', recipeSchema)

export default Recipe

