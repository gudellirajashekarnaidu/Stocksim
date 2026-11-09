import Stock from '../models/Stock.js';
import Portfolio from '../models/Portfolio.js';
import User from '../models/User.js';
import Watchlist from '../models/Watchlist.js';

// GET /api/market/movers
export const getMarketMovers = async (req, res) => {
  try {
    const stocks = await Stock.find({}).select('symbol companyName currentPrice previousPrice priceChange percentageChange sector').lean();

    const sorted = stocks
      .filter(s => s.previousPrice > 0)
      .map(s => ({
        ...s,
        change: s.currentPrice - s.previousPrice,
        pct: ((s.currentPrice - s.previousPrice) / s.previousPrice) * 100
      }))
      .sort((a, b) => b.pct - a.pct);

    const gainers = sorted.slice(0, 5);
    const losers = [...sorted].sort((a, b) => a.pct - b.pct).slice(0, 5);

    res.json({ gainers, losers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/market/leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({ role: 'USER' }).select('name virtualBalance').lean();
    const portfolios = await Portfolio.find({}).populate('holdings.stockId', 'currentPrice').lean();

    const portfolioMap = {};
    for (const p of portfolios) {
      let holdingsValue = 0;
      for (const h of p.holdings) {
        if (h.stockId?.currentPrice) {
          holdingsValue += h.quantity * h.stockId.currentPrice;
        }
      }
      portfolioMap[p.userId.toString()] = holdingsValue;
    }

    const ranked = users
      .map(u => ({
        _id: u._id,
        name: u.name,
        cashBalance: u.virtualBalance,
        holdingsValue: portfolioMap[u._id.toString()] || 0,
        totalValue: u.virtualBalance + (portfolioMap[u._id.toString()] || 0)
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 20)
      .map((u, i) => ({ ...u, rank: i + 1 }));

    res.json(ranked);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/market/watchlist
export const getWatchlist = async (req, res) => {
  try {
    const wl = await Watchlist.findOne({ userId: req.user._id }).populate(
      'stocks', 'symbol companyName currentPrice previousPrice sector priceChange percentageChange'
    );
    res.json(wl?.stocks || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/market/watchlist/:stockId
export const toggleWatchlist = async (req, res) => {
  try {
    const { stockId } = req.params;
    let wl = await Watchlist.findOne({ userId: req.user._id });
    if (!wl) {
      wl = await Watchlist.create({ userId: req.user._id, stocks: [stockId] });
      return res.json({ watched: true, message: 'Added to watchlist' });
    }

    const idx = wl.stocks.findIndex(id => id.toString() === stockId);
    if (idx > -1) {
      wl.stocks.splice(idx, 1);
      await wl.save();
      return res.json({ watched: false, message: 'Removed from watchlist' });
    } else {
      wl.stocks.push(stockId);
      await wl.save();
      return res.json({ watched: true, message: 'Added to watchlist' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/market/watchlist/:stockId/status
export const getWatchStatus = async (req, res) => {
  try {
    const wl = await Watchlist.findOne({ userId: req.user._id });
    const watched = wl?.stocks.some(id => id.toString() === req.params.stockId) || false;
    res.json({ watched });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/market/overview - summary stats
export const getMarketOverview = async (req, res) => {
  try {
    const stocks = await Stock.find({}).select('currentPrice previousPrice').lean();
    const advancing = stocks.filter(s => s.currentPrice >= s.previousPrice).length;
    const declining = stocks.length - advancing;

    res.json({
      totalStocks: stocks.length,
      advancing,
      declining,
      unchanged: 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
