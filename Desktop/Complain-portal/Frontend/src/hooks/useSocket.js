import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (userId, division = null) => {
  const socketRef = useRef(null);

  useEffect(() => {
    // Connect to backend socket
    socketRef.current = io(import.meta.env.VITE_API_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    const socket = socketRef.current;

    // Join personal notification room
    if (userId) {
      socket.emit('join_user_room', { userId });
    }

    // Join division room (for authorities)
    if (division) {
      socket.emit('join_division_room', { division });
    }

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [userId, division]);

  // joinComplaintRoom: call this to get live updates for a complaint
  const joinComplaintRoom = (complaintId) => {
    socketRef.current?.emit('join_complaint_room', { complaintId });
  };

  return { socket: socketRef.current, joinComplaintRoom };
};
