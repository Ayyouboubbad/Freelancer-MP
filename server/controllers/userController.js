const User = require('../models/User');
const Gig = require('../models/Gig');
const Review = require('../models/Review');

// ─── Get public profile ───────────────────────────────────────────────────────
exports.getPublicProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name avatar bio country languages skills xp level totalEarnings completedOrders responseTime isAvailable isVerified role createdAt');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    if (user.isBlocked) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Fetch gigs if freelancer
    let gigs = [];
    if (user.role === 'freelancer') {
      gigs = await Gig.find({ seller: user._id, isActive: true })
        .select('title images packages averageRating totalReviews totalOrders category isFeatured')
        .sort('-createdAt')
        .limit(12);
    }

    // Fetch reviews where this user is the reviewee
    const reviews = await Review.find({ reviewee: user._id, isHidden: false })
      .populate('reviewer', 'name avatar country')
      .sort('-createdAt')
      .limit(10);

    const avgRating = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.status(200).json({
      success: true,
      profile: {
        ...user.toObject(),
        gigs,
        reviews,
        averageRating: parseFloat(avgRating.toFixed(1)),
        totalReviews: reviews.length,
      },
    });
  } catch (err) {
    next(err);
  }
};
