const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    payer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    payee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: { type: Number, required: true },
    platformFee: { type: Number, default: 0 },
    netAmount: { type: Number, required: true },    // amount - platformFee
    currency: { type: String, default: 'USD' },
    type: {
      type: String,
      enum: ['payment', 'refund', 'payout'],
      default: 'payment',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    method: { type: String, default: 'simulated' },
    reference: { type: String, default: '' },   // External payment ref (Stripe charge ID, etc.)
  },
  { timestamps: true }
);

transactionSchema.index({ payer: 1 });
transactionSchema.index({ payee: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
