import mongoose from 'mongoose';

const watchlistSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    stocks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Stock' }]
  },
  { timestamps: true }
);

export default mongoose.model('Watchlist', watchlistSchema);
