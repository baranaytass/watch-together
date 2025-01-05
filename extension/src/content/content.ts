import { SUPPORTED_PROVIDERS, VideoProvider } from '../types';

class ContentScript {
  private currentProvider: VideoProvider | null = null;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    // Mesaj dinleyicisini ekle
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'INITIALIZE_SESSION') {
        this.initializeSession();
      }
    });

    // Mevcut sayfanın provider'ını belirle
    this.detectProvider();
  }

  private detectProvider(): void {
    const currentDomain = window.location.hostname;
    this.currentProvider = SUPPORTED_PROVIDERS.find(provider => 
      currentDomain.includes(provider.domain)
    ) || null;
  }

  private async initializeSession(): Promise<void> {
    if (!this.currentProvider) {
      console.error('No supported video provider detected');
      return;
    }

    try {
      // Video elementini bul
      const videoElement = document.querySelector(this.currentProvider.selector) as HTMLVideoElement;
      
      if (!videoElement) {
        throw new Error('Video element not found');
      }

      // Background script'e session başlatma mesajı gönder
      await chrome.runtime.sendMessage({
        action: 'CREATE_SESSION',
        data: {
          provider: this.currentProvider.name,
          url: window.location.href,
          title: document.title
        }
      });

    } catch (error) {
      console.error('Failed to initialize session:', error);
    }
  }
}

// Content script'i başlat
new ContentScript(); 