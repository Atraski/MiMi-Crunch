import { Router } from 'express'
import {
  createPublicRecipeUploadSignature,
  createUploadSignature,
} from '../controllers/uploadController.js'
import { adminAuthMiddleware } from '../middleware/adminAuth.js'

const router = Router()

router.post('/uploads/signature', adminAuthMiddleware, createUploadSignature)
router.post('/uploads/public-signature', createPublicRecipeUploadSignature)

export default router
