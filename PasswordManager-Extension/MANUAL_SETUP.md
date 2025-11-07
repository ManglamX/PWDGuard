# Manual Setup Guide - Fix "Native messaging host not found" Error

This guide will help you manually configure the native messaging host if the automatic installation script didn't work.

---

## Step 1: Get Your Extension ID

1. Open Chrome and go to `chrome://extensions/`
2. Find "PwdGuard Password Manager" extension
3. Copy the **Extension ID** (it looks like: `abcdefghijklmnopqrstuvwxyz123456`)
4. Keep this ID handy - you'll need it in the next steps

---

## Step 2: Update the Native Messaging Manifest

### Windows

1. Open this file in a text editor (as Administrator):
   ```
   C:\Users\YourUsername\Desktop\PWDGuard\PasswordManager-Extension\native-messaging-host\com.pwdguard.native.json
   ```

2. Replace `EXTENSION_ID_PLACEHOLDER` with your actual Extension ID:
   ```json
   {
     "name": "com.pwdguard.native",
     "description": "PwdGuard Native Messaging Host",
     "path": "C:\\Users\\YourUsername\\Desktop\\PWDGuard\\native-host\\native-host-wrapper.bat",
     "type": "stdio",
     "allowed_origins": [
       "chrome-extension://YOUR_ACTUAL_EXTENSION_ID_HERE/"
     ]
   }
   ```

3. Create a wrapper batch file at:
   ```
   C:\Users\YourUsername\Desktop\PWDGuard\native-host\native-host-wrapper.bat
   ```
   
   With this content:
   ```batch
   @echo off
   "C:\Program Files\nodejs\node.exe" "C:\Users\YourUsername\Desktop\PWDGuard\native-host\native-host.js"
   ```

4. Register the manifest with Chrome:
   - Open Command Prompt as Administrator
   - Run this command (replace paths with your actual paths):
   ```cmd
   reg add "HKCU\Software\Google\Chrome\NativeMessagingHosts\com.pwdguard.native" /ve /t REG_SZ /d "C:\Users\YourUsername\Desktop\PWDGuard\PasswordManager-Extension\native-messaging-host\com.pwdguard.native.json" /f
   ```

### macOS

1. Open this file in a text editor:
   ```
   ~/Desktop/PWDGuard/PasswordManager-Extension/native-messaging-host/com.pwdguard.native.json
   ```

2. Update it:
   ```json
   {
     "name": "com.pwdguard.native",
     "description": "PwdGuard Native Messaging Host",
     "path": "/Users/YourUsername/Desktop/PWDGuard/native-host/native-host.js",
     "type": "stdio",
     "allowed_origins": [
       "chrome-extension://YOUR_ACTUAL_EXTENSION_ID_HERE/"
     ]
   }
   ```

3. Make the script executable:
   ```bash
   chmod +x ~/Desktop/PWDGuard/native-host/native-host.js
   ```

4. Add shebang to native-host.js (first line):
   ```javascript
   #!/usr/bin/env node
   ```

5. Copy manifest to Chrome's directory:
   ```bash
   mkdir -p ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/
   cp ~/Desktop/PWDGuard/PasswordManager-Extension/native-messaging-host/com.pwdguard.native.json ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/
   ```

### Linux

1. Open this file in a text editor:
   ```
   ~/Desktop/PWDGuard/PasswordManager-Extension/native-messaging-host/com.pwdguard.native.json
   ```

2. Update it:
   ```json
   {
     "name": "com.pwdguard.native",
     "description": "PwdGuard Native Messaging Host",
     "path": "/home/yourusername/Desktop/PWDGuard/native-host/native-host.js",
     "type": "stdio",
     "allowed_origins": [
       "chrome-extension://YOUR_ACTUAL_EXTENSION_ID_HERE/"
     ]
   }
   ```

3. Make the script executable:
   ```bash
   chmod +x ~/Desktop/PWDGuard/native-host/native-host.js
   ```

4. Add shebang to native-host.js (first line):
   ```javascript
   #!/usr/bin/env node
   ```

5. Copy manifest to Chrome's directory:
   ```bash
   mkdir -p ~/.config/google-chrome/NativeMessagingHosts/
   cp ~/Desktop/PWDGuard/PasswordManager-Extension/native-messaging-host/com.pwdguard.native.json ~/.config/google-chrome/NativeMessagingHosts/
   ```

---

## Step 3: Verify Node.js Path

Make sure Node.js is installed and accessible:

```bash
# Check Node.js installation
node --version

# Find Node.js path
# Windows:
where node

# Mac/Linux:
which node
```

If Node.js is not found, install it from https://nodejs.org/

---

## Step 4: Test the Connection

1. **Restart Chrome completely**
   - Close all Chrome windows
   - Check Task Manager (Windows) or Activity Monitor (Mac) to ensure Chrome is fully closed
   - Reopen Chrome

2. **Check Extension**
   - Click the PwdGuard extension icon
   - The status should now show "Connected" in green

