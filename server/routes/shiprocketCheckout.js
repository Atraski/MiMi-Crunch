import express from 'express'
import {
  catalogProducts,
  catalogCollections,
  catalogCollectionProducts,
  postAccessToken,
  postOrderWebhook,
  loyaltyGetPoints,
  loyaltyBlockPoints,
  loyaltyUnblockPoints,
} from '../controllers/shiprocketCheckoutController.js'

const router = express.Router()

router.get('/catalog/products', catalogProducts)
router.get('/catalog/collections', catalogCollections)
router.get('/catalog/collection-products', catalogCollectionProducts)

router.post('/access-token', postAccessToken)
router.post('/order-webhook', postOrderWebhook)

router.post('/loyalty/get-points', loyaltyGetPoints)
router.post('/loyalty/block-points', loyaltyBlockPoints)
router.post('/loyalty/unblock-points', loyaltyUnblockPoints)

export default router
