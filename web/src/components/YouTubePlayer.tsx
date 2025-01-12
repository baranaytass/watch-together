'use client';

import { useEffect, useRef, useState } from 'react';
import { VideoState } from '@/types/socket';
import type { YouTubePlayer } from '@/types/youtube';

interface Props {
    videoUrl: string;
    onStateChange?: (state: VideoState) => void;
    onError?: (error: string) => void;
}

export default function YouTubePlayer({ videoUrl, onStateChange, onError }: Props) {
    const playerRef = useRef<YouTubePlayer | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isReady, setIsReady] = useState(false);
    const [playerId] = useState(`youtube-player-${Math.random().toString(36).substr(2, 9)}`);

    // Video ID'sini URL'den çıkar
    const getVideoId = (url: string): string | null => {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : null;
    };

    // YouTube IFrame API'yi yükle
    useEffect(() => {
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        }

        window.onYouTubeIframeAPIReady = initializePlayer;

        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
            }
        };
    }, []);

    // Player'ı başlat
    const initializePlayer = () => {
        if (!containerRef.current) return;

        const videoId = getVideoId(videoUrl);
        if (!videoId) {
            onError?.('Invalid YouTube URL');
            return;
        }

        containerRef.current.innerHTML = `<div id="${playerId}"></div>`;

        const player = new window.YT.Player(playerId, {
            height: '360',
            width: '640',
            videoId,
            playerVars: {
                autoplay: 0,
                controls: 1,
                disablekb: 0,
                enablejsapi: 1,
                fs: 1,
                modestbranding: 1,
                playsinline: 1,
                rel: 0
            },
            events: {
                onReady: () => {
                    playerRef.current = player;
                    setIsReady(true);
                },
                onStateChange: (event) => {
                    if (!onStateChange) return;

                    const state: VideoState = {
                        isPlaying: event.data === window.YT.PlayerState.PLAYING,
                        currentTime: player.getCurrentTime(),
                        timestamp: Date.now()
                    };

                    onStateChange(state);
                },
                onError: (event) => {
                    const errorMessages: { [key: number]: string } = {
                        2: 'Invalid video ID',
                        5: 'HTML5 player error',
                        100: 'Video not found',
                        101: 'Video cannot be embedded',
                        150: 'Video cannot be embedded'
                    };

                    onError?.(errorMessages[event.data] || 'An error occurred');
                }
            }
        });
    };

    // Dış kontrollerle player'ı yönet
    useEffect(() => {
        if (!isReady || !playerRef.current) return;

        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'SYNC_PLAYER') {
                const { isPlaying, currentTime } = event.data.state as VideoState;
                
                if (isPlaying) {
                    playerRef.current?.playVideo();
                    playerRef.current?.seekTo(currentTime, true);
                } else {
                    playerRef.current?.pauseVideo();
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [isReady]);

    return (
        <div className="aspect-video">
            <div ref={containerRef} className="w-full h-full" />
        </div>
    );
} 