const socketHandler = (io) => {
  // Store connected users
  const users = new Map();

  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // User joins with their ID
    socket.on('join', (userId) => {
      users.set(userId, socket.id);
      socket.userId = userId;
      console.log(`User ${userId} joined with socket ${socket.id}`);
    });

    // Handle complaint updates
    socket.on('complaint_update', (data) => {
      // Broadcast to all connected clients except sender
      socket.broadcast.emit('complaint_updated', data);
    });

    // Handle status changes
    socket.on('status_change', (data) => {
      // Send to specific user if userId is provided
      if (data.userId && users.has(data.userId)) {
        const targetSocketId = users.get(data.userId);
        io.to(targetSocketId).emit('status_changed', data);
      } else {
        // Broadcast to all
        io.emit('status_changed', data);
      }
    });

    // Handle new comments
    socket.on('new_comment', (data) => {
      socket.broadcast.emit('comment_added', data);
    });

    // Handle notifications
    socket.on('send_notification', (data) => {
      if (data.userId && users.has(data.userId)) {
        const targetSocketId = users.get(data.userId);
        io.to(targetSocketId).emit('notification', data);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      if (socket.userId) {
        users.delete(socket.userId);
        console.log(`User ${socket.userId} disconnected`);
      }
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  // Return io instance for use in other parts of the app
  return io;
};

module.exports = socketHandler;
