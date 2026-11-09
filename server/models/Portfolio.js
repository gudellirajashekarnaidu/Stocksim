import mongoose from 'mongoose';

const holdingSchema = new mongoose.Schema({
  stockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock', required: true },
  quantity: { type: Number, required: true, min: 0 },
  averageBuyPrice: { type: Number, required: true }
});

const portfolioSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    holdings: [holdingSchema]
  },
  { timestamps: true }
);

export default mongoose.model('Portfolio', portfolioSchema);
