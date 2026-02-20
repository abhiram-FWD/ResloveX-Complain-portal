module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('✅ Client connected:', socket.id);
    
    socket.on('join_user_room', ({ userId }) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined their room`);
    });
    
    socket.on('join_division_room', ({ division }) => {
      socket.join(`division_${division}`);
      console.log(`Joined division room: ${division}`);
    });
    
    socket.on('join_complaint_room', ({ complaintId }) => {
      socket.join(`complaint_${complaintId}`);
      console.log(`Joined complaint room: ${complaintId}`);
    });
    
    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
    });
  });
};
