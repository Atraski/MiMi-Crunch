import { Router } from 'express'
import { createUploadSignature } from '../controllers/uploadController.js'
import { adminAuthMiddleware } from '../middleware/adminAuth.js'

const router = Router()

router.post('/uploads/signature', adminAuthMiddleware, createUploadSignature)

export default router
