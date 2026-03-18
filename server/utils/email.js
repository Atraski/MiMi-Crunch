import resend from '../config/resend.js';

/**
 * Send verification code for user registration/OTP
 */
export const sendVerificationEmail = async ({ to, code }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'MiMi Crunch <otp@admin.mimicrunch.com>',
      to,
      subject: 'Verify your email for MiMi Crunch',
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
    });

    if (error) {
      console.error("Resend Verification Email Error:", error);
      throw error;
    }

    console.log('Verification Email sent via Resend:', data.id);
    return data;
  } catch (error) {
    console.error("Verification Email Error:", error);
    throw error;
  }
};

/**
 * Send order confirmation email after order is placed
 */
export const sendOrderConfirmationEmail = async ({ to, orderData }) => {
  try {
    // Build items list HTML
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

    const { data, error } = await resend.emails.send({
      from: 'MiMi Crunch <support@mimicrunch.com>',
      to,
      subject: `Order Confirmed! (${orderData.orderId || orderData._id.toString().slice(-6).toUpperCase()})`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 25px; border-radius: 15px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #2ecc71; margin-bottom: 5px;">Order Placed!</h1>
            <p style="color: #666; margin: 0;">Order ID: ${orderData.orderId || ('#' + orderData._id.toString().slice(-6).toUpperCase())}</p>
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
    });

    if (error) {
      console.error("Resend Order Confirmation Email Error:", error);
      return;
    }

    console.log('Order Confirmation Email sent via Resend:', data.id);
    return data;
  } catch (error) {
    console.error("Order Confirmation Email Error:", error);
  }
};
