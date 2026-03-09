import twilio from 'twilio'

const accountSid = process.env.TWILIO_SID || 'AC1f88136f9c5a19998a0d87fcf5535aaa'
const authToken = process.env.TWILIO_TOKEN || '2b234d2f85c8267e6602577dec432d8d'
const twilioNumber = process.env.TWILIO_PHONE_NUMBER || '+19124946682'

const client = twilio(accountSid, authToken)

export const sendSmsOtp = async (to, otp) => {
    try {
        let formattedPhone = String(to).trim()
        if (!formattedPhone.startsWith('+')) {
            if (formattedPhone.length === 10) {
                formattedPhone = '+91' + formattedPhone // Default to India if 10 digits
            } else {
                formattedPhone = '+' + formattedPhone
            }
        }
        const message = await client.messages.create({
            body: `Your Mimi Crunch verification code is: ${otp}`,
            from: twilioNumber,
            to: formattedPhone,
        })
        console.log(`Sent OTP to ${formattedPhone}, SID: ${message.sid}`)
        return message
    } catch (error) {
        console.error('Twilio Error:', error)
        throw new Error('Failed to send OTP via SMS. ' + error.message)
    }
}
