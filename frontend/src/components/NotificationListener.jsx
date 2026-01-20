import { useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useToast } from '../context/ToastContext';

export default function NotificationListener() {
  const socket = useSocket();
  const { addToast } = useToast();

  useEffect(() => {
    if (!socket) return;

    socket.on('notification', (data) => {
      addToast(data.message, data.type || 'info');
    });

    return () => socket.off('notification');
  }, [socket, addToast]);

  return null;
}