/**
 * Stable numeric IDs for Shiprocket Checkout catalog (matches client utils/shiprocketIds.js).
 */
export function mongoObjectIdToShiprocketNumeric(oid) {
  if (oid == null || oid === '') return 1
  const hex = String(oid).replace(/[^0-9a-f]/gi, '')
  if (hex.length < 6) return 1
  const n = parseInt(hex.slice(-15), 16)
  const m = Number.isFinite(n) ? n % 2147483647 : 1
  return m > 0 ? m : 1
}

function parseWeightToKg(weightStr) {
  if (!weightStr || typeof weightStr !== 'string') return 0
  const s = weightStr.trim().toLowerCase().replace(/\s/g, '')
  const gMatch = s.match(/^([\d.]+)\s*g$/)
  const kgMatch = s.match(/^([\d.]+)\s*kg$/)
  if (gMatch) return Math.max(0, Number(gMatch[1]) / 1000)
  if (kgMatch) return Math.max(0, Number(kgMatch[1]))
  const num = parseFloat(String(weightStr).replace(/[^0-9.]/g, ''), 10)
  return Number.isFinite(num) ? Math.max(num, 0.01) : 0.25
}

function emptyImage() {
  return { src: '' }
}

function isoUpdatedAt(doc) {
  const d = doc?.updatedAt ? new Date(doc.updatedAt) : new Date()
  return d.toISOString()
}

/**
 * Map Mongo lean product → Shiprocket catalog product shape (all keys present).
 */
export function mapProductToShiprocket(product) {
  const vendor = String(
    process.env.SHIPROCKET_CATALOG_VENDOR || process.env.STORE_NAME || 'MiMi Crunch',
  )
  const updated_at = isoUpdatedAt(product)
  const mainImg =
    Array.isArray(product.images) && product.images[0]
      ? { src: String(product.images[0]) }
      : emptyImage()

  let variants = Array.isArray(product.variants) ? [...product.variants] : []

  if (variants.length === 0) {
    variants = [
      {
        _id: `synthetic-${String(product._id)}`,
        weight: String(product.weight || ''),
        price: Number(product.price ?? 0),
        stock: 0,
        sku: `${product.slug || 'sku'}-default`,
        images: product.images || [],
      },
    ]
  }

  const mappedVariants = variants.map((v, idx) => {
    const synthetic = String(v._id || '').startsWith('synthetic-')
    const vid = synthetic
      ? mongoObjectIdToShiprocketNumeric(`variant:${product._id}`)
      : v._id != null
        ? mongoObjectIdToShiprocketNumeric(v._id)
        : mongoObjectIdToShiprocketNumeric(`${product._id}:${idx}`)
    const vImg =
      Array.isArray(v.images) && v.images[0]
        ? { src: String(v.images[0]) }
        : mainImg
    const qty = Number(v.stock ?? 0)
    const priceNum = Number(v.price ?? product.price ?? 0)
    return {
      id: vid,
      title: String(v.weight || `Variant ${idx + 1}`),
      price: priceNum.toFixed(2),
      quantity: qty,
      sku: String(v.sku || `${product.slug}-${String(v.weight || idx).replace(/\s/g, '')}` || `SKU-${idx}`),
      updated_at,
      image: vImg,
      weight: parseWeightToKg(String(v.weight || '')) || 0.25,
    }
  })

  const bodyHtml = product.description ? `<p>${String(product.description)}</p>` : '<p></p>'

  return {
    id: mongoObjectIdToShiprocketNumeric(product._id),
    title: String(product.title || product.name || ''),
    body_html: bodyHtml,
    vendor,
    product_type: String(product.category || product.collection || ''),
    updated_at,
    status: product.isActive === false ? 'draft' : 'active',
    variants: mappedVariants,
    image: mainImg,
  }
}

export function mapCollectionToShiprocket(collection) {
  const updated_at = isoUpdatedAt(collection)
  const img =
    collection.image && String(collection.image).trim()
      ? { src: String(collection.image) }
      : emptyImage()
  return {
    id: mongoObjectIdToShiprocketNumeric(collection._id),
    title: String(collection.title || ''),
    body_html: collection.description ? `<p>${String(collection.description)}</p>` : '<p></p>',
    updated_at,
    image: img,
  }
}
