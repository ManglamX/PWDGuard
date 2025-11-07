# Troubleshooting Guide - Extension Not Working

## Quick Diagnostics

### Step 1: Check Extension Status

1. Open Chrome DevTools Console (F12)
2. Go to any website (e.g., facebook.com)
3. Check for these messages:
   ```
   PwdGuard: Initializing on [domain]
   PwdGuard: Login form detected
   ```

If you DON'T see these messages, the extension might not be enabled.

### Step 2: Check Extension Settings

1. Click the PwdGuard extension icon
2. Verify:
   - ✅ Status shows "Connected" (green)
   - ✅ "Extension Enabled" toggle is ON
   - ✅ "Auto-fill" toggle is ON

### Step 3: Check Background Script

1. Go to `chrome://extensions/`
2. Find "PwdGuard Password Manager"
3. Click "Inspect views: service worker"
4. Check Console for errors

### Step 4: Test Native Messaging

In the background script console, run:
```javascript
chrome.runtime.sendNativeMessage('com.pwdguard.native', 
  { type: 'connection-test' },
  (response) => console.log('Native response:', response)
)
```

Should see: `Native response: {success: true, ...}`

---

## Common Issues

### Issue 1: Extension Not Initializing

**Symptoms:**
- No console messages on web pages
- Forms not detected
- No auto-fill banner

**Causes:**
1. Extension disabled in settings
2. HTTPS-only mode blocking HTTP sites
3. Domain in never-save list

**Solutions:**

**A. Check if extension is enabled:**
```javascript
// Run in page console
chrome.storage.local.get(['settings'], (result) => {
  console.log('Settings:', result.settings);
});
```

Should show: `enabled: true`

**B. Enable extension:**
1. Click extension icon
2. Turn ON "Extension Enabled" toggle
3. Reload the page

**C. Check HTTPS settings:**
```javascript
// Run in page console
console.log('Protocol:', window.location.protocol);
console.log('Hostname:', window.location.hostname);
```

If HTTP and not localhost, enable "Allow HTTP" in settings.

### Issue 2: Auto-fill Not Working

**Symptoms:**
- No auto-fill banner appears
- Manual auto-fill button doesn't work

**Causes:**
1. Auto-fill disabled in settings
2. No credentials saved for domain
3. Credentials not loading from native host

**Solutions:**

**A. Check auto-fill setting:**
```javascript
chrome.storage.local.get(['settings'], (result) => {
  console.log('Auto-fill enabled:', result.settings.autoFillEnabled);
});
```

**B. Check if credentials exist:**
```javascript
chrome.runtime.sendMessage({
  type: 'get-credentials',
  domain: window.location.hostname
}, (response) => {
  console.log('Credentials:', response);
});
```

Should return array of credentials.

**C. Check native host connection:**
- Extension icon should show green "Connected"
- If red or gray, native host not connected

### Issue 3: Save Not Working

**Symptoms:**
- No save prompt after form submission
- Save button does nothing

**Causes:**
1. Form not detected as login form
2. Credentials not captured
3. Native host not responding

**Solutions:**

**A. Check form detection:**
```javascript
// Run in page console
const forms = document.querySelectorAll('form');
console.log('Forms found:', forms.length);

forms.forEach((form, i) => {
  const passwords = form.querySelectorAll('input[type="password"]');
  console.log(`Form ${i}:`, passwords.length, 'password fields');
});
```

**B. Manually trigger save:**
1. Click extension icon
2. Click "Save" button
3. Should show save prompt

**C. Check background script:**
Open background console and look for:
```
Received from native app: {type: 'save-response', success: true}
```

### Issue 4: Native Host Not Connected

**Symptoms:**
- Extension icon shows "Disconnected" or red
- Console shows: "Native messaging error: Specified native messaging host not found"

**Causes:**
1. Native host not installed
2. Extension ID mismatch
3. Registry entry missing (Windows)

**Solutions:**

**A. Run setup script:**
```cmd
cd PasswordManager-Extension
.\setup-helper.bat
```

**B. Verify Extension ID:**
1. Go to `chrome://extensions/`
2. Copy Extension ID
3. Check it matches in:
   ```
   native-messaging-host\com.pwdguard.native.json
   ```

