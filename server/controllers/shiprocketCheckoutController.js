import Product from '../models/Product.js'
import Collection from '../models/Collection.js'
import Order from '../models/Order.js'
import { getNextOrderSequence } from '../models/OrderCounter.js'
import { updateStock } from './productController.js'
import {
  mapProductToShiprocket,
  mapCollectionToShiprocket,
  mongoObjectIdToShiprocketNumeric,
} from '../lib/shiprocket/catalogMapper.js'
import { shiprocketCheckoutHeaders } from '../lib/shiprocket/hmac.js'
import { findProductVariantByShiprocketId } from '../lib/shiprocket/resolveVariant.js'

/** Must match Shiprocket Checkout API host (no trailing slash). */
const CHECKOUT_API_BASE_URL =
  String(process.env.SHIPROCKET_CHECKOUT_API_BASE || '').trim().replace(/\/$/, '') ||
  'https://checkout-api.shiprocket.com'

const ACCESS_TOKEN_PATH =
  String(process.env.SHIPROCKET_CHECKOUT_ACCESS_TOKEN_PATH || '').trim() ||
  '/api/v1/access-token/checkout'

function parseUpstreamError(text) {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function normalizeCartItemsForCheckout(items) {
  if (!Array.isArray(items)) return []
  return items.map((row) => {
    const q = Number(row.quantity ?? row.qty ?? 1) || 1
    const vid = row.variant_id ?? row.variantId ?? row.id
    const n = Number(vid)
    const variant_id = Number.isFinite(n) ? n : String(vid ?? '')
    return { variant_id, quantity: q }
  })
}

/**
 * Body for POST /api/v1/access-token/checkout — keys in stable order for consistent HMAC.
 * Required: cart_data (with items), timestamp. redirect_url is included per Shiprocket integration guides.
 */
function buildAccessTokenRequestBody(normalizedItems, redirectUrl, siteUrl) {
  const redirect_url =
    String(redirectUrl || '').trim() ||
    `${String(siteUrl || '').replace(/\/$/, '')}/order-success`
  return {
    cart_data: {
      items: normalizedItems,
    },
    redirect_url,
    timestamp: new Date().toISOString(),
  }
}

function logShiprocketUpstreamFailure(status, url, requestBody, responseText) {
  const parsed = (() => {
    try {
      return JSON.parse(responseText)
    } catch {
      return responseText
    }
  })()
  const entry = {
    upstreamUrl: url,
    upstreamStatus: status,
    shiprocketResponse: parsed,
    shiprocketResponseRaw: responseText,
    requestBodyLength: requestBody?.length ?? 0,
  }
  if (status === 511) {
    console.error(
      '[Shiprocket Checkout] 511 NETWORK_AUTHENTICATION_REQUIRED / Invalid credentials — full upstream response:',
      JSON.stringify(entry, null, 2),
    )
  } else {
    console.error(
      '[Shiprocket Checkout] access-token upstream error:',
      JSON.stringify(entry, null, 2),
    )
  }
}

const PAGE_DEFAULT = 1
const LIMIT_DEFAULT = 100

function parsePagination(req) {
  const page = Math.max(PAGE_DEFAULT, parseInt(req.query.page, 10) || PAGE_DEFAULT)
  const limit = Math.min(
    100,
    Math.max(1, parseInt(req.query.limit, 10) || LIMIT_DEFAULT),
  )
  const skip = (page - 1) * limit
  return { page, limit, skip }
}

/** GET /api/shiprocket/catalog/products */
export const catalogProducts = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req)
    const filter = {
      $or: [{ isActive: { $exists: false } }, { isActive: true }],
    }
    const total = await Product.countDocuments(filter)
    const rows = await Product.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean()

    const products = rows.map((p) => mapProductToShiprocket(p))
    return res.json({
      products,
      pagination: { page, limit, total },
    })
  } catch (err) {
    console.error('catalogProducts:', err)
    return res.status(500).json({ error: 'Failed to list products.' })
  }
}

async function findCollectionByNumericId(srId) {
  const target = Number(srId)
  if (!Number.isFinite(target)) return null
  const cols = await Collection.find({}).lean()
  return cols.find((c) => mongoObjectIdToShiprocketNumeric(c._id) === target) || null
}

