// In-memory OTP store
// Note: OTPs are cleared on server restart — acceptable for this use case.
const store = new Map()

export function saveOTP(phone, otp) {
  store.set(phone, {
    otp: otp.toString(),
    expiresAt: Date.now() + parseInt(process.env.OTP_EXPIRY_MS || '600000'),
    attempts: 0,
  })
}

export function verifyOTP(phone, inputOtp) {
  const record = store.get(phone)

  if (!record) {
    return { success: false, message: 'OTP nahi mila. Dobara bhejein.' }
  }

  if (Date.now() > record.expiresAt) {
    store.delete(phone)
    return { success: false, message: 'OTP expire ho gaya (10 min). Dobara bhejein.' }
  }

  if (record.attempts >= 3) {
    store.delete(phone)
    return { success: false, message: '3 baar galat OTP dala. Dobara bhejein.' }
  }

  if (record.otp !== inputOtp.toString()) {
    record.attempts += 1
    return { success: false, message: `Galat OTP. ${3 - record.attempts} attempts baaki.` }
  }

  store.delete(phone)
  return { success: true }
}
