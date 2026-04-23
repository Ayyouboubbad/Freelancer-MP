/**
 * Notification socket handler.
 * Each authenticated user joins their own private room (their userId)
 * so the server can push targeted notifications.
 */
module.exports = (io, socket) => {
  // Join personal room on connection
  const userId = socket.handshake.auth?.userId;
  if (userId) {
    socket.join(`user_${userId}`);
  }

  socket.on('disconnect', () => {
    if (userId) socket.leave(`user_${userId}`);
  });
};

/**
 * Utility: push a real-time notification to a user.
 * Call this from controllers after creating a Notification document.
 *
 * @param {object} io        - Socket.io server instance
 * @param {string} userId    - Recipient user ID
 * @param {object} payload   - Notification data to emit
 */
const pushNotification = (io, userId, payload) => {
  io.to(`user_${userId}`).emit('notification', payload);
};

module.exports.pushNotification = pushNotification;
