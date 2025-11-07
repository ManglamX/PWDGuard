# Quick Fix: "Native messaging host not found" Error

## 🚨 The Problem

You're seeing this error because Chrome can't find the native messaging host configuration. This is expected on first install!

## ✅ Quick Solution (5 Minutes)

### Option 1: Use the Setup Helper (Easiest)

1. **Right-click** on `setup-helper.bat`
2. Select **"Run as administrator"**
3. Follow the prompts:
   - It will check Node.js ✓
   - Ask for your Extension ID
   - Configure everything automatically
   - Register with Chrome
4. **Close Chrome completely** (check Task Manager!)
5. **Reopen Chrome**
6. Click the extension icon → Should show "Connected" ✅

### Option 2: Manual Configuration (If script fails)

#### Step 1: Get Your Extension ID
1. Go to `chrome://extensions/`
2. Find "PwdGuard Password Manager"
3. Copy the Extension ID (looks like: `abcdefghijklmnopqrstuvwxyz123456`)

#### Step 2: Update the Manifest File
1. Open: `native-messaging-host\com.pwdguard.native.json`
2. Replace `EXTENSION_ID_PLACEHOLDER` with your actual ID
3. Replace `PATH_TO_NATIVE_HOST_EXECUTABLE` with:
   ```
   C:\Users\Manglam\Desktop\PWDGuard\native-host\native-host-wrapper.bat
   ```
   (Use double backslashes: `\\`)

Example:
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

#### Step 3: Register with Chrome
Open Command Prompt **as Administrator** and run:
```cmd
reg add "HKCU\Software\Google\Chrome\NativeMessagingHosts\com.pwdguard.native" /ve /t REG_SZ /d "C:\Users\Manglam\Desktop\PWDGuard\PasswordManager-Extension\native-messaging-host\com.pwdguard.native.json" /f
```

#### Step 4: Restart Chrome
- Close ALL Chrome windows
- Check Task Manager → End any Chrome processes
- Reopen Chrome

---

## 🔍 Diagnostic Tool

Run `diagnose.bat` to check what's wrong:
1. Double-click `diagnose.bat`
2. It will check:
   - Node.js installation ✓
   - Extension loaded ✓
   - Extension ID configured ✓
   - Native host files ✓
   - Registry entry ✓
   - File paths ✓
3. Follow the recommendations

---

## 📋 Checklist

Before asking for help, verify:

- [ ] Node.js is installed (`node --version` in cmd)
- [ ] Extension is loaded in Chrome (`chrome://extensions/`)
- [ ] Extension ID is copied correctly (no spaces!)
- [ ] Manifest file updated with Extension ID
- [ ] Manifest file updated with correct path
- [ ] Registry entry created
- [ ] Chrome restarted COMPLETELY
- [ ] No antivirus blocking the native host

---

## 🐛 Common Mistakes

### 1. Wrong Extension ID
**Problem:** Extension ID has spaces or is incomplete
**Fix:** Copy the ENTIRE ID from chrome://extensions/

### 2. Wrong Path Format
**Problem:** Using single backslashes in JSON
**Fix:** Use double backslashes: `C:\\Users\\...`

### 3. Chrome Not Restarted
**Problem:** Chrome still running in background
**Fix:** 
- Close all Chrome windows
- Open Task Manager (Ctrl+Shift+Esc)
- End all "Google Chrome" processes
- Reopen Chrome

### 4. Not Running as Administrator
**Problem:** Registry update failed
**Fix:** Right-click script → "Run as administrator"

### 5. Extension ID Changed
**Problem:** Reloading unpacked extension generates new ID
**Fix:** Get the new ID and update manifest again

---

## 🎯 Expected Result

After setup, you should see:

**Extension Popup:**
```
┌─────────────────────────┐
│ PwdGuard                │
├─────────────────────────┤
│ Status: Connected ✓     │  ← Should be GREEN
│                         │
│ Current Site:           │
│ example.com             │
│                         │
│ Saved Passwords: 0      │
└─────────────────────────┘
```

---

## 🆘 Still Not Working?

### Check Console for Errors
1. Click extension icon
2. Right-click on popup → Inspect
3. Go to Console tab
4. Look for error messages
5. Share the error message for help

### Test Native Host Manually
```cmd
cd C:\Users\Manglam\Desktop\PWDGuard\native-host
node native-host.js
```
- If it shows errors → Fix the script
- If it hangs → That's normal! (waiting for input)
- Press Ctrl+C to exit

### Verify Registry
1. Press `Win + R`
2. Type `regedit`
3. Navigate to: `HKEY_CURRENT_USER\Software\Google\Chrome\NativeMessagingHosts\com.pwdguard.native`
4. Check the value points to your manifest file

---

## 📞 Get Help

If nothing works:

1. Run `diagnose.bat` and save the output
2. Check the Console errors (see above)
3. Note your:
   - Windows version
   - Chrome version
   - Node.js version
   - Extension ID
4. See `MANUAL_SETUP.md` for detailed troubleshooting

---

## 💡 Pro Tips

- **Keep Extension ID handy** - You'll need it if you reload the extension
- **Use absolute paths** - More reliable than relative paths
- **Check antivirus** - Some antivirus software blocks native messaging
- **Try in Incognito** - Rule out extension conflicts (allow in incognito first)

---

## ✅ Success!

Once you see "Connected" status:
1. Visit any login page
2. Enter credentials
3. Submit the form
4. Extension will prompt to save
5. Return to the site → Auto-fill available!

**Enjoy secure password management!** 🔐
