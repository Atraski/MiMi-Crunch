import { Router } from 'express'
import { createUploadSignature } from '../controllers/uploadController.js'

const router = Router()

router.post('/uploads/signature', createUploadSignature)

export default router
