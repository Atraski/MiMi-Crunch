import Order from '../models/Order.js'
import Product from '../models/Product.js'
import User from '../models/User.js'
import { getNextOrderSequence } from '../models/OrderCounter.js'
import { sendOrderConfirmationEmail } from '../utils/email.js'
import { updateStock } from './productController.js'
import { sendWhatsAppOrderConfirmation } from '../utils/whatsapp.js'

const hasOrderEmail = (email) =>
  typeof email === 'string' && email.trim().length > 0 && email.includes('@') && email.length < 200

/** Find order by MongoDB _id (24 hex) or by orderId (e.g. MiMi-100001) */
const findOrderByIdOrOrderId = async (id) => {
  if (!id) return null
  const s = String(id).trim()
  if (/^[a-fA-F0-9]{24}$/.test(s)) return Order.findById(s)
  return Order.findOne({ orderId: s })
} 
import {
  requestPickupForShipment,
  syncOrderToShiprocket as pushOrderToShiprocket,
} from '../utils/shiprocket.js'
import { createPaymentSession, verifyPayment } from '../utils/cashfree.js'

const ALLOWED_ORDER_STATUSES = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled']

const buildShiprocketUpdate = (syncResult) => {
  if (!syncResult?.success) {
    return {
      partner: 'shiprocket',
      synced: false,
      syncedAt: new Date(),
      lastError:
        typeof syncResult?.error === 'string'
          ? syncResult.error
          : JSON.stringify(syncResult?.error || 'Unknown shiprocket error'),
    }
  }

  return {
    partner: 'shiprocket',
    synced: true,
    syncedAt: new Date(),
    shiprocketOrderId: syncResult.data?.shiprocketOrderId || '',
    shipmentId: syncResult.data?.shipmentId || '',
    awbCode: syncResult.data?.awbCode || '',
    courierName: syncResult.data?.courierName || '',
    lastError: '',
  }
}

const mergeShippingPartner = (order, patch) => {
  order.shippingPartner = {
    ...(order.shippingPartner?.toObject?.() || order.shippingPartner || {}),
    ...patch,
  }
}

/**
 * Order Create Controller
 * Handles order logic and variant-specific stock deduction.
 */
const createOrder = async (req, res) => {
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

    // 2. Data Enrichment
    const isUserLoggedIn = !!req.user;
    const finalUserId = isUserLoggedIn ? req.user._id : null;
    const finalEmail = isUserLoggedIn ? req.user.email : shippingAddress.email;
    const finalFullName = isUserLoggedIn ? (req.user.name || shippingAddress.fullName) : shippingAddress.fullName;

    // 3. INVENTORY CHECK & UPDATE
    try {
      console.log("--- Stock Update Process Start ---");
      await updateStock(items); 
      console.log("Stock update function finished successfully.");
    } catch (stockErr) {
      console.error("Critical: Stock update failed at Controller:", stockErr.message);
      return res.status(400).json({ 
        error: stockErr.message || 'One or more items are out of stock.' 
      });
    }

    // 4. Pricing normalization (server-side fallback)
    const itemsSubtotal = Array.isArray(items)
      ? items.reduce((sum, item) => {
          const qty = Number(item?.qty || 0)
          const price = Number(item?.price || 0)
          return sum + qty * price
        }, 0)
      : 0

    const safeSubtotal = Number(subtotal || itemsSubtotal)
    const safeDiscount = Number(discountAmount || 0)
    const hasDeliveryFromClient = Number.isFinite(Number(deliveryFee))
    const safeDeliveryFee = hasDeliveryFromClient ? Number(deliveryFee) : 0
    const hasTotalFromClient = Number.isFinite(Number(total))
    const safeTotal = hasTotalFromClient
      ? Number(total)
      : Math.max(safeSubtotal - safeDiscount, 0) + safeDeliveryFee

    // 5. Order ID (MiMi-100000, MiMi-100001, ...) and Order Creation
    const orderSeq = await getNextOrderSequence()
    const humanOrderId = `MiMi-${orderSeq}`

    const order = await Order.create({
      orderId: humanOrderId,
      userId: finalUserId, 
      items, 
      shippingAddress: {
        ...shippingAddress,
        fullName: finalFullName,
        email: finalEmail
      },
      subtotal: safeSubtotal,
      deliveryFee: safeDeliveryFee,
      discountAmount: safeDiscount,
      totalAmount: safeTotal, 
      paymentMethod: paymentMethod || 'COD',
      paymentStatus: paymentMethod === 'ONLINE' ? 'Pending' : (paymentMethod || 'COD'),
      status: 'Pending'
    })

    // 5.5. Handle ONLINE Payment Session (Cashfree uses human orderId)
    if (paymentMethod === 'ONLINE') {
      try {
        const cfSession = await createPaymentSession({
          orderId: humanOrderId,
          amount: safeTotal,
          customerDetails: {
            customerId: finalUserId ? finalUserId.toString() : `GUEST${Date.now()}`,
            phone: shippingAddress.phone || '9999999999',
            name: finalFullName,
            email: finalEmail
          }
        })
        order.paymentSessionId = cfSession.payment_session_id;
        await order.save();

        return res.status(201).json({
          success: true,
          paymentRequired: true,
          sessionId: cfSession.payment_session_id,
          orderId: humanOrderId
        })
      } catch (cfErr) {
        console.error(
          "Cashfree Session Creation Error:",
          cfErr?.response?.data || cfErr?.message || cfErr
        );
        order.status = "Cancelled";
        await order.save();
        const userMessage =
          cfErr?.code === "CASHFREE_NOT_CONFIGURED"
            ? "Payment is not configured. Please contact support."
            : (typeof cfErr?.message === "string" ? cfErr.message : null) ||
              "Payment gateway error. Please try again.";
        const statusCode =
          cfErr?.statusCode && cfErr.statusCode >= 400 && cfErr.statusCode < 600
            ? cfErr.statusCode
            : 500;
        return res.status(statusCode).json({
          error: userMessage,
          ...(process.env.NODE_ENV !== "production" &&
            cfErr?.message && { debug: cfErr.message }),
        });
      }
    }

    // 6. Auto-sync to Shiprocket right after order creation
    let shiprocketAutoSync = null
    const shiprocketReady = Boolean(
      String(process.env.SHIPROCKET_EMAIL || '').trim() &&
        String(
          process.env.SHIPROCKET_PASSWORD || process.env.SHIPROCKET_API_SECRET || '',
        ).trim(),
    )
    if (shiprocketReady) {
      shiprocketAutoSync = await pushOrderToShiprocket(order)
      mergeShippingPartner(order, buildShiprocketUpdate(shiprocketAutoSync))
      order.shipmentId = shiprocketAutoSync?.data?.shipmentId
        ? String(shiprocketAutoSync.data.shipmentId)
        : order.shipmentId
      if (shiprocketAutoSync?.success) {
        order.status = 'Processed'
      }
      await order.save()
      if (!shiprocketAutoSync.success) {
        console.error('Shiprocket auto-sync failed on order create:', shiprocketAutoSync.error)
      }
    } else {
      mergeShippingPartner(order, {
        partner: 'shiprocket',
        synced: false,
        syncedAt: new Date(),
        lastError:
          'Missing Shiprocket fulfillment credentials (SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD)',
      })
      await order.save()
    }

    // 7. CLEAR USER CART
    if (isUserLoggedIn) {
      await User.findByIdAndUpdate(finalUserId, { 
        $set: { cart: [] } 
      });
    }

    // 8. Order confirmation email – only if user filled email on checkout
    try {
      if (hasOrderEmail(finalEmail)) {
        await sendOrderConfirmationEmail({
          to: finalEmail.trim(),
          orderData: order
        })
      }
    } catch (mailErr) {
      console.error("Order confirmation email failed:", mailErr)
    }

    // 9. Order confirmation WhatsApp message
    try {
      await sendWhatsAppOrderConfirmation(
        shippingAddress.phone,
        shippingAddress.fullName || 'Customer',
        humanOrderId,
        safeTotal
      )
    } catch (waErr) {
      console.error("Order confirmation WhatsApp failed:", waErr)
    }

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      orderId: humanOrderId,
      shippingSynced: order.shippingPartner?.synced === true,
      shippingError: order.shippingPartner?.lastError || null,
      shiprocket: shiprocketAutoSync?.success
        ? {
            shiprocketOrderId: shiprocketAutoSync.data?.shiprocketOrderId || null,
            shipmentId: shiprocketAutoSync.data?.shipmentId || null,
          }
        : null,
    })

  } catch (err) {
    console.error('Final Order creation error:', err)
    return res.status(500).json({ error: 'Failed to place order.' })
  }
}

/**
 * Get User Orders (History)
 */
const getUserOrders = async (req, res) => {
  try {
    const authUserId = req.auth?.userId
    const requestedUserId = req.params.userId

    if (!authUserId) {
      return res.status(401).json({ error: 'Authentication required.' })
    }

    if (String(authUserId) !== String(requestedUserId)) {
      return res.status(403).json({ error: 'Not allowed to view these orders.' })
    }

    const targetId = authUserId

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
const listAllOrders = async (req, res) => {
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

/**
 * Admin: Update Order Status + Shiprocket Sync
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body
    if (!ALLOWED_ORDER_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Allowed values: ${ALLOWED_ORDER_STATUSES.join(', ')}`,
      })
    }

    const order = await findOrderByIdOrOrderId(req.params.id)
    if (!order) return res.status(404).json({ error: 'Order not found' })

    order.status = status

    // Sync with Shiprocket when order moves to shipped first time
    let shiprocketRes = null
    const alreadySynced = order.shippingPartner?.synced === true
    if (status === 'Shipped' && !alreadySynced) {
      console.log(`Syncing order ${order.orderId || order._id} to Shiprocket`)
      shiprocketRes = await pushOrderToShiprocket(order)
      mergeShippingPartner(order, buildShiprocketUpdate(shiprocketRes))
      order.shipmentId = shiprocketRes?.data?.shipmentId
        ? String(shiprocketRes.data.shipmentId)
        : order.shipmentId
      if (!shiprocketRes.success) {
        console.error('Shiprocket sync failed:', shiprocketRes.error)
      }
    }

    await order.save()

    return res.json({
      success: true,
      order,
      shiprocket: shiprocketRes
        ? { success: shiprocketRes.success, error: shiprocketRes.error || null }
        : null,
    })
  } catch (err) {
    console.error('Update status error:', err)
    return res.status(500).json({ error: 'Failed to update order status' })
  }
}

const syncOrderToShiprocket = async (req, res) => {
  try {
    const order = await findOrderByIdOrOrderId(req.params.id)
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    const syncResult = await pushOrderToShiprocket(order)
    mergeShippingPartner(order, buildShiprocketUpdate(syncResult))
    if (syncResult?.success && syncResult?.data?.shipmentId) {
      order.shipmentId = String(syncResult.data.shipmentId)
      order.status = 'Processed'
    }
    await order.save()

    if (!syncResult.success) {
      return res.status(502).json({
        success: false,
        error: 'Shiprocket sync failed',
        details: syncResult.error || null,
        order,
      })
    }

    return res.json({ success: true, order, shiprocket: syncResult.data })
  } catch (err) {
    console.error('Manual shiprocket sync error:', err)
    return res.status(500).json({ error: 'Failed to sync order with shiprocket' })
  }
}

const PICKUP_REQUEST_TIMEOUT_MS = 15000

const requestPickup = async (req, res) => {
  try {
    const order = await findOrderByIdOrOrderId(req.params.id)
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    const shipmentId = Number(order.shipmentId || order.shippingPartner?.shipmentId)
    if (!shipmentId) {
      return res.status(400).json({
        success: false,
        error: 'Missing shipmentId. Please sync order first.',
        order,
      })
    }

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error('PICKUP_TIMEOUT')),
        PICKUP_REQUEST_TIMEOUT_MS
      )
    )
    const pickupResult = await Promise.race([
      requestPickupForShipment(shipmentId),
      timeoutPromise,
    ])
    if (!pickupResult.success) {
      mergeShippingPartner(order, {
        pickupRequested: false,
        pickupRequestedAt: new Date(),
        pickupStatus: 'Failed',
        lastError:
          typeof pickupResult.error === 'string'
            ? pickupResult.error
            : JSON.stringify(pickupResult.error || 'Pickup request failed. Check active pickup location and shipment weight.'),
      })
      await order.save()
      return res.status(502).json({
        success: false,
        error: 'Pickup request failed. Check active pickup location and valid shipment weight.',
        details: pickupResult.error || null,
        order,
      })
    }

    mergeShippingPartner(order, {
      pickupRequested: true,
      pickupRequestedAt: new Date(),
      pickupStatus: pickupResult.data?.pickupStatus || 'Requested',
      pickupToken: pickupResult.data?.pickupToken || '',
      lastError: '',
    })
    order.status = 'Shipped'
    await order.save()

    return res.json({
      success: true,
      order,
      pickup: pickupResult.data,
    })
  } catch (err) {
    console.error('Pickup request error:', err?.message || err)
    if (err?.message === 'PICKUP_TIMEOUT') {
      return res.status(504).json({
        success: false,
        error: 'Pickup request is taking too long. Please try again or request pickup from Shiprocket dashboard.',
      })
    }
    return res.status(500).json({ success: false, error: 'Failed to request pickup' })
  }
}

const verifyCashfreePayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ error: 'Order ID is required' });

    const order = await findOrderByIdOrOrderId(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const cfOrderId = order.orderId || order._id.toString();
    const payments = await verifyPayment(cfOrderId);
    const successfulPayment = Array.isArray(payments) 
      ? payments.find(p => p.payment_status === 'SUCCESS')
      : null;

    if (successfulPayment) {
      order.paymentStatus = 'Paid';
      order.transactionId = successfulPayment.cf_payment_id;
      // Also trigger Shiprocket if not already synced
      if (order.shippingPartner?.synced !== true) {
         const shiprocketSync = await pushOrderToShiprocket(order);
         mergeShippingPartner(order, buildShiprocketUpdate(shiprocketSync));
         if (shiprocketSync.success) order.status = 'Processed';
      }
      await order.save();

       // Order confirmation email – only if user had filled email at checkout
       try {
        const toEmail = order.shippingAddress?.email
        if (hasOrderEmail(toEmail)) {
          await sendOrderConfirmationEmail({
            to: toEmail.trim(),
            orderData: order
          })
        }
      } catch (mailErr) {
        console.error("Order confirmation email failed:", mailErr)
      }

      // Order confirmation WhatsApp – Online Payment success
      try {
        await sendWhatsAppOrderConfirmation(
          order.shippingAddress?.phone || order.phone,
          order.shippingAddress?.fullName || 'Customer',
          order.orderId || order._id.toString(),
          order.total
        )
      } catch (waErr) {
        console.error("Order confirmation WhatsApp failed:", waErr)
      }

      return res.json({ success: true, message: 'Payment verified', order });
    } else {
      return res.status(400).json({ success: false, message: 'Payment not successful yet' });
    }
  } catch (err) {
    console.error("Verify Payment error:", err?.message || err);
    const msg =
      err?.code === "CASHFREE_NOT_CONFIGURED"
        ? "Payment verification is not configured."
        : typeof err?.message === "string" && err.message.length < 120
          ? err.message
          : "Verification failed. Please try again.";
    return res.status(500).json({ error: msg });
  }
}

const cashfreeWebhook = async (req, res) => {
  // Cashfree sends a POST request with the payment details (order_id = our MiMi-100001)
  try {
    const { order_id } = req.body?.data?.order || {};
    if (order_id) {
       console.log(`Cashfree Webhook received for ${order_id}`);
       const payments = await verifyPayment(order_id);
       const successfulPayment = Array.isArray(payments) 
         ? payments.find(p => p.payment_status === 'SUCCESS')
         : null;

       if (successfulPayment) {
          const order = await findOrderByIdOrOrderId(order_id);
          if (order && order.paymentStatus !== 'Paid') {
            order.paymentStatus = 'Paid';
            order.transactionId = successfulPayment.cf_payment_id;
            if (order.shippingPartner?.synced !== true) {
              const shiprocketSync = await pushOrderToShiprocket(order);
              mergeShippingPartner(order, buildShiprocketUpdate(shiprocketSync));
              if (shiprocketSync.success) order.status = 'Processed';
            }
            await order.save();

            // Order confirmation WhatsApp – Webhook Online Payment success
            try {
              await sendWhatsAppOrderConfirmation(
                order.shippingAddress?.phone || order.phone,
                order.shippingAddress?.fullName || 'Customer',
                order.orderId || order._id.toString(),
                order.total
              )
            } catch (waErr) {
              console.error("Order confirmation WhatsApp failed:", waErr)
            }
          }
       }
    }
    res.status(200).send('OK');
  } catch (err) {
    console.error("Cashfree Webhook Error:", err?.message || err);
    res.status(500).send("Internal Server Error");
  }
}

export {
  createOrder,
  getUserOrders,
  listAllOrders,
  updateOrderStatus,
  syncOrderToShiprocket,
  requestPickup,
  verifyCashfreePayment,
  cashfreeWebhook,
}