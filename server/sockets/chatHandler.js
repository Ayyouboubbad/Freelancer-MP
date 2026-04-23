const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

/**
 * Chat socket handler.
 * Attached to each connected socket by the main socket setup.
 */
module.exports = (io, socket) => {
  // Join a conversation room
  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId);
  });

  // Leave conversation room
  socket.on('leave_conversation', (conversationId) => {
    socket.leave(conversationId);
  });

  // Send message via socket (also persists to DB)
  socket.on('send_message', async (data) => {
    const { conversationId, text, senderId } = data;

    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) return;

      const message = await Message.create({
        conversation: conversationId,
        sender: senderId,
        text: text || '',
      });

      conversation.lastMessage = message._id;
      conversation.lastMessageAt = new Date();
      // Increment unread for other participants
      conversation.participants.forEach((p) => {
        if (p.toString() !== senderId) {
          const cur = conversation.unreadCounts.get(p.toString()) || 0;
          conversation.unreadCounts.set(p.toString(), cur + 1);
        }
      });
      await conversation.save();

      const populated = await message.populate('sender', 'name avatar');

      // Broadcast to everyone in the conversation room
      io.to(conversationId).emit('receive_message', populated);
    } catch (err) {
      socket.emit('error', { message: 'Failed to send message.' });
    }
  });

  // Typing indicator
  socket.on('typing', ({ conversationId, userId, userName }) => {
    socket.to(conversationId).emit('user_typing', { userId, userName });
  });

  socket.on('stop_typing', ({ conversationId }) => {
    socket.to(conversationId).emit('user_stop_typing');
  });
};
