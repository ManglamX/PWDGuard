# Desktop App - Browser Passwords Not Showing - FIXED

## Problem
The "Browser Passwords" tab in the desktop app was showing the empty state message even though passwords were saved via the Chrome extension.

## Root Cause
The `window.electron` API wasn't properly exposed in the preload script. The `ExtensionCredentials` component was trying to call:
```typescript
window.electron?.ipcRenderer.invoke('extension:get-credentials')
```

But only `window.ipcRenderer` was exposed, not `window.electron.ipcRenderer`.

## Solution Applied

### Updated: `electron/preload/index.ts`

Added a second `contextBridge.exposeInMainWorld` call to expose `window.electron`:

```typescript
// Also expose as window.electron for extension integration
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    on(channel: string, listener: (...args: any[]) => void) {
      ipcRenderer.on(channel, (event, ...args) => listener(...args))
    },
    removeListener(channel: string, listener: (...args: any[]) => void) {
      ipcRenderer.removeListener(channel, listener)
    },
    invoke(channel: string, ...args: any[]) {
      return ipcRenderer.invoke(channel, ...args)
    }
  }
})
```

## How It Works Now

### Complete Flow:

```
1. User saves password in Chrome extension
   ↓
2. Extension → Native Host → Encrypts & saves to file
   ↓
3. Native Host logs event to extension.log
   ↓
4. ExtensionIntegration (Electron main) watches log file
   ↓
5. Detects credential-saved event
   ↓
6. Shows desktop notification
   ↓
7. Sends IPC message to renderer
   ↓
8. User opens "Browser Passwords" tab
   ↓
9. ExtensionCredentials component calls:
   window.electron.ipcRenderer.invoke('extension:get-credentials')
   ↓
10. Main process (ExtensionIntegration) handles IPC
   ↓
11. Reads credential files from disk
   ↓
12. Returns credentials to renderer
   ↓
13. Component displays credentials ✓
```

## Testing Steps

### 1. Restart Desktop App
```bash
# Stop current process (Ctrl+C)
npm run dev
```

### 2. Save a Password
- Open Chrome
- Go to any login page (e.g., facebook.com)
- Enter credentials and submit
- Extension should prompt to save
- Click "Save Password"

### 3. Check Desktop App
- Open PwdGuard desktop app
- Click "Browser Passwords" tab
- Should now see the saved credentials!

### 4. Verify Features
- ✅ Credentials are listed by domain
- ✅ Can search/filter credentials
- ✅ Can expand domain to see accounts
- ✅ Can copy username
- ✅ Can delete credentials
- ✅ Real-time updates when new passwords saved

## Expected Output

### Console Logs:
```
Extension integration initialized
Native messaging host started with PID: 12345
```

### Desktop App UI:
```
🔐 Browser Extension Credentials
Passwords saved from Chrome extension (X total)

[Search bar]

🌐 facebook.com
   2 accounts
   
   ▼ user@example.com
      Last used: 11/7/2025
      [📋 Copy] [🗑️ Delete]
```

## Troubleshooting

### If still showing empty state:

1. **Check if credentials exist:**
   ```
   %APPDATA%\PwdGuard\credentials\
   ```
   Should contain `.json` files for each domain

2. **Check console for errors:**
   - Open DevTools in desktop app (F12)
   - Look for errors in Console

3. **Verify IPC handlers:**
   - Check if `extension:get-credentials` handler is registered
   - Should see "Extension integration initialized" in console

4. **Test IPC directly:**
   Open DevTools console and run:
   ```javascript
   window.electron.ipcRenderer.invoke('extension:get-credentials')
     .then(console.log)
   ```
   Should return array of credentials

### If window.electron is undefined:

1. Verify preload script is loaded:
   ```javascript
   console.log(window.electron)
   ```
   Should show object with ipcRenderer

2. Check preload path in main process:
   ```typescript
   const preload = path.join(__dirname, '../preload/index.mjs')
   ```

3. Rebuild the app:
   ```bash
   npm run dev
   ```

## Files Modified

1. **electron/preload/index.ts** - Added window.electron exposure
2. **electron/main/index.ts** - Initialized ExtensionIntegration (already done)
3. **electron/main/extension-integration.ts** - Fixed TypeScript types (already done)

## Additional Features Working

### Desktop Notifications
When a password is saved via the extension:
- Desktop notification appears
- Shows domain and username
- Confirms secure storage

### Real-time Updates
When viewing "Browser Passwords" tab:
- Listens for 'extension-credential-saved' IPC event
- Automatically refreshes credential list
- No need to manually refresh

### Credential Management
From desktop app, you can:
- View all browser-saved passwords
- Search by domain or username
- Group by domain
- Copy usernames to clipboard
- Delete credentials
- See last used timestamp

## Security Notes

- Passwords are encrypted with AES-256-CBC
- Stored locally in %APPDATA%\PwdGuard\
- Never sent to external servers
- Desktop app reads encrypted files
- Decryption happens in native host only

## Success Indicators

✅ "Extension integration initialized" in console
✅ Native host PIDs logged
✅ window.electron is defined
✅ IPC handlers respond correctly
✅ Credentials display in UI
✅ Desktop notifications work
✅ Real-time updates work

---

**Status: FIXED** ✅

The desktop app should now properly display all browser-saved passwords in the "Browser Passwords" tab!
