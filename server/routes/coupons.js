import { Router } from 'express'
import {
  createCoupon,
  deleteCoupon,
  getAvailableCoupons,
  getCouponById,
  listCoupons,
  updateCoupon,
  validateCoupon,
} from '../controllers/couponController.js'
import { adminAuthMiddleware } from '../middleware/adminAuth.js'

const router = Router()

router.post('/coupons/validate', validateCoupon)
router.get('/coupons/available', getAvailableCoupons)
router.post('/coupons', adminAuthMiddleware, createCoupon)
router.get('/coupons', adminAuthMiddleware, listCoupons)
router.get('/coupons/:id', adminAuthMiddleware, getCouponById)
router.patch('/coupons/:id', adminAuthMiddleware, updateCoupon)
router.delete('/coupons/:id', adminAuthMiddleware, deleteCoupon)

export default router
