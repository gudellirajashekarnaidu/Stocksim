/**
 * Geometric Brownian Motion price simulator.
 * Updates all stock prices every 10 seconds and broadcasts via Socket.io.
 * Sectors have different volatilities matching real-world behavior.
 */
import Stock from '../models/Stock.js';

const SECTOR_VOLATILITY = {
  Technology:              0.018,
  Automotive:              0.025,
  Financial:               0.012,
  Entertainment:           0.020,
  'Consumer Discretionary': 0.015,
  'Consumer Staples':      0.009,
  Healthcare:              0.014,
  Energy:                  0.022,
  Default:                 0.016
};

// Simulated news events that occasionally spike/crash a stock
const NEWS_EVENTS = [
  { headline: '📈 Strong earnings beat analyst expectations', impact: 0.04 },
  { headline: '📉 Regulatory investigation announced', impact: -0.05 },
  { headline: '🚀 New product launch exceeds forecasts', impact: 0.06 },
  { headline: '💔 CEO resignation announced', impact: -0.07 },
  { headline: '🤝 Major acquisition deal confirmed', impact: 0.08 },
  { headline: '⚠️ Supply chain disruptions reported', impact: -0.04 },
  { headline: '🌍 International market expansion announced', impact: 0.05 },
  { headline: '📊 Analysts upgrade to Strong Buy', impact: 0.03 },
  { headline: '🔻 Analysts downgrade on weak outlook', impact: -0.03 },
  { headline: '💰 Share buyback program initiated', impact: 0.04 },
  { headline: '🔬 Breakthrough technology patent filed', impact: 0.09 },
  { headline: '⚡ Data breach disclosed to regulators', impact: -0.06 }
];

// Track the last news event per stock (cooldown)
const stockNewsCooldown = {};

/**
 * Simulate one GBM step for a price.
 * @param {number} S  Current price
 * @param {number} vol Annualised volatility (e.g. 0.02)
 * @param {number} dt  Time fraction of a day (1 = 1 day)
 * @returns {number} New price
 */
function gbmStep(S, vol, dt = 1 / 78) {
  const drift = 0.0001;            // slight upward bias (bull market)
  const shock = (Math.random() * 2 - 1) * Math.sqrt(dt) * vol;
  return Math.max(0.01, S * Math.exp((drift - 0.5 * vol * vol) * dt + shock));
}

/**
 * Returns a news event for the stock ~2% of the time.
 */
function maybeNewsEvent(stockId) {
  const now = Date.now();
  const lastEvent = stockNewsCooldown[stockId] || 0;
  // 2% chance, with at least 60s cooldown
  if (now - lastEvent > 60000 && Math.random() < 0.02) {
    stockNewsCooldown[stockId] = now;
    return NEWS_EVENTS[Math.floor(Math.random() * NEWS_EVENTS.length)];
  }
  return null;
}

/**
 * Starts the price simulation loop.
 * @param {Server} io  Socket.io server instance
 * @param {number} intervalMs  Milliseconds between updates (default 10s)
 */
export function startPriceSimulator(io, intervalMs = 10000) {
  console.log(`⚡ Price simulator started (interval: ${intervalMs}ms)`);

  const tick = async () => {
    try {
      const stocks = await Stock.find({}, 'symbol currentPrice previousPrice sector historicalPrices').lean();
      const updates = [];

      for (const stock of stocks) {
        const vol = SECTOR_VOLATILITY[stock.sector] || SECTOR_VOLATILITY.Default;
        const newPrice = parseFloat(gbmStep(stock.currentPrice, vol).toFixed(2));
        const change = parseFloat((newPrice - stock.previousPrice).toFixed(2));
        const pct = parseFloat(((change / stock.previousPrice) * 100).toFixed(2));

        // Append to historicalPrices (keep last 90 points)
        const histEntry = { date: new Date(), price: newPrice };

        const newsEvent = maybeNewsEvent(stock._id.toString());
        let newsImpact = 1;
        let newsPayload = null;

        if (newsEvent) {
          newsImpact = 1 + newsEvent.impact;
          newsPayload = { headline: newsEvent.headline, symbol: stock.symbol, impact: newsEvent.impact };
        }

        const finalPrice = parseFloat((newPrice * newsImpact).toFixed(2));

        updates.push({
          updateOne: {
            filter: { _id: stock._id },
            update: {
              $set: {
                currentPrice: finalPrice,
                priceChange: parseFloat((finalPrice - stock.previousPrice).toFixed(2)),
                percentageChange: parseFloat(((finalPrice - stock.previousPrice) / stock.previousPrice * 100).toFixed(2))
              },
              $push: {
                historicalPrices: {
                  $each: [{ date: new Date(), price: finalPrice }],
                  $slice: -90  // keep last 90 data points
                }
              }
            }
          }
        });

        // Broadcast to Socket.io room
        const payload = {
          _id: stock._id,
          symbol: stock.symbol,
          currentPrice: finalPrice,
          priceChange: parseFloat((finalPrice - stock.previousPrice).toFixed(2)),
          percentageChange: parseFloat(((finalPrice - stock.previousPrice) / stock.previousPrice * 100).toFixed(2)),
          previousPrice: stock.previousPrice
        };

        io.emit('priceUpdate', payload);

        if (newsPayload) {
          io.emit('newsEvent', newsPayload);
        }
      }

      if (updates.length > 0) {
        await Stock.bulkWrite(updates);
      }
    } catch (err) {
      console.error('Price simulator error:', err.message);
    }
  };

  // Run immediately then on interval
  tick();
  return setInterval(tick, intervalMs);
}
