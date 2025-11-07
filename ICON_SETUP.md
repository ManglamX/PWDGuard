# Icon Setup Instructions for PwdGuard

## Problem
Windows desktop/taskbar icons need to be properly sized to match other applications like Chrome. The icon needs to be in `.ico` format with multiple embedded sizes, including large sizes for high-DPI displays.

## Solution - Create Large Desktop Icon

### Step 1: Prepare High-Resolution Source Image

1. **Create/Get your logo** - Make sure `pwdapplogo.png` is **1024x1024 pixels** or larger for best quality
   - Larger source = better quality when Windows scales the icon

### Step 2: Create ICO file with MAXIMUM sizes (CRITICAL for Large Desktop Icons)

1. **Use a professional ICO converter** that supports large sizes:
   - **Recommended**: https://www.icoconverter.com/ (supports up to 512x512)
   - **Alternative**: https://convertio.co/png-ico/
   - **Best Option**: Use ImageMagick or GIMP to create ICO with all sizes

2. **IMPORTANT - Include ALL these sizes in the ICO file:**
   - 16x16 (for small icons)
   - 32x32 (for small icons)
   - 48x48 (for medium icons)
   - 64x64 (for medium icons)
   - 128x128 (for large icons)
   - 256x256 (for large icons - **CRITICAL**)
   - **512x512** (for extra-large/high-DPI - **HIGHLY RECOMMENDED**)

3. **Why 512x512 matters:**
   - Windows uses 256x256 for normal displays
   - Windows uses 512x512 for high-DPI (4K) displays and when icons are set to "Extra Large"
   - Without 512x512, the icon will look pixelated on high-DPI screens

### Step 3: Place the ICO file

1. **Copy `pwdapplogo.ico` to:**
   - `build/pwdapplogo.ico` ← **REQUIRED** (for Windows installer and desktop icon)
   - `public/pwdapplogo.ico` ← Optional (for window icon in dev mode)

2. **Also keep PNG version:**
   - `public/pwdapplogo.png` (for UI display)

### Option 2: Use Electron Builder's auto-conversion

If you have a high-resolution PNG (512x512 or larger), Electron Builder will automatically convert it, but the result might not be as good as a manually created ICO.

1. Place `pwdapplogo.png` (512x512 or larger) in:
   - `build/pwdapplogo.png`
   - `public/pwdapplogo.png`

2. The build process will convert it, but for best results, use Option 1.

## File Locations

```
project-root/
├── build/
│   └── pwdapplogo.ico    ← Windows app icon (with multiple sizes)
│   └── pwdapplogo.png    ← Fallback/other platforms
├── public/
│   └── pwdapplogo.png    ← For UI display and window icon
```

## After Setup

1. Restart your dev server: `npm run dev`
2. For production builds: `npm run build`
3. The icon should now appear at the proper size in the Windows taskbar!

## Recommended Icon Sizes

- **Source PNG**: **1024x1024 pixels minimum** (2048x2048 is even better for future-proofing)
- **ICO file**: **MUST contain sizes**: 16, 32, 48, 64, 128, 256, **512 pixels**
- **UI Logo**: 120-180px (responsive, already configured in CSS)

## Windows Display Settings

If the desktop icon still appears small after creating the proper ICO:

1. **Right-click on desktop** → **View** → Select **Large icons** or **Extra large icons**
2. **Or**: Right-click desktop → **Display settings** → Adjust **Scale and layout** to 125% or higher
3. **Or**: Right-click the icon → **Properties** → **Change Icon** → Select your ICO file → **OK**

## Quick ICO Creation Tool (Command Line)

If you have ImageMagick installed:
```bash
magick convert pwdapplogo.png -define icon:auto-resize=256,128,96,64,48,32,16 pwdapplogo.ico
```

Or with multiple sizes including 512:
```bash
magick convert pwdapplogo.png ( -clone 0 -resize 16x16 ) ( -clone 0 -resize 32x32 ) ( -clone 0 -resize 48x48 ) ( -clone 0 -resize 64x64 ) ( -clone 0 -resize 128x128 ) ( -clone 0 -resize 256x256 ) ( -clone 0 -resize 512x512 ) -delete 0 pwdapplogo.ico
```

