import express from 'express'
const router = express.Router()
import { 
  createOrder, 
  getUserOrders, 
  listAllOrders 
} from '../controllers/orderController.js'
import { authMiddleware } from '../middleware/auth.js' // Auth check ke liye

// 1. Order Place Karne ke liye (Public - Guest aur Registered dono ke liye)
// Note: Isme authMiddleware optional rakha hai taaki guest orders (Case 1) chal sakein
router.post('/', createOrder)

// 2. Logged-in User ki Order History dekhne ke liye (Case 2)
// Isme authMiddleware zaroori hai taaki koi aur aapka order na dekh sake
router.get('/my-orders/:userId', authMiddleware, getUserOrders)

// 3. Admin ke liye saare orders ki list (Future Admin Panel ke liye)
router.get('/admin/all', authMiddleware, listAllOrders)

export default router