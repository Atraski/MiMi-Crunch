import express from 'express'
import { recordVisit, pingActivity, getStats } from '../controllers/analytics.js'
import { adminAuthMiddleware } from '../middleware/adminAuth.js'

const router = express.Router()

router.post('/analytics/visit', recordVisit)
router.post('/analytics/ping', pingActivity)
router.get('/analytics/stats', adminAuthMiddleware, getStats)

export default router
