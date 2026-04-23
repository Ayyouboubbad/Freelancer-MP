const router = require('express').Router();
const userController = require('../controllers/userController');

// Public profile — no auth required
router.get('/:id', userController.getPublicProfile);

module.exports = router;
