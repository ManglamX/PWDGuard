// Background Service Worker for PwdGuard Extension
// Handles Native Messaging, context menus, and extension state

let nativePort = null;
let connectionStatus = 'disconnected';
let pendingMessages = [];
let credentialsCache = {}; // Cache credentials by domain
let pendingRequests = {}; // Store pending request callbacks

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('PwdGuard Extension installed');
  
  // Create context menus
  chrome.contextMenus.create({
    id: 'pwdguard-save',
    title: 'Save Password with PwdGuard',
    contexts: ['editable']
  });
  
  chrome.contextMenus.create({
    id: 'pwdguard-autofill',
    title: 'Auto-fill Password',
    contexts: ['editable']
  });
  
  chrome.contextMenus.create({
    id: 'pwdguard-never-save',
    title: 'Never Save for This Site',
    contexts: ['page']
  });
  
  // Initialize default settings
  chrome.storage.local.get(['settings'], (result) => {
    if (!result.settings) {
      const defaultSettings = {
        enabled: true,
        httpsOnly: true,
        allowLocalhost: true,
        autoFillEnabled: true,
        notificationsEnabled: true,
        neverSaveList: [],
        theme: 'light'
      };
      chrome.storage.local.set({ settings: defaultSettings });
    }
  });
  
  // Try to connect to native app
  connectToNativeApp();
});

// Connect to Native Messaging Host
function connectToNativeApp() {
  try {
    nativePort = chrome.runtime.connectNative('com.pwdguard.native');
    
    nativePort.onMessage.addListener((message) => {
      console.log('Received from native app:', message);
      handleNativeMessage(message);
    });
    
    nativePort.onDisconnect.addListener(() => {
      console.log('Disconnected from native app');
      connectionStatus = 'disconnected';
      nativePort = null;
      
      if (chrome.runtime.lastError) {
        console.error('Native messaging error:', chrome.runtime.lastError.message);
      }
      
      // Update icon to show disconnected state
      updateExtensionIcon('disconnected');
      
      // Retry connection after 5 seconds
      setTimeout(connectToNativeApp, 5000);
    });
    
    connectionStatus = 'connected';
    updateExtensionIcon('connected');
    
    // Send pending messages
    while (pendingMessages.length > 0) {
      const msg = pendingMessages.shift();
      sendToNativeApp(msg);
    }
    
  } catch (error) {
    console.error('Failed to connect to native app:', error);
    connectionStatus = 'error';
    updateExtensionIcon('error');
  }
}

// Send message to native app
function sendToNativeApp(message) {
  if (nativePort && connectionStatus === 'connected') {
    try {
      nativePort.postMessage(message);
      return true;
    } catch (error) {
      console.error('Error sending to native app:', error);
      pendingMessages.push(message);
      return false;
    }
  } else {
    pendingMessages.push(message);
    return false;
  }
}

// Handle messages from native app
function handleNativeMessage(message) {
  switch (message.type) {
    case 'save-response':
      handleSaveResponse(message);
      break;
    case 'credentials-response':
      handleCredentialsResponse(message);
      break;
    case 'connection-test':
      console.log('Connection test successful');
      break;
    case 'error':
      console.error('Native app error:', message.error);
      break;
  }
}

// Handle save response from native app
function handleSaveResponse(message) {
  if (message.success) {
    // Invalidate cache for this domain so it gets refreshed
    if (message.domain && credentialsCache[message.domain]) {
      delete credentialsCache[message.domain];
    }
    
    // Show success notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Password Saved',
      message: `Credentials for ${message.domain} have been saved securely.`
    });
    
    // Notify content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'save-success',
          domain: message.domain
        });
      }
    });
  } else {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Save Failed',
      message: message.error || 'Failed to save credentials.'
    });
  }
}

// Handle credentials response from native app
function handleCredentialsResponse(message) {
  const { messageId, credentials, domain } = message;
  
  // Cache the credentials
  if (domain) {
    credentialsCache[domain] = credentials || [];
  }
  
  // Call pending request callback if exists
  if (messageId && pendingRequests[messageId]) {
    pendingRequests[messageId](credentials || []);
    delete pendingRequests[messageId];
  }
  
  // Also send to content script for auto-fill
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'credentials-response',
        credentials: credentials || []
      }).catch(() => {
        // Ignore errors if content script not ready
      });
    }
  });
}