/** GET /api/shiprocket/catalog/collections */
export const catalogCollections = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req)
    const total = await Collection.countDocuments({})
    const rows = await Collection.find({}).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean()
    const collections = rows.map((c) => mapCollectionToShiprocket(c))
    return res.json({
      collections,
      pagination: { page, limit, total },
    })
  } catch (err) {
    console.error('catalogCollections:', err)
    return res.status(500).json({ error: 'Failed to list collections.' })
  }
}

/** GET /api/shiprocket/catalog/collection-products */
export const catalogCollectionProducts = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req)
    const collectionId = req.query.collection_id
    if (!collectionId) {
      return res.status(400).json({ error: 'collection_id is required.' })
    }

    const col = await findCollectionByNumericId(collectionId)
    if (!col) {
      return res.json({
        products: [],
        pagination: { page, limit, total: 0 },
      })
    }

    const slugs = Array.isArray(col.productSlugs) ? col.productSlugs.filter(Boolean) : []
    const filter = {
      slug: { $in: slugs },
      $or: [{ isActive: { $exists: false } }, { isActive: true }],
    }
    const total = await Product.countDocuments(filter)
    const rows = await Product.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean()
    const products = rows.map((p) => mapProductToShiprocket(p))
    return res.json({
      products,
      pagination: { page, limit, total },
    })
  } catch (err) {
    console.error('catalogCollectionProducts:', err)
    return res.status(500).json({ error: 'Failed to list collection products.' })
  }
}

/** POST /api/shiprocket/access-token → proxies to https://checkout-api.shiprocket.com/api/v1/access-token/checkout */
export const postAccessToken = async (req, res) => {
  try {
    const { cartItems, redirectUrl } = req.body || {}
    const siteUrl =
      String(process.env.SITE_URL || '').replace(/\/$/, '') ||
      String(process.env.CLIENT_URL || '').replace(/\/$/, '') ||
      'https://www.mimicrunch.com'

    const normalizedItems = normalizeCartItemsForCheckout(cartItems)
    if (normalizedItems.length === 0) {
      return res.status(400).json({
        error: 'cartItems required',
        detail:
          'Send cartItems: [{ variant_id, quantity }] — variants must exist in catalog.',
      })
    }

    const payload = buildAccessTokenRequestBody(
      normalizedItems,
      redirectUrl,
      siteUrl,
    )

    /** Critical: HMAC is computed over this exact string (same bytes as request body). */
    const body = JSON.stringify(payload)
    const pathPart = ACCESS_TOKEN_PATH.startsWith('/') ? ACCESS_TOKEN_PATH : `/${ACCESS_TOKEN_PATH}`
    const url = `${CHECKOUT_API_BASE_URL}${pathPart}`

    let hdrs
    try {
      hdrs = shiprocketCheckoutHeaders(body)
    } catch (e) {
      return res.status(503).json({
        error: 'Shiprocket Checkout is not configured.',
        detail: e?.message || String(e),
      })
    }

    let srRes = await fetch(url, {
      method: 'POST',
      headers: hdrs,
      body,
    })

    if (!srRes.ok) {
      let errText = await srRes.text()
      logShiprocketUpstreamFailure(srRes.status, url, body, errText)

      const looksAuthFail =
        srRes.status === 401 ||
        srRes.status === 403 ||
        srRes.status === 511 ||
        /invalid credentials|authentication required/i.test(errText)

      if (looksAuthFail) {
        console.warn(
          '[Shiprocket Checkout] Retrying with raw X-Api-Key (no "Bearer " prefix)',
        )
        try {
          const hdrsRaw = shiprocketCheckoutHeaders(body, { useBearer: false })
          srRes = await fetch(url, {
            method: 'POST',
            headers: hdrsRaw,
            body,
          })
          if (!srRes.ok) {
            errText = await srRes.text()
            logShiprocketUpstreamFailure(srRes.status, url, body, errText)
          }
        } catch (e) {
          console.warn('[Shiprocket Checkout] Raw-key retry skipped:', e?.message)
        }
      }

      if (!srRes.ok) {
        const detail = parseUpstreamError(errText)
        const is511 = srRes.status === 511
        const clientPayload = {
          error: is511
            ? 'Shiprocket authentication failed (511 — invalid API key / secret or wrong header format)'
            : 'Token generation failed (upstream rejected the request)',
          upstreamStatus: srRes.status,
          shiprocketBody: detail,
          hint:
            'Use API Key + Shared Secret from Fastrr / SR Checkout dashboard (fastrr-dashboard.pickrr.com → Settings → Platform). Must match checkout-api.shiprocket.com — not Shiprocket Settings → API → Create API User.',
        }
        if (process.env.NODE_ENV !== 'production' || process.env.SHIPROCKET_DEBUG === '1') {
          clientPayload.shiprocketResponseRaw = errText
          clientPayload.requestUrl = url
        }
        return res.status(502).json(clientPayload)
      }
    }

    const data = await srRes.json()
    const token = data?.result?.token ?? data?.token ?? data?.data?.token
    const orderId =
      data?.result?.order_id ??
      data?.result?.orderId ??
      data?.order_id ??
      null

    if (!token) {
      return res.status(502).json({
        error: 'Invalid token response',
        detail: JSON.stringify(data).slice(0, 500),
      })
    }

    return res.json({ token, orderId })
  } catch (err) {
    console.error('postAccessToken:', err)
    return res.status(500).json({ error: 'Could not generate access token.' })
  }
}

