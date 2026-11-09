import express from 'express';
import {
  getMarketMovers,
  getLeaderboard,
  getWatchlist,
  toggleWatchlist,
  getWatchStatus,
  getMarketOverview
} from '../controllers/marketController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/movers', getMarketMovers);
router.get('/leaderboard', getLeaderboard);
router.get('/overview', getMarketOverview);

// Watchlist (protected)
router.get('/watchlist', protect, getWatchlist);
router.post('/watchlist/:stockId', protect, toggleWatchlist);
router.get('/watchlist/:stockId/status', protect, getWatchStatus);

export default router;
