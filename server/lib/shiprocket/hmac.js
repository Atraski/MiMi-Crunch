import crypto from 'crypto'

/**
 * Shiprocket Checkout: X-Api-HMAC-SHA256 = Base64( HMAC-SHA256(secretKey, rawRequestBody) )
 * The raw body MUST be the exact UTF-8 string sent in the POST body (same bytes as JSON.stringify output).
 */
export function generateHMAC(body, secretKey) {
  const sk = String(secretKey || '')
  const raw = typeof body === 'string' ? body : JSON.stringify(body ?? '')
  const h = crypto.createHmac('sha256', sk).update(raw, 'utf8')
  const enc = String(process.env.SHIPROCKET_CHECKOUT_HMAC_ENCODING || 'base64')
    .toLowerCase()
    .trim()
  if (enc === 'hex') return h.digest('hex')
  return h.digest('base64')
}

/**
 * Resolve Checkout API key + secret (aliases for different dashboard labels).
 */
export function getShiprocketCheckoutCredentials() {
  const apiKey = String(
    process.env.SHIPROCKET_API_KEY ||
      process.env.SHIPROCKET_CHECKOUT_API_KEY ||
      '',
  ).trim()
  const secretKey = String(
    process.env.SHIPROCKET_SECRET_KEY ||
      process.env.SHIPROCKET_CHECKOUT_SECRET_KEY ||
      '',
  ).trim()
  return { apiKey, secretKey }
}

export function shiprocketCheckoutHeaders(body = '', options = {}) {
  const { apiKey: keyOverride, useBearer } = options
  const { apiKey: envKey, secretKey } = getShiprocketCheckoutCredentials()
  const apiKey = keyOverride != null ? String(keyOverride).trim() : envKey

  if (!apiKey || !secretKey) {
    throw new Error(
      'Missing credentials: set SHIPROCKET_API_KEY + SHIPROCKET_SECRET_KEY (Checkout/Fastrr keys — NOT the Shipping API user email/password).',
    )
  }
  const raw = typeof body === 'string' ? body : ''
  const headerOverride = String(process.env.SHIPROCKET_CHECKOUT_X_API_KEY_HEADER || '').trim()
  const rawKeyOnlyEnv = String(process.env.SHIPROCKET_CHECKOUT_X_API_KEY_RAW || '') === '1'
  const bearerEnv = String(process.env.SHIPROCKET_CHECKOUT_USE_BEARER_PREFIX || '')
    .trim()
  let preferBearer
  if (useBearer === true) preferBearer = true
  else if (useBearer === false) preferBearer = false
  else {
    preferBearer =
      bearerEnv !== '0' &&
      bearerEnv !== 'false' &&
      !rawKeyOnlyEnv
  }

  const xApiKey = headerOverride
    ? headerOverride
    : preferBearer
      ? `Bearer ${apiKey}`
      : apiKey

  return {
    'Content-Type': 'application/json',
    'X-Api-Key': xApiKey,
    'X-Api-HMAC-SHA256': generateHMAC(raw, secretKey),
  }
}
