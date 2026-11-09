import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    stockId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stock',
      required: true
    },
    transactionType: { type: String, enum: ['BUY', 'SELL'], required: true },
    quantity: { type: Number, required: true, min: 1 },
    pricePerShare: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['COMPLETED', 'FAILED'], default: 'COMPLETED' }
  },
  { timestamps: true }
);

export default mongoose.model('Transaction', transactionSchema);
