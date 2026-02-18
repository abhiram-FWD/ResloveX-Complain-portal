// This file manages all real-time socket.io connections

module.exports = (io) => {

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // User joins their personal room (for targeted notifications)
    // Client emits: { userId }
    socket.on('join_user_room', ({ userId }) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined personal room`);
    });

    // Authority joins their division room (for new complaint alerts)
    // Client emits: { division }
    socket.on('join_division_room', ({ division }) => {
      socket.join(`division_${division}`);
      console.log(`Authority joined division room: ${division}`);
    });

    // Citizen joins their complaint room (for live status updates)
    // Client emits: { complaintId }
    socket.on('join_complaint_room', ({ complaintId }) => {
      socket.join(`complaint_${complaintId}`);
      console.log(`User joined complaint room: ${complaintId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

};

// Socket events emitted by controllers:
// 'complaint_updated'  → sent to complaint_${complaintId} room
//   payload: { complaintId, status, action, performedBy, timestamp }
// 'new_complaint'      → sent to division_${division} room
//   payload: { complaintId, title, category, location }
// 'notification'       → sent to user_${userId} room
//   payload: { message, type, complaintId }
