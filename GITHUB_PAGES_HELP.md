# 🔧 GitHub Pages Setup Guide for ERGo!

## Current Status

**Your URL:** https://etigerschuss.github.io/ERGo/
**Repository:** https://github.com/ETigerschuss/ERGo

The page exists but appears blank. Let's fix it!

---

## ✅ Step-by-Step Fix

### Step 1: Check GitHub Pages Settings

1. **Go to:** https://github.com/ETigerschuss/ERGo/settings/pages

2. **Verify these settings:**
   - ✅ **Source:** Deploy from a branch
   - ✅ **Branch:** `main`
   - ✅ **Folder:** `/ (root)` ← **IMPORTANT!**
   - ✅ Click **Save** if anything changed

3. **Check for green checkmark** that says:
   > "Your site is live at https://etigerschuss.github.io/ERGo/"

---

### Step 2: Wait for Deployment (if needed)

If you just enabled Pages or changed settings:

1. Go to **Actions** tab: https://github.com/ETigerschuss/ERGo/actions
2. Look for "pages build and deployment" workflow
3. Wait for green checkmark (usually 1-2 minutes)
4. Refresh your page: https://etigerschuss.github.io/ERGo/

---

### Step 3: Check Browser Console

If still blank, open your friend's phone browser:

**On iPhone:**
1. Settings → Safari → Advanced → Web Inspector → ON
2. Connect phone to Mac
3. Open Safari on Mac → Develop → [iPhone] → ERGo page
4. Check Console for errors

**On Android Chrome:**
1. Open https://etigerschuss.github.io/ERGo/
2. Tap menu (⋮) → More tools → Remote devices
3. Or use `chrome://inspect` on desktop
4. Check Console tab

**Look for errors like:**
- ❌ `Failed to load module script`
- ❌ `404 Not Found: phaser.js`
- ❌ `CORS error`

---

### Step 4: Verify Files Are on GitHub

Check if your game files are actually on GitHub:

1. **Go to:** https://github.com/ETigerschuss/ERGo
2. **Look for these files:**
   - ✅ `index.html` ← Main page
   - ✅ `phaser.js` ← Game engine
   - ✅ `src/main.js` ← Game code
   - ✅ `src/scenes/` folder
   - ✅ `src/data/` folder
   - ✅ `assets/` folder

3. **Click on `index.html`** and verify it contains:
   ```html
   <script src="phaser.js"></script>
   <script type="module" src="src/main.js"></script>
   ```

---

## 🔍 Common Issues & Fixes

### Issue 1: Blank Page with No Errors

**Cause:** GitHub Pages hasn't deployed yet
**Fix:** 
- Wait 2-5 minutes after enabling Pages
- Check Actions tab for deployment status
- Hard refresh browser: Ctrl+Shift+R (or Cmd+Shift+R)

### Issue 2: 404 Error on Game Files

**Cause:** Case-sensitive filenames or wrong paths
**Fix:**
- GitHub Pages is case-sensitive
- Check file paths in `index.html` and `src/main.js`
- Verify `phaser.js` exists in root directory

### Issue 3: Module Loading Error

**Cause:** Browser doesn't support ES6 modules
**Fix:**
- Use modern browser (Chrome 61+, Safari 11+, Firefox 60+)
- Or we can bundle the code (I can help with this)

### Issue 4: CORS Error

**Cause:** Loading assets from wrong domain
**Fix:**
- All assets must be in same repository
- Check `assets/` folder exists on GitHub

---

## 🧪 Test Right Now

### Desktop Test
Open in new browser tab: https://etigerschuss.github.io/ERGo/

**What you should see:**
1. Black background
2. "Select Your Insects" title
3. Grid of 16 insect cards
4. Spectral coverage preview at bottom

**If you see blank/white page:**
- Right-click → Inspect → Console tab
- Copy any red errors and send them to me

### Mobile Test
Send this link to your friend: https://etigerschuss.github.io/ERGo/

**They should see:**
- Same insect selection screen
- Touch controls working
- No need to pinch/zoom

---

## 📋 Checklist

Copy this and check off:

```
Settings:
□ GitHub Pages is enabled
□ Source is "Deploy from a branch"
□ Branch is "main"
□ Folder is "/ (root)"
□ Green checkmark shows "Your site is live"

Files on GitHub:
□ index.html exists
□ phaser.js exists (1.5 MB file)
□ src/main.js exists
□ src/scenes/ folder exists
□ src/data/ folder exists
□ assets/ folder exists

Testing:
□ Desktop browser shows game (or errors)
□ Browser console checked for errors
□ Friend can access on mobile
```

---

## 🆘 Still Not Working?

**Tell me:**

1. **What do you see?**
   - Blank white page?
   - Blank black page?
   - Error message?
   - Loading forever?

2. **Browser Console Errors** (right-click → Inspect → Console)
   - Copy/paste any red error messages

3. **GitHub Actions Status**
   - Go to: https://github.com/ETigerschuss/ERGo/actions
   - Is there a green ✅ or red ❌?

4. **Screenshots help!**
   - Screenshot of the blank page
   - Screenshot of browser console
   - Screenshot of GitHub Pages settings

---

## 💡 Quick Verification Commands

Run these locally to verify your files are correct:

```powershell
# Check if index.html loads Phaser
Select-String -Path index.html -Pattern "phaser.js"

# Check if main.js exists and has correct imports
Select-String -Path src/main.js -Pattern "DefogGame"

# Verify file structure
Get-ChildItem -Recurse -Include *.js | Select-Object FullName
```

---

## 🎯 Expected Result

**When working, your friend will:**

1. Open: https://etigerschuss.github.io/ERGo/
2. See: Insect selection screen
3. Select: Up to 5 insects
4. Tap: "Start Game"
5. Play: See fog clearing with spectral vision!

---

## 🔧 Alternative: Use GitHub's Built-in Viewer

If Pages isn't working, try this temporary solution:

**Send your friend:**
```
https://github.com/ETigerschuss/ERGo/blob/main/index.html
```

They can click **"Download"** or **"Raw"** to save locally and open.

**Not ideal, but works as backup!**

---

## Next Steps

1. **Go to:** https://github.com/ETigerschuss/ERGo/settings/pages
2. **Verify settings** (see Step 1 above)
3. **Test the link:** https://etigerschuss.github.io/ERGo/
4. **Tell me what you see!**

I'm here to help debug! 🐛🔍
