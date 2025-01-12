declare global {
    interface Window {
        YT: {
            Player: new (
                elementId: string,
                config: {
                    height: string | number;
                    width: string | number;
                    videoId: string;
                    playerVars?: {
                        autoplay?: 0 | 1;
                        controls?: 0 | 1;
                        disablekb?: 0 | 1;
                        enablejsapi?: 0 | 1;
                        fs?: 0 | 1;
                        modestbranding?: 0 | 1;
                        playsinline?: 0 | 1;
                        rel?: 0 | 1;
                    };
                    events?: {
                        onReady?: (event: { target: any }) => void;
                        onStateChange?: (event: { target: any; data: number }) => void;
                        onError?: (event: { target: any; data: number }) => void;
                    };
                }
            ) => any;
            PlayerState: {
                UNSTARTED: -1;
                ENDED: 0;
                PLAYING: 1;
                PAUSED: 2;
                BUFFERING: 3;
                CUED: 5;
            };
        };
        onYouTubeIframeAPIReady: () => void;
    }
}

export interface YouTubePlayer {
    playVideo(): void;
    pauseVideo(): void;
    seekTo(seconds: number, allowSeekAhead: boolean): void;
    getCurrentTime(): number;
    getPlayerState(): number;
    destroy(): void;
} 