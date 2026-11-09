import express from 'express';
import {
  createStockAdmin,
  updateStockAdmin,
  deleteStockAdmin,
  getAllUsersAdmin,
  getAllTransactionsAdmin
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/users', getAllUsersAdmin);
router.get('/transactions', getAllTransactionsAdmin);
router.post('/stocks', createStockAdmin);
router.put('/stocks/:id', updateStockAdmin);
router.delete('/stocks/:id', deleteStockAdmin);

export default router;
