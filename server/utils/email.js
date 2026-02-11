import { mailTransport, nodemailer } from '../config/mailer.js'

/**
 * User registration/OTP ke waqt verification code bhejne ke liye
 */
export const sendVerificationEmail = async ({ to, code }) => {
  try {
    const info = await mailTransport.sendMail({
      from: 'MiMi Crunch <no-reply@mimi-crunch.test>',
      to,
      subject: 'Verify your email for MiMi Crunch',
      text: `Your 6-digit verification code is ${code}. It expires in 10 minutes.`,
      html: `<div style="font-family: sans-serif; border: 1px solid #ddd; padding: 20px; max-width: 500px; margin: auto;">
              <h2 style="color: #ff6b6b; text-align: center;">Welcome to MiMi Crunch!</h2>
              <p>Someone (hopefully you!) requested a verification code for your account.</p>
              <div style="background: #f9f9f9; padding: 15px; text-align: center; border-radius: 10px;">
                <p style="margin: 0; font-size: 0.9rem; color: #666;">Verification Code</p>
                <strong style="font-size: 2rem; letter-spacing: 5px; color: #333;">${code}</strong>
              </div>
              <p style="font-size: 0.8rem; color: #888; text-align: center; margin-top: 20px;">
                This code expires in 10 minutes. If you didn't request this, please ignore this email.
              </p>
            </div>`,
    })

    const previewUrl = nodemailer.getTestMessageUrl(info)
    if (previewUrl) {
      console.log('Verification Email Preview URL:', previewUrl)
    }
    return info
  } catch (error) {
    console.error("Verification Email Error:", error)
    throw error
  }
}

/**
 * Order place hone par confirmation details bhejne ke liye
 */
export const sendOrderConfirmationEmail = async ({ to, orderData }) => {
  try {
    // Items list ka HTML generate karna
    const itemsHtml = orderData.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 14px;">
          <span style="font-weight: bold;">${item.name}</span> <br/>
          <span style="color: #666;">Qty: ${item.qty}</span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-size: 14px;">
          ₹${item.price * item.qty}
        </td>
      </tr>
    `).join('');

    const info = await mailTransport.sendMail({
      from: 'MiMi Crunch <orders@mimi-crunch.test>',
      to,
      subject: `Order Confirmed! (#${orderData._id.toString().slice(-6).toUpperCase()})`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 25px; border-radius: 15px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #2ecc71; margin-bottom: 5px;">Order Placed!</h1>
            <p style="color: #666; margin: 0;">Order ID: #${orderData._id.toString().slice(-6).toUpperCase()}</p>
          </div>
          
          <p>Hi <b>${orderData.shippingAddress.fullName}</b>,</p>
          <p>We've received your order and are getting it ready for shipment. Here's a summary of what you ordered:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="text-align: left; padding: 12px; font-size: 14px;">Product</th>
                <th style="text-align: right; padding: 12px; font-size: 14px;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td style="padding: 12px; font-weight: bold; font-size: 16px;">Total Amount</td>
                <td style="padding: 12px; font-weight: bold; text-align: right; font-size: 16px; color: #2ecc71;">₹${orderData.totalAmount}</td>
              </tr>
            </tfoot>
          </table>

          <div style="background: #fdf2f2; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <p style="margin: 0; font-weight: bold; color: #d63031;">Shipping to:</p>
            <p style="margin: 8px 0 0 0; color: #555; line-height: 1.5;">
              ${orderData.shippingAddress.addressLine1}, <br/>
              ${orderData.shippingAddress.city} - ${orderData.shippingAddress.pincode} <br/>
              <b>Phone:</b> ${orderData.shippingAddress.phone}
            </p>
          </div>

          <p style="text-align: center; font-size: 0.85rem; color: #999;">
            Questions? Reply to this email or visit our support page. <br/>
            &copy; 2026 MiMi Crunch. All rights reserved.
          </p>
        </div>
      `,
    })

    const previewUrl = nodemailer.getTestMessageUrl(info)
    if (previewUrl) {
      console.log('Order Email Preview URL:', previewUrl)
    }
    return info
  } catch (error) {
    console.error("Order Confirmation Email Error:", error)
    // Hum error throw nahi kar rahe taaki order creation process na rukey
  }
}