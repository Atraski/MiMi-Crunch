import axios from 'axios'

const SHIPROCKET_URL = 'https://apiv2.shiprocket.in/v1/external'
const FALLBACK_SHIPROCKET_EMAIL = 'customer@mimicrunch.com'

let cachedToken = null
let cachedTokenExpiryMs = 0

const getShiprocketCredentials = () => {
  const email = String(process.env.SHIPROCKET_EMAIL || process.env.SHIPROCKET_API_KEY || '').trim()
  const password = String(
    process.env.SHIPROCKET_PASSWORD || process.env.SHIPROCKET_API_SECRET || '',
  ).trim()
  return { email, password }
}

const getTokenExpiryFromJwt = (token) => {
  try {
    const payloadPart = token.split('.')[1]
    if (!payloadPart) return null
    const decoded = JSON.parse(Buffer.from(payloadPart, 'base64').toString())
    if (!decoded?.exp) return null
    return Number(decoded.exp) * 1000
  } catch {
    return null
  }
}

const getNumeric = (value, fallback = 0) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const getOrderWeightKg = (order) => {
  const fallbackPerUnit = getNumeric(process.env.SHIPROCKET_DEFAULT_ITEM_WEIGHT_KG, 0.25)
  const estimated = Array.isArray(order?.items)
    ? order.items.reduce((sum, item) => sum + getNumeric(item?.qty, 0) * fallbackPerUnit, 0)
    : 0
  return Math.max(estimated || fallbackPerUnit, 0.1)
}

const mapOrderPayload = (order) => {
  const shipping = order?.shippingAddress || {}
  const shippingState = shipping.state || process.env.SHIPROCKET_DEFAULT_STATE || 'West Bengal'
  const shippingPincode = String(shipping.pincode || process.env.SHIPROCKET_DEFAULT_PINCODE || '700001')
  const shippingPhone = String(shipping.phone || process.env.SHIPROCKET_DEFAULT_PHONE || '9999999999')
  const subTotal = getNumeric(order?.subtotal, getNumeric(order?.totalAmount))
  const discount = getNumeric(order?.discountAmount, 0)

  return {
    order_id: order.orderId || `MC-${order._id.toString()}`,
    order_date: new Date(order.createdAt || Date.now()).toISOString().slice(0, 10),
    pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary',
    billing_customer_name: shipping.fullName || 'Customer',
    billing_last_name: '',
    billing_address: shipping.addressLine1 || 'Address not provided',
    billing_address_2: shipping.addressLine2 || '',
    billing_city: shipping.city || process.env.SHIPROCKET_DEFAULT_CITY || 'Kolkata',
    billing_pincode: shippingPincode,
    billing_state: shippingState,
    billing_country: 'India',
    billing_email: shipping.email || FALLBACK_SHIPROCKET_EMAIL,
    billing_phone: shippingPhone,
    shipping_is_billing: true,
    order_items: (order.items || []).map((item, index) => ({
      name: item?.name || `Item ${index + 1}`,
      sku: item?.productId || `sku-${index + 1}`,
      units: getNumeric(item?.qty, 1),
      selling_price: getNumeric(item?.price, 0),
      discount: 0,
      tax: 0,
      hsn: '',
    })),
    payment_method: order.paymentMethod === 'COD' ? 'COD' : 'Prepaid',
    sub_total: subTotal,
    discount,
    shipping_charges: getNumeric(order?.deliveryFee, 0),
    length: getNumeric(process.env.SHIPROCKET_DEFAULT_LENGTH_CM, 15),
    breadth: getNumeric(process.env.SHIPROCKET_DEFAULT_BREADTH_CM, 15),
    height: getNumeric(process.env.SHIPROCKET_DEFAULT_HEIGHT_CM, 10),
    weight: getOrderWeightKg(order),
  }
}

const validateCredentials = () => {
  const { email, password } = getShiprocketCredentials()
  if (!email || !password) {
    return 'Missing Shiprocket credentials (set SHIPROCKET_EMAIL/PASSWORD or SHIPROCKET_API_KEY/SECRET)'
  }
  return null
}

export const getShiprocketToken = async (forceRefresh = false) => {
  const now = Date.now()
  const hasValidCache =
    !forceRefresh && cachedToken && cachedTokenExpiryMs && now < cachedTokenExpiryMs - 2 * 60 * 1000

  if (hasValidCache) {
    return cachedToken
  }

  try {
    const { email, password } = getShiprocketCredentials()
    const response = await axios.post(
      `${SHIPROCKET_URL}/auth/login`,
      {
        email,
        password,
      },
      { timeout: 20000 },
    )

    const token = response?.data?.token
    if (!token) throw new Error('Token not found in response')

    cachedToken = token
    cachedTokenExpiryMs = getTokenExpiryFromJwt(token) || now + 23 * 60 * 60 * 1000
    return token
  } catch (error) {
    console.error('Shiprocket auth error:', error.response?.data || error.message)
    return null
  }
}

