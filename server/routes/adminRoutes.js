const router = require('express').Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.use(auth, authorize('admin'));

// Users
router.get('/users', adminController.getUsers);
router.put('/users/:id/block', adminController.toggleBlockUser);
router.put('/users/:id/role', adminController.changeUserRole);

// Gigs
router.get('/gigs', adminController.getAdminGigs);
router.put('/gigs/:id/feature', adminController.featureGig);

// Disputes
router.get('/disputes', adminController.getDisputes);
router.put('/disputes/:id/resolve', adminController.resolveDispute);

// Reviews
router.put('/reviews/:id/toggle-visibility', adminController.toggleReviewVisibility);

// Analytics & Logs
router.get('/analytics', adminController.getAnalytics);
router.get('/logs', adminController.getLogs);

module.exports = router;
