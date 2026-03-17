import mongoose from 'mongoose'

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, required: true },
    slug: { type: String, trim: true, required: true, unique: true },
    excerpt: { type: String, trim: true },
    contentHtml: { type: String, trim: true },
    coverImage: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    published: { type: Boolean, default: false },
    publishedAt: { type: Date },
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
  },
  { timestamps: true, suppressReservedKeysWarning: true },
)

const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema)

export default Blog

