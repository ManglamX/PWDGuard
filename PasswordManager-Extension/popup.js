// Popup Script for PwdGuard Extension

document.addEventListener('DOMContentLoaded', async () => {
  // Get current tab info
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (tab && tab.url) {
    const url = new URL(tab.url);
    updateSiteInfo(url.hostname);
  }
  
  // Check connection status
  updateConnectionStatus();
  
  // Load settings
  loadSettings();
  
  // Set up event listeners
  setupEventListeners();
});

// Update site information
function updateSiteInfo(domain) {
  const siteIcon = document.querySelector('.site-icon');
  const siteDomain = document.getElementById('site-domain');
  const credentialCount = document.getElementById('credential-count');
  
  siteDomain.textContent = domain;
  
  // Get credential count for this domain
  chrome.runtime.sendMessage({
    type: 'get-credentials',
    domain: domain
  }, (response) => {
    if (response && response.credentials) {
      const count = response.credentials.length;
      credentialCount.textContent = count;
      
      // Update icon based on count
      if (count > 0) {
        siteIcon.textContent = '🔓';
      } else {
        siteIcon.textContent = '🔒';
      }
    }
  });
}

// Update connection status
function updateConnectionStatus() {
  chrome.runtime.sendMessage({ type: 'get-connection-status' }, (response) => {
    const statusIndicator = document.getElementById('status-indicator');
    const statusText = document.getElementById('status-text');
    
    if (response && response.status) {
      statusIndicator.className = `status-indicator ${response.status}`;
      
      switch (response.status) {
        case 'connected':
          statusText.textContent = 'Connected';
          enableActions();
          break;
        case 'disconnected':
          statusText.textContent = 'Disconnected';
          disableActions();
          break;
        case 'error':
          statusText.textContent = 'Connection Error';
          disableActions();
          break;
        default:
          statusText.textContent = 'Connecting...';
      }
    }
  });
  
  // Update status every 5 seconds
  setTimeout(updateConnectionStatus, 5000);
}

// Enable action buttons
function enableActions() {
  document.getElementById('autofill-btn').disabled = false;
  document.getElementById('save-btn').disabled = false;
  document.getElementById('generate-btn').disabled = false;
}

// Disable action buttons
function disableActions() {
  document.getElementById('autofill-btn').disabled = true;
  document.getElementById('save-btn').disabled = true;
  document.getElementById('generate-btn').disabled = true;
}

// Load settings from storage
function loadSettings() {
  chrome.storage.local.get(['settings'], (result) => {
    const settings = result.settings || {};
    
    document.getElementById('enabled-toggle').checked = settings.enabled !== false;
    document.getElementById('autofill-toggle').checked = settings.autoFillEnabled !== false;
  });
}

// Set up event listeners
function setupEventListeners() {
  // Auto-fill button
  document.getElementById('autofill-btn').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      chrome.tabs.sendMessage(tab.id, { type: 'manual-autofill' });
      window.close();
    }
  });
  
  // Save button
  document.getElementById('save-btn').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      chrome.tabs.sendMessage(tab.id, { type: 'manual-save' });
      window.close();
    }
  });
  
  // Generate button
  document.getElementById('generate-btn').addEventListener('click', () => {
    const password = generateStrongPassword();
    
    // Copy to clipboard
    navigator.clipboard.writeText(password).then(() => {
      showNotification('Strong password generated and copied to clipboard!');
      
      // Show password in a temporary overlay
      showPasswordOverlay(password);
    });
  });
  
  // Extension enabled toggle
  document.getElementById('enabled-toggle').addEventListener('change', (e) => {
    updateSetting('enabled', e.target.checked);
  });
  
  // Auto-fill toggle
  document.getElementById('autofill-toggle').addEventListener('change', (e) => {
    updateSetting('autoFillEnabled', e.target.checked);
  });
  
  // Open desktop app button
  document.getElementById('open-desktop-btn').addEventListener('click', () => {
    // Send message to open desktop app
    chrome.runtime.sendMessage({ type: 'open-desktop-app' });
    showNotification('Opening PwdGuard desktop application...');
  });
  
  // Settings button
  document.getElementById('settings-btn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
}

// Update setting in storage
function updateSetting(key, value) {
  chrome.storage.local.get(['settings'], (result) => {
    const settings = result.settings || {};
    settings[key] = value;
    chrome.storage.local.set({ settings: settings }, () => {
      showNotification(`Setting updated: ${key}`);
    });
  });
}

// Generate strong password
function generateStrongPassword(length = 16) {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = lowercase + uppercase + numbers + symbols;
  let password = '';
  
  // Ensure at least one of each type
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Show password overlay
function showPasswordOverlay(password) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.2s ease;
  `;
  
  overlay.innerHTML = `
    <div style="
      background: white;
      padding: 24px;
      border-radius: 12px;
      max-width: 320px;
      text-align: center;
    ">
      <h3 style="margin: 0 0 16px 0; color: #333;">Generated Password</h3>
      <div style="
        background: #f5f5f5;
        padding: 12px;
        border-radius: 8px;
        font-family: 'Courier New', monospace;
        font-size: 14px;
        word-break: break-all;
        color: #333;
        margin-bottom: 16px;
      ">${password}</div>
      <p style="font-size: 12px; color: #666; margin: 0 0 16px 0;">
        Password copied to clipboard
      </p>
      <button style="
        background: #00bcd4;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
      " onclick="this.parentElement.parentElement.remove()">Close</button>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  // Auto-close after 10 seconds
  setTimeout(() => {
    if (overlay.parentElement) {
      overlay.remove();
    }
  }, 10000);
}

// Show notification
function showNotification(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #4caf50;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    z-index: 10001;
    animation: slideUp 0.3s ease;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideDown 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from {
      transform: translateX(-50%) translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes slideDown {
    from {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
    to {
      transform: translateX(-50%) translateY(20px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
