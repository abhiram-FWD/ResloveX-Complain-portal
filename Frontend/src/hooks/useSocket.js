import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (userId = null, division = null) => {
  const socketRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setReady(true);
      if (userId) socket.emit('join_user_room', { userId });
      if (division) socket.emit('join_division_room', { division });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setReady(false);
    };
  }, [userId, division]);

  const joinComplaintRoom = (complaintId) => {
    socketRef.current?.emit('join_complaint_room', { complaintId });
  };

  const on = (event, handler) => socketRef.current?.on(event, handler);
  const off = (event, handler) => socketRef.current?.off(event, handler);

  return { socketRef, joinComplaintRoom, on, off, ready };
};