# PwdGuard Chrome Extension - Quick Start Guide

Get up and running with PwdGuard in 5 minutes! ⚡

---

## Prerequisites ✅

- [ ] Google Chrome installed
- [ ] Node.js installed ([Download](https://nodejs.org/))
- [ ] PwdGuard desktop app installed

---

## Installation (3 Steps)

### Step 1: Generate Icons (1 minute)

1. Open `create-icons.html` in your browser
2. Click **"Download All Icons"**
3. Save all files to the `icons/` folder

### Step 2: Load Extension (1 minute)

1. Open Chrome → `chrome://extensions/`
2. Enable **"Developer mode"** (top right)
3. Click **"Load unpacked"**
4. Select the `PasswordManager-Extension` folder
5. **Copy the Extension ID** (long string under the extension name)

### Step 3: Install Native Host (2 minutes)

**Windows:**
```cmd
cd C:\Users\YourUsername\Desktop\PWDGuard\PasswordManager-Extension
install.bat
```

**Mac/Linux:**
```bash
cd /path/to/PWDGuard/PasswordManager-Extension
chmod +x install.sh
./install.sh
```

When prompted, **paste your Extension ID** and press Enter.

---

## Verify Installation ✓

1. Click the PwdGuard icon in Chrome toolbar
2. Connection status should show **"Connected"** in green
3. If not, click **Settings** → **Test Connection**

---

## First Use 🎯

### Save Your First Password

1. Visit any login page (e.g., `https://github.com/login`)
2. Enter username and password
3. Click "Sign in"
4. PwdGuard prompt appears
5. Click **"Save Password"**
6. ✅ Done! Password saved securely

### Auto-fill Your Password

1. Return to the same login page
2. Banner appears: "PwdGuard found 1 saved password"
3. Click **"Auto-fill"**
4. ✅ Credentials filled automatically!

---

## Keyboard Shortcuts ⌨️

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Auto-fill | `Ctrl + Shift + L` | `Cmd + Shift + L` |
| Save | `Ctrl + Shift + S` | `Cmd + Shift + S` |

---

## Troubleshooting 🔧

### "Disconnected" Status?

1. Make sure PwdGuard desktop app is running
2. Restart Chrome completely
3. Run the installation script again
4. Check that Extension ID is correct in `native-messaging-host/com.pwdguard.native.json`

### Passwords Not Saving?

1. Make sure you're on an HTTPS website
2. Check that extension is enabled (click icon → toggle should be ON)
3. Try right-click → "Save Password with PwdGuard"

### Auto-fill Not Working?

1. Make sure auto-fill is enabled (click icon → toggle should be ON)
2. Verify passwords are saved (click icon → should show count > 0)
3. Try keyboard shortcut: `Ctrl+Shift+L`

---

## Next Steps 📚

- **Full Documentation**: See `README.md`
- **Detailed Installation**: See `INSTALLATION_GUIDE.md`
- **Settings**: Click extension icon → Settings
- **Desktop App**: Open PwdGuard → Browser Passwords tab

---

## Quick Tips 💡

- **Never Save a Site**: Right-click → "Never Save for This Site"
- **Multiple Accounts**: Extension supports multiple accounts per website
- **Generate Password**: Click extension icon → Generate button
- **View Saved Passwords**: Open desktop app → Browser Passwords tab
- **Change Theme**: Settings → Appearance → Select theme

---

## Support 💬

Need help? 
- Check `INSTALLATION_GUIDE.md` for detailed troubleshooting
- Email: support@pwdguard.com
- GitHub: [Report an issue]

---

**That's it! You're all set! 🎉**

Start browsing and let PwdGuard automatically save and fill your passwords securely.
