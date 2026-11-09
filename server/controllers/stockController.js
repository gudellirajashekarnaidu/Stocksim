import Stock from '../models/Stock.js';

export const getStocks = async (req, res) => {
  try {
    const { search, sector, sort, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { symbol: { $regex: search, $options: 'i' } }
      ];
    }
    if (sector) query.sector = sector;

    let sortOptions = {};
    if (sort === 'price_asc') sortOptions.currentPrice = 1;
    else if (sort === 'price_desc') sortOptions.currentPrice = -1;
    else sortOptions.symbol = 1;

    const skipIndex = (parseInt(page) - 1) * parseInt(limit);
    const total = await Stock.countDocuments(query);
    const stocks = await Stock.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skipIndex)
      .select('-historicalPrices');

    res.json({
      stocks,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStockById = async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id);
    if (!stock) return res.status(404).json({ message: 'Stock not found' });
    res.json(stock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
