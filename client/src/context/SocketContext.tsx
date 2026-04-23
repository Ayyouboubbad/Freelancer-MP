import React, { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { useNotificationStore } from '../store/notificationStore';

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuthStore();
  const { addMessage } = useChatStore();
  const { addLive } = useNotificationStore();

  useEffect(() => {
    if (!user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      withCredentials: true,
      auth: { userId: user._id },
    });

    socketRef.current = socket;

    socket.on('receive_message', (msg) => addMessage(msg));
    socket.on('notification', (n)   => addLive(n));

    return () => { socket.disconnect(); };
  }, [user?._id]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
