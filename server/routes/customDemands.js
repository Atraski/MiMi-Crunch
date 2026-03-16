import express from 'express';
const router = express.Router();
import * as customDemandController from '../controllers/customDemandController.js';

// Public route to submit a demand
router.post('/', customDemandController.createDemand);

// Admin routes
router.get('/', customDemandController.getAllDemands);
router.patch('/:id/status', customDemandController.updateDemandStatus);
router.delete('/:id', customDemandController.deleteDemand);

export default router;
