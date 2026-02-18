import { Router } from 'express'
import {
  createCollection,
  deleteCollection,
  getCollectionById,
  getCollectionBySlug,
  listCollections,
  updateCollection,
} from '../controllers/collectionController.js'
import { adminAuthMiddleware } from '../middleware/adminAuth.js'

const router = Router()

router.post('/collections', adminAuthMiddleware, createCollection)
router.get('/collections', listCollections)
router.get('/collections/slug/:slug', getCollectionBySlug)
router.get('/collections/:id', getCollectionById)
router.patch('/collections/:id', adminAuthMiddleware, updateCollection)
router.delete('/collections/:id', adminAuthMiddleware, deleteCollection)

export default router

