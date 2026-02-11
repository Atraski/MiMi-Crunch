import { Router } from 'express'
import {
  createReview,
  listByProduct,
  listAll,
  updateReview,
} from '../controllers/reviewController.js'

const router = Router()

router.post('/reviews', createReview)
router.get('/reviews', (req, res, next) => {
  if (req.query.productSlug) return listByProduct(req, res, next)
  if (req.query.all === 'true') return listAll(req, res, next)
  return res.status(400).json({ error: 'Use productSlug or all=true' })
})
router.patch('/reviews/:id', updateReview)

export default router
