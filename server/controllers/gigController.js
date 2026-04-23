const Gig = require('../models/Gig');
const Order = require('../models/Order');

// ─── Create Gig ───────────────────────────────────────────────────────────────
exports.createGig = async (req, res, next) => {
  try {
    const { title, description, category, subcategory, tags, packages, faqs } = req.body;

    const images = req.files ? req.files.map((f) => f.path) : [];

    const gig = await Gig.create({
      seller: req.user._id,
      title,
      description,
      category,
      subcategory,
      tags: typeof tags === 'string' ? JSON.parse(tags) : tags,
      packages: typeof packages === 'string' ? JSON.parse(packages) : packages,
      faqs: faqs ? (typeof faqs === 'string' ? JSON.parse(faqs) : faqs) : [],
      images,
    });

    res.status(201).json({ success: true, gig });
  } catch (err) {
    next(err);
  }
};

// ─── Get all gigs (with filters) ──────────────────────────────────────────────
exports.getGigs = async (req, res, next) => {
  try {
    const category     = req.query.category    || '';
    const minPrice     = req.query.minPrice     || '';
    const maxPrice     = req.query.maxPrice     || '';
    const minRating    = req.query.minRating    || '';
    const deliveryDays = req.query.deliveryDays || '';
    const sort         = req.query.sort         || '-createdAt';
    const page         = parseInt(req.query.page  || '1',  10);
    const limit        = parseInt(req.query.limit || '12', 10);

    const filter = { isActive: true, isPaused: false };
    if (category) filter.category = category;
    if (minRating) filter.averageRating = { $gte: parseFloat(minRating) };

    let priceFilter = {};
    if (minPrice) priceFilter.$gte = parseFloat(minPrice);
    if (maxPrice) priceFilter.$lte = parseFloat(maxPrice);
    if (Object.keys(priceFilter).length) filter['packages.price'] = priceFilter;

    if (deliveryDays) filter['packages.deliveryDays'] = { $lte: parseInt(deliveryDays) };

    const skip = (page - 1) * limit;

    const [gigs, total] = await Promise.all([
      Gig.find(filter)
        .populate('seller', 'name avatar level country')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Gig.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      gigs,
    });
  } catch (err) {
    next(err);
  }
};

// ─── Search gigs ──────────────────────────────────────────────────────────────
exports.searchGigs = async (req, res, next) => {
  try {
    const q        = req.query.q        || '';
    const category = req.query.category || '';
    const sort     = req.query.sort     || '-createdAt';
    const page     = parseInt(req.query.page  || '1',  10);
    const limit    = parseInt(req.query.limit || '12', 10);

    const filter = { isActive: true, isPaused: false };
    if (q) filter.$text = { $search: q };
    if (category) filter.category = category;

    const skip = (page - 1) * limit;

    const [gigs, total] = await Promise.all([
      Gig.find(filter, q ? { score: { $meta: 'textScore' } } : {})
        .populate('seller', 'name avatar level country')
        .sort(q ? { score: { $meta: 'textScore' } } : sort)
        .skip(skip)
        .limit(limit),
      Gig.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      gigs,
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get single gig ───────────────────────────────────────────────────────────
exports.getGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id).populate(
      'seller',
      'name avatar bio level country languages skills completedOrders responseTime isAvailable'
    );
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found.' });

    // Track impressions
    await Gig.findByIdAndUpdate(req.params.id, { $inc: { impressions: 1 } });

    res.status(200).json({ success: true, gig });
  } catch (err) {
    next(err);
  }
};

// ─── Update gig ───────────────────────────────────────────────────────────────
exports.updateGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found.' });
    if (gig.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const allowed = ['title', 'description', 'category', 'subcategory', 'tags', 'packages', 'faqs', 'isPaused'];
    const updates = {};
    allowed.forEach((f) => {
      if (req.body[f] !== undefined) {
        updates[f] = typeof req.body[f] === 'string' && ['tags', 'packages', 'faqs'].includes(f)
          ? JSON.parse(req.body[f])
          : req.body[f];
      }
    });

    if (req.files && req.files.length) {
      updates.images = req.files.map((f) => f.path);
    }

    const updated = await Gig.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    res.status(200).json({ success: true, gig: updated });
  } catch (err) {
    next(err);
  }
};

// ─── Delete gig ───────────────────────────────────────────────────────────────
exports.deleteGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found.' });
    if (gig.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    // Check for active orders
    const activeOrders = await Order.countDocuments({
      gig: gig._id,
      status: { $in: ['pending', 'active', 'delivered', 'revision'] },
    });
    if (activeOrders > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete gig with active orders.' });
    }

    await gig.deleteOne();
    res.status(200).json({ success: true, message: 'Gig deleted.' });
  } catch (err) {
    next(err);
  }
};

// ─── My gigs (freelancer) ─────────────────────────────────────────────────────
exports.getMyGigs = async (req, res, next) => {
  try {
    const gigs = await Gig.find({ seller: req.user._id }).sort('-createdAt');
    res.status(200).json({ success: true, count: gigs.length, gigs });
  } catch (err) {
    next(err);
  }
};
