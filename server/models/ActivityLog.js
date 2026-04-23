const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'user_blocked',
        'user_unblocked',
        'user_role_changed',
        'gig_approved',
        'gig_rejected',
        'gig_featured',
        'order_cancelled_admin',
        'dispute_resolved',
        'review_hidden',
        'seeder_run',
        'admin_login',
      ],
    },
    target: {
      type: String,   // e.g. "User:507f..." or "Gig:..."
      default: '',
    },
    details: {
      type: String,
      default: '',
    },
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
  },
  { timestamps: true }
);

activityLogSchema.index({ actor: 1 });
activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
