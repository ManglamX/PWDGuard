@echo off
REM Batch script to help create a large ICO file for Windows
REM This requires ImageMagick to be installed
REM Download from: https://imagemagick.org/script/download.php

echo Creating large ICO file with all required sizes...
echo.

if not exist "build\pwdapplogo.png" (
    echo ERROR: Source file build\pwdapplogo.png not found!
    echo Please place your logo PNG file in the build folder first.
    pause
    exit /b 1
)

REM Check if ImageMagick is installed
magick -version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ImageMagick is not installed or not in PATH.
    echo.
    echo Please install ImageMagick from: https://imagemagick.org/script/download.php
    echo Or use an online converter: https://www.icoconverter.com/
    echo.
    echo For online converter:
    echo 1. Upload build\pwdapplogo.png
    echo 2. Select sizes: 16, 32, 48, 64, 128, 256, 512
    echo 3. Download as pwdapplogo.ico
    echo 4. Place in build\ folder
    echo.
    pause
    exit /b 1
)

echo Creating ICO with sizes: 16, 32, 48, 64, 128, 256, 512...
magick convert "build\pwdapplogo.png" ^
    ( -clone 0 -resize 16x16 ) ^
    ( -clone 0 -resize 32x32 ) ^
    ( -clone 0 -resize 48x48 ) ^
    ( -clone 0 -resize 64x64 ) ^
    ( -clone 0 -resize 128x128 ) ^
    ( -clone 0 -resize 256x256 ) ^
    ( -clone 0 -resize 512x512 ) ^
    -delete 0 ^
    "build\pwdapplogo.ico"

if exist "build\pwdapplogo.ico" (
    echo.
    echo SUCCESS! ICO file created: build\pwdapplogo.ico
    echo.
    echo The ICO file contains all required sizes including 512x512 for large desktop icons.
    echo.
) else (
    echo.
    echo ERROR: Failed to create ICO file
    echo.
)

pause

