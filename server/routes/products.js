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

const router = Router()

router.post('/products', createProduct)
router.get('/products', listProducts)
router.get('/products/stream', streamProducts)
router.get('/products/:id', getProductById)
router.get('/products/slug/:slug', getProductBySlug)
router.patch('/products/:id', updateProduct)
router.delete('/products/:id', deleteProduct)

export default router
