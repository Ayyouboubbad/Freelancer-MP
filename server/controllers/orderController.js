const Order = require('../models/Order');
const Gig = require('../models/Gig');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');

const PLATFORM_FEE_RATE = 0.20; // 20%

// ─── Place order (simulated payment) ─────────────────────────────────────────
exports.placeOrder = async (req, res, next) => {
  try {
    const { gigId, packageName, requirements } = req.body;

    const gig = await Gig.findById(gigId).populate('seller');
    if (!gig || !gig.isActive) {
      return res.status(404).json({ success: false, message: 'Gig not found or unavailable.' });
    }

    const pkg = gig.packages.find((p) => p.name === packageName);
    if (!pkg) return res.status(400).json({ success: false, message: 'Invalid package selected.' });

    // Prevent ordering your own gig
    if (gig.seller._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot order your own gig.' });
    }

    const price = pkg.price;
    const platformFee = parseFloat((price * PLATFORM_FEE_RATE).toFixed(2));
    const freelancerEarnings = parseFloat((price - platformFee).toFixed(2));
    const deadline = new Date(Date.now() + pkg.deliveryDays * 24 * 60 * 60 * 1000);

    const order = await Order.create({
      client: req.user._id,
      freelancer: gig.seller._id,
      gig: gig._id,
      package: {
        name: pkg.name,
        title: pkg.title,
        price: pkg.price,
        deliveryDays: pkg.deliveryDays,
        revisions: pkg.revisions,
        features: pkg.features,
      },
      price,
      platformFee,
      freelancerEarnings,
      status: 'active',        // Simulated: treat as instantly paid
      paymentStatus: 'paid',
      deadline,
      requirements: requirements || '',
    });

    // Create transaction record
    await Transaction.create({
      order: order._id,
      payer: req.user._id,
      payee: gig.seller._id,
      amount: price,
      platformFee,
      netAmount: freelancerEarnings,
      status: 'completed',
      method: 'simulated',
    });

    // Increment gig totalOrders
    await Gig.findByIdAndUpdate(gigId, { $inc: { totalOrders: 1 } });

    // Notify freelancer
    await Notification.create({
      user: gig.seller._id,
      type: 'order_placed',
      title: 'New Order Received 🎉',
      body: `${req.user.name} ordered your gig "${gig.title}".`,
      link: `/dashboard/freelancer/orders/${order._id}`,
      relatedOrder: order._id,
    });

    res.status(201).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// ─── Get order by ID ──────────────────────────────────────────────────────────
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('client', 'name avatar')
      .populate('freelancer', 'name avatar level')
      .populate('gig', 'title images');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    const isParty =
      order.client._id.toString() === req.user._id.toString() ||
      order.freelancer._id.toString() === req.user._id.toString();
    if (!isParty && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.status(200).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// ─── Get my orders (client or freelancer) ────────────────────────────────────
exports.getMyOrders = async (req, res, next) => {
  try {
    const status = req.query.status || '';
    const page   = parseInt(req.query.page  || '1',  10);
    const limit  = parseInt(req.query.limit || '10', 10);
    const filter = {};

    if (req.user.role === 'client') filter.client = req.user._id;
    else if (req.user.role === 'freelancer') filter.freelancer = req.user._id;

    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('client', 'name avatar')
        .populate('freelancer', 'name avatar level')
        .populate('gig', 'title images')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(filter),
    ]);

    res.status(200).json({ success: true, total, page: parseInt(page), orders });
  } catch (err) {
    next(err);
  }
};

// ─── Deliver order ────────────────────────────────────────────────────────────
exports.deliverOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the freelancer can deliver.' });
    }
    if (!['active', 'revision'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Order is not in a deliverable state.' });
    }

    const files = req.files ? req.files.map((f) => f.path) : [];
    const { note } = req.body;

    order.status = 'delivered';
    order.deliveredAt = new Date();
    order.delivery = { files, note, deliveredAt: new Date() };
    await order.save();

    // Notify client
    await Notification.create({
      user: order.client,
      type: 'order_delivered',
      title: 'Order Delivered ✅',
      body: `Your order has been delivered. Please review and accept or request a revision.`,
      link: `/dashboard/client/orders/${order._id}`,
      relatedOrder: order._id,
    });

    res.status(200).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// ─── Update order status (accept, request revision, cancel) ──────────────────
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { action, note } = req.body; // action: 'accept' | 'revision' | 'cancel'
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    const isClient = order.client.toString() === req.user._id.toString();
    const isFreelancer = order.freelancer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isClient && !isFreelancer && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (action === 'accept') {
      if (!isClient) return res.status(403).json({ success: false, message: 'Only client can accept.' });
      if (order.status !== 'delivered') {
        return res.status(400).json({ success: false, message: 'Order not delivered yet.' });
      }
      order.status = 'completed';

      // Award XP, update earnings
      await User.findByIdAndUpdate(order.freelancer, {
        $inc: { xp: 25, totalEarnings: order.freelancerEarnings, completedOrders: 1 },
      });
      // Recalculate level
      const freelancer = await User.findById(order.freelancer);
      freelancer.recalculateLevel();
      await freelancer.save();

      await Notification.create({
        user: order.freelancer,
        type: 'order_completed',
        title: 'Order Completed 🏆',
        body: `Your order has been marked as completed. You earned $${order.freelancerEarnings}.`,
        link: `/dashboard/freelancer/orders/${order._id}`,
        relatedOrder: order._id,
      });
    } else if (action === 'revision') {
      if (!isClient) return res.status(403).json({ success: false, message: 'Only client can request revision.' });
      if (order.status !== 'delivered') {
        return res.status(400).json({ success: false, message: 'Order not delivered yet.' });
      }
      if (order.revisionCount >= order.package.revisions) {
        return res.status(400).json({ success: false, message: 'Revision limit reached.' });
      }
      order.status = 'revision';
      order.revisionCount += 1;
      order.revisionNote = note || '';

      await Notification.create({
        user: order.freelancer,
        type: 'order_revision',
        title: 'Revision Requested 🔄',
        body: `Client requested a revision: ${note || 'No note provided.'}`,
        link: `/dashboard/freelancer/orders/${order._id}`,
        relatedOrder: order._id,
      });
    } else if (action === 'cancel') {
      if (!['pending', 'active'].includes(order.status)) {
        return res.status(400).json({ success: false, message: 'Cannot cancel at this stage.' });
      }
      order.status = 'cancelled';
      order.cancelledBy = isClient ? 'client' : isFreelancer ? 'freelancer' : 'admin';
      order.cancelReason = note || '';

      await Notification.create({
        user: isClient ? order.freelancer : order.client,
        type: 'order_cancelled',
        title: 'Order Cancelled',
        body: `Order has been cancelled. Reason: ${note || 'No reason provided.'}`,
        link: `/dashboard`,
        relatedOrder: order._id,
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action.' });
    }

    await order.save();
    res.status(200).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};
