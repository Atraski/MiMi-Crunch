import pkg from 'whatsapp-web.js'
const { Client, LocalAuth } = pkg
import qrcode from 'qrcode-terminal'

let client = null
let isReady = false

export function initWhatsApp() {
  client = new Client({
    authStrategy: new LocalAuth({ clientId: 'mimi-crunch-otp' }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  })

  client.on('qr', (qr) => {
    console.log('\n========================================')
    console.log('  WhatsApp QR Code — Scan karo apne phone se:')
    console.log('========================================\n')
    qrcode.generate(qr, { small: true })
    console.log('\n  WhatsApp > Linked Devices > Link a Device\n')
    console.log('========================================\n')
  })

  client.on('ready', () => {
    isReady = true
    console.log('[WhatsApp] Client ready! OTP via WhatsApp enabled.')
  })

  client.on('authenticated', () => {
    console.log('[WhatsApp] Authenticated successfully.')
  })

  client.on('auth_failure', (msg) => {
    isReady = false
    console.error('[WhatsApp] Auth failed:', msg)
  })

  client.on('disconnected', (reason) => {
    isReady = false
    console.warn('[WhatsApp] Disconnected:', reason)
    // Auto-reconnect after 5 seconds
    setTimeout(() => {
      console.log('[WhatsApp] Reconnecting...')
      client.initialize()
    }, 5000)
  })

  client.initialize()
  return client
}

export function getWhatsAppClient() {
  return client
}

export function isWhatsAppReady() {
  return isReady
}

/**
 * WhatsApp pe OTP bhejta hai
 * @param {string} phone - 10-digit Indian mobile number
 * @param {string} otp - 6-digit OTP
 */
export async function sendOTPviaWhatsApp(phone, otp) {
  if (!isReady || !client) {
    return { success: false, message: 'WhatsApp client ready nahi hai. Server restart karo aur QR scan karo.' }
  }

  // Indian number format: 91XXXXXXXXXX@c.us
  const chatId = `91${phone}@c.us`

  const message = `🔐 *Mimi Crunch OTP Verification*

Your OTP is: *${otp}*

⏱ Valid for 10 minutes only.
🚫 Do NOT share this OTP with anyone.

Happy Crunching! 🌿`

  try {
    await client.sendMessage(chatId, message)
    console.log(`[WhatsApp OTP] Sent to ${phone}`)
    return { success: true }
  } catch (err) {
    console.error('[WhatsApp OTP] Send failed:', err.message)
    return { success: false, message: 'WhatsApp message send nahi hua. Dobara try karo.' }
  }
}