// Update extension icon based on status
function updateExtensionIcon(status) {
  const iconPaths = {
    connected: {
      '16': 'icons/icon16.png',
      '32': 'icons/icon32.png',
      '48': 'icons/icon48.png',
      '128': 'icons/icon128.png'
    },
    disconnected: {
      '16': 'icons/icon16-gray.png',
      '32': 'icons/icon32-gray.png',
      '48': 'icons/icon48-gray.png',
      '128': 'icons/icon128-gray.png'
    },
    error: {
      '16': 'icons/icon16-red.png',
      '32': 'icons/icon32-red.png',
      '48': 'icons/icon48-red.png',
      '128': 'icons/icon128-red.png'
    }
  };
  
  chrome.action.setIcon({ path: iconPaths[status] || iconPaths.disconnected });
}

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'save-credentials':
      handleSaveCredentials(request, sender);
      sendResponse({ success: true });
      break;
      
    case 'get-credentials':
      handleGetCredentials(request, sender, sendResponse);
      return true; // Keep channel open for async response
      
    case 'get-connection-status':
      sendResponse({ status: connectionStatus });
      break;
      
    case 'test-connection':
      testConnection(sendResponse);
      return true;
      
    case 'add-to-never-save':
      addToNeverSave(request.domain);
      sendResponse({ success: true });
      break;
      
    default:
      sendResponse({ error: 'Unknown message type' });
  }
});

// Handle save credentials request
function handleSaveCredentials(request, sender) {
  const { domain, username, password, formType } = request;
  
  // Check if site is in never-save list
  chrome.storage.local.get(['settings'], (result) => {
    const settings = result.settings || {};
    if (settings.neverSaveList && settings.neverSaveList.includes(domain)) {
      console.log('Site is in never-save list, skipping');
      return;
    }
    
    // Send to native app
    sendToNativeApp({
      type: 'save-credentials',
      domain: domain,
      username: username,
      password: password,
      formType: formType,
      timestamp: Date.now()
    });
  });
}

// Handle get credentials request
function handleGetCredentials(request, sender, sendResponse) {
  const { domain } = request;
  
  // Check cache first
  if (credentialsCache[domain]) {
    sendResponse({ credentials: credentialsCache[domain] });
    return;
  }
  
  // Request credentials from native app
  const messageId = Date.now();
  
  // Store callback for when response arrives
  pendingRequests[messageId] = (credentials) => {
    sendResponse({ credentials: credentials });
  };
  
  sendToNativeApp({
    type: 'get-credentials',
    domain: domain,
    messageId: messageId
  });
  
  // Timeout after 5 seconds
  setTimeout(() => {
    if (pendingRequests[messageId]) {
      delete pendingRequests[messageId];
      sendResponse({ credentials: [] });
    }
  }, 5000);
}

// Test connection to native app
function testConnection(sendResponse) {
  if (connectionStatus === 'connected') {
    sendToNativeApp({
      type: 'connection-test',
      timestamp: Date.now()
    });
    sendResponse({ success: true, status: 'connected' });
  } else {
    connectToNativeApp();
    setTimeout(() => {
      sendResponse({ success: connectionStatus === 'connected', status: connectionStatus });
    }, 1000);
  }
}

// Add domain to never-save list
function addToNeverSave(domain) {
  chrome.storage.local.get(['settings'], (result) => {
    const settings = result.settings || {};
    if (!settings.neverSaveList) {
      settings.neverSaveList = [];
    }
    if (!settings.neverSaveList.includes(domain)) {
      settings.neverSaveList.push(domain);
      chrome.storage.local.set({ settings: settings });
    }
  });
}

// Context menu click handler
chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case 'pwdguard-save':
      chrome.tabs.sendMessage(tab.id, { type: 'manual-save' });
      break;
    case 'pwdguard-autofill':
      chrome.tabs.sendMessage(tab.id, { type: 'manual-autofill' });
      break;
    case 'pwdguard-never-save':
      const url = new URL(tab.url);
      addToNeverSave(url.hostname);
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'Site Added to Never-Save List',
        message: `${url.hostname} will not prompt for password saving.`
      });
      break;
  }
});

// Keyboard command handler
chrome.commands.onCommand.addListener((command) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      switch (command) {
        case 'auto-fill':
          chrome.tabs.sendMessage(tabs[0].id, { type: 'manual-autofill' });
          break;
        case 'save-password':
          chrome.tabs.sendMessage(tabs[0].id, { type: 'manual-save' });
          break;
      }
    }
  });
});

// Keep service worker alive
setInterval(() => {
  console.log('Service worker heartbeat');
}, 20000);
