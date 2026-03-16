import { Resend } from 'resend';

// Initialize resend only if API key exists to prevent server crash on boot (e.g. in DigitalOcean)
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : {
      emails: {
        send: async () => {
          console.error("❌ CRITICAL: RESEND_API_KEY is missing in environment variables. Email could not be sent.");
          return { error: { message: "Missing API key", name: "missing_api_key" }, data: null };
        }
      }
    };

if (!process.env.RESEND_API_KEY) {
  console.warn("⚠️ WARNING: RESEND_API_KEY is not defined. Email functionality will be disabled.");
}

export default resend;
