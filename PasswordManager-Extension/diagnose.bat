@echo off
REM PwdGuard Extension Diagnostic Tool

color 0E
echo.
echo ========================================
echo   PwdGuard Extension Diagnostics
echo ========================================
echo.

set "ERRORS=0"

REM Check 1: Node.js
echo [1/7] Checking Node.js...
node --version >nul 2>&1
if %errorLevel% neq 0 (
    echo [FAIL] Node.js is NOT installed
    set /a ERRORS+=1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo [PASS] Node.js %NODE_VERSION% is installed
)
echo.

REM Check 2: Extension loaded
echo [2/7] Extension Status
echo Please check manually:
echo - Go to chrome://extensions/
echo - Find "PwdGuard Password Manager"
echo - Verify it's enabled
set /p EXT_LOADED="Is the extension loaded and enabled? (y/n): "
if /i not "%EXT_LOADED%"=="y" (
    echo [FAIL] Extension is not loaded or enabled
    set /a ERRORS+=1
) else (
    echo [PASS] Extension is loaded
)
echo.

REM Check 3: Extension ID
echo [3/7] Checking Extension ID configuration...
set "MANIFEST_FILE=%~dp0native-messaging-host\com.pwdguard.native.json"

if not exist "%MANIFEST_FILE%" (
    echo [FAIL] Manifest file not found: %MANIFEST_FILE%
    set /a ERRORS+=1
) else (
    findstr /C:"EXTENSION_ID_PLACEHOLDER" "%MANIFEST_FILE%" >nul
    if %errorLevel% equ 0 (
        echo [FAIL] Extension ID not configured (still has PLACEHOLDER)
        set /a ERRORS+=1
    ) else (
        echo [PASS] Extension ID appears to be configured
    )
)
echo.

REM Check 4: Native host path
echo [4/7] Checking native host path...
set "NATIVE_HOST_DIR=%~dp0..\native-host"
set "NATIVE_HOST_FILE=%NATIVE_HOST_DIR%\native-host.js"
set "WRAPPER_FILE=%NATIVE_HOST_DIR%\native-host-wrapper.bat"

if not exist "%NATIVE_HOST_FILE%" (
    echo [FAIL] Native host script not found: %NATIVE_HOST_FILE%
    set /a ERRORS+=1
) else (
    echo [PASS] Native host script exists
)

if not exist "%WRAPPER_FILE%" (
    echo [WARN] Wrapper script not found: %WRAPPER_FILE%
    echo This may cause issues on Windows
) else (
    echo [PASS] Wrapper script exists
)
echo.

REM Check 5: Registry
echo [5/7] Checking Chrome registry...
set "REGISTRY_KEY=HKCU\Software\Google\Chrome\NativeMessagingHosts\com.pwdguard.native"

reg query "%REGISTRY_KEY%" >nul 2>&1
if %errorLevel% neq 0 (
    echo [FAIL] Registry entry not found
    echo Key: %REGISTRY_KEY%
    set /a ERRORS+=1
) else (
    echo [PASS] Registry entry exists
    echo.
    echo Registry value:
    reg query "%REGISTRY_KEY%" /ve
)
echo.

REM Check 6: Manifest file content
echo [6/7] Checking manifest file content...
if exist "%MANIFEST_FILE%" (
    echo Manifest file content:
    type "%MANIFEST_FILE%"
    echo.
    
    findstr /C:"PATH_TO_NATIVE_HOST_EXECUTABLE" "%MANIFEST_FILE%" >nul
    if %errorLevel% equ 0 (
        echo [FAIL] Path not configured (still has PLACEHOLDER)
        set /a ERRORS+=1
    ) else (
        echo [PASS] Path appears to be configured
    )
)
echo.

REM Check 7: Test native host
echo [7/7] Testing native host script...
echo Testing if native host can be executed...
node "%NATIVE_HOST_FILE%" --version >nul 2>&1
if %errorLevel% neq 0 (
    echo [WARN] Native host script may have issues
    echo Try running manually: node "%NATIVE_HOST_FILE%"
) else (
    echo [PASS] Native host script can be executed
)
echo.

REM Summary
echo ========================================
echo   Diagnostic Summary
echo ========================================
echo.
if %ERRORS% equ 0 (
    echo [SUCCESS] No critical errors found!
    echo.
    echo If you're still seeing "Native messaging host not found":
    echo 1. Close Chrome COMPLETELY (check Task Manager^)
    echo 2. Reopen Chrome
    echo 3. Try the extension again
    echo.
    echo If still not working, the Extension ID might be wrong.
    echo Run setup-helper.bat to reconfigure.
) else (
    echo [ERRORS] Found %ERRORS% error(s^)
    echo.
    echo Please fix the errors above and try again.
    echo.
    echo Quick fixes:
    echo 1. Install Node.js: https://nodejs.org/
    echo 2. Load extension in Chrome: chrome://extensions/
    echo 3. Run setup-helper.bat to configure Extension ID
    echo 4. Restart Chrome completely
)
echo.

echo ========================================
echo   Configuration Paths
echo ========================================
echo Manifest: %MANIFEST_FILE%
echo Native Host: %NATIVE_HOST_FILE%
echo Wrapper: %WRAPPER_FILE%
echo Registry: %REGISTRY_KEY%
echo.

pause
