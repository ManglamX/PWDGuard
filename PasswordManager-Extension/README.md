# PwdGuard Password Manager - Chrome Extension

A secure Chrome extension that automatically captures and saves login credentials to the PwdGuard desktop password manager application and auto-fills them on subsequent visits.

## Features

### 🔐 Automatic Credential Capture
- **Smart Form Detection**: Automatically identifies username/email and password fields
- **Real-time Monitoring**: Monitors form submissions on both traditional websites and SPAs
- **Login Type Recognition**: Distinguishes between login, registration, and password change forms
- **Save Prompts**: Non-intrusive notification popup with options to save, never save, or dismiss

### 🔄 Auto-fill Functionality
- **Automatic Detection**: Checks for saved credentials on page load
- **Multiple Accounts**: Supports multiple accounts per website with easy selection
- **Keyboard Shortcuts**: 
  - `Ctrl/Cmd + Shift + L` - Auto-fill credentials
  - `Ctrl/Cmd + Shift + S` - Save current credentials
- **Discreet Banner**: Shows a banner when saved passwords are available

### 🔒 Security Features
- **HTTPS Only**: Only captures credentials on secure HTTPS websites (with optional localhost override)
- **No Browser Storage**: Passwords are never stored in browser storage
- **Encrypted Storage**: All passwords are encrypted before storage in the desktop app
- **Memory Clearing**: Sensitive data is cleared from memory after transmission
- **Domain Validation**: Prevents phishing attempts with domain verification

### 🔗 Desktop App Integration
- **Native Messaging**: Secure communication with desktop app via Chrome Native Messaging protocol
- **Connection Status**: Real-time connection status indicator
- **Error Handling**: Graceful handling of connection errors with retry logic

### ⚙️ Customization
- **Enable/Disable**: Toggle extension functionality on/off
- **Never-Save List**: Manage websites where passwords should never be saved
- **Auto-fill Control**: Enable/disable auto-fill feature
- **Theme Selection**: Light, dark, or auto theme options
- **Notification Settings**: Control notification preferences

### 🎨 User Interface
- **Extension Popup**: Quick access to status, saved passwords count, and actions
- **Settings Page**: Comprehensive settings management
- **Context Menu**: Right-click integration for manual save and auto-fill
- **Visual Feedback**: Color-coded icon states and success notifications

## Installation

### Prerequisites
- Google Chrome or Chromium-based browser
- Node.js (for Native Messaging host)
- PwdGuard desktop application

### Step 1: Install the Extension

#### Option A: Load Unpacked (Development)
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** in the top right corner
3. Click **Load unpacked**
4. Select the `PasswordManager-Extension` folder
5. Note the **Extension ID** displayed on the extension card

#### Option B: Chrome Web Store (When Published)
1. Visit the Chrome Web Store
2. Search for "PwdGuard Password Manager"
3. Click **Add to Chrome**

### Step 2: Install Native Messaging Host

#### Windows
1. Open Command Prompt or PowerShell
2. Navigate to the extension directory:
   ```cmd
   cd C:\Users\YourUsername\Desktop\PWDGuard\PasswordManager-Extension
   ```
3. Run the installation script:
   ```cmd
   install.bat
   ```
4. Enter your Extension ID when prompted
5. Follow the on-screen instructions

#### macOS/Linux
1. Open Terminal
2. Navigate to the extension directory:
   ```bash
   cd /path/to/PWDGuard/PasswordManager-Extension
   ```
3. Make the script executable:
   ```bash
   chmod +x install.sh
   ```
4. Run the installation script:
   ```bash
   ./install.sh
   ```
5. Enter your Extension ID when prompted
6. Follow the on-screen instructions

### Step 3: Configure Extension ID (If Skipped)
If you skipped entering the Extension ID during installation:

1. Open the file: `native-messaging-host/com.pwdguard.native.json`
2. Replace `EXTENSION_ID_PLACEHOLDER` with your actual Extension ID
3. Save the file
4. Re-run the installation script

### Step 4: Test Connection
1. Click the PwdGuard extension icon in Chrome
2. Check the connection status (should show "Connected")
3. If disconnected, click **Settings** → **Test Connection**
4. Ensure the PwdGuard desktop application is running

## Usage

### Saving Passwords

1. **Automatic Capture**:
   - Navigate to any login page
   - Enter your username and password
   - Submit the form
   - A save prompt will appear asking if you want to save the password
   - Click **Save Password** to store the credentials

2. **Manual Save**:
   - Right-click on a password field
   - Select **Save Password with PwdGuard**
   - Or use keyboard shortcut: `Ctrl/Cmd + Shift + S`

### Auto-filling Passwords

1. **Automatic**:
   - Visit a website with saved credentials
   - A banner will appear at the top of the page
   - Click **Auto-fill** to fill in your credentials

2. **Manual**:
   - Right-click on a login field
   - Select **Auto-fill Password**
   - Or use keyboard shortcut: `Ctrl/Cmd + Shift + L`

3. **Multiple Accounts**:
   - If multiple accounts are saved for a site
   - A selection dialog will appear
   - Choose the account you want to use

### Managing Settings

