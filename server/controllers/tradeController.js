import User from '../models/User.js';
import Stock from '../models/Stock.js';
import Transaction from '../models/Transaction.js';
import Portfolio from '../models/Portfolio.js';

export const buyStock = async (req, res) => {
  const { stockId, quantity } = req.body;
  const qty = Number(quantity);

  if (!qty || qty <= 0) {
    return res.status(400).json({
      message: 'Invalid quantity. Must be a positive number.'
    });
  }

  try {
    const stock = await Stock.findById(stockId);
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    const totalCost = stock.currentPrice * qty;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.virtualBalance < totalCost) {
      return res.status(400).json({
        message: `Insufficient balance. Need $${totalCost.toFixed(2)}, have $${user.virtualBalance.toFixed(2)}`
      });
    }

    user.virtualBalance = Number((user.virtualBalance - totalCost).toFixed(2));
    await user.save();

    let portfolio = await Portfolio.findOne({ userId: user._id });

    if (!portfolio) {
      portfolio = new Portfolio({
        userId: user._id,
        holdings: []
      });
    }

    const holdingIndex = portfolio.holdings.findIndex(
      h => h.stockId.toString() === stockId
    );

    if (holdingIndex >= 0) {
      const holding = portfolio.holdings[holdingIndex];

      const newQty = holding.quantity + qty;

      holding.averageBuyPrice =
        (
          (holding.averageBuyPrice * holding.quantity) +
          totalCost
        ) / newQty;

      holding.quantity = newQty;
    } else {
      portfolio.holdings.push({
        stockId,
        quantity: qty,
        averageBuyPrice: stock.currentPrice
      });
    }

    await portfolio.save();

    await Transaction.create({
      userId: user._id,
      stockId,
      transactionType: 'BUY',
      quantity: qty,
      pricePerShare: stock.currentPrice,
      totalAmount: totalCost,
      status: 'COMPLETED'
    });

    res.status(200).json({
      message: `Successfully bought ${qty} share(s) of ${stock.symbol}`,
      balance: user.virtualBalance
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message
    });
  }
};

export const sellStock = async (req, res) => {
  const { stockId, quantity } = req.body;
  const qty = Number(quantity);

  if (!qty || qty <= 0) {
    return res.status(400).json({
      message: 'Invalid quantity. Must be a positive number.'
    });
  }

  try {
    const stock = await Stock.findById(stockId);
    if (!stock) {
      return res.status(404).json({
        message: 'Stock not found'
      });
    }

    const portfolio = await Portfolio.findOne({
      userId: req.user._id
    });

    if (!portfolio) {
      return res.status(404).json({
        message: 'Portfolio not found'
      });
    }

    const holdingIndex = portfolio.holdings.findIndex(
      h => h.stockId.toString() === stockId
    );

    if (
      holdingIndex === -1 ||
      portfolio.holdings[holdingIndex].quantity < qty
    ) {
      return res.status(400).json({
        message: `Insufficient shares. You own ${portfolio.holdings[holdingIndex]?.quantity || 0} share(s).`
      });
    }

    const totalGain = Number((stock.currentPrice * qty).toFixed(2));

    const user = await User.findById(req.user._id);

    user.virtualBalance = Number(
      (user.virtualBalance + totalGain).toFixed(2)
    );

    await user.save();

    portfolio.holdings[holdingIndex].quantity -= qty;

    if (portfolio.holdings[holdingIndex].quantity === 0) {
      portfolio.holdings.splice(holdingIndex, 1);
    }

    await portfolio.save();

    await Transaction.create({
      userId: user._id,
      stockId,
      transactionType: 'SELL',
      quantity: qty,
      pricePerShare: stock.currentPrice,
      totalAmount: totalGain,
      status: 'COMPLETED'
    });

    res.status(200).json({
      message: `Successfully sold ${qty} share(s) of ${stock.symbol}`,
      balance: user.virtualBalance
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message
    });
  }
};

export const getUserPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      userId: req.user._id
    }).populate('holdings.stockId');

    const user = await User.findById(req.user._id).select('virtualBalance');

    if (!portfolio) {
      return res.json({
        holdings: [],
        investedAmount: 0,
        currentValue: 0,
        totalProfitLoss: 0,
        profitLossPercentage: 0,
        cashBalance: user?.virtualBalance || 0
      });
    }

    let investedAmount = 0;
    let currentValue = 0;

    const holdings = portfolio.holdings
      .filter(h => h.stockId)
      .map(h => {
        const invested = h.quantity * h.averageBuyPrice;
        const current = h.quantity * h.stockId.currentPrice;

        investedAmount += invested;
        currentValue += current;

        return {
          stockId: h.stockId._id,
          symbol: h.stockId.symbol,
          companyName: h.stockId.companyName,
          quantity: h.quantity,
          averageBuyPrice: h.averageBuyPrice,
          currentPrice: h.stockId.currentPrice,
          currentValue: current,
          profitLoss: current - invested,
          profitLossPercentage:
            invested > 0
              ? (((current - invested) / invested) * 100).toFixed(2)
              : 0
        };
      });

    const totalProfitLoss = currentValue - investedAmount;

    res.json({
      holdings,
      investedAmount,
      currentValue,
      totalProfitLoss,
      profitLossPercentage:
        investedAmount > 0
          ? ((totalProfitLoss / investedAmount) * 100).toFixed(2)
          : 0,
      cashBalance: user?.virtualBalance || 0
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message
    });
  }
};

export const getTransactionHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      userId: req.user._id
    })
      .populate('stockId', 'symbol companyName')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(transactions);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message
    });
  }
};