const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    against: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      required: [true, 'Dispute reason is required'],
      maxlength: [2000, 'Reason cannot exceed 2000 characters'],
    },
    evidence: [{ type: String }],   // Cloudinary attachment URLs
    status: {
      type: String,
      enum: ['open', 'under_review', 'resolved_client', 'resolved_freelancer', 'closed'],
      default: 'open',
    },
    resolution: { type: String, default: '' },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

disputeSchema.index({ status: 1 });
disputeSchema.index({ order: 1 });

module.exports = mongoose.model('Dispute', disputeSchema);
