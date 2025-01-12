import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { ClientToServerEvents, ServerToClientEvents } from '@/types/socket';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const useSocket = (sessionId: string) => {
    const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents>>();

    useEffect(() => {
        // Socket.IO bağlantısını oluştur
        socketRef.current = io(SOCKET_URL);

        // Oturuma katıl
        socketRef.current.emit('joinSession', sessionId);

        // Cleanup
        return () => {
            if (socketRef.current) {
                socketRef.current.emit('leaveSession', sessionId);
                socketRef.current.disconnect();
            }
        };
    }, [sessionId]);

    return socketRef.current;
};

export default useSocket; 