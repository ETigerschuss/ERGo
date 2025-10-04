# 📱 Mobile Testing Guide for ERGo!

## Quick Start - Test on Your Phone

### Option 1: Same WiFi Network (Fastest)

**On your computer:**
1. Check your computer's local IP address:
   - **Windows**: Open PowerShell and run `ipconfig` → Look for "IPv4 Address" (e.g., `192.168.1.100`)
   - **Mac/Linux**: Open Terminal and run `ifconfig` → Look for "inet" (e.g., `192.168.1.100`)

2. Start the HTTP server (if not already running):
   ```powershell
   python -m http.server 8000
   ```

**On your phone:**
1. Connect to the **same WiFi network** as your computer
2. Open your phone's browser (Chrome, Safari, Firefox)
3. Navigate to: `http://YOUR_IP_ADDRESS:8000`
   - Example: `http://192.168.1.100:8000`
4. Bookmark it for easy access!

---

### Option 2: GitHub Pages (Public Access)

**Share with testers anywhere in the world!**

1. Push your code to GitHub (see below)
2. Enable GitHub Pages:
   - Go to your repo: `https://github.com/ETigerschuss/ERGo`
   - Click **Settings** → **Pages**
   - Source: Deploy from `main` branch
   - Click **Save**
3. Wait 1-2 minutes, then access at:
   - `https://etigerschuss.github.io/ERGo/`

---

## Mobile Browser Compatibility

| Browser | iOS | Android | Notes |
|---------|-----|---------|-------|
| **Safari** | ✅ Excellent | N/A | Best on iPhone/iPad |
| **Chrome** | ✅ Good | ✅ Excellent | Recommended for Android |
| **Firefox** | ✅ Good | ✅ Good | Good alternative |
| **Edge** | ✅ Good | ✅ Good | Works well |

---

## Touch Controls

### Selection Screen
- **Tap insect cards** to select/deselect
- **Swipe** to scroll through insect families
- **Tap "START GAME"** when all 4 families selected

### Game Screen
- **Tap insect emoji** to select it
- **Tap anywhere** on the flower image to set waypoint
- **Hold SHIFT** (external keyboard) for multi-select
- **Tap corner panels** to switch insects mid-game

---

## Optimizations for Mobile

✅ **Responsive Layout** - Adapts to phone/tablet screens
✅ **Touch-Friendly** - All buttons are finger-sized (44x44px minimum)
✅ **No Zoom** - Viewport locked to prevent accidental zooming
✅ **Smooth Performance** - Optimized rendering for 60 FPS on modern phones
✅ **Portrait Mode** - Works in both portrait and landscape

---

## Testing Checklist

### Performance Tests
- [ ] Game loads in under 3 seconds on 4G
- [ ] No lag when moving multiple insects
- [ ] Spectral wavelength curves render smoothly
- [ ] RGB bars update without flickering

### Touch Tests
- [ ] Can select all 4 insects without double-tapping
- [ ] Waypoints place accurately where you tap
- [ ] Panels don't accidentally close when tapping insects
- [ ] Can switch insects mid-game easily

### Visual Tests
- [ ] Text is readable without zooming
- [ ] Spectral visualization shows all wavelength labels
- [ ] Flower image scales correctly to screen
- [ ] No UI elements cut off at screen edges

### Bug Tests
- [ ] Colors look diverse (not all red/yellow)
- [ ] Cabbage White reveals natural colors
- [ ] Green-only team (Ant+Mosquito) shows yellow tint
- [ ] Blue specialists (Hoverfly, Hornet) show cyan tint

---

## Network Troubleshooting

### "Cannot connect" error:
- ✅ Computer and phone on **same WiFi**?
- ✅ HTTP server **running** on computer? (check PowerShell)
- ✅ Firewall **allowing** port 8000? (Windows Security settings)
- ✅ IP address **correct**? (run `ipconfig` again)

### Slow loading:
- ✅ Use **Chrome** on Android (fastest JavaScript engine)
- ✅ Close other apps to free RAM
- ✅ Try WiFi 5GHz band instead of 2.4GHz
- ✅ Hard refresh: Long-press reload button → "Empty Cache and Hard Reload"

---

## Sharing with Testers

### Send Test Link (Local)
```
Hey! Test ERGo on your phone:
1. Connect to WiFi: [YOUR_WIFI_NAME]
2. Open: http://[YOUR_IP]:8000
3. Try different insect teams!
```

### Send Test Link (GitHub Pages)
```
Test ERGo! - Insect Vision Explorer
https://etigerschuss.github.io/ERGo/

Select 4 insects (one from each family) and explore
how they see flower colors differently!

Best on Chrome mobile. Let me know what you think!
```

---

## Advanced: QR Code for Easy Access

1. Generate QR code for your local IP:
   - Visit: `https://www.qr-code-generator.com/`
   - Enter: `http://YOUR_IP:8000`
   - Download QR code image

2. Show QR code to testers → They scan → Instant access!

---

## Known Mobile Limitations

⚠️ **Multi-select requires keyboard** - SHIFT+tap only works with external keyboard (rare on phones)
   - **Workaround**: Select insects one at a time

⚠️ **Small text on old phones** - Minimum iOS 12+ or Android 8+ recommended
   - **Workaround**: Use tablet or enable accessibility zoom

⚠️ **Battery drain** - Game uses GPU for rendering
   - **Workaround**: Plug in charger for long sessions

---

## Performance Tips

**For best mobile experience:**
1. Close background apps
2. Use latest browser version
3. Enable hardware acceleration (Chrome settings)
4. Avoid low-power mode during gameplay
5. Use WiFi instead of cellular data

---

## Feedback Collection

**What to ask testers:**
- ✅ Which phone/browser did you use?
- ✅ Did the game load smoothly?
- ✅ Were the colors visually diverse?
- ✅ Did touch controls feel responsive?
- ✅ Any bugs or weird behavior?
- ✅ How long did you play?

---

## Next Steps

1. **Test locally** on your own phone first
2. **Fix any bugs** you find
3. **Push to GitHub** for public access
4. **Share test link** with friends/colleagues
5. **Collect feedback** and iterate!

Happy testing! 🐝📱🔬
