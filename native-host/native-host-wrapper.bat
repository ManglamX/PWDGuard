@echo off
REM PwdGuard Native Messaging Host Wrapper for Windows
REM This wrapper launches the Node.js native host script

REM Try to find Node.js in common locations
set "NODE_PATH="

if exist "C:\Program Files\nodejs\node.exe" (
    set "NODE_PATH=C:\Program Files\nodejs\node.exe"
) else if exist "C:\Program Files (x86)\nodejs\node.exe" (
    set "NODE_PATH=C:\Program Files (x86)\nodejs\node.exe"
) else (
    REM Try to use node from PATH
    where node >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        set "NODE_PATH=node"
    )
)

if "%NODE_PATH%"=="" (
    echo Error: Node.js not found! >&2
    exit /b 1
)

REM Get the directory where this script is located
set "SCRIPT_DIR=%~dp0"

REM Launch the native host
"%NODE_PATH%" "%SCRIPT_DIR%native-host.js"
