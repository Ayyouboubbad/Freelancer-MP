const router = require('express').Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

const reviewRules = [
  body('orderId').notEmpty().withMessage('Order ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1–5'),
  body('comment').trim().isLength({ min: 10, max: 1000 }).withMessage('Comment must be 10–1000 characters'),
];

router.post('/', auth, authorize('client'), reviewRules, validate, reviewController.createReview);
router.get('/gig/:gigId', reviewController.getGigReviews);
router.put('/:id/report', auth, reviewController.reportReview);

module.exports = router;
