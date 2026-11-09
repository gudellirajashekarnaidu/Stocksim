import User from '../models/User.js';
import Stock from '../models/Stock.js';
import Transaction from '../models/Transaction.js';

export const createStockAdmin = async (req, res) => {
  try {
    const stock = new Stock(req.body);
    await stock.save();
    res.status(201).json(stock);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateStockAdmin = async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id);
    if (!stock) return res.status(404).json({ message: 'Stock not found' });
    Object.assign(stock, req.body);
    await stock.save();
    res.json(stock);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteStockAdmin = async (req, res) => {
  try {
    const stock = await Stock.findByIdAndDelete(req.params.id);
    if (!stock) return res.status(404).json({ message: 'Stock not found' });
    res.json({ message: 'Stock deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsersAdmin = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllTransactionsAdmin = async (req, res) => {
  try {
    const transactions = await Transaction.find({})
      .populate('userId', 'name email')
      .populate('stockId', 'symbol companyName')
      .sort({ createdAt: -1 })
      .limit(200);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
