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
    tags: [{ type: String, trim: true }],
    published: { type: Boolean, default: true },
  },
  { timestamps: true, suppressReservedKeysWarning: true },
)

const Recipe = mongoose.models.Recipe || mongoose.model('Recipe', recipeSchema)

export default Recipe

