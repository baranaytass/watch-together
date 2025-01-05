import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import VideoPlayer from '../components/VideoPlayer';
import Chat from '../components/Chat';
import ParticipantList from '../components/ParticipantList';
import { Session, VideoState, User } from '../types';

const SessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [videoState, setVideoState] = useState<VideoState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    buffering: false
  });

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_WEBSOCKET_URL || '');
    newSocket.emit('join-session', sessionId);
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [sessionId]);

  return (
    <div className="session-page">
      <div className="video-container">
        <VideoPlayer
          videoState={videoState}
          onStateChange={(newState) => {
            setVideoState(newState);
            socket?.emit('video-state-change', newState);
          }}
        />
      </div>
      <div className="sidebar">
        <ParticipantList participants={session?.participants || []} />
        <Chat socket={socket} />
      </div>
    </div>
  );
};

export default SessionPage; 