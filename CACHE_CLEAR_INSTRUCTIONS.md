# HOW TO CLEAR BROWSER CACHE AND SEE THE FIXES

## The Problem:
Your browser has cached the old JavaScript files. Even though the code is fixed, the browser is still running the old version from its cache.

## Solutions (Try in this order):

### ✅ Solution 1: Hard Refresh (FASTEST)
**Windows:**
- Press `Ctrl + Shift + R` 
- OR `Ctrl + F5`

**Mac:**
- Press `Cmd + Shift + R`

### ✅ Solution 2: Clear Cache in DevTools
1. Open the game in browser
2. Press `F12` to open Developer Tools
3. Right-click the refresh button (🔄)
4. Select **"Empty Cache and Hard Reload"**

### ✅ Solution 3: Clear Browser Cache Completely
**Chrome/Edge:**
1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files"
3. Click "Clear data"
4. Refresh the page

### ✅ Solution 4: Disable Cache While DevTools Open
1. Open game
2. Press `F12` (DevTools)
3. Go to **Network** tab
4. Check ☑️ **"Disable cache"**
5. Keep DevTools open and refresh

### ✅ Solution 5: Force Reload from Server
If running a local server:
```powershell
# Stop the server (Ctrl+C)
# Then restart it
python -m http.server 8000
# OR
npx http-server
```

Then open: http://localhost:8000 with a hard refresh

---

## How to Verify the Fixes Are Loaded:

### 1. Check Diptera Species Order
1. Open the game
2. Click **Diptera** (🪰 top-right panel)
3. You should see 4 cards:
   - **Card 1/4**: "Mosquito" with green "▶ STARTING INSECT" badge
   - **Card 2/4**: "Vinegar Fly" with "Unlocks later (2/4)"
   - **Card 3/4**: "Housefly"
   - **Card 4/4**: "Horsefly"

**If you still see "Vinegar Fly" as 1/4**, the cache hasn't cleared.

### 2. Check Lepidoptera Species Order
1. Go back to family selection
2. Click **Lepidoptera** (🦋 bottom-left panel)
3. You should see:
   - **Card 1/4**: "Hummingbird Hawk-moth" (NOT ant!)
   - **Card 2/4**: "Peacock Butterfly"
   - **Card 3/4**: "Monarch Butterfly"
   - **Card 4/4**: "Cabbage White"

**If you see "Ant" as the first insect**, the cache hasn't cleared.

### 3. Check Back Button Works
1. Select any family
2. Click the **"← Back"** button (bottom-left)
3. Should return to family selection
4. Select the same family again
5. Click **"← Back"** again
6. Should still work (not freeze/break)

---

## Still Not Working?

### Check Console for Errors:
1. Press `F12`
2. Go to **Console** tab
3. Look for any red error messages
4. Share them with me if you see any

### Verify File is Saved:
1. Open `src/scenes/StartNew.js` in VS Code
2. Look at lines 70-77
3. Should show:
```javascript
const speciesByFamily = [
    ['ant', 'honeybee', 'bumblebee', 'hornet'],              // Hymenoptera
    ['mosquito', 'vinegar_fly', 'housefly', 'horsefly'],     // Diptera
    ['hawk_moth', 'peacock', 'monarch', 'cabbage_white'],    // Lepidoptera
    ['stag_beetle', 'firefly', 'ladybug', 'rose_chafer']     // Coleoptera
];
```

### Verify Git Status:
```powershell
git status
```
Should show:
```
modified:   src/scenes/StartNew.js
modified:   src/scenes/DefogGameAdvanced.js
```

If it doesn't show these files as modified, the changes weren't saved!

---

## Expected Results After Cache Clear:

### Family Selection Screen (Initial):
```
🐝 Hymenoptera     🪰 Diptera
(Shows Ant)        (Shows Mosquito) ← SHOULD BE MOSQUITO!

🦋 Lepidoptera     🪲 Coleoptera
(Shows Hawk Moth)  (Shows Stag Beetle) ← SHOULD BE HAWK MOTH!
```

### Diptera Details Screen:
```
1/4: Mosquito (STARTING INSECT)
2/4: Vinegar Fly (Unlocks later)
3/4: Housefly (Unlocks later)
4/4: Horsefly (Unlocks later)
```

### Lepidoptera Details Screen:
```
1/4: Hummingbird Hawk-moth (STARTING INSECT)
2/4: Peacock Butterfly (Unlocks later)
3/4: Monarch Butterfly (Unlocks later)
4/4: Cabbage White (Unlocks later)
```

---

## Files That Were Changed:

1. ✅ `src/scenes/StartNew.js` (Lines 72-76, 185-339, 386-408)
2. ✅ `src/scenes/DefogGameAdvanced.js` (Lines 43-48)

Both files have been updated with correct species order.

**If you're STILL seeing the wrong species, it's 100% a browser cache issue!**

Try the hard refresh solutions above! 🔄
