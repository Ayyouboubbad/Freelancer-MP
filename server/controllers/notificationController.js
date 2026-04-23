const Notification = require('../models/Notification');

// ─── Get my notifications ─────────────────────────────────────────────────────
exports.getNotifications = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page  || '1',  10);
    const limit = parseInt(req.query.limit || '20', 10);
    const skip  = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ user: req.user._id })
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ user: req.user._id }),
      Notification.countDocuments({ user: req.user._id, isRead: false }),
    ]);

    res.status(200).json({ success: true, total, unreadCount, notifications });
  } catch (err) {
    next(err);
  }
};

// ─── Mark all as read ─────────────────────────────────────────────────────────
exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
};

// ─── Mark single as read ──────────────────────────────────────────────────────
exports.markRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true, readAt: new Date() }
    );
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

// ─── Delete notification ──────────────────────────────────────────────────────
exports.deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.status(200).json({ success: true, message: 'Notification deleted.' });
  } catch (err) {
    next(err);
  }
};
