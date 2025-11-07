// Content Script for PwdGuard Extension
// Detects forms, captures credentials, and handles auto-fill

(function() {
  'use strict';
  
  // State management
  let capturedCredentials = null;
  let formSubmitListener = null;
  let currentDomain = window.location.hostname;
  let settings = {};
  let isProcessing = false;
  
  // Load settings
  chrome.storage.local.get(['settings'], (result) => {
    settings = result.settings || {};
    if (settings.enabled) {
      initialize();
    }
  });
  
  // Initialize content script
  function initialize() {
    console.log('PwdGuard: Initializing on', currentDomain);
    
    // Check if HTTPS or allowed localhost
    if (!isSecureContext()) {
      console.log('PwdGuard: Insecure context, skipping');
      return;
    }
    
    // Check if domain is in never-save list
    if (settings.neverSaveList && settings.neverSaveList.includes(currentDomain)) {
      console.log('PwdGuard: Domain in never-save list');
      return;
    }
    
    // Detect and monitor forms
    detectForms();
    
    // Check for saved credentials
    checkForSavedCredentials();
    
    // Set up mutation observer for dynamic forms
    observeDOMChanges();
  }
  
  // Check if context is secure
  function isSecureContext() {
    if (window.location.protocol === 'https:') {
      return true;
    }
    
    if (settings.allowLocalhost && 
        (window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1')) {
      return true;
    }
    
    return !settings.httpsOnly;
  }
  
  // Detect login forms on the page
  function detectForms() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      const formInfo = analyzeForm(form);
      
      if (formInfo.isLoginForm) {
        console.log('PwdGuard: Login form detected', formInfo);
        attachFormListener(form, formInfo);
      }
    });
  }
  
  // Analyze form to determine type and fields
  function analyzeForm(form) {
    const inputs = form.querySelectorAll('input');
    let usernameField = null;
    let passwordField = null;
    let confirmPasswordField = null;
    let emailField = null;
    
    inputs.forEach(input => {
      const type = input.type.toLowerCase();
      const name = (input.name || '').toLowerCase();
      const id = (input.id || '').toLowerCase();
      const placeholder = (input.placeholder || '').toLowerCase();
      const autocomplete = (input.autocomplete || '').toLowerCase();
      
      // Detect password fields
      if (type === 'password') {
        if (!passwordField) {
          passwordField = input;
        } else if (!confirmPasswordField) {
          confirmPasswordField = input;
        }
      }
      
      // Detect username/email fields
      if (type === 'email' || autocomplete === 'email' || 
          name.includes('email') || id.includes('email') || placeholder.includes('email')) {
        emailField = input;
      }
      
      if (type === 'text' || type === 'email') {
        if (autocomplete === 'username' || 
            name.includes('user') || name.includes('login') ||
            id.includes('user') || id.includes('login') ||
            placeholder.includes('user') || placeholder.includes('login')) {
          usernameField = input;
        }
      }
    });
    
    // Determine form type
    let formType = 'unknown';
    let isLoginForm = false;
    
    if (passwordField) {
      if (confirmPasswordField) {
        formType = 'registration';
        isLoginForm = false; // Don't capture registration forms automatically
      } else if (usernameField || emailField) {
        formType = 'login';
        isLoginForm = true;
      } else {
        // Check for password change indicators
        const formText = form.textContent.toLowerCase();
        if (formText.includes('change password') || formText.includes('reset password')) {
          formType = 'password-change';
          isLoginForm = false;
        } else {
          formType = 'login';
          isLoginForm = true;
        }
      }
    }
    
    return {
      form,
      formType,
      isLoginForm,
      usernameField: usernameField || emailField,
      passwordField,
      confirmPasswordField
    };
  }
  
  // Attach form submission listener
  function attachFormListener(form, formInfo) {
    // Remove existing listener if any
    if (formSubmitListener) {
      form.removeEventListener('submit', formSubmitListener);
    }
    
    formSubmitListener = (e) => {
      handleFormSubmit(e, formInfo);
    };
    
    form.addEventListener('submit', formSubmitListener);
    
    // Also monitor password field changes for SPA
    if (formInfo.passwordField) {
      formInfo.passwordField.addEventListener('change', () => {
        captureCredentials(formInfo);
      });
    }
  }
  
  // Handle form submission
  function handleFormSubmit(event, formInfo) {
    if (isProcessing) return;
    
    console.log('PwdGuard: Form submitted');
    captureCredentials(formInfo);
    
    // Wait a bit to see if login was successful
    setTimeout(() => {
      // Check if we're still on the same page (login failed) or redirected (success)
      if (capturedCredentials) {
        showSavePrompt(capturedCredentials);
      }
    }, 1000);
  }
  
  // Capture credentials from form
  function captureCredentials(formInfo) {
    const username = formInfo.usernameField ? formInfo.usernameField.value : '';
    const password = formInfo.passwordField ? formInfo.passwordField.value : '';
    
    if (username && password) {
      capturedCredentials = {
        domain: currentDomain,
        url: window.location.href,
        username: username,
        password: password,
        formType: formInfo.formType,
        timestamp: Date.now()
      };
      
      console.log('PwdGuard: Credentials captured for', currentDomain);
    }
  }
  
  // Show save prompt notification
  function showSavePrompt(credentials) {
    if (isProcessing) return;
    isProcessing = true;
    
    // Create notification overlay
    const overlay = document.createElement('div');
    overlay.id = 'pwdguard-save-prompt';
    overlay.innerHTML = `
      <div class="pwdguard-notification">
        <div class="pwdguard-header">
          <img src="${chrome.runtime.getURL('icons/icon48.png')}" alt="PwdGuard">
          <span>PwdGuard Password Manager</span>
        </div>
        <div class="pwdguard-content">
          <p>Save password for <strong>${credentials.domain}</strong>?</p>
          <p class="pwdguard-username">${credentials.username}</p>
        </div>
        <div class="pwdguard-actions">
          <button id="pwdguard-save" class="pwdguard-btn pwdguard-btn-primary">Save Password</button>
          <button id="pwdguard-never" class="pwdguard-btn pwdguard-btn-secondary">Never for this site</button>
          <button id="pwdguard-not-now" class="pwdguard-btn pwdguard-btn-text">Not now</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Add event listeners
    document.getElementById('pwdguard-save').addEventListener('click', () => {
      saveCredentials(credentials);
      removePrompt();
    });
    
    document.getElementById('pwdguard-never').addEventListener('click', () => {
      neverSaveForSite(credentials.domain);
      removePrompt();
    });
    
    document.getElementById('pwdguard-not-now').addEventListener('click', () => {
      removePrompt();
    });
    
    // Auto-dismiss after 15 seconds
    setTimeout(() => {
      removePrompt();
    }, 15000);
  }
  
  // Remove save prompt
  function removePrompt() {
    const prompt = document.getElementById('pwdguard-save-prompt');
    if (prompt) {
      prompt.remove();
    }
    isProcessing = false;
    capturedCredentials = null;
  }
  
  // Save credentials via background script
  function saveCredentials(credentials) {
    chrome.runtime.sendMessage({
      type: 'save-credentials',
      domain: credentials.domain,
      username: credentials.username,
      password: credentials.password,
      formType: credentials.formType
    }, (response) => {
      if (response && response.success) {
        showSuccessNotification('Password saved successfully!');
      }
    });
    
    // Clear from memory
    credentials.password = null;
  }
  
  // Add domain to never-save list
  function neverSaveForSite(domain) {
    chrome.runtime.sendMessage({
      type: 'add-to-never-save',
      domain: domain
    }, (response) => {
      if (response && response.success) {
        showSuccessNotification(`Won't ask again for ${domain}`);
      }
    });
  }
  
  // Check for saved credentials and offer auto-fill
  function checkForSavedCredentials() {
    if (!settings.autoFillEnabled) return;
    
    chrome.runtime.sendMessage({
      type: 'get-credentials',
      domain: currentDomain
    }, (response) => {
      if (response && response.credentials && response.credentials.length > 0) {
        showAutoFillBanner(response.credentials);
      }
    });
  }
  
  // Show auto-fill banner
  function showAutoFillBanner(credentials) {
    // Don't show if already shown
    if (document.getElementById('pwdguard-autofill-banner')) return;
    
    const banner = document.createElement('div');
    banner.id = 'pwdguard-autofill-banner';
    banner.innerHTML = `
      <div class="pwdguard-banner">
        <div class="pwdguard-banner-content">
          <img src="${chrome.runtime.getURL('icons/icon32.png')}" alt="PwdGuard">
          <span>PwdGuard found ${credentials.length} saved ${credentials.length === 1 ? 'password' : 'passwords'} for this site</span>
        </div>
        <div class="pwdguard-banner-actions">
          <button id="pwdguard-autofill-btn" class="pwdguard-btn pwdguard-btn-primary">Auto-fill</button>
          <button id="pwdguard-dismiss-btn" class="pwdguard-btn pwdguard-btn-text">✕</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(banner);
    
    // Add event listeners
    document.getElementById('pwdguard-autofill-btn').addEventListener('click', () => {
      autoFillCredentials(credentials);
      banner.remove();
    });
    
    document.getElementById('pwdguard-dismiss-btn').addEventListener('click', () => {
      banner.remove();
    });
    
    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      if (banner.parentNode) {
        banner.remove();
      }
    }, 10000);
  }
  
  // Auto-fill credentials into form
  function autoFillCredentials(credentials) {
    // If multiple credentials, show selection
    if (credentials.length > 1) {
      showCredentialSelector(credentials);
      return;
    }
    
    const cred = credentials[0];
    fillFormFields(cred);
    showSuccessNotification('Credentials auto-filled!');
  }
  
  // Show credential selector for multiple accounts
  function showCredentialSelector(credentials) {
    const selector = document.createElement('div');
    selector.id = 'pwdguard-credential-selector';
    
    const credentialsList = credentials.map((cred, index) => `
      <div class="pwdguard-credential-item" data-index="${index}">
        <div class="pwdguard-credential-username">${cred.username}</div>
        <div class="pwdguard-credential-date">Last used: ${new Date(cred.lastUsed || Date.now()).toLocaleDateString()}</div>
      </div>
    `).join('');
    
    selector.innerHTML = `
      <div class="pwdguard-selector-overlay">
        <div class="pwdguard-selector-dialog">
          <div class="pwdguard-selector-header">
            <h3>Select Account</h3>
            <button id="pwdguard-selector-close" class="pwdguard-btn-close">✕</button>
          </div>
          <div class="pwdguard-selector-content">
            ${credentialsList}
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(selector);
    
    // Add event listeners
    document.getElementById('pwdguard-selector-close').addEventListener('click', () => {
      selector.remove();
    });
    
    document.querySelectorAll('.pwdguard-credential-item').forEach(item => {
      item.addEventListener('click', () => {
        const index = parseInt(item.dataset.index);
        fillFormFields(credentials[index]);
        selector.remove();
        showSuccessNotification('Credentials auto-filled!');
      });
    });
  }
  
  // Fill form fields with credentials
  function fillFormFields(credentials) {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      const formInfo = analyzeForm(form);
      
      if (formInfo.isLoginForm) {
        if (formInfo.usernameField) {
          formInfo.usernameField.value = credentials.username;
          formInfo.usernameField.dispatchEvent(new Event('input', { bubbles: true }));
          formInfo.usernameField.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        if (formInfo.passwordField) {
          formInfo.passwordField.value = credentials.password;
          formInfo.passwordField.dispatchEvent(new Event('input', { bubbles: true }));
          formInfo.passwordField.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    });
  }
  
  // Show success notification
  function showSuccessNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'pwdguard-success-notification';
    notification.innerHTML = `
      <div class="pwdguard-success-content">
        <span class="pwdguard-success-icon">✓</span>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('pwdguard-show');
    }, 10);
    
    setTimeout(() => {
      notification.classList.remove('pwdguard-show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
  
  // Observe DOM changes for dynamic forms
  function observeDOMChanges() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            if (node.tagName === 'FORM') {
              const formInfo = analyzeForm(node);
              if (formInfo.isLoginForm) {
                attachFormListener(node, formInfo);
              }
            } else if (node.querySelectorAll) {
              const forms = node.querySelectorAll('form');
              forms.forEach(form => {
                const formInfo = analyzeForm(form);
                if (formInfo.isLoginForm) {
                  attachFormListener(form, formInfo);
                }
              });
            }
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.type) {
      case 'manual-save':
        // Manually trigger save for current form
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
          const formInfo = analyzeForm(form);
          if (formInfo.isLoginForm) {
            captureCredentials(formInfo);
            if (capturedCredentials) {
              showSavePrompt(capturedCredentials);
            }
          }
        });
        break;
        
      case 'manual-autofill':
        // Manually trigger auto-fill
        checkForSavedCredentials();
        break;
        
      case 'save-success':
        showSuccessNotification('Password saved successfully!');
        break;
        
      case 'credentials-response':
        if (request.credentials && request.credentials.length > 0) {
          autoFillCredentials(request.credentials);
        }
        break;
    }
    
    sendResponse({ success: true });
  });
  
})();
