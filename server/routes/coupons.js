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

const router = Router()

router.post('/coupons/validate', validateCoupon)
router.get('/coupons/available', getAvailableCoupons)
router.post('/coupons', createCoupon)
router.get('/coupons', listCoupons)
router.get('/coupons/:id', getCouponById)
router.patch('/coupons/:id', updateCoupon)
router.delete('/coupons/:id', deleteCoupon)

export default router
