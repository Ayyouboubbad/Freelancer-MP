const Review = require('../models/Review');
const Order = require('../models/Order');
const Gig = require('../models/Gig');
const User = require('../models/User');
const Notification = require('../models/Notification');

// ─── Create review ────────────────────────────────────────────────────────────
exports.createReview = async (req, res, next) => {
  try {
    const { orderId, rating, comment } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'You can only review completed orders.' });
    }
    if (order.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the client can leave a review.' });
    }

    // Check duplicate
    const existing = await Review.findOne({ order: orderId });
    if (existing) return res.status(409).json({ success: false, message: 'Review already submitted.' });

    const review = await Review.create({
      order: orderId,
      gig: order.gig,
      reviewer: req.user._id,
      reviewee: order.freelancer,
      rating,
      comment,
    });

    // Recalculate gig averageRating
    const allReviews = await Review.find({ gig: order.gig, isHidden: false });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Gig.findByIdAndUpdate(order.gig, {
      averageRating: Math.round(avg * 10) / 10,
      totalReviews: allReviews.length,
    });

    // Award XP for 5-star review
    if (rating === 5) {
      await User.findByIdAndUpdate(order.freelancer, { $inc: { xp: 10 } });
      const freelancer = await User.findById(order.freelancer);
      freelancer.recalculateLevel();
      await freelancer.save();
    }

    // Notify freelancer
    await Notification.create({
      user: order.freelancer,
      type: 'review_received',
      title: `New ${rating}-Star Review ⭐`,
      body: `${req.user.name} left a review: "${comment.slice(0, 80)}..."`,
      link: `/gig/${order.gig}`,
    });

    res.status(201).json({ success: true, review });
  } catch (err) {
    next(err);
  }
};

// ─── Get reviews for a gig ────────────────────────────────────────────────────
exports.getGigReviews = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page  || '1',  10);
    const limit = parseInt(req.query.limit || '10', 10);
    const skip  = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ gig: req.params.gigId, isHidden: false })
        .populate('reviewer', 'name avatar country')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Review.countDocuments({ gig: req.params.gigId, isHidden: false }),
    ]);

    res.status(200).json({ success: true, total, reviews });
  } catch (err) {
    next(err);
  }
};

// ─── Report a review ──────────────────────────────────────────────────────────
exports.reportReview = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });

    review.isReported = true;
    review.reportReason = reason || '';
    await review.save();

    res.status(200).json({ success: true, message: 'Review reported for admin review.' });
  } catch (err) {
    next(err);
  }
};
