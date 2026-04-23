import Product from '../../models/Product.js'
import { mongoObjectIdToShiprocketNumeric } from './catalogMapper.js'

/**
 * Find product + variant for a Shiprocket catalog variant id (numeric as in API).
 */
export async function findProductVariantByShiprocketId(shrVariantId) {
  const target = Number(shrVariantId)
  if (!Number.isFinite(target) || target <= 0) return null

  const products = await Product.find({})
    .select('slug name title variants images price weight')
    .lean()

  for (const p of products) {
    const vars = Array.isArray(p.variants) ? p.variants : []
    if (vars.length === 0) {
      const syntheticId = mongoObjectIdToShiprocketNumeric(`variant:${p._id}`)
      if (syntheticId === target) {
        return {
          product: p,
          variant: {
            weight: String(p.weight || ''),
            price: Number(p.price ?? 0),
            stock: 0,
            sku: `${p.slug || 'p'}-default`,
            images: Array.isArray(p.images) ? p.images : [],
          },
          variantIndex: 0,
        }
      }
      continue
    }
    for (let i = 0; i < vars.length; i++) {
      const v = vars[i]
      const vid =
        v._id != null
          ? mongoObjectIdToShiprocketNumeric(v._id)
          : mongoObjectIdToShiprocketNumeric(`${p._id}:${i}`)
      if (vid === target) {
        return { product: p, variant: v, variantIndex: i }
      }
    }
  }
  return null
}
