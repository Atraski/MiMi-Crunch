const isFbqReady = () => typeof window !== 'undefined' && typeof window.fbq === 'function'

export const trackMetaEvent = (eventName, payload = {}) => {
  if (!isFbqReady()) return
  window.fbq('track', eventName, payload)
}

export const buildMetaContentsFromCart = (cart = []) =>
  (cart || []).map((item) => ({
    id: item.slug || item.id || item._id || item.name || 'item',
    quantity: Number(item.qty) || 1,
    item_price: Number(item.price) || 0,
  }))

export const buildMetaContentFromProduct = (product = {}) => ({
  content_ids: [product.slug || product.id || product._id || product.name || 'product'],
  content_name: product.name || 'Product',
  content_type: 'product',
  value: Number(product.price) || 0,
  currency: 'INR',
})
