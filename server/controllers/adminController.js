const User = require('../models/User');
const Gig = require('../models/Gig');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Dispute = require('../models/Dispute');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const logActivity = require('../middleware/activityLogger');

// ─── Get all users ────────────────────────────────────────────────────────────
exports.getUsers = async (req, res, next) => {
  try {
    const role = req.query.role || '';
    const isBlocked = req.query.isBlocked;
    const search = req.query.search || '';
    const page  = parseInt(req.query.page  || '1',  10);
    const limit = parseInt(req.query.limit || '20', 10);
    const filter = {};
    if (role) filter.role = role;
    if (isBlocked !== undefined) filter.isBlocked = isBlocked === 'true';
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(filter).select('-password').sort('-createdAt').skip(skip).limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);

    res.status(200).json({ success: true, total, users });
  } catch (err) {
    next(err);
  }
};

// ─── Block / unblock user ─────────────────────────────────────────────────────
exports.toggleBlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    user.isBlocked = !user.isBlocked;
    await user.save();

    await logActivity({
      actorId: req.user._id,
      action: user.isBlocked ? 'user_blocked' : 'user_unblocked',
      target: `User:${user._id}`,
      details: `${user.name} (${user.email})`,
      req,
    });

    res.status(200).json({ success: true, isBlocked: user.isBlocked, message: `User ${user.isBlocked ? 'blocked' : 'unblocked'}.` });
  } catch (err) {
    next(err);
  }
};

// ─── Change user role ─────────────────────────────────────────────────────────
exports.changeUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['client', 'freelancer', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    await logActivity({
      actorId: req.user._id,
      action: 'user_role_changed',
      target: `User:${user._id}`,
      details: `Role changed to ${role}`,
      req,
    });

    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// ─── Get all gigs (admin) ─────────────────────────────────────────────────────
exports.getAdminGigs = async (req, res, next) => {
  try {
    const page     = parseInt(req.query.page  || '1',  10);
    const limit    = parseInt(req.query.limit || '20', 10);
    const isActive = req.query.isActive;
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [gigs, total] = await Promise.all([
      Gig.find(filter).populate('seller', 'name email').sort('-createdAt').skip(skip).limit(parseInt(limit)),
      Gig.countDocuments(filter),
    ]);

    res.status(200).json({ success: true, total, gigs });
  } catch (err) {
    next(err);
  }
};

// ─── Feature / unfeatured a gig ───────────────────────────────────────────────
exports.featureGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found.' });

    gig.isFeatured = !gig.isFeatured;
    await gig.save();

    await logActivity({
      actorId: req.user._id,
      action: 'gig_featured',
      target: `Gig:${gig._id}`,
      details: `Gig "${gig.title}" ${gig.isFeatured ? 'featured' : 'unfeatured'}`,
      req,
    });

    res.status(200).json({ success: true, isFeatured: gig.isFeatured });
  } catch (err) {
    next(err);
  }
};

// ─── Get all disputes ─────────────────────────────────────────────────────────
exports.getDisputes = async (req, res, next) => {
  try {
    const status = req.query.status || '';
    const page   = parseInt(req.query.page  || '1',  10);
    const limit  = parseInt(req.query.limit || '20', 10);
    const filter = {};
    if (status) filter.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [disputes, total] = await Promise.all([
      Dispute.find(filter)
        .populate('raisedBy', 'name email')
        .populate('against', 'name email')
        .populate('order', 'price status')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit)),
      Dispute.countDocuments(filter),
    ]);

    res.status(200).json({ success: true, total, disputes });
  } catch (err) {
    next(err);
  }
};

// ─── Resolve dispute ──────────────────────────────────────────────────────────
exports.resolveDispute = async (req, res, next) => {
  try {
    const { resolution, favorOf } = req.body; // favorOf: 'client' | 'freelancer'

    const dispute = await Dispute.findById(req.params.id).populate('order');
    if (!dispute) return res.status(404).json({ success: false, message: 'Dispute not found.' });

    dispute.status = favorOf === 'client' ? 'resolved_client' : 'resolved_freelancer';
    dispute.resolution = resolution;
    dispute.resolvedBy = req.user._id;
    dispute.resolvedAt = new Date();
    await dispute.save();

    // Update order
    await Order.findByIdAndUpdate(dispute.order._id, { status: 'cancelled' });

    // Notify both parties
    const notifyMsg = `Dispute resolved in favor of the ${favorOf}. ${resolution}`;
    await Notification.insertMany([
      {
        user: dispute.raisedBy,
        type: 'dispute_resolved',
        title: 'Dispute Resolved',
        body: notifyMsg,
        link: `/dashboard`,
        relatedOrder: dispute.order._id,
      },
      {
        user: dispute.against,
        type: 'dispute_resolved',
        title: 'Dispute Resolved',
        body: notifyMsg,
        link: `/dashboard`,
        relatedOrder: dispute.order._id,
      },
    ]);

    await logActivity({
      actorId: req.user._id,
      action: 'dispute_resolved',
      target: `Dispute:${dispute._id}`,
      details: `Resolved in favor of ${favorOf}`,
      req,
    });

    res.status(200).json({ success: true, dispute });
  } catch (err) {
    next(err);
  }
};

// ─── Hide / show review ───────────────────────────────────────────────────────
exports.toggleReviewVisibility = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });

    review.isHidden = !review.isHidden;
    await review.save();

    await logActivity({
      actorId: req.user._id,
      action: 'review_hidden',
      target: `Review:${review._id}`,
      req,
    });

    res.status(200).json({ success: true, isHidden: review.isHidden });
  } catch (err) {
    next(err);
  }
};

// ─── Platform analytics ───────────────────────────────────────────────────────
exports.getAnalytics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalFreelancers,
      totalClients,
      totalGigs,
      totalOrders,
      completedOrders,
      totalReviews,
      openDisputes,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'freelancer' }),
      User.countDocuments({ role: 'client' }),
      Gig.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ status: 'completed' }),
      Review.countDocuments(),
      Dispute.countDocuments({ status: 'open' }),
    ]);

    // Revenue (sum of all completed transaction amounts)
    const revenueAgg = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$platformFee' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // Orders per month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const ordersPerMonth = await Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: '$platformFee' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        totalUsers,
        totalFreelancers,
        totalClients,
        totalGigs,
        totalOrders,
        completedOrders,
        totalReviews,
        openDisputes,
        totalRevenue,
        ordersPerMonth,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get activity logs ────────────────────────────────────────────────────────
exports.getLogs = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page  || '1',  10);
    const limit = parseInt(req.query.limit || '50', 10);
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      ActivityLog.find()
        .populate('actor', 'name email')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit)),
      ActivityLog.countDocuments(),
    ]);

    res.status(200).json({ success: true, total, logs });
  } catch (err) {
    next(err);
  }
};
