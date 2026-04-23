const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  files: [{ type: String }],   // Cloudinary URLs
  note: { type: String, maxlength: 1000 },
  deliveredAt: { type: Date, default: Date.now },
});

const orderSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    gig: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gig',
      required: true,
    },
    package: {
      name: String,
      title: String,
      price: Number,
      deliveryDays: Number,
      revisions: Number,
      features: [String],
    },

    // Pricing
    price: { type: Number, required: true },
    platformFee: { type: Number, default: 0 },   // e.g. 20% of price
    freelancerEarnings: { type: Number, default: 0 },

    // Status flow: pending → active → delivered → revision → completed | cancelled | disputed
    status: {
      type: String,
      enum: ['pending', 'active', 'delivered', 'revision', 'completed', 'cancelled', 'disputed'],
      default: 'pending',
    },

    // Payment (simulated)
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid',
    },
    paymentMethod: { type: String, default: 'simulated' },
    transactionId: { type: String, default: '' },

    // Deadlines
    deadline: { type: Date },
    deliveredAt: { type: Date },

    // Revision requests
    revisionCount: { type: Number, default: 0 },
    revisionNote: { type: String, default: '' },

    // Requirements from client
    requirements: { type: String, default: '' },

    // Delivery files
    delivery: deliverySchema,

    // Cancellation
    cancelledBy: { type: String, enum: ['client', 'freelancer', 'admin', ''], default: '' },
    cancelReason: { type: String, default: '' },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
orderSchema.index({ freelancer: 1, status: 1 });
orderSchema.index({ client: 1, status: 1 });

module.exports = mongoose.model('Order', orderSchema);
