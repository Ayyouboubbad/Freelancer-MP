const router = require('express').Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { uploadDelivery } = require('../middleware/upload');

router.use(auth);

router.post('/', authorize('client'), orderController.placeOrder);
router.get('/my', orderController.getMyOrders);
router.get('/:id', orderController.getOrder);
router.post('/:id/deliver', authorize('freelancer'), uploadDelivery, orderController.deliverOrder);
router.put('/:id/status', orderController.updateOrderStatus);

module.exports = router;
