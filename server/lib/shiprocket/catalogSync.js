import { shiprocketCheckoutHeaders } from './hmac.js'

const BASE_URL =
  String(process.env.SHIPROCKET_CHECKOUT_API_BASE || '').trim() ||
  'https://checkout-api.shiprocket.com'

/**
 * Push single product JSON to Shiprocket Checkout webhook (after admin create/update).
 */
export async function syncProductToShiprocket(productPayload) {
  const body = JSON.stringify(productPayload)
  const res = await fetch(`${BASE_URL}/wh/v1/custom/product`, {
    method: 'POST',
    headers: shiprocketCheckoutHeaders(body),
    body,
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Shiprocket product sync failed: ${err}`)
  }
  return res.json().catch(() => ({}))
}

export async function syncCollectionToShiprocket(collectionPayload) {
  const body = JSON.stringify(collectionPayload)
  const res = await fetch(`${BASE_URL}/wh/v1/custom/collection`, {
    method: 'POST',
    headers: shiprocketCheckoutHeaders(body),
    body,
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Shiprocket collection sync failed: ${err}`)
  }
  return res.json().catch(() => ({}))
}