function normalizeWebhookPayload(payload) {
  const order_id =
    payload.order_id ??
    payload.orderId ??
    payload.order_id_shiprocket ??
    ''
  const cart_data = payload.cart_data ?? payload.cartData ?? {}
  const items = cart_data.items ?? payload.items ?? []
  const status = String(payload.status ?? payload.order_status ?? '').toUpperCase()
  const phone =
    payload.phone ??
    payload.customer_phone ??
    payload.mobile ??
    ''
  const email = payload.email ?? payload.customer_email ?? ''
  const payment_type = payload.payment_type ?? payload.payment_mode ?? ''
  const total_amount_payable =
    payload.total_amount_payable ??
    payload.total ??
    payload.amount ??
    0

  const shipping = payload.shipping ?? payload.shipping_address ?? {}
  const fullName =
    shipping.full_name ??
    shipping.fullName ??
    payload.customer_name ??
    ''
  const addressLine1 =
    shipping.address ??
    shipping.address_line1 ??
    shipping.addressLine1 ??
    ''
  const city = shipping.city ?? ''
  const pincode = shipping.pincode ?? shipping.zip ?? ''

  return {
    order_id,
    items,
    status,
    phone,
    email,
    payment_type,
    total_amount_payable,
    shippingAddress: {
      fullName: fullName || 'Customer',
      phone: String(phone || ''),
      email: String(email || ''),
      addressLine1: addressLine1 || '',
      city: String(city || ''),
      pincode: String(pincode || ''),
    },
    raw: payload,
  }
}

/**
 * POST /api/shiprocket/order-webhook
 * Boilerplate: Shiprocket POSTs order events here — acknowledge quickly with 200 JSON.
 * Extend `onShiprocketOrderReceived` below for your DB / email / fulfilment logic.
 */
