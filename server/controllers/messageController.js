const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// ─── Get or create conversation ───────────────────────────────────────────────
exports.getOrCreateConversation = async (req, res, next) => {
  try {
    const { participantId } = req.body;
    if (participantId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot message yourself.' });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, participantId] },
    }).populate('participants', 'name avatar level');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, participantId],
      });
      conversation = await conversation.populate('participants', 'name avatar level');
    }

    res.status(200).json({ success: true, conversation });
  } catch (err) {
    next(err);
  }
};

// ─── Get my conversations ─────────────────────────────────────────────────────
exports.getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'name avatar level')
      .populate('lastMessage')
      .sort('-lastMessageAt');

    res.status(200).json({ success: true, conversations });
  } catch (err) {
    next(err);
  }
};

// ─── Get messages in conversation ────────────────────────────────────────────
exports.getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const page  = parseInt(req.query.page  || '1',  10);
    const limit = parseInt(req.query.limit || '30', 10);

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found.' });

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) return res.status(403).json({ success: false, message: 'Access denied.' });

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name avatar')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    // Mark messages as read
    await Message.updateMany(
      { conversation: conversationId, sender: { $ne: req.user._id }, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    // Reset unread count for this user
    conversation.unreadCounts.set(req.user._id.toString(), 0);
    await conversation.save();

    res.status(200).json({ success: true, messages: messages.reverse() });
  } catch (err) {
    next(err);
  }
};

// ─── Send message (REST fallback — real-time via Socket.io) ──────────────────
exports.sendMessage = async (req, res, next) => {
  try {
    const { conversationId, text } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found.' });

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) return res.status(403).json({ success: false, message: 'Access denied.' });

    const attachments = req.files ? req.files.map((f) => f.path) : [];

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      text: text || '',
      attachments,
    });

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();

    // Increment unread for other participants
    conversation.participants.forEach((p) => {
      if (p.toString() !== req.user._id.toString()) {
        const current = conversation.unreadCounts.get(p.toString()) || 0;
        conversation.unreadCounts.set(p.toString(), current + 1);
      }
    });
    await conversation.save();

    const populated = await message.populate('sender', 'name avatar');
    res.status(201).json({ success: true, message: populated });
  } catch (err) {
    next(err);
  }
};
