import Stock from '../models/Stock.js';

const generateHistoricalPrices = (basePrice, days = 30) => {
  const prices = [];
  let price = basePrice * 0.88;
  for (let i = days; i >= 0; i--) {
    const change = (Math.random() - 0.47) * 0.03;
    price = Math.max(0.01, price * (1 + change));
    prices.push({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      price: parseFloat(price.toFixed(2))
    });
  }
  return prices;
};

const STOCKS = [
  {
    symbol: 'AAPL', companyName: 'Apple Inc.',
    currentPrice: 178.50, previousPrice: 174.80,
    description: 'Apple designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. Its flagship products include iPhone, Mac, iPad, and Apple Watch.',
    sector: 'Technology', marketCap: '2.74T', peRatio: 28.4, dividendYield: 0.52,
    weekHigh52: 199.62, weekLow52: 143.90,
    volume: 58200000, avgVolume: 61400000,
    dailyHigh: 179.20, dailyLow: 174.10,
    priceChange: 3.70, percentageChange: 2.12
  },
  {
    symbol: 'TSLA', companyName: 'Tesla Inc.',
    currentPrice: 218.30, previousPrice: 224.60,
    description: 'Tesla designs, develops, manufactures, leases, and sells electric vehicles, energy generation and storage systems, and related services. It operates Gigafactories worldwide.',
    sector: 'Automotive', marketCap: '693B', peRatio: 55.2, dividendYield: 0,
    weekHigh52: 299.29, weekLow52: 138.80,
    volume: 112000000, avgVolume: 124000000,
    dailyHigh: 227.00, dailyLow: 215.10,
    priceChange: -6.30, percentageChange: -2.81
  },
  {
    symbol: 'GOOGL', companyName: 'Alphabet Inc.',
    currentPrice: 142.65, previousPrice: 139.40,
    description: 'Alphabet is the parent company of Google, the world\'s largest search engine, along with YouTube, Google Cloud, Waymo, and other subsidiaries.',
    sector: 'Technology', marketCap: '1.78T', peRatio: 24.1, dividendYield: 0,
    weekHigh52: 153.78, weekLow52: 102.63,
    volume: 22400000, avgVolume: 25600000,
    dailyHigh: 143.90, dailyLow: 140.10,
    priceChange: 3.25, percentageChange: 2.33
  },
  {
    symbol: 'MSFT', companyName: 'Microsoft Corporation',
    currentPrice: 382.40, previousPrice: 374.60,
    description: 'Microsoft develops, licenses, and supports software, services, devices, and solutions. Products include Windows, Office 365, Azure cloud, and Xbox gaming.',
    sector: 'Technology', marketCap: '2.84T', peRatio: 35.8, dividendYield: 0.72,
    weekHigh52: 420.82, weekLow52: 309.45,
    volume: 20100000, avgVolume: 22800000,
    dailyHigh: 385.00, dailyLow: 378.20,
    priceChange: 7.80, percentageChange: 2.08
  },
  {
    symbol: 'AMZN', companyName: 'Amazon.com Inc.',
    currentPrice: 188.40, previousPrice: 184.20,
    description: 'Amazon is the world\'s largest e-commerce and cloud computing company. AWS is the global leader in cloud infrastructure, powering a large portion of the modern internet.',
    sector: 'Consumer Discretionary', marketCap: '1.96T', peRatio: 44.3, dividendYield: 0,
    weekHigh52: 201.20, weekLow52: 118.35,
    volume: 35600000, avgVolume: 38900000,
    dailyHigh: 190.50, dailyLow: 185.80,
    priceChange: 4.20, percentageChange: 2.28
  },
  {
    symbol: 'NVDA', companyName: 'NVIDIA Corporation',
    currentPrice: 892.30, previousPrice: 854.50,
    description: 'NVIDIA is the world\'s leading designer of GPUs for gaming, data centers, and AI. Its chips power the majority of generative AI training workloads globally.',
    sector: 'Technology', marketCap: '2.19T', peRatio: 72.6, dividendYield: 0.03,
    weekHigh52: 974.00, weekLow52: 390.63,
    volume: 41800000, avgVolume: 44200000,
    dailyHigh: 898.60, dailyLow: 860.10,
    priceChange: 37.80, percentageChange: 4.42
  },
  {
    symbol: 'META', companyName: 'Meta Platforms Inc.',
    currentPrice: 512.60, previousPrice: 498.30,
    description: 'Meta develops social media platforms including Facebook, Instagram, and WhatsApp, serving billions of users. It is also investing heavily in the metaverse via Reality Labs.',
    sector: 'Technology', marketCap: '1.31T', peRatio: 26.9, dividendYield: 0.40,
    weekHigh52: 531.49, weekLow52: 296.36,
    volume: 16200000, avgVolume: 18900000,
    dailyHigh: 516.90, dailyLow: 504.20,
    priceChange: 14.30, percentageChange: 2.87
  },
  {
    symbol: 'JPM', companyName: 'JPMorgan Chase & Co.',
    currentPrice: 196.80, previousPrice: 200.40,
    description: 'JPMorgan Chase is the largest U.S. bank by assets. It operates in investment banking, commercial banking, financial transaction processing, and asset management.',
    sector: 'Financial', marketCap: '563B', peRatio: 11.8, dividendYield: 2.31,
    weekHigh52: 220.19, weekLow52: 143.26,
    volume: 8900000, avgVolume: 9800000,
    dailyHigh: 201.50, dailyLow: 195.60,
    priceChange: -3.60, percentageChange: -1.80
  },
  {
    symbol: 'WMT', companyName: 'Walmart Inc.',
    currentPrice: 68.20, previousPrice: 66.90,
    description: 'Walmart operates the world\'s largest retail chain with over 10,000 stores globally, including Walmart Supercenters, Sam\'s Club, and a rapidly growing e-commerce segment.',
    sector: 'Consumer Staples', marketCap: '548B', peRatio: 29.6, dividendYield: 1.25,
    weekHigh52: 71.95, weekLow52: 49.85,
    volume: 11200000, avgVolume: 13400000,
    dailyHigh: 68.90, dailyLow: 67.20,
    priceChange: 1.30, percentageChange: 1.94
  },
  {
    symbol: 'DIS', companyName: 'The Walt Disney Company',
    currentPrice: 113.80, previousPrice: 111.20,
    description: 'Disney is one of the world\'s largest entertainment companies, with operations spanning media networks, theme parks, streaming (Disney+), and studio entertainment.',
    sector: 'Entertainment', marketCap: '208B', peRatio: 72.3, dividendYield: 0,
    weekHigh52: 123.74, weekLow52: 78.73,
    volume: 14500000, avgVolume: 16200000,
    dailyHigh: 114.80, dailyLow: 111.60,
    priceChange: 2.60, percentageChange: 2.34
  },
  {
    symbol: 'NFLX', companyName: 'Netflix Inc.',
    currentPrice: 634.50, previousPrice: 619.80,
    description: 'Netflix is the world\'s largest streaming entertainment service with 260+ million paid memberships globally, offering a vast library of TV shows, films, anime, and documentaries.',
    sector: 'Entertainment', marketCap: '274B', peRatio: 43.5, dividendYield: 0,
    weekHigh52: 700.99, weekLow52: 344.73,
    volume: 5200000, avgVolume: 6100000,
    dailyHigh: 638.00, dailyLow: 626.40,
    priceChange: 14.70, percentageChange: 2.37
  },
  {
    symbol: 'BRK.B', companyName: 'Berkshire Hathaway Inc.',
    currentPrice: 402.30, previousPrice: 396.80,
    description: 'Berkshire Hathaway, led by Warren Buffett, is a multinational conglomerate holding company, with subsidiaries including GEICO, Burlington Northern Santa Fe, and Dairy Queen.',
    sector: 'Financial', marketCap: '878B', peRatio: 9.1, dividendYield: 0,
    weekHigh52: 417.50, weekLow52: 330.93,
    volume: 3800000, avgVolume: 4200000,
    dailyHigh: 404.90, dailyLow: 398.10,
    priceChange: 5.50, percentageChange: 1.39
  }
];

export const seedDatabase = async () => {
  try {
    const count = await Stock.countDocuments();

    if (count > 0 && count < STOCKS.length) {
      // Drop and re-seed if we have fewer stocks than expected
      await Stock.deleteMany({});
      console.log('🔄 Re-seeding with updated stock data...');
    } else if (count >= STOCKS.length) {
      console.log(`📊 Market data already seeded (${count} stocks)`);
      return;
    }

    const stockData = STOCKS.map(s => ({
      ...s,
      historicalPrices: generateHistoricalPrices(s.currentPrice, 30)
    }));

    await Stock.insertMany(stockData);
    console.log(`✅ Seeded ${stockData.length} realistic stocks with 30-day historical prices`);
  } catch (err) {
    console.error('Seed error:', err.message);
  }
};
