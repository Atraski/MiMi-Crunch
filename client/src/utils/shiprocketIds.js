import { getProductSlugFromCartItem } from './cartUtils'

/**
 * Must stay in sync with server/lib/shiprocket/catalogMapper.js (mongoObjectIdToShiprocketNumeric).
 */
export function mongoObjectIdToShiprocketNumeric(oid) {
  if (oid == null || oid === '') return 1
  const hex = String(oid).replace(/[^0-9a-f]/gi, '')
  if (hex.length < 6) return 1
  const n = parseInt(hex.slice(-15), 16)
  const m = Number.isFinite(n) ? n % 2147483647 : 1
  return m > 0 ? m : 1
}

/**
 * Build `{ variant_id, quantity }[]` for Shiprocket Checkout access-token API.
 */
export function buildShiprocketCheckoutCartItems(cart, products) {
  if (!Array.isArray(cart) || !Array.isArray(products)) return []
  const bySlug = new Map(products.map((p) => [p.slug, p]))
  const out = []
  for (const item of cart) {
    const slug = getProductSlugFromCartItem(item)
    const p = bySlug.get(slug)
    if (!p?._id) continue
    const weightStr = String(item.size || item.weight || '').trim()
    const norm = (w) => (w || '').trim().toLowerCase()
    const variant = (p.variants || []).find((v) => norm(v.weight) === norm(weightStr))
    if (!variant?._id) continue
    const vid = mongoObjectIdToShiprocketNumeric(variant._id)
    out.push({
      variant_id: String(vid),
      quantity: Number(item.qty) || 1,
    })
  }
  return out
}
