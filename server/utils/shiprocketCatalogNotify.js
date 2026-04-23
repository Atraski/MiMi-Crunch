import { getShiprocketCheckoutCredentials } from '../lib/shiprocket/hmac.js'

/**
 * Fire-and-forget push to Shiprocket Checkout catalog webhooks when admin changes data.
 * Requires Checkout/Fastrr API key + secret (HMAC).
 */
export async function notifyShiprocketProduct(productLean) {
  const { apiKey, secretKey } = getShiprocketCheckoutCredentials()
  if (!apiKey || !secretKey) return
  const { mapProductToShiprocket } = await import('../lib/shiprocket/catalogMapper.js')
  const { syncProductToShiprocket } = await import('../lib/shiprocket/catalogSync.js')
  await syncProductToShiprocket(mapProductToShiprocket(productLean))
}

export async function notifyShiprocketCollection(collectionLean) {
  const { apiKey, secretKey } = getShiprocketCheckoutCredentials()
  if (!apiKey || !secretKey) return
  const { mapCollectionToShiprocket } = await import('../lib/shiprocket/catalogMapper.js')
  const { syncCollectionToShiprocket } = await import('../lib/shiprocket/catalogSync.js')
  await syncCollectionToShiprocket(mapCollectionToShiprocket(collectionLean))
}
