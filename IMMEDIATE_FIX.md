# Immediate Fix - Extension Not Working

## 🚨 Quick Diagnosis

The extension is likely not enabled or has incorrect settings. Follow these steps:

---

## Step 1: Check Extension Status (30 seconds)

1. Click the **PwdGuard extension icon** in Chrome
2. Check if it shows:
   - ✅ **"Connected"** in green
   - ✅ **"Extension Enabled"** toggle is ON
   - ✅ **"Auto-fill"** toggle is ON

**If any toggle is OFF, turn it ON!**

---

## Step 2: Reset Extension Settings (1 minute)

### Option A: Via Extension Popup
1. Click PwdGuard icon
2. Click **"Settings"** button
3. Scroll to bottom
4. Click **"Reset to Defaults"**
5. Reload the webpage

### Option B: Via Console
1. Go to `chrome://extensions/`
2. Find "PwdGuard Password Manager"
3. Click **"Inspect views: service worker"**
4. In the console, paste and run:

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
}, () => {
  console.log('Settings reset!');
  chrome.runtime.reload();
});
```

---

## Step 3: Test the Extension (2 minutes)

### Use the Test Page:
1. Open this file in Chrome:
   ```
   file:///C:/Users/Manglam/Desktop/PWDGuard/PasswordManager-Extension/test-extension.html
   ```

2. Run all tests:
   - **Test 1:** Extension Detection
   - **Test 2:** Connection Status
   - **Test 3:** Settings
   - **Test 4:** Get Credentials
   - **Test 5:** Form Detection
   - **Test 6:** Auto-fill

3. All tests should show ✓ (green checkmarks)

---

## Step 4: Test on Real Website (2 minutes)

1. Go to **facebook.com** (or any login page)
2. Open **DevTools** (F12)
3. Go to **Console** tab
4. You should see:
   ```
   PwdGuard: Initializing on www.facebook.com
   PwdGuard: Login form detected
   ```

5. If you see these messages, the extension is working! ✓

---

## Step 5: Test Save & Auto-fill

### Test Save:
1. Enter credentials in the form
2. Click Submit
3. **Expected:** Save prompt appears
4. Click "Save Password"
5. **Expected:** Success notification

### Test Auto-fill:
1. Reload the page
2. **Expected:** Auto-fill banner appears
3. Click "Auto-fill"
4. **Expected:** Form fields filled

---

## Common Issues & Quick Fixes

### Issue: Extension Icon Shows "Disconnected"

**Fix:**
1. Reload the extension:
   - Go to `chrome://extensions/`
   - Click reload icon on PwdGuard
2. Restart Chrome completely
3. Check if desktop app is running (`npm run dev`)

### Issue: No Console Messages on Webpage

**Fix:**
1. Extension might be disabled
2. Run this in page console:
```javascript
chrome.storage.local.get(['settings'], (result) => {
  console.log('Extension enabled:', result.settings?.enabled);
  if (!result.settings?.enabled) {
    console.log('❌ Extension is DISABLED!');
  }
});
```

3. If disabled, enable it via popup or reset settings (Step 2)

### Issue: Forms Not Detected

**Fix:**
1. Check if page is HTTPS:
```javascript
console.log('Protocol:', window.location.protocol);
```

2. If HTTP, either:
   - Enable "Allow HTTP" in settings
   - Or test on HTTPS site

### Issue: Save Prompt Doesn't Appear

**Fix:**
1. Manually trigger save:
   - Click extension icon
   - Click "Save" button
   
2. Or run in console:
```javascript
chrome.runtime.sendMessage({ type: 'manual-save' });
```

### Issue: Auto-fill Doesn't Work

**Fix:**
1. Check if credentials exist:
```javascript
chrome.runtime.sendMessage({
  type: 'get-credentials',
  domain: window.location.hostname
}, (response) => {
  console.log('Credentials:', response);
});
```

2. If no credentials, save some first

3. Manually trigger auto-fill:
   - Click extension icon
   - Click "Auto-fill" button

---

## Nuclear Option: Complete Reset

If nothing works, do a complete reset:

### 1. Clear Extension Data
```javascript
// Run in background console (chrome://extensions/ → Inspect service worker)
chrome.storage.local.clear(() => {
  console.log('Storage cleared');
  credentialsCache = {};
  pendingRequests = {};
  chrome.runtime.reload();
});
```

### 2. Reload Extension
- Go to `chrome://extensions/`
- Click reload icon

### 3. Restart Chrome
- Close ALL Chrome windows
- Reopen Chrome

### 4. Reset Settings
- Follow Step 2 above

### 5. Test Again
- Follow Step 3 above

---

## Verification Checklist

After fixes, verify:

- [ ] Extension icon shows "Connected" (green)
- [ ] Extension Enabled toggle is ON
- [ ] Auto-fill toggle is ON
- [ ] Console shows "PwdGuard: Initializing..." on webpages
- [ ] Forms are detected
- [ ] Save prompt appears after form submission
- [ ] Auto-fill banner appears on return visits
- [ ] Manual save/auto-fill buttons work
- [ ] Desktop app shows saved passwords

---

## Still Not Working?

### Collect Debug Info:

1. **Extension Console Errors:**
   - `chrome://extensions/` → Inspect service worker
   - Copy any errors

2. **Page Console Errors:**
   - F12 on webpage
   - Copy any errors

3. **Connection Status:**
   - Click extension icon
   - Note the status

4. **Settings:**
```javascript
chrome.storage.local.get(['settings'], (result) => {
  console.log(JSON.stringify(result.settings, null, 2));
});
```

5. **Test Results:**
   - Run test-extension.html
   - Screenshot results

### Then check:
- `TROUBLESHOOTING.md` - Detailed troubleshooting
- `MANUAL_SETUP.md` - Setup instructions
- `QUICK_FIX.md` - Other common fixes

---

## Most Likely Cause

**90% of the time, the issue is:**
- ❌ Extension not enabled in settings
- ❌ Auto-fill toggle is OFF
- ❌ Native host not connected

**Fix:** Reset settings (Step 2) and reload extension!

---

## Contact

If you've tried everything and it still doesn't work, you may have found a bug. Please report with:
- Chrome version
- OS version
- Error messages
- Test results
- Steps to reproduce

---

**Good luck!** 🍀
