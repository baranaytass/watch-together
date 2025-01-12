class PopupManager {
    private detectButton: HTMLButtonElement;
    private startButton: HTMLButtonElement;
    private statusElement: HTMLDivElement;
    private currentDomain: string | null = null;

    constructor() {
        this.detectButton = document.getElementById('detectButton') as HTMLButtonElement;
        this.startButton = document.getElementById('startButton') as HTMLButtonElement;
        this.statusElement = document.getElementById('status') as HTMLDivElement;

        if (!this.detectButton || !this.startButton || !this.statusElement) {
            console.error('Required elements not found');
            return;
        }

        this.initialize();
    }

    private initialize(): void {
        this.detectButton.addEventListener('click', () => this.handleDetectProvider());
        this.startButton.addEventListener('click', () => this.handleStartSession());
    }

    private async getCurrentTab(): Promise<chrome.tabs.Tab> {
        const queryOptions = { active: true, currentWindow: true };
        const [tab] = await chrome.tabs.query(queryOptions);
        return tab;
    }

    private async handleDetectProvider(): Promise<void> {
        try {
            const tab = await this.getCurrentTab();
            if (!tab.url) {
                this.updateStatus('No active tab found');
                return;
            }

            const domain = new URL(tab.url).hostname;
            this.currentDomain = domain;

            const response = await fetch(`http://localhost:5000/api/providers/check?domain=${domain}`);
            const data = await response.json();

            if (data.success && data.isSupported) {
                this.updateStatus('Provider supported!');
                this.startButton.style.display = 'block';
            } else {
                this.updateStatus('Provider not supported');
                this.startButton.style.display = 'none';
            }
        } catch (error) {
            console.error('Error detecting provider:', error);
            this.updateStatus('Error detecting provider');
        }
    }

    private async handleStartSession(): Promise<void> {
        if (!this.currentDomain) {
            this.updateStatus('No domain detected');
            return;
        }

        try {
            const tab = await this.getCurrentTab();
            const response = await fetch('http://localhost:5000/api/sessions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    videoUrl: tab.url,
                    provider: this.currentDomain
                })
            });

            const data = await response.json();

            if (data.success) {
                const shareLink = `http://localhost:5000/watch/${data.sessionId}`;
                this.updateStatus(`Session created! Share link: ${shareLink}`);
                
                // Link'i kopyalamak için bir buton ekle
                const copyButton = document.createElement('button');
                copyButton.textContent = 'Copy Link';
                copyButton.className = 'button';
                copyButton.onclick = () => {
                    navigator.clipboard.writeText(shareLink)
                        .then(() => {
                            copyButton.textContent = 'Copied!';
                            setTimeout(() => {
                                copyButton.textContent = 'Copy Link';
                            }, 2000);
                        })
                        .catch(err => console.error('Failed to copy:', err));
                };
                
                this.statusElement.appendChild(document.createElement('br'));
                this.statusElement.appendChild(copyButton);
            } else {
                this.updateStatus('Failed to create session');
            }
        } catch (error) {
            console.error('Error creating session:', error);
            this.updateStatus('Error creating session');
        }
    }

    private updateStatus(message: string): void {
        this.statusElement.textContent = message;
    }
}

// Popup yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', () => {
    new PopupManager();
}); 