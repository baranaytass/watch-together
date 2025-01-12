'use client';

import { useEffect, useState } from 'react';
import { getSession } from '@/services/api';
import { Session } from '@/types/session';
import { VideoState } from '@/types/socket';
import useSocket from '@/hooks/useSocket';
import YouTubePlayer from '@/components/YouTubePlayer';

interface Props {
    params: {
        sessionId: string;
    };
}

export default function PlayerPage({ params }: Props) {
    const { sessionId } = params;
    const [session, setSession] = useState<Session | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [participants, setParticipants] = useState<string[]>([]);
    const [videoState, setVideoState] = useState<VideoState>({
        isPlaying: false,
        currentTime: 0,
        timestamp: Date.now()
    });

    const socket = useSocket(sessionId);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await getSession(sessionId);
                if (!response.success || !response.session) {
                    setError(response.message || 'Session not found');
                    return;
                }
                setSession(response.session);
            } catch (err) {
                setError('Failed to fetch session');
            }
        };

        fetchSession();
    }, [sessionId]);

    useEffect(() => {
        if (!socket) return;

        socket.on('stateUpdate', (state: VideoState) => {
            setVideoState(state);
            // Player'ı senkronize et
            window.postMessage({ type: 'SYNC_PLAYER', state }, '*');
        });

        socket.on('participantJoined', (participantId: string) => {
            setParticipants(prev => [...prev, participantId]);
        });

        socket.on('participantLeft', (participantId: string) => {
            setParticipants(prev => prev.filter(id => id !== participantId));
        });

        socket.on('error', (message: string) => {
            setError(message);
        });

        return () => {
            socket.off('stateUpdate');
            socket.off('participantJoined');
            socket.off('participantLeft');
            socket.off('error');
        };
    }, [socket]);

    const handleVideoStateChange = (state: VideoState) => {
        if (socket) {
            socket.emit('updateState', state);
        }
    };

    const handleVideoError = (error: string) => {
        setError(error);
    };

    if (error) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
                    <p className="text-gray-700">{error}</p>
                </div>
            </main>
        );
    }

    if (!session) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Loading...</h1>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-start p-8 bg-gray-100">
            <div className="w-full max-w-4xl">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Watch Together Session</h1>
                
                <div className="mb-8">
                    <YouTubePlayer
                        videoUrl={session.videoUrl}
                        onStateChange={handleVideoStateChange}
                        onError={handleVideoError}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">Participants</h2>
                        <div className="bg-gray-50 p-4 rounded-md">
                            {participants.length === 0 ? (
                                <p className="text-gray-500">No participants yet</p>
                            ) : (
                                <ul className="list-disc list-inside">
                                    {participants.map(id => (
                                        <li key={id} className="text-gray-700">{id}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">Video State</h2>
                        <div className="bg-gray-50 p-4 rounded-md">
                            <p className="text-gray-700">Status: {videoState.isPlaying ? 'Playing' : 'Paused'}</p>
                            <p className="text-gray-700">Current Time: {videoState.currentTime.toFixed(2)}s</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
} 