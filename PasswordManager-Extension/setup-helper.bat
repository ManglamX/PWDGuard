@echo off
REM PwdGuard Extension Setup Helper
REM This script helps you configure the native messaging host

color 0A
echo.
echo ========================================
echo   PwdGuard Extension Setup Helper
echo ========================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo WARNING: Not running as Administrator!
    echo Some operations may fail.
    echo Please right-click and "Run as Administrator"
    echo.
    pause
)

REM Step 1: Check Node.js
echo [Step 1/5] Checking Node.js installation...
node --version >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo After installation, restart this script.
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js %NODE_VERSION% is installed
echo.

REM Step 2: Get Extension ID
echo [Step 2/5] Extension ID Configuration
echo.
echo Please follow these steps:
echo 1. Open Chrome and go to: chrome://extensions/
echo 2. Find "PwdGuard Password Manager" extension
echo 3. Copy the Extension ID (long string under the name)
echo.
set /p EXTENSION_ID="Paste your Extension ID here: "

if "%EXTENSION_ID%"=="" (
    echo [ERROR] Extension ID cannot be empty!
    pause
    exit /b 1
)

echo [OK] Extension ID: %EXTENSION_ID%
echo.

REM Step 3: Get current directory
echo [Step 3/5] Detecting paths...
set "CURRENT_DIR=%~dp0"
set "NATIVE_HOST_DIR=%CURRENT_DIR%..\native-host"
set "MANIFEST_FILE=%CURRENT_DIR%native-messaging-host\com.pwdguard.native.json"
set "WRAPPER_FILE=%NATIVE_HOST_DIR%\native-host-wrapper.bat"

echo Current directory: %CURRENT_DIR%
echo Native host directory: %NATIVE_HOST_DIR%
echo Manifest file: %MANIFEST_FILE%
echo.

REM Step 4: Update manifest file
echo [Step 4/5] Updating manifest file...

REM Create a temporary PowerShell script to update JSON
set "PS_SCRIPT=%TEMP%\update-manifest.ps1"
(
echo $manifestPath = '%MANIFEST_FILE%'
echo $wrapperPath = '%WRAPPER_FILE%'
echo $extensionId = '%EXTENSION_ID%'
echo.
echo # Read manifest
echo $manifest = Get-Content $manifestPath -Raw ^| ConvertFrom-Json
echo.
echo # Update values
echo $manifest.path = $wrapperPath -replace '\\', '\\'
echo $manifest.allowed_origins = @("chrome-extension://$extensionId/")
echo.
echo # Write back
echo $manifest ^| ConvertTo-Json -Depth 10 ^| Set-Content $manifestPath
echo.
echo Write-Host "Manifest updated successfully!"
) > "%PS_SCRIPT%"

powershell -ExecutionPolicy Bypass -File "%PS_SCRIPT%"
del "%PS_SCRIPT%"

echo [OK] Manifest file updated
echo.

REM Step 5: Register with Chrome
echo [Step 5/5] Registering with Chrome...

set "REGISTRY_KEY=HKCU\Software\Google\Chrome\NativeMessagingHosts\com.pwdguard.native"

reg add "%REGISTRY_KEY%" /ve /t REG_SZ /d "%MANIFEST_FILE%" /f >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Failed to register with Chrome!
    echo Please run this script as Administrator.
    echo.
    pause
    exit /b 1
)

echo [OK] Registered with Chrome
echo.

REM Verify registration
echo Verifying registration...
reg query "%REGISTRY_KEY%" >nul 2>&1
if %errorLevel% equ 0 (
    echo [OK] Registry entry verified
) else (
    echo [WARNING] Could not verify registry entry
)
echo.

REM Final instructions
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Close Chrome COMPLETELY (check Task Manager)
echo 2. Reopen Chrome
echo 3. Click the PwdGuard extension icon
echo 4. Status should show "Connected" in green
echo.
echo If you see "Disconnected":
echo - Make sure Chrome is completely closed and reopened
echo - Check that the Extension ID is correct
echo - See MANUAL_SETUP.md for troubleshooting
echo.
echo Configuration Details:
echo - Extension ID: %EXTENSION_ID%
echo - Manifest: %MANIFEST_FILE%
echo - Native Host: %WRAPPER_FILE%
echo - Registry: %REGISTRY_KEY%
echo.
pause