1. Click the extension icon
2. Click **Settings** button
3. Configure your preferences:
   - Enable/disable extension
   - Toggle auto-fill
   - Manage never-save list
   - Customize keyboard shortcuts
   - Select theme

### Never Save for Specific Sites

**Option 1**: When prompted to save
- Click **Never for this site**

**Option 2**: From context menu
- Right-click on the page
- Select **Never Save for This Site**

**Option 3**: From settings
- Go to Settings → Never Save List
- Add the domain manually

## Keyboard Shortcuts

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| Auto-fill credentials | `Ctrl + Shift + L` | `Cmd + Shift + L` |
| Save password | `Ctrl + Shift + S` | `Cmd + Shift + S` |

To customize shortcuts:
1. Go to `chrome://extensions/shortcuts`
2. Find PwdGuard Password Manager
3. Click the edit icon to change shortcuts

## Troubleshooting

### Extension Not Connecting to Desktop App

1. **Check Desktop App**: Ensure PwdGuard desktop application is running
2. **Verify Installation**: Re-run the installation script
3. **Check Extension ID**: Verify the Extension ID in the native messaging manifest
4. **Restart Browser**: Close and reopen Chrome completely
5. **Check Logs**: Look for errors in:
   - Chrome: `chrome://extensions/` → Extension details → Inspect views: background page
   - Native Host: `%APPDATA%\PwdGuard\extension.log` (Windows) or `~/.config/PwdGuard/extension.log` (Linux/Mac)

### Passwords Not Being Captured

1. **Check HTTPS**: Ensure you're on an HTTPS website (or localhost)
2. **Enable Extension**: Verify the extension is enabled in settings
3. **Check Never-Save List**: Make sure the site isn't in the never-save list
4. **Form Detection**: Some custom forms may not be detected automatically - use manual save

### Auto-fill Not Working

1. **Enable Auto-fill**: Check that auto-fill is enabled in settings
2. **Verify Credentials**: Ensure credentials are saved for the current domain
3. **Form Compatibility**: Some sites use custom form implementations that may not be compatible
4. **Manual Fill**: Use the manual auto-fill option from context menu or keyboard shortcut

### Connection Status Shows "Disconnected"

1. **Native Host**: Verify the native messaging host is properly installed
2. **Registry/Config**: Check that the native messaging manifest is registered:
   - Windows: `HKEY_CURRENT_USER\Software\Google\Chrome\NativeMessagingHosts\com.pwdguard.native`
   - macOS: `~/Library/Application Support/Google/Chrome/NativeMessagingHosts/`
   - Linux: `~/.config/google-chrome/NativeMessagingHosts/`
3. **Permissions**: Ensure the native host script has execute permissions
4. **Node.js**: Verify Node.js is installed and accessible from PATH

## Security & Privacy

### Data Storage
- **No Cloud Storage**: All data is stored locally on your device
- **Encrypted**: Passwords are encrypted using AES-256-CBC encryption
- **Desktop Only**: Credentials are stored only in the desktop application
- **No Telemetry**: No usage data or analytics are collected

### Communication
- **Native Messaging**: Uses Chrome's secure Native Messaging protocol
- **Local Only**: All communication is local between extension and desktop app
- **No External Requests**: Extension doesn't make any external network requests

### Best Practices
- Keep the desktop application running for extension functionality
- Regularly update both extension and desktop app
- Use strong master password for desktop app
- Review saved credentials periodically
- Use never-save list for sensitive sites if needed

## Development

### Project Structure
```
PasswordManager-Extension/
├── manifest.json              # Extension manifest
├── background.js              # Service worker (Native Messaging)
├── content.js                 # Content script (Form detection)
├── content.css                # Content script styles
├── popup.html                 # Extension popup
├── popup.js                   # Popup logic
├── popup.css                  # Popup styles
├── settings.html              # Settings page
├── settings.js                # Settings logic
├── settings.css               # Settings styles
├── icons/                     # Extension icons
├── native-messaging-host/     # Native messaging manifest
├── install.bat                # Windows installer
├── install.sh                 # Linux/Mac installer
└── README.md                  # This file

native-host/
└── native-host.js             # Node.js Native Messaging host
```

### Building from Source
1. Clone the repository
2. No build step required - extension is pure JavaScript
3. Load unpacked in Chrome for development
4. Make changes and reload extension to test

### Contributing
Contributions are welcome! Please follow these guidelines:
- Follow existing code style
- Test thoroughly before submitting
- Update documentation as needed
- Submit pull requests to the main repository

## Version History

### Version 1.0.0 (Current)
- Initial release
- Automatic credential capture
- Auto-fill functionality
- Native messaging integration
- Settings management
- Keyboard shortcuts
- Context menu integration
- Multiple account support
- Theme customization

## Support

For issues, questions, or feature requests:
- GitHub Issues: [Link to repository]
- Email: support@pwdguard.com
- Documentation: [Link to docs]

## License

Copyright © 2024 PwdGuard. All rights reserved.

## Acknowledgments

- Built with Chrome Extension Manifest V3
- Uses Chrome Native Messaging API
- Integrates with PwdGuard desktop application
