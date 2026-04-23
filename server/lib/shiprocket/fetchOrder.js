import { shiprocketCheckoutHeaders } from './hmac.js'

const DEFAULT_DETAILS_URL =
  process.env.SHIPROCKET_ORDER_DETAILS_URL ||
  'https://fastrr-api-dev.pickrr.com/api/v1/custom-platform-order/details'

/**
 * Optional: fetch normalized order details from Shiprocket / Fastrr.
 */
export async function fetchShiprocketCheckoutOrder(orderId) {
  const payload = {
    order_id: orderId,
    timestamp: new Date().toISOString(),
  }
  const body = JSON.stringify(payload)
  const res = await fetch(DEFAULT_DETAILS_URL, {
    method: 'POST',
    headers: shiprocketCheckoutHeaders(body),
    body,
  })
  if (!res.ok) {
    throw new Error(`Failed to fetch order: ${await res.text()}`)
  }
  return res.json()
}
