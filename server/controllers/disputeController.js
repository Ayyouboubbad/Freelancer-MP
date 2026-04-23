const Dispute = require('../models/Dispute');
const Order = require('../models/Order');
const Notification = require('../models/Notification');

// ─── Open dispute ─────────────────────────────────────────────────────────────
exports.openDispute = async (req, res, next) => {
  try {
    const { orderId, reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    const isParty =
      order.client.toString() === req.user._id.toString() ||
      order.freelancer.toString() === req.user._id.toString();
    if (!isParty) return res.status(403).json({ success: false, message: 'Access denied.' });

    if (!['active', 'delivered', 'revision'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Cannot dispute at this stage.' });
    }

    const existing = await Dispute.findOne({ order: orderId, status: 'open' });
    if (existing) return res.status(409).json({ success: false, message: 'A dispute is already open for this order.' });

    const against =
      req.user._id.toString() === order.client.toString() ? order.freelancer : order.client;

    const evidence = req.files ? req.files.map((f) => f.path) : [];

    const dispute = await Dispute.create({
      order: orderId,
      raisedBy: req.user._id,
      against,
      reason,
      evidence,
    });

    // Update order status
    order.status = 'disputed';
    await order.save();

    // Notify the other party
    await Notification.create({
      user: against,
      type: 'dispute_opened',
      title: 'Dispute Opened ⚠️',
      body: `A dispute has been opened on order. Reason: ${reason.slice(0, 100)}`,
      link: `/dashboard`,
      relatedOrder: order._id,
    });

    res.status(201).json({ success: true, dispute });
  } catch (err) {
    next(err);
  }
};

// ─── Get dispute ──────────────────────────────────────────────────────────────
exports.getDispute = async (req, res, next) => {
  try {
    const dispute = await Dispute.findById(req.params.id)
      .populate('raisedBy', 'name avatar')
      .populate('against', 'name avatar')
      .populate('order')
      .populate('resolvedBy', 'name');

    if (!dispute) return res.status(404).json({ success: false, message: 'Dispute not found.' });

    const isParty =
      dispute.raisedBy._id.toString() === req.user._id.toString() ||
      dispute.against._id.toString() === req.user._id.toString();
    if (!isParty && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.status(200).json({ success: true, dispute });
  } catch (err) {
    next(err);
  }
};