**C. Check registry (Windows):**
```cmd
reg query "HKCU\Software\Google\Chrome\NativeMessagingHosts\com.pwdguard.native"
```

Should show path to manifest file.

---

## Debug Commands

### Check Extension State

Run in background script console:

```javascript
// Check connection
console.log('Connection status:', connectionStatus);
console.log('Native port:', nativePort);

// Check cache
console.log('Credentials cache:', credentialsCache);

// Check pending requests
console.log('Pending requests:', pendingRequests);

// Test native messaging
chrome.runtime.sendNativeMessage('com.pwdguard.native',
  { type: 'connection-test' },
  (response) => console.log('Response:', response)
);
```

### Check Content Script State

Run in page console:

```javascript
// Check if content script loaded
console.log('Content script loaded:', typeof checkForSavedCredentials !== 'undefined');

// Check settings
chrome.storage.local.get(['settings'], (result) => {
  console.log('Settings:', result.settings);
});

// Manually check for credentials
chrome.runtime.sendMessage({
  type: 'get-credentials',
  domain: window.location.hostname
}, (response) => {
  console.log('Credentials response:', response);
});
```

### Force Reload Extension

```javascript
// Run in background console
chrome.runtime.reload();
```

---

## Manual Testing Steps

### Test Save Flow

1. Go to a login page (e.g., facebook.com)
2. Open DevTools Console (F12)
3. Enter credentials in form
4. Submit form
5. **Expected:** Save prompt appears
6. Click "Save Password"
7. **Expected:** Success notification
8. Check background console for:
   ```
   Received from native app: {type: 'save-response', success: true}
   ```

### Test Auto-fill Flow

1. Go to a site with saved credentials
2. Open DevTools Console
3. **Expected:** Auto-fill banner appears
4. Click "Auto-fill"
5. **Expected:** Form fields filled
6. Check console for:
   ```
   PwdGuard: Auto-filling credentials
   ```

### Test Manual Actions

1. Click extension icon
2. Click "Auto-fill" button
3. **Expected:** Form fills
4. Click "Save" button
5. **Expected:** Save prompt appears
6. Click "Generate" button
7. **Expected:** Password copied to clipboard

---

## Log Files

### Extension Logs
- Background console: `chrome://extensions/` → Inspect service worker
- Content console: F12 on any webpage
- Native host logs: `%APPDATA%\PwdGuard\extension.log`

### Check Native Host Log

```cmd
type %APPDATA%\PwdGuard\extension.log
```

Should show entries like:
```json
{"timestamp":"...","event":"credential-saved","data":{...}}
```

---

## Reset Extension

If all else fails:

### 1. Clear Extension Data

```javascript
// Run in background console
chrome.storage.local.clear(() => {
  console.log('Storage cleared');
  chrome.runtime.reload();
});
```

### 2. Reload Extension

1. Go to `chrome://extensions/`
2. Click reload icon
3. Restart Chrome

### 3. Reinstall Native Host

```cmd
cd PasswordManager-Extension
.\setup-helper.bat
```

### 4. Restart Desktop App

```cmd
npm run dev
```

---

## Getting Help

If issues persist, collect this information:

1. **Chrome version:** `chrome://version/`
2. **Extension version:** Check manifest.json
3. **OS:** Windows/Mac/Linux
4. **Error messages:** From all consoles
5. **Connection status:** From extension popup
6. **Native host status:** Check if process running

Run diagnostics:
```cmd
cd PasswordManager-Extension
.\diagnose.bat
```

---

## Quick Fixes

### Fix 1: Extension Not Enabled

```javascript
chrome.storage.local.set({
  settings: {
    enabled: true,
    httpsOnly: true,
    allowLocalhost: true,
    autoFillEnabled: true,
    notificationsEnabled: true,
    neverSaveList: [],
    theme: 'light'
  }
}, () => console.log('Settings reset'));
```

### Fix 2: Clear Cache

```javascript
// Run in background console
credentialsCache = {};
console.log('Cache cleared');
```

### Fix 3: Reconnect Native Host

```javascript
// Run in background console
if (nativePort) {
  nativePort.disconnect();
}
connectToNativeApp();
```

---

**Still having issues?** Check `MANUAL_SETUP.md` for detailed setup instructions.
