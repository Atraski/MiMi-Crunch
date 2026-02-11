import mongoose from 'mongoose'

const productFaqSchema = new mongoose.Schema(
  {
    question: { type: String, trim: true, required: true },
    answer: { type: String, trim: true, required: true },
  },
  { _id: false },
)

const variantSchema = new mongoose.Schema(
  {
    weight: { type: String, trim: true, required: true },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number },
    images: [{ type: String, trim: true }],
  },
  { _id: false },
)

const productSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    title: { type: String, trim: true, required: true },
    slug: { type: String, trim: true, required: true, unique: true },
    weight: { type: String, trim: true, required: true },
    weightOptions: {
      type: [{ type: String, trim: true }],
      default: ['500g', '1000g'],
    },
    selectorCount: { type: Number, default: 1 },
    ctaPrimary: {
      label: { type: String, trim: true },
      href: { type: String, trim: true },
    },
    ctaSecondary: {
      label: { type: String, trim: true },
      href: { type: String, trim: true },
    },
    category: { type: String, trim: true },
    description: { type: String, trim: true },
    additionalInfo: { type: String, trim: true },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number },
    collection: { type: String, trim: true },
    keywords: [{ type: String, trim: true }],
    tags: [{ type: String, trim: true }],
    images: [{ type: String, trim: true }],
    variants: { type: [variantSchema], default: [] },
    isActive: { type: Boolean, default: true },
    inventory: {
      stock: { type: Number, default: 0 },
      lowStockThreshold: { type: Number, default: 5 },
    },
    faqs: { type: [productFaqSchema], default: [] },
  },
  { timestamps: true, suppressReservedKeysWarning: true },
)

const Product = mongoose.models.Product || mongoose.model('Product', productSchema)

export default Product
