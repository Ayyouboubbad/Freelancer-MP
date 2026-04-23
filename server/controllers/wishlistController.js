const User = require('../models/User');
const Gig = require('../models/Gig');

// ─── Toggle wishlist ──────────────────────────────────────────────────────────
exports.toggleWishlist = async (req, res, next) => {
  try {
    const { gigId } = req.params;

    const gig = await Gig.findById(gigId);
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found.' });

    const user = await User.findById(req.user._id);
    const index = user.wishlist.indexOf(gigId);

    let action;
    if (index === -1) {
      user.wishlist.push(gigId);
      action = 'added';
    } else {
      user.wishlist.splice(index, 1);
      action = 'removed';
    }

    await user.save();
    res.status(200).json({ success: true, action, wishlist: user.wishlist });
  } catch (err) {
    next(err);
  }
};

// ─── Get wishlist ─────────────────────────────────────────────────────────────
exports.getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'wishlist',
      populate: { path: 'seller', select: 'name avatar level' },
    });
    res.status(200).json({ success: true, wishlist: user.wishlist });
  } catch (err) {
    next(err);
  }
};
