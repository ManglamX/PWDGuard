# PwdGuard Chrome Extension - Complete Installation Guide

This guide will walk you through the complete installation process for the PwdGuard Chrome Extension and its integration with the desktop application.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Step-by-Step Installation](#step-by-step-installation)
3. [Verification](#verification)
4. [Troubleshooting](#troubleshooting)
5. [Uninstallation](#uninstallation)

---

## Prerequisites

Before you begin, ensure you have:

- ✅ **Google Chrome** or **Chromium-based browser** (Edge, Brave, Opera, etc.)
- ✅ **Node.js** (version 14 or higher) - [Download here](https://nodejs.org/)
- ✅ **PwdGuard Desktop Application** installed and running
- ✅ **Administrator/Root access** (for Windows registry or system directories)

### Check Node.js Installation

Open a terminal/command prompt and run:

```bash
node --version
```

You should see a version number like `v18.x.x` or higher.

---

## Step-by-Step Installation

### Part 1: Install the Chrome Extension

#### Option A: Load Unpacked Extension (Development Mode)

1. **Open Chrome Extensions Page**
   - Open Google Chrome
   - Navigate to `chrome://extensions/`
   - Or click the three-dot menu → More Tools → Extensions

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner
   - This will reveal additional options

3. **Load the Extension**
   - Click the "Load unpacked" button
   - Navigate to the `PasswordManager-Extension` folder
   - Select the folder and click "Select Folder"

4. **Note Your Extension ID**
   - After loading, you'll see the extension card
   - Copy the **Extension ID** (a long string like `abcdefghijklmnopqrstuvwxyz123456`)
   - Save this ID - you'll need it in the next step

#### Option B: Install from Chrome Web Store (When Published)

1. Visit the Chrome Web Store
2. Search for "PwdGuard Password Manager"
3. Click "Add to Chrome"
4. Click "Add extension" in the confirmation dialog

---

### Part 2: Install Native Messaging Host

The Native Messaging Host allows the Chrome extension to communicate securely with your desktop application.

#### Windows Installation

1. **Open Command Prompt as Administrator**
   - Press `Win + X`
   - Select "Command Prompt (Admin)" or "PowerShell (Admin)"

2. **Navigate to Extension Directory**
   ```cmd
   cd C:\Users\YourUsername\Desktop\PWDGuard\PasswordManager-Extension
   ```
   Replace `YourUsername` with your actual Windows username.

3. **Run Installation Script**
   ```cmd
   install.bat
   ```

4. **Enter Extension ID**
   - When prompted, paste the Extension ID you copied earlier
   - Press Enter

5. **Wait for Completion**
   - The script will:
     - Check Node.js installation
     - Configure the native messaging host
     - Register it with Chrome
     - Display success message

6. **Verify Registry Entry**
   - Press `Win + R`
   - Type `regedit` and press Enter
   - Navigate to: `HKEY_CURRENT_USER\Software\Google\Chrome\NativeMessagingHosts\com.pwdguard.native`
   - You should see an entry with the path to your manifest file

#### macOS Installation

1. **Open Terminal**
   - Press `Cmd + Space`
   - Type "Terminal" and press Enter

2. **Navigate to Extension Directory**
   ```bash
   cd /path/to/PWDGuard/PasswordManager-Extension
   ```

3. **Make Script Executable**
   ```bash
   chmod +x install.sh
   ```

4. **Run Installation Script**
   ```bash
   ./install.sh
   ```

5. **Enter Extension ID**
   - When prompted, paste the Extension ID
   - Press Enter

6. **Verify Installation**
   ```bash
   ls ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/
   ```
   You should see `com.pwdguard.native.json`

#### Linux Installation

1. **Open Terminal**
   - Press `Ctrl + Alt + T`

2. **Navigate to Extension Directory**
   ```bash
   cd /path/to/PWDGuard/PasswordManager-Extension
   ```

3. **Make Script Executable**
   ```bash
   chmod +x install.sh
   ```

4. **Run Installation Script**
   ```bash
   ./install.sh
   ```

5. **Enter Extension ID**
   - When prompted, paste the Extension ID
   - Press Enter

6. **Verify Installation**
   ```bash
   ls ~/.config/google-chrome/NativeMessagingHosts/
   ```
   You should see `com.pwdguard.native.json`

---

### Part 3: Generate Extension Icons

The extension needs icons to display properly in Chrome.

1. **Open Icon Generator**
   - Navigate to the extension folder
   - Open `create-icons.html` in your web browser
   - Double-click the file or right-click → Open with → Chrome

2. **Download Icons**
   - Click "Download All Icons" button
   - Save all icons to the `icons/` folder in the extension directory
   - Alternatively, click "Download All States" to get gray and red icons too

3. **Verify Icons**
   - Check that the `icons/` folder contains:
     - `icon16.png`
     - `icon32.png`
     - `icon48.png`
     - `icon128.png`

4. **Reload Extension**
   - Go back to `chrome://extensions/`
   - Click the refresh icon on the PwdGuard extension card

---

## Verification

### Test the Installation

1. **Check Extension Icon**
   - Look for the PwdGuard icon in your Chrome toolbar
   - It should be visible and colored (not grayed out)

2. **Open Extension Popup**
   - Click the PwdGuard icon
   - Check the connection status
   - It should show "Connected" in green

3. **Test Connection**
   - Click the extension icon
   - Click "Settings"
   - Scroll to "Desktop App Connection"
   - Click "Test Connection"
   - You should see "Connection successful!"

4. **Test Password Capture**
   - Visit any login page (e.g., https://example.com/login)
   - Enter a test username and password
   - Submit the form
   - You should see a save prompt from PwdGuard

5. **Test Auto-fill**
   - Return to the same login page
   - You should see a banner offering to auto-fill
   - Click "Auto-fill" to verify it works

### Check Desktop App Integration

1. **Open PwdGuard Desktop App**
   - Launch the desktop application
   - Look for an "Extension Credentials" or similar tab
   - You should see any passwords saved via the extension

2. **Check Notifications**
   - When you save a password via the extension
   - The desktop app should show a notification

---

## Troubleshooting

### Extension Shows "Disconnected"

**Possible Causes:**
- Native messaging host not installed correctly
- Extension ID mismatch
- Desktop app not running

**Solutions:**

1. **Verify Extension ID**
   ```bash
   # Open the manifest file
   # Windows: notepad native-messaging-host\com.pwdguard.native.json
   # Mac/Linux: nano native-messaging-host/com.pwdguard.native.json
   ```
   - Check that the Extension ID matches your actual extension ID
   - Update if necessary and re-run the installation script

2. **Check Native Host Path**
   - Open the manifest file
   - Verify the "path" points to the correct location
   - On Windows, it should point to `native-host.bat`
   - On Mac/Linux, it should point to `native-host.js`

3. **Restart Everything**
   - Close Chrome completely (check Task Manager/Activity Monitor)
   - Restart the PwdGuard desktop app
   - Open Chrome again

4. **Check Logs**
   - **Windows**: `%APPDATA%\PwdGuard\extension.log`
   - **Mac**: `~/Library/Application Support/PwdGuard/extension.log`
   - **Linux**: `~/.config/PwdGuard/extension.log`

### Passwords Not Being Captured

1. **Check HTTPS**
   - Ensure you're on an HTTPS website
   - Or enable "Allow Localhost" in settings for local development

2. **Check Extension Status**
   - Click the extension icon
   - Verify "Extension Enabled" is turned ON

3. **Check Never-Save List**
   - Go to Settings
   - Check if the current site is in the never-save list
   - Remove it if necessary

4. **Try Manual Save**
   - Right-click on a password field
   - Select "Save Password with PwdGuard"

### Auto-fill Not Working

1. **Enable Auto-fill**
   - Click the extension icon
   - Ensure "Auto-fill" toggle is ON

2. **Check Saved Credentials**
   - Click the extension icon
   - Verify credentials are saved for the current site
   - The count should be greater than 0

3. **Try Manual Auto-fill**
   - Press `Ctrl+Shift+L` (or `Cmd+Shift+L` on Mac)
   - Or right-click → "Auto-fill Password"

### Permission Errors on Windows

1. **Run as Administrator**
   - Right-click `install.bat`
   - Select "Run as administrator"

2. **Check Registry Permissions**
   - Open Registry Editor
   - Navigate to the native messaging key
   - Ensure you have write permissions

### Node.js Not Found

1. **Install Node.js**
   - Download from https://nodejs.org/
   - Install the LTS version
   - Restart your terminal/command prompt

2. **Check PATH**
   - Ensure Node.js is in your system PATH
   - Restart your computer if necessary

---

## Uninstallation

### Remove Chrome Extension

1. Go to `chrome://extensions/`
2. Find PwdGuard Password Manager
3. Click "Remove"
4. Confirm removal

### Remove Native Messaging Host

#### Windows

1. **Delete Registry Entry**
   ```cmd
   reg delete "HKCU\Software\Google\Chrome\NativeMessagingHosts\com.pwdguard.native" /f
   ```

2. **Delete Files**
   - Delete the `native-host` folder
   - Delete the `PasswordManager-Extension` folder

#### macOS

1. **Remove Manifest**
   ```bash
   rm ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/com.pwdguard.native.json
   rm ~/Library/Application\ Support/Chromium/NativeMessagingHosts/com.pwdguard.native.json
   ```

2. **Delete Files**
   ```bash
   rm -rf /path/to/native-host
   rm -rf /path/to/PasswordManager-Extension
   ```

#### Linux

1. **Remove Manifest**
   ```bash
   rm ~/.config/google-chrome/NativeMessagingHosts/com.pwdguard.native.json
   rm ~/.config/chromium/NativeMessagingHosts/com.pwdguard.native.json
   ```

2. **Delete Files**
   ```bash
   rm -rf /path/to/native-host
   rm -rf /path/to/PasswordManager-Extension
   ```

### Remove Stored Credentials (Optional)

**Warning:** This will delete all passwords saved via the extension!

- **Windows**: Delete `%APPDATA%\PwdGuard\credentials\`
- **Mac**: Delete `~/Library/Application Support/PwdGuard/credentials/`
- **Linux**: Delete `~/.config/PwdGuard/credentials/`

---

## Additional Resources

- **Extension Documentation**: See `README.md`
- **Desktop App Documentation**: See main PwdGuard documentation
- **Support**: Contact support@pwdguard.com
- **Report Issues**: [GitHub Issues](https://github.com/pwdguard/extension/issues)

---

## Security Notes

- All passwords are encrypted using AES-256-CBC
- Encryption keys are stored securely on your device
- No data is sent to external servers
- Communication between extension and desktop app is local only
- Always keep your desktop app and extension updated

---

**Congratulations!** 🎉

You've successfully installed the PwdGuard Chrome Extension. You can now:
- Automatically save passwords as you browse
- Auto-fill credentials with a single click
- Manage all your passwords from the desktop app
- Enjoy secure, encrypted password storage

Happy browsing! 🔐
