const router = require('express').Router();
const wishlistController = require('../controllers/wishlistController');
const disputeController = require('../controllers/disputeController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { uploadDelivery } = require('../middleware/upload');

// Wishlist
router.post('/wishlist/:gigId', auth, authorize('client'), wishlistController.toggleWishlist);
router.get('/wishlist', auth, wishlistController.getWishlist);

// Disputes
router.post('/disputes', auth, uploadDelivery, disputeController.openDispute);
router.get('/disputes/:id', auth, disputeController.getDispute);

module.exports = router;
