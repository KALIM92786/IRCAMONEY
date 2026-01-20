import { useEffect, useState } from 'react';
import io from 'socket.io-client';

let socket;

export const useSocket = () => {
  const [socketInstance, setSocketInstance] = useState(null);

  useEffect(() => {
    if (!socket) {
      socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
        auth: {
          token: localStorage.getItem('token')
        }
      });
    }
    setSocketInstance(socket);

    return () => {
      // Socket cleanup if necessary
    };
  }, []);

  return socketInstance;
};