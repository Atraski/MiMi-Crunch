import express from 'express'
const router = express.Router()
import { 
  createOrder, 
  getUserOrders, 
  listAllOrders,
  syncOrderToShiprocket,
  updateOrderStatus,
  requestPickup,
} from '../controllers/orderController.js'
import { authMiddleware } from '../middleware/auth.js' // Auth check ke liye
import { adminAuthMiddleware } from '../middleware/adminAuth.js'

// 1. Order Place Karne ke liye (Public - Guest aur Registered dono ke liye)
// Note: Isme authMiddleware optional rakha hai taaki guest orders (Case 1) chal sakein
router.post('/', createOrder)

// 2. Logged-in User ki Order History dekhne ke liye (Case 2)
// Isme authMiddleware zaroori hai taaki koi aur aapka order na dekh sake
router.get('/my-orders/:userId', authMiddleware, getUserOrders)

// 3. Admin ke liye saare orders ki list (Future Admin Panel ke liye)
router.get('/admin/all', adminAuthMiddleware, listAllOrders)

// 4. Admin ke liye order status update
router.patch('/admin/:id/status', adminAuthMiddleware, updateOrderStatus)

// 5. Shiprocket sync (requested route)
router.post('/:id/sync', adminAuthMiddleware, syncOrderToShiprocket)

// 6. Pickup request (requested route)
router.post('/:id/pickup', adminAuthMiddleware, requestPickup)

// Legacy admin routes (backward compatibility)
router.post('/admin/:id/shiprocket/sync', adminAuthMiddleware, syncOrderToShiprocket)
router.post('/admin/:id/shiprocket/pickup', adminAuthMiddleware, requestPickup)

export default router