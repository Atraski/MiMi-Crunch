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
    stock: { type: Number, default: 0 },
    sku: { type: String, trim: true, default: '' },
  },
  { _id: true },
)

const productSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    title: { type: String, trim: true, required: true },
    slug: { type: String, trim: true, required: true, unique: true },
    weight: { type: String, trim: true, required: true }, // Default display weight
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
    price: { type: Number, required: true }, // Base price
    compareAtPrice: { type: Number },
    collection: { type: String, trim: true },
    keywords: [{ type: String, trim: true }],
    tags: [{ type: String, trim: true }],
    images: [{ type: String, trim: true }],
    variants: { type: [variantSchema], default: [] }, // Embedded variants
    isActive: { type: Boolean, default: true },
    inventory: {
      // Global stock hata diya, ab sirf threshold rakha hai
      lowStockThreshold: { type: Number, default: 5 },
    },
    faqs: { type: [productFaqSchema], default: [] },
    benefits: { type: String, trim: true, default: '' },
    trust: { type: String, trim: true, default: '' },
    faqContent: { type: String, trim: true, default: '' },
    metaData: { type: String, trim: true, default: '' },
    metaTitle: { type: String, trim: true, default: '' },
    metaDescription: { type: String, trim: true, default: '' },
    schemaMarkup: { type: String, trim: true, default: '' },
  },
  { timestamps: true, suppressReservedKeysWarning: true },
)

const Product = mongoose.models.Product || mongoose.model('Product', productSchema)

export default Product
