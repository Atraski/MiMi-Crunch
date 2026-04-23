import { sendOTPviaWhatsApp, isWhatsAppReady } from '../utils/whatsappClient.js'

/**
 * OTP bhejta hai — WhatsApp via apne number se (free)
 */
export async function sendOTPviaSMS(phone, otp) {
  if (!isWhatsAppReady()) {
    console.warn('[OTP] WhatsApp client not ready.')
    return { success: false, message: 'WhatsApp service abhi ready nahi hai. 1-2 minute baad try karo ya server restart karo aur QR scan karo.' }
  }

  return await sendOTPviaWhatsApp(phone, otp)
}
