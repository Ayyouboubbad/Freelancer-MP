const router = require('express').Router();
const messageController = require('../controllers/messageController');
const auth = require('../middleware/auth');
const { uploadDelivery } = require('../middleware/upload');

router.use(auth);

router.post('/conversations', messageController.getOrCreateConversation);
router.get('/conversations', messageController.getConversations);
router.get('/conversations/:conversationId', messageController.getMessages);
router.post('/send', uploadDelivery, messageController.sendMessage);

module.exports = router;
