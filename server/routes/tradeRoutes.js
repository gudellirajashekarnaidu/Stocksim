import express from 'express';
import {
  buyStock,
  sellStock,
  getUserPortfolio,
  getTransactionHistory
} from '../controllers/tradeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/buy', protect, buyStock);
router.post('/sell', protect, sellStock);
router.get('/portfolio', protect, getUserPortfolio);
router.get('/history', protect, getTransactionHistory);

export default router;
