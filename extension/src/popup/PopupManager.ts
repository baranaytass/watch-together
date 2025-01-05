import { SUPPORTED_PROVIDERS } from '../types';

class PopupManager {
  private startButton: HTMLButtonElement;
  private statusMessage: HTMLDivElement;

  constructor() {
    this.startButton = document.getElementById('startButton') as HTMLButtonElement;
    this.statusMessage = document.getElementById('status-message') as HTMLDivElement;
    this.initializeListeners();
  }

  private initializeListeners(): void {
    this.startButton.addEventListener('click', () => this.handleStartClick());
    
    // Sayfa yüklendiğinde mevcut sekmenin uyumluluğunu kontrol et
    this.checkCurrentTab();
  }

  private async checkCurrentTab(): Promise<void> {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.url) {
      this.updateStatus('No active tab found. Please refresh the page.', true);
      this.startButton.disabled = true;
      return;
    }

    const url = new URL(tab.url);
    const isSupported = SUPPORTED_PROVIDERS.some(provider => 
      url.hostname.includes(provider.domain)
    );

    if (!isSupported) {
      const supportedSites = SUPPORTED_PROVIDERS.map(p => p.name).join(', ');
      this.updateStatus(
        `This website is not supported. Currently supported platforms: ${supportedSites}`, 
        true
      );
      this.startButton.disabled = true;
    } else {
      const provider = SUPPORTED_PROVIDERS.find(p => url.hostname.includes(p.domain));
      this.updateStatus(
        `Ready to watch ${provider?.name} video together!`, 
        false
      );
      this.startButton.disabled = false;
    }
  }

  private async handleStartClick(): Promise<void> {
    this.startButton.disabled = true;
    this.updateStatus('Initializing...', false);

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Content script'e mesaj gönder
      await chrome.tabs.sendMessage(tab.id!, { action: 'INITIALIZE_SESSION' });
      
      this.updateStatus('Session started!', false);
      // Popup'ı kapat
      window.close();
    } catch (error) {
      console.error('Error starting session:', error);
      this.updateStatus('Failed to start session', true);
      this.startButton.disabled = false;
    }
  }

  private updateStatus(message: string, isError: boolean): void {
    this.statusMessage.textContent = message;
    this.statusMessage.className = isError ? 'error' : 'success';
  }
}

// Popup yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
}); 