import express from 'express'
const router = express.Router()
import { 
  createOrder, 
  getUserOrders, 
  listAllOrders,
  syncOrderToShiprocket,
  updateOrderStatus,
  requestPickup,
  verifyCashfreePayment,
  cashfreeWebhook,
} from '../controllers/orderController.js'
import { authMiddleware } from '../middleware/auth.js'
import { adminAuthMiddleware } from '../middleware/adminAuth.js'

// 1. Place order (public - guest and registered)
router.post('/', createOrder)
router.post('/verify-payment', verifyCashfreePayment)
router.post('/webhook/cashfree', cashfreeWebhook)

// 2. Logged-in user order history (auth required)
router.get('/my-orders/:userId', authMiddleware, getUserOrders)

// 3. Admin: list all orders
router.get('/admin/all', adminAuthMiddleware, listAllOrders)

// 4. Admin: update order status
router.patch('/admin/:id/status', adminAuthMiddleware, updateOrderStatus)

// 5. Shiprocket sync (requested route)
router.post('/:id/sync', adminAuthMiddleware, syncOrderToShiprocket)

// 6. Pickup request (requested route)
router.post('/:id/pickup', adminAuthMiddleware, requestPickup)

// Legacy admin routes (backward compatibility)
router.post('/admin/:id/shiprocket/sync', adminAuthMiddleware, syncOrderToShiprocket)
router.post('/admin/:id/shiprocket/pickup', adminAuthMiddleware, requestPickup)

export default router