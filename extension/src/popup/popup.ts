import { config } from '../config';

document.addEventListener('DOMContentLoaded', () => {
    const detectButton = document.getElementById('detectButton') as HTMLButtonElement;
    const startButton = document.getElementById('startButton') as HTMLButtonElement;
    const statusText = document.getElementById('status') as HTMLDivElement;
    const sessionUrlContainer = document.getElementById('sessionUrlContainer') as HTMLDivElement;
    const sessionUrlText = document.getElementById('sessionUrl') as HTMLDivElement;
    const copyButton = document.getElementById('copyButton') as HTMLButtonElement;

    let currentUrl: string | null = null;

    const showStatus = (message: string, type: 'error' | 'success' | 'info') => {
        statusText.textContent = message;
        statusText.className = type;
        statusText.style.display = 'block';
    };

    const hideStatus = () => {
        statusText.style.display = 'none';
        statusText.className = '';
    };

    detectButton.addEventListener('click', async () => {
        try {
            // Get current tab URL
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab.url) {
                throw new Error('No URL found');
            }

            currentUrl = tab.url;
            detectButton.disabled = true;
            showStatus('Checking provider...', 'info');

            // Extract domain from URL
            const domain = new URL(tab.url).hostname;

            // Check if provider is supported
            const response = await fetch(`${config.apiUrl}/providers/check?url=${encodeURIComponent(tab.url)}`);
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error?.message || 'Failed to check provider');
            }

            if (data.isSupported) {
                hideStatus();
                startButton.style.display = 'flex';
                detectButton.style.display = 'none';
            } else {
                showStatus('This video provider is not supported', 'error');
                detectButton.disabled = false;
            }
        } catch (error) {
            showStatus(error instanceof Error ? error.message : 'An error occurred', 'error');
            detectButton.disabled = false;
        }
    });

    startButton.addEventListener('click', async () => {
        if (!currentUrl) {
            showStatus('No URL found', 'error');
            return;
        }

        try {
            startButton.disabled = true;
            showStatus('Creating session...', 'info');

            // Create session
            const response = await fetch(`${config.apiUrl}/sessions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    videoUrl: currentUrl
                })
            });

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error?.message || 'Failed to create session');
            }

            // Show session URL
            sessionUrlText.textContent = data.session.url;
            sessionUrlContainer.style.display = 'block';
            showStatus('Session created successfully!', 'success');

        } catch (error) {
            showStatus(error instanceof Error ? error.message : 'An error occurred', 'error');
            startButton.disabled = false;
        }
    });

    copyButton.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(sessionUrlText.textContent || '');
            const originalText = copyButton.innerHTML;
            copyButton.innerHTML = `
                <svg class="icon" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
                Copied!
            `;
            setTimeout(() => {
                copyButton.innerHTML = originalText;
            }, 2000);
        } catch (error) {
            showStatus('Failed to copy to clipboard', 'error');
        }
    });
}); 