import twilio from 'twilio';

// Twilio credentials (Inhe .env file mein rakhein)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

// Twilio client initialize karein
const client = (accountSid && authToken) ? twilio(accountSid, authToken) : null;

/**
 * Order Place hone par SMS bhejne ka utility function
 * @param {string} phone - Customer ka 10-digit phone number
 * @param {string} orderId - Order ID confirmation ke liye
 */
export const sendOrderSms = async (phone, orderId) => {
  try {
    // 1. Check karein agar Twilio configured hai
    if (!client) {
      console.warn("SMS service not configured. Skipping SMS.");
      return null;
    }

    // 2. Phone number format sahi karein (Indian +91 prefix)
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

    // 3. Message template
    const message = `Hello! MiMi Crunch pe aapka order (#${orderId}) place ho gaya hai. Hum jaldi hi ise deliver karenge. Thank you!`;

    // 4. Send SMS
    const response = await client.messages.create({
      body: message,
      from: twilioPhone,
      to: formattedPhone,
    });

    console.log(`SMS sent successfully: ${response.sid}`);
    return response;
  } catch (err) {
    console.error("SMS sending failed:", err.message);
    // Note: SMS fail hone par order cancel nahi hona chahiye, isliye sirf log karenge.
    return null;
  }
};