import axios from 'axios'

/**
 * Sends a WhatsApp order confirmation message using Meta Cloud API.
 * Expects variables in .env: WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_TEMPLATE_NAME
 * 
 * @param {string} phone - Customer phone number
 * @param {string} name - Customer name
 * @param {string} orderId - Human-readable Order ID
 * @param {number|string} total - Total order amount
 */
export const sendWhatsAppOrderConfirmation = async (phone, name, orderId, total) => {
  try {
    const token = process.env.WHATSAPP_TOKEN
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID
    const templateName = process.env.WHATSAPP_TEMPLATE_NAME || 'order_confirmation'

    if (!token || !phoneId) {
      console.warn('[WhatsApp] API credentials missing in .env. Skipping message.')
      return null
    }

    // Clean phone number: remove all non-digits
    let cleanPhone = String(phone || '').replace(/\D/g, '')
    
    // Normalize Indian numbers (add 91 if 10 digits)
    if (cleanPhone.length === 10) {
      cleanPhone = '91' + cleanPhone
    }

    if (!cleanPhone || cleanPhone.length < 10) {
      console.warn(`[WhatsApp] Invalid phone number: ${phone}`)
      return null
    }

    const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`
    
    // Standard template payload with 3 parameters: Name, OrderID, Total
    const payload = {
      messaging_product: 'whatsapp',
      to: cleanPhone,
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'en_US' }, // Change if using different language
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: name || 'Customer' },
              { type: 'text', text: String(orderId) },
              { type: 'text', text: `₹${total}` }
            ]
          }
        ]
      }
    }

    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    console.log(`[WhatsApp] Message sent to ${cleanPhone}. Response ID: ${response.data?.messages?.[0]?.id}`)
    return response.data
  } catch (error) {
    console.error('[WhatsApp] API Error:', error.response?.data || error.message)
    return null
  }
}
