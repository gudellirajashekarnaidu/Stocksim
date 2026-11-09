import mongoose from 'mongoose';

const historicalPriceSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  price: { type: Number, required: true }
});

const stockSchema = new mongoose.Schema(
  {
    symbol: { type: String, required: true, unique: true, uppercase: true, trim: true },
    companyName: { type: String, required: true },
    currentPrice: { type: Number, required: true },
    previousPrice: { type: Number, required: true },
    priceChange: { type: Number, default: 0 },
    percentageChange: { type: Number, default: 0 },
    description: { type: String },
    sector: { type: String },
    logo: { type: String },
    dailyHigh: { type: Number },
    dailyLow: { type: Number },
    weekHigh52: { type: Number },
    weekLow52: { type: Number },
    marketCap: { type: String },
    volume: { type: Number, default: 0 },
    avgVolume: { type: Number, default: 0 },
    peRatio: { type: Number },
    dividendYield: { type: Number, default: 0 },
    historicalPrices: [historicalPriceSchema]
  },
  { timestamps: true }
);

export default mongoose.model('Stock', stockSchema);
