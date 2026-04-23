const router = require('express').Router();
const gigController = require('../controllers/gigController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { uploadGigImages } = require('../middleware/upload');

// Public
router.get('/', gigController.getGigs);
router.get('/search', gigController.searchGigs);
router.get('/my', auth, authorize('freelancer'), gigController.getMyGigs);
router.get('/:id', gigController.getGig);

// Freelancer-only
router.post('/', auth, authorize('freelancer'), uploadGigImages, gigController.createGig);
router.put('/:id', auth, authorize('freelancer', 'admin'), uploadGigImages, gigController.updateGig);
router.delete('/:id', auth, authorize('freelancer', 'admin'), gigController.deleteGig);

module.exports = router;
