const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'order_placed',
        'order_delivered',
        'order_completed',
        'order_cancelled',
        'order_revision',
        'review_received',
        'message_received',
        'dispute_opened',
        'dispute_resolved',
        'gig_approved',
        'gig_rejected',
        'system',
      ],
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    link: { type: String, default: '' },   // Frontend route to navigate to
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    // Optional reference
    relatedOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    relatedGig: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig' },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
