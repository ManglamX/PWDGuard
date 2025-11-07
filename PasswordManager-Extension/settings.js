// Settings Page Script for PwdGuard Extension

document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  setupEventListeners();
  checkConnection();
});

// Load settings from storage
function loadSettings() {
  chrome.storage.local.get(['settings'], (result) => {
    const settings = result.settings || getDefaultSettings();
    
    // General settings
    document.getElementById('enabled').checked = settings.enabled !== false;
    document.getElementById('autofill').checked = settings.autoFillEnabled !== false;
    document.getElementById('notifications').checked = settings.notificationsEnabled !== false;
    
    // Security settings
    document.getElementById('https-only').checked = settings.httpsOnly !== false;
    document.getElementById('allow-localhost').checked = settings.allowLocalhost !== false;
    
    // Theme
    if (settings.theme) {
      document.querySelector(`input[name="theme"][value="${settings.theme}"]`).checked = true;
    }
    
    // Never save list
    loadNeverSaveList(settings.neverSaveList || []);
  });
}

// Get default settings
function getDefaultSettings() {
  return {
    enabled: true,
    autoFillEnabled: true,
    notificationsEnabled: true,
    httpsOnly: true,
    allowLocalhost: true,
    neverSaveList: [],
    theme: 'light'
  };
}

// Load never save list
function loadNeverSaveList(list) {
  const container = document.getElementById('never-save-list');
  
  if (list.length === 0) {
    container.innerHTML = '<div class="empty-list">No sites in the never-save list</div>';
    return;
  }
  
  container.innerHTML = list.map(domain => `
    <div class="never-save-item">
      <span class="never-save-domain">${domain}</span>
      <button class="remove-site-btn" data-domain="${domain}">Remove</button>
    </div>
  `).join('');
  
  // Add event listeners to remove buttons
  container.querySelectorAll('.remove-site-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      removeSiteFromNeverSave(btn.dataset.domain);
    });
  });
}

// Set up event listeners
function setupEventListeners() {
  // General settings
  document.getElementById('enabled').addEventListener('change', (e) => {
    updateSetting('enabled', e.target.checked);
  });
  
  document.getElementById('autofill').addEventListener('change', (e) => {
    updateSetting('autoFillEnabled', e.target.checked);
  });
  
  document.getElementById('notifications').addEventListener('change', (e) => {
    updateSetting('notificationsEnabled', e.target.checked);
  });
  
  // Security settings
  document.getElementById('https-only').addEventListener('change', (e) => {
    updateSetting('httpsOnly', e.target.checked);
  });
  
  document.getElementById('allow-localhost').addEventListener('change', (e) => {
    updateSetting('allowLocalhost', e.target.checked);
  });
  
  // Theme selection
  document.querySelectorAll('input[name="theme"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      updateSetting('theme', e.target.value);
      showNotification('Theme updated');
    });
  });
  
  // Add site to never-save list
  document.getElementById('add-site-btn').addEventListener('click', () => {
    const input = document.getElementById('new-site');
    const domain = input.value.trim();
    
    if (domain) {
      addSiteToNeverSave(domain);
      input.value = '';
    }
  });
  
  // Enter key in add site input
  document.getElementById('new-site').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('add-site-btn').click();
    }
  });
  
  // Test connection button
  document.getElementById('test-connection-btn').addEventListener('click', () => {
    testConnection();
  });
  
  // Reset button
  document.getElementById('reset-btn').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      resetSettings();
    }
  });
  
  // Help link
  document.getElementById('help-link').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'https://github.com/pwdguard/extension/wiki/installation' });
  });
}

// Update a single setting
function updateSetting(key, value) {
  chrome.storage.local.get(['settings'], (result) => {
    const settings = result.settings || getDefaultSettings();
    settings[key] = value;
    
    chrome.storage.local.set({ settings: settings }, () => {
      showNotification('Setting saved');
    });
  });
}

// Add site to never-save list
function addSiteToNeverSave(domain) {
  // Validate domain
  if (!isValidDomain(domain)) {
    showNotification('Invalid domain format', 'error');
    return;
  }
  
  chrome.storage.local.get(['settings'], (result) => {
    const settings = result.settings || getDefaultSettings();
    
    if (!settings.neverSaveList) {
      settings.neverSaveList = [];
    }
    
    if (settings.neverSaveList.includes(domain)) {
      showNotification('Domain already in list', 'warning');
      return;
    }
    
    settings.neverSaveList.push(domain);
    
    chrome.storage.local.set({ settings: settings }, () => {
      loadNeverSaveList(settings.neverSaveList);
      showNotification(`Added ${domain} to never-save list`);
    });
  });
}

// Remove site from never-save list
function removeSiteFromNeverSave(domain) {
  chrome.storage.local.get(['settings'], (result) => {
    const settings = result.settings || getDefaultSettings();
    
    if (settings.neverSaveList) {
      settings.neverSaveList = settings.neverSaveList.filter(d => d !== domain);
      
      chrome.storage.local.set({ settings: settings }, () => {
        loadNeverSaveList(settings.neverSaveList);
        showNotification(`Removed ${domain} from never-save list`);
      });
    }
  });
}

// Validate domain format
function isValidDomain(domain) {
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?)*\.[a-zA-Z]{2,}$/;
  return domainRegex.test(domain) || domain === 'localhost';
}

// Check connection to desktop app
function checkConnection() {
  chrome.runtime.sendMessage({ type: 'get-connection-status' }, (response) => {
    updateConnectionUI(response ? response.status : 'disconnected');
  });
}

// Test connection to desktop app
function testConnection() {
  const btn = document.getElementById('test-connection-btn');
  btn.disabled = true;
  btn.textContent = 'Testing...';
  
  updateConnectionUI('testing');
  
  chrome.runtime.sendMessage({ type: 'test-connection' }, (response) => {
    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = 'Test Connection';
      
      if (response && response.success) {
        updateConnectionUI('connected');
        showNotification('Connection successful!');
      } else {
        updateConnectionUI('disconnected');
        showNotification('Connection failed. Please check the desktop app.', 'error');
      }
    }, 1000);
  });
}

// Update connection UI
function updateConnectionUI(status) {
  const icon = document.getElementById('connection-icon');
  const title = document.getElementById('connection-title');
  const message = document.getElementById('connection-message');
  
  switch (status) {
    case 'connected':
      icon.textContent = '✅';
      icon.className = 'status-icon connected';
      title.textContent = 'Connected';
      message.textContent = 'Successfully connected to PwdGuard desktop application';
      break;
      
    case 'disconnected':
      icon.textContent = '❌';
      icon.className = 'status-icon disconnected';
      title.textContent = 'Disconnected';
      message.textContent = 'Cannot connect to PwdGuard desktop application. Make sure it is installed and running.';
      break;
      
    case 'testing':
      icon.textContent = '🔄';
      icon.className = 'status-icon';
      title.textContent = 'Testing Connection...';
      message.textContent = 'Attempting to connect to desktop application';
      break;
      
    default:
      icon.textContent = '⚠️';
      icon.className = 'status-icon';
      title.textContent = 'Unknown Status';
      message.textContent = 'Unable to determine connection status';
  }
}

// Reset all settings
function resetSettings() {
  const defaultSettings = getDefaultSettings();
  
  chrome.storage.local.set({ settings: defaultSettings }, () => {
    loadSettings();
    showNotification('Settings reset to defaults');
  });
}

// Show notification
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#4caf50'};
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    animation: slideIn 0.3s ease;
    font-size: 14px;
    font-weight: 500;
    max-width: 300px;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
