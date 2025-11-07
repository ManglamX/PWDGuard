#!/bin/bash

# PwdGuard Extension Installation Script for Linux/Mac

echo "========================================"
echo "PwdGuard Extension Installer"
echo "========================================"
echo ""

# Get the extension directory
EXTENSION_DIR="$(cd "$(dirname "$0")" && pwd)"
NATIVE_HOST_DIR="$EXTENSION_DIR/../native-host"
NATIVE_HOST_SCRIPT="$NATIVE_HOST_DIR/native-host.js"

# Check if Node.js is installed
echo "[1/5] Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi
echo "Node.js is installed: $(node --version)"
echo ""

# Make native host script executable
echo "[2/5] Setting up native messaging host..."
if [ ! -f "$NATIVE_HOST_SCRIPT" ]; then
    echo "ERROR: Native host script not found at $NATIVE_HOST_SCRIPT"
    exit 1
fi
chmod +x "$NATIVE_HOST_SCRIPT"
echo "Native host script configured."
echo ""

# Get extension ID
echo "[3/5] Configuring native messaging manifest..."
read -p "Enter your Chrome Extension ID (or press Enter to skip): " EXTENSION_ID

if [ -z "$EXTENSION_ID" ]; then
    echo "Skipping extension ID configuration."
    echo "You'll need to manually update the manifest later."
else
    # Update the native messaging manifest
    sed -i.bak "s/EXTENSION_ID_PLACEHOLDER/$EXTENSION_ID/g" "$EXTENSION_DIR/native-messaging-host/com.pwdguard.native.json"
    echo "Extension ID configured."
fi
echo ""

# Update the path in the manifest
echo "[4/5] Updating native host path..."
NODE_PATH=$(which node)
sed -i.bak "s|PATH_TO_NATIVE_HOST_EXECUTABLE|$NATIVE_HOST_SCRIPT|g" "$EXTENSION_DIR/native-messaging-host/com.pwdguard.native.json"
echo "Native host path configured."
echo ""

# Register the native messaging host
echo "[5/5] Registering native messaging host..."
MANIFEST_PATH="$EXTENSION_DIR/native-messaging-host/com.pwdguard.native.json"

# Determine OS and set appropriate directory
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    NATIVE_MESSAGING_DIR="$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts"
    mkdir -p "$NATIVE_MESSAGING_DIR"
    cp "$MANIFEST_PATH" "$NATIVE_MESSAGING_DIR/com.pwdguard.native.json"
    echo "Registered for Chrome on macOS"
    
    # Also register for Chromium if it exists
    CHROMIUM_DIR="$HOME/Library/Application Support/Chromium/NativeMessagingHosts"
    if [ -d "$(dirname "$CHROMIUM_DIR")" ]; then
        mkdir -p "$CHROMIUM_DIR"
        cp "$MANIFEST_PATH" "$CHROMIUM_DIR/com.pwdguard.native.json"
        echo "Registered for Chromium on macOS"
    fi
else
    # Linux
    NATIVE_MESSAGING_DIR="$HOME/.config/google-chrome/NativeMessagingHosts"
    mkdir -p "$NATIVE_MESSAGING_DIR"
    cp "$MANIFEST_PATH" "$NATIVE_MESSAGING_DIR/com.pwdguard.native.json"
    echo "Registered for Chrome on Linux"
    
    # Also register for Chromium if it exists
    CHROMIUM_DIR="$HOME/.config/chromium/NativeMessagingHosts"
    if [ -d "$(dirname "$CHROMIUM_DIR")" ]; then
        mkdir -p "$CHROMIUM_DIR"
        cp "$MANIFEST_PATH" "$CHROMIUM_DIR/com.pwdguard.native.json"
        echo "Registered for Chromium on Linux"
    fi
fi
echo ""

echo "========================================"
echo "Installation Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Open Chrome and go to chrome://extensions/"
echo "2. Enable 'Developer mode' in the top right"
echo "3. Click 'Load unpacked'"
echo "4. Select the folder: $EXTENSION_DIR"
echo "5. Copy the Extension ID from the extension card"
echo "6. Run this script again and enter the Extension ID"
echo ""
echo "The extension should now be able to communicate with the desktop app!"
echo ""
