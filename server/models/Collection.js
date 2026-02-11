import mongoose from 'mongoose'

const collectionSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, required: true },
    slug: { type: String, trim: true, required: true, unique: true },
    description: { type: String, trim: true },
    image: { type: String, trim: true },
    productSlugs: [{ type: String, trim: true }],
  },
  { timestamps: true, suppressReservedKeysWarning: true },
)

const Collection =
  mongoose.models.Collection || mongoose.model('Collection', collectionSchema)

export default Collection