3. **If still disconnected:**
   - Open Chrome DevTools on the extension popup (right-click → Inspect)
   - Check the Console for error messages
   - Look for specific error details

---

## Step 5: Verify Registry/File System

### Windows - Check Registry

1. Press `Win + R`, type `regedit`, press Enter
2. Navigate to:
   ```
   HKEY_CURRENT_USER\Software\Google\Chrome\NativeMessagingHosts\com.pwdguard.native
   ```
3. The default value should point to your manifest JSON file
4. If missing, add it manually:
   - Right-click → New → String Value
   - Name: (Default)
   - Value: Full path to com.pwdguard.native.json

### Mac/Linux - Check File Location

```bash
# Chrome
ls ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/
# or
ls ~/.config/google-chrome/NativeMessagingHosts/

# Should see: com.pwdguard.native.json
```

---

## Common Issues & Solutions

### Issue 1: "Specified native messaging host not found"

**Cause:** Chrome can't find the manifest file

**Solution:**
- Verify the manifest is in the correct location
- Check that Extension ID matches exactly
- Restart Chrome completely

### Issue 2: "Native host has exited"

**Cause:** Node.js path is incorrect or script has errors

**Solution:**
- Test the native host manually:
  ```bash
  node C:\Users\YourUsername\Desktop\PWDGuard\native-host\native-host.js
  ```
- Check for syntax errors
- Verify Node.js is in PATH

### Issue 3: "Access denied"

**Cause:** Permission issues

**Solution:**
- Run Command Prompt as Administrator (Windows)
- Check file permissions (Mac/Linux):
  ```bash
  chmod 755 ~/Desktop/PWDGuard/native-host/native-host.js
  ```

### Issue 4: Extension ID Changed

**Cause:** Reloading unpacked extension generates new ID

**Solution:**
- Get the new Extension ID
- Update the manifest JSON file
- Re-register with Chrome
- Restart Chrome

---

## Quick Test Script

Create a test file to verify the native host works:

**test-native-host.js:**
```javascript
const fs = require('fs');
const path = require('path');

// Test message
const testMessage = {
  type: 'ping',
  timestamp: Date.now()
};

// Write message length (4 bytes, little-endian)
const messageStr = JSON.stringify(testMessage);
const messageLength = Buffer.alloc(4);
messageLength.writeUInt32LE(messageStr.length, 0);

// Write to stdout
process.stdout.write(messageLength);
process.stdout.write(messageStr);

console.error('Test message sent successfully');
```

Run it:
```bash
node test-native-host.js
```

---

## Alternative: Use Absolute Paths

If relative paths aren't working, use absolute paths everywhere:

**Windows Example:**
```json
{
  "name": "com.pwdguard.native",
  "description": "PwdGuard Native Messaging Host",
  "path": "C:\\Users\\Manglam\\Desktop\\PWDGuard\\native-host\\native-host-wrapper.bat",
  "type": "stdio",
  "allowed_origins": [
    "chrome-extension://abcdefghijklmnopqrstuvwxyz123456/"
  ]
}
```

**native-host-wrapper.bat:**
```batch
@echo off
"C:\Program Files\nodejs\node.exe" "C:\Users\Manglam\Desktop\PWDGuard\native-host\native-host.js"
```

---

## Debugging Tips

1. **Check Chrome's Native Messaging Logs:**
   - Chrome doesn't provide detailed logs, but you can check:
   - `chrome://extensions/` → Extension details → Inspect views: background page
   - Look at Console tab for errors

2. **Test Native Host Directly:**
   ```bash
   node native-host.js
   # Type a test message (it won't work interactively, but you'll see if the script runs)
   ```

3. **Check File Permissions:**
   - Ensure all files are readable
   - Ensure scripts are executable
   - Check antivirus isn't blocking

4. **Verify JSON Syntax:**
   - Use a JSON validator on the manifest file
   - Ensure no trailing commas
   - Ensure proper escaping of backslashes (Windows)

---

## Success Checklist

- [ ] Extension ID copied correctly
- [ ] Manifest JSON updated with Extension ID
- [ ] Path to native host is correct
- [ ] Node.js is installed and in PATH
- [ ] Manifest registered with Chrome (registry/file system)
- [ ] Chrome restarted completely
- [ ] Extension shows "Connected" status

---

## Still Having Issues?

If you've followed all steps and it's still not working:

1. **Collect Information:**
   - Your OS and version
   - Chrome version
   - Node.js version
   - Exact error message from Console
   - Extension ID

2. **Check Logs:**
   - Extension console (Inspect background page)
   - Native host logs (if any)
   - Chrome's error messages

3. **Try Simplified Test:**
   - Create a minimal native host that just echoes messages
   - Test if Chrome can connect to it
   - If that works, the issue is in the native-host.js script

---

## Contact Support

If you need help:
- Email: support@pwdguard.com
- Include: OS, Chrome version, error messages, steps tried

---

**Good luck!** 🍀

Once connected, you should see a green "Connected" status in the extension popup.
