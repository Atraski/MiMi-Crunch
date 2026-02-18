import { Router } from 'express'
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProductBySlug,
  listProducts,
  streamProducts,
  updateProduct,
} from '../controllers/productController.js'
import { adminAuthMiddleware } from '../middleware/adminAuth.js'

const router = Router()

router.post('/products', adminAuthMiddleware, createProduct)
router.get('/products', listProducts)
router.get('/products/stream', streamProducts)
router.get('/products/:id', getProductById)
router.get('/products/slug/:slug', getProductBySlug)
router.patch('/products/:id', adminAuthMiddleware, updateProduct)
router.delete('/products/:id', adminAuthMiddleware, deleteProduct)

export default router
