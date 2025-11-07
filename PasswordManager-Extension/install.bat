@echo off
REM PwdGuard Extension Installation Script for Windows

echo ========================================
echo PwdGuard Extension Installer
echo ========================================
echo.

REM Get the extension directory
set "EXTENSION_DIR=%~dp0"
set "NATIVE_HOST_DIR=%EXTENSION_DIR%..\native-host"
set "NATIVE_HOST_SCRIPT=%NATIVE_HOST_DIR%\native-host.js"

REM Check if Node.js is installed
echo [1/5] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js is installed.
echo.

REM Make native host script executable
echo [2/5] Setting up native messaging host...
if not exist "%NATIVE_HOST_SCRIPT%" (
    echo ERROR: Native host script not found at %NATIVE_HOST_SCRIPT%
    pause
    exit /b 1
)
echo Native host script found.
echo.

REM Get extension ID (you'll need to update this after loading the extension)
echo [3/5] Configuring native messaging manifest...
set /p EXTENSION_ID="Enter your Chrome Extension ID (or press Enter to skip): "

if "%EXTENSION_ID%"=="" (
    echo Skipping extension ID configuration.
    echo You'll need to manually update the manifest later.
) else (
    REM Update the native messaging manifest
    powershell -Command "(Get-Content '%EXTENSION_DIR%native-messaging-host\com.pwdguard.native.json') -replace 'EXTENSION_ID_PLACEHOLDER', '%EXTENSION_ID%' | Set-Content '%EXTENSION_DIR%native-messaging-host\com.pwdguard.native.json'"
    echo Extension ID configured.
)
echo.

REM Update the path in the manifest
echo [4/5] Updating native host path...
set "NODE_PATH=%ProgramFiles%\nodejs\node.exe"
if not exist "%NODE_PATH%" (
    set "NODE_PATH=%ProgramFiles(x86)%\nodejs\node.exe"
)

REM Create a batch wrapper for the native host
set "WRAPPER_PATH=%NATIVE_HOST_DIR%\native-host.bat"
echo @echo off > "%WRAPPER_PATH%"
echo "%NODE_PATH%" "%NATIVE_HOST_SCRIPT%" >> "%WRAPPER_PATH%"

REM Update manifest with wrapper path
powershell -Command "(Get-Content '%EXTENSION_DIR%native-messaging-host\com.pwdguard.native.json') -replace 'PATH_TO_NATIVE_HOST_EXECUTABLE', '%WRAPPER_PATH:\=\\%' | Set-Content '%EXTENSION_DIR%native-messaging-host\com.pwdguard.native.json'"
echo Native host path configured.
echo.

REM Register the native messaging host
echo [5/5] Registering native messaging host with Chrome...
set "MANIFEST_PATH=%EXTENSION_DIR%native-messaging-host\com.pwdguard.native.json"
set "REGISTRY_KEY=HKCU\Software\Google\Chrome\NativeMessagingHosts\com.pwdguard.native"

reg add "%REGISTRY_KEY%" /ve /t REG_SZ /d "%MANIFEST_PATH%" /f >nul 2>&1
if errorlevel 1 (
    echo ERROR: Failed to register native messaging host.
    echo Please run this script as Administrator.
    pause
    exit /b 1
)
echo Native messaging host registered successfully!
echo.

echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Open Chrome and go to chrome://extensions/
echo 2. Enable "Developer mode" in the top right
echo 3. Click "Load unpacked"
echo 4. Select the folder: %EXTENSION_DIR%
echo 5. Copy the Extension ID from the extension card
echo 6. Run this script again and enter the Extension ID
echo.
echo The extension should now be able to communicate with the desktop app!
echo.
pause