export const syncOrderToShiprocket = async (order) => {
  try {
    if (!order?._id) {
      return { success: false, error: 'Order payload missing _id' }
    }

    const credentialError = validateCredentials()
    if (credentialError) {
      return { success: false, error: credentialError }
    }

    const token = await getShiprocketToken()
    if (!token) {
      return { success: false, error: 'Shiprocket authentication failed' }
    }

    const payload = mapOrderPayload(order)
    const response = await axios.post(`${SHIPROCKET_URL}/orders/create/adhoc`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      timeout: 25000,
    })

    const data = response?.data || {}
    const extractedShipmentId = data?.shipment_id || data?.shipment_details?.id || null
    const extractedOrderId = data?.order_id || data?.order_details?.id || null
    const apiMessage = String(data?.message || '').trim()
    const looksLikeErrorMessage =
      apiMessage.toLowerCase().includes('wrong pickup location') ||
      apiMessage.toLowerCase().includes('error')

    // Shiprocket can return 200 with a message but without shipment_id.
    // Treat that as failure so UI can show the exact reason.
    if (!extractedShipmentId || looksLikeErrorMessage) {
      return {
        success: false,
        error: apiMessage || 'Shiprocket order create failed (missing shipment_id)',
        data: {
          raw: data,
          shiprocketOrderId: extractedOrderId,
          shipmentId: extractedShipmentId,
        },
      }
    }

    return {
      success: true,
      data: {
        raw: data,
        shiprocketOrderId: extractedOrderId,
        shipmentId: extractedShipmentId,
        awbCode: data?.awb_code || data?.shipment_details?.awb_code || null,
        courierName: data?.courier_name || data?.shipment_details?.courier_name || null,
      },
    }
  } catch (error) {
    console.error('Shiprocket create order error:', error.response?.data || error.message)
    return {
      success: false,
      error: error.response?.data || error.message || 'External API error',
    }
  }
}

const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
})

export const assignAwbToShipment = async (shipmentId) => {
  try {
    const credentialError = validateCredentials()
    if (credentialError) return { success: false, error: credentialError }

    const token = await getShiprocketToken()
    if (!token) return { success: false, error: 'Shiprocket authentication failed' }

    const response = await axios.post(
      `${SHIPROCKET_URL}/courier/assign/awb`,
      { shipment_id: Number(shipmentId) },
      {
        headers: getAuthHeaders(token),
        timeout: 25000,
      },
    )

    const data = response?.data || {}
    return {
      success: true,
      data: {
        raw: data,
        awbCode: data?.response?.data?.awb_code || data?.awb_code || null,
        courierName:
          data?.response?.data?.courier_name || data?.courier_name || data?.response?.data?.courier || null,
        courierCompanyId:
          data?.response?.data?.courier_company_id || data?.courier_company_id || null,
      },
    }
  } catch (error) {
    console.error('Shiprocket AWB assign error:', error.response?.data || error.message)
    return {
      success: false,
      error: error.response?.data || error.message || 'Failed to assign AWB',
    }
  }
}

export const requestPickupForShipment = async (shipmentId) => {
  try {
    const credentialError = validateCredentials()
    if (credentialError) return { success: false, error: credentialError }

    const token = await getShiprocketToken()
    if (!token) return { success: false, error: 'Shiprocket authentication failed' }

    const response = await axios.post(
      `${SHIPROCKET_URL}/courier/generate/pickup`,
      { shipment_id: [Number(shipmentId)] },
      {
        headers: getAuthHeaders(token),
        timeout: 12000,
      },
    )

    const data = response?.data || {}
    return {
      success: true,
      data: {
        raw: data,
        pickupStatus: data?.pickup_status || data?.status || 'Requested',
        pickupToken: data?.pickup_token || data?.request_id || null,
      },
    }
  } catch (error) {
    console.error('Shiprocket pickup request error:', error.response?.data || error.message)
    const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout')
    const errMsg = isTimeout
      ? 'Shiprocket took too long to respond. Please try again or request pickup from Shiprocket dashboard.'
      : (error.response?.data?.message || error.response?.data || error.message || 'Failed to request pickup')
    return {
      success: false,
      error: errMsg,
    }
  }
}