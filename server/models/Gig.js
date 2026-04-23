const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  name: { type: String, required: true, enum: ['basic', 'standard', 'premium'] },
  title: { type: String, required: true, maxlength: 100 },
  description: { type: String, required: true, maxlength: 500 },
  price: { type: Number, required: true, min: 5 },
  deliveryDays: { type: Number, required: true, min: 1 },
  revisions: { type: Number, default: 1 },
  features: [{ type: String }],
});

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
});

const gigSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Gig title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'web-development',
        'mobile-apps',
        'design',
        'writing',
        'marketing',
        'video-animation',
        'music-audio',
        'data',
        'business',
        'ai-services',
        'other',
      ],
    },
    subcategory: { type: String, default: '' },
    tags: [{ type: String }],
    packages: {
      type: [packageSchema],
      validate: {
        validator: (v) => v.length >= 1 && v.length <= 3,
        message: 'A gig must have 1–3 packages',
      },
    },
    faqs: [faqSchema],

    // Media
    images: [{ type: String }],   // Cloudinary URLs
    video: { type: String, default: '' },

    // Stats
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },

    // Publishing
    isActive: { type: Boolean, default: true },
    isPaused: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
gigSchema.index({ category: 1, averageRating: -1 });
gigSchema.index({ title: 'text', description: 'text', tags: 'text' });
gigSchema.index({ seller: 1 });

module.exports = mongoose.model('Gig', gigSchema);