export const postOrderWebhook = async (req, res) => {
  try {
    const rawBody = req.body || {}
    const payload = normalizeWebhookPayload(rawBody)

    /** Boilerplate logging — order_id + customer contact for debugging / support */
    console.log('[Shiprocket Webhook] inbound', {
      order_id: payload.order_id || null,
      phone: payload.phone || payload.shippingAddress?.phone || null,
      email: payload.email || payload.shippingAddress?.email || null,
      status: payload.status || null,
      itemCount: Array.isArray(payload.items) ? payload.items.length : 0,
    })

    if (!payload.order_id) {
      return res.status(400).json({ error: 'Missing order reference.' })
    }

    const dup = await Order.findOne({
      shiprocketCheckoutOrderId: String(payload.order_id),
    }).lean()
    if (dup) {
      return res.json({ success: true, duplicate: true })
    }

    const st = payload.status ? String(payload.status).toUpperCase() : ''
    if (st && ['FAILED', 'CANCELLED', 'ABANDONED', 'ABORTED'].includes(st)) {
      console.warn(`[Shiprocket Checkout] order ${payload.order_id} status: ${payload.status}`)
      return res.json({ received: true })
    }

    const lineItems = []
    for (const row of payload.items) {
      const variantId = row.variant_id ?? row.variantId ?? row.id
      const qty = Number(row.quantity ?? row.qty ?? 1) || 1
      const resolved = await findProductVariantByShiprocketId(variantId)
      if (!resolved) {
        console.error('[Shiprocket Checkout] Unknown variant_id:', variantId)
        return res.status(400).json({
          error: `Unknown variant_id: ${variantId}`,
        })
      }

      const { product, variant } = resolved
      const slug = product.slug || ''
      const weightStr = String(variant.weight || '')
      const productId = slug && weightStr ? `${slug}:${weightStr}` : String(product._id)

      lineItems.push({
        productId,
        name: String(product.name || product.title || 'Product'),
        qty,
        price: Number(variant.price ?? product.price ?? 0),
        weight: weightStr,
      })
    }

    if (lineItems.length === 0) {
      return res.status(400).json({ error: 'No line items in webhook.' })
    }

    await updateStock(lineItems)

    const itemsSubtotal = lineItems.reduce(
      (sum, item) => sum + item.qty * item.price,
      0,
    )
    const safeTotal = Number(payload.total_amount_payable) || itemsSubtotal

    const pm = String(payload.payment_type || '').toUpperCase()
    const paymentMethod =
      pm.includes('COD') || pm.includes('CASH') ? 'COD' : 'ONLINE'
    const paymentStatus =
      paymentMethod === 'COD' ? 'COD' : 'Paid'

    const seq = await getNextOrderSequence()
    const humanOrderId = `MiMi-${seq}`

    await Order.create({
      orderId: humanOrderId,
      userId: null,
      items: lineItems.map(({ productId, name, qty, price, weight }) => ({
        productId,
        name,
        qty,
        price,
        weight: weight || '',
      })),
      shippingAddress: {
        fullName: payload.shippingAddress.fullName,
        phone: payload.shippingAddress.phone,
        email: payload.shippingAddress.email || '',
        addressLine1: payload.shippingAddress.addressLine1,
        city: payload.shippingAddress.city,
        pincode: payload.shippingAddress.pincode,
      },
      subtotal: itemsSubtotal,
      discountAmount: 0,
      deliveryFee: 0,
      totalAmount: safeTotal,
      paymentMethod,
      paymentStatus,
      status: 'Confirmed',
      shiprocketCheckoutOrderId: String(payload.order_id),
      shippingPartner: {
        partner: 'shiprocket-checkout',
        synced: false,
        lastError: '',
      },
    })

    console.log(`[Shiprocket Checkout] Order recorded: ${humanOrderId} (sr ${payload.order_id})`)
    return res.status(200).json({
      success: true,
      orderId: humanOrderId,
      shiprocketOrderId: String(payload.order_id),
    })
  } catch (err) {
    console.error('[Shiprocket Webhook] Error:', err?.stack || err?.message || err)
    return res.status(500).json({ error: 'Order processing failed.' })
  }
}

/** POST /api/shiprocket/loyalty/get-points */
export const loyaltyGetPoints = async (req, res) => {
  const mobile = req.body?.mobile_number ?? ''
  return res.json({
    success: true,
    mobile_number: String(mobile || ''),
    loyalty_points: 0,
    transactional_points: 0,
    message: 'Not configured — stub response.',
  })
}

/** POST /api/shiprocket/loyalty/block-points */
export const loyaltyBlockPoints = async (req, res) => {
  return res.json({
    success: true,
    blocked: true,
    message: 'Not configured — stub response.',
  })
}

/** POST /api/shiprocket/loyalty/unblock-points */
export const loyaltyUnblockPoints = async (req, res) => {
  return res.json({
    success: true,
    unblocked: true,
    message: 'Not configured — stub response.',
  })
}
