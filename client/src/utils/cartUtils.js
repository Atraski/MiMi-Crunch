/** Max total weight per product (same slug) in cart, in kg */
export const MAX_WEIGHT_PER_PRODUCT_KG = 10

/**
 * Parse weight string to kg. Handles "500g", "1kg", "1KG", "250g", "1.5kg", etc.
 * @param {string} weightStr - e.g. "500g", "1kg"
 * @returns {number} weight in kg, or 0 if unparseable
 */
export function parseWeightToKg(weightStr) {
  if (!weightStr || typeof weightStr !== 'string') return 0
  const s = weightStr.trim().toLowerCase().replace(/\s/g, '')
  const gMatch = s.match(/^([\d.]+)\s*g$/)
  const kgMatch = s.match(/^([\d.]+)\s*kg$/)
  if (gMatch) return Math.max(0, Number(gMatch[1]) / 1000)
  if (kgMatch) return Math.max(0, Number(kgMatch[1]))
  // fallback: if only number, assume kg
  const num = parseFloat(s.replace(/[^0-9.]/g, ''), 10)
  if (Number.isFinite(num)) {
    if (s.includes('g')) return num / 1000
    return num
  }
  return 0
}

/**
 * Get product slug from cart item id (format "slug:weight" or just "slug").
 * @param {object} item - cart item with id
 * @returns {string}
 */
export function getProductSlugFromCartItem(item) {
  if (!item?.id) return ''
  return item.id.includes(':') ? item.id.split(':')[0] : item.id
}

/**
 * Total weight in kg for a single product (all variants) in cart.
 * @param {array} cart - cart array
 * @param {string} productSlug - product slug
 * @returns {number}
 */
export function getCartWeightKgForProduct(cart, productSlug) {
  if (!Array.isArray(cart) || !productSlug) return 0
  return cart.reduce((sum, item) => {
    if (getProductSlugFromCartItem(item) !== productSlug) return sum
    const w = parseWeightToKg(item.size || item.weight || '')
    return sum + (item.qty || 0) * w
  }, 0)
}

/**
 * If we add one more unit of variantWeightStr, would it exceed limit for this product?
 * @param {array} cart
 * @param {string} productSlug
 * @param {string} variantWeightStr - e.g. "500g"
 * @param {number} addQty - usually 1
 * @returns {boolean}
 */
export function wouldExceedWeightLimit(cart, productSlug, variantWeightStr, addQty = 1) {
  const current = getCartWeightKgForProduct(cart, productSlug)
  const addKg = parseWeightToKg(variantWeightStr) * addQty
  return current + addKg > MAX_WEIGHT_PER_PRODUCT_KG
}
