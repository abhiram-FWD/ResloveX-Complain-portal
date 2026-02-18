const { io } = require('../server');

const sendNotification = (type, data) => {
  try {
    // Get io instance from server
    const socketIO = io;

    if (!socketIO) {
      console.log('Socket.IO not initialized');
      return;
    }

    // Emit notification based on type
    switch (type) {
      case 'new_complaint':
        socketIO.emit('notification', {
          type: 'new_complaint',
          message: `New complaint: ${data.title}`,
          data,
        });
        break;

      case 'status_update':
        if (data.user && data.user._id) {
          socketIO.emit('notification', {
            type: 'status_update',
            message: `Complaint status updated to ${data.status}`,
            userId: data.user._id,
            data,
          });
        }
        break;

      case 'new_comment':
        socketIO.emit('notification', {
          type: 'new_comment',
          message: 'New comment added to complaint',
          data,
        });
        break;

      case 'complaint_assigned':
        if (data.assignedTo && data.assignedTo._id) {
          socketIO.emit('notification', {
            type: 'complaint_assigned',
            message: 'New complaint assigned to you',
            userId: data.assignedTo._id,
            data,
          });
        }
        break;

      default:
        console.log(`Unknown notification type: ${type}`);
    }
  } catch (error) {
    console.error('Error sending notification:', error.message);
  }
};

module.exports = { sendNotification };
