import Order from '../models/Order.js'
import Product from '../models/Product.js'
import User from '../models/User.js'
import { sendOrderConfirmationEmail } from '../utils/email.js' 
import { updateStock } from './productController.js' 

/**
 * Order Create Controller
 * Logic: User data session (req.user) se enrich kiya jayega agar available ho.
 */
export const createOrder = async (req, res) => {
  try {
    const { 
      items, 
      shippingAddress, 
      subtotal, 
      deliveryFee, 
      discountAmount, 
      total,
      paymentMethod
    } = req.body

    // 1. Basic Validation
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty.' })
    }

    // 2. Data Enrichment from Backend Session
    // Agar user logged in hai, toh data req.user se uthayenge
    const isUserLoggedIn = !!req.user;
    const finalUserId = isUserLoggedIn ? req.user._id : null;
    const finalEmail = isUserLoggedIn ? req.user.email : shippingAddress.email;
    const finalFullName = isUserLoggedIn ? (req.user.name || shippingAddress.fullName) : shippingAddress.fullName;

    // 3. Order Create
    const order = await Order.create({
      userId: finalUserId, 
      items,
      shippingAddress: {
        ...shippingAddress,
        fullName: finalFullName,
        email: finalEmail
      },
      subtotal,
      deliveryFee,
      discountAmount,
      totalAmount: total, 
      paymentMethod: paymentMethod || 'COD',
      status: 'Pending'
    })

    // 4. Inventory Stock Update
    try {
      await updateStock(items)
    } catch (stockErr) {
      console.error("Critical: Stock update failed:", stockErr)
    }

    // 5. Email Confirmation Trigger
    try {
      if (finalEmail) {
        await sendOrderConfirmationEmail({
          to: finalEmail,
          orderData: order
        })
      }
    } catch (mailErr) {
      console.error("Notification failed:", mailErr)
    }

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      orderId: order._id
    })

  } catch (err) {
    console.error('Final Order creation error:', err)
    return res.status(500).json({ error: 'Failed to place order.' })
  }
}

/**
 * Get User Orders (History)
 */
export const getUserOrders = async (req, res) => {
  try {
    // Session security: Hamesha req.user.id check karein
    const targetId = req.user?.id || req.params.userId;

    if (!targetId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    const orders = await Order.find({ userId: targetId })
      .sort({ createdAt: -1 })
      .lean()
      
    return res.json(orders)
  } catch (err) {
    console.error('Fetch orders error:', err)
    return res.status(500).json({ error: 'Failed to fetch orders.' })
  }
}

/**
 * Admin: List All Orders
 */
export const listAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .lean()
    return res.json(orders)
  } catch (err) {
    console.error('Admin fetch orders error:', err)
    return res.status(500).json({ error: 'Failed to fetch all orders.' })
  }
}