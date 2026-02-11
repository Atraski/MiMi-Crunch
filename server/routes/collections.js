import { Router } from 'express'
import {
  createCollection,
  deleteCollection,
  getCollectionById,
  getCollectionBySlug,
  listCollections,
  updateCollection,
} from '../controllers/collectionController.js'

const router = Router()

router.post('/collections', createCollection)
router.get('/collections', listCollections)
router.get('/collections/slug/:slug', getCollectionBySlug)
router.get('/collections/:id', getCollectionById)
router.patch('/collections/:id', updateCollection)
router.delete('/collections/:id', deleteCollection)

export default router

