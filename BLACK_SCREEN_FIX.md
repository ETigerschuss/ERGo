# 🐛 Black Screen Fix

## You're seeing a black screen at https://etigerschuss.github.io/ERGo/

This is **good news** - it means GitHub Pages is working! The black screen is your game's background color, but the game might not be starting.

---

## 🔍 Step 1: Run Diagnostic (Wait 2 minutes first!)

I just pushed a diagnostic page. **Wait 2 minutes** for GitHub to deploy it, then:

### Open this link:
👉 **https://etigerschuss.github.io/ERGo/diagnostic.html**

This will tell you exactly what's failing:
- ✅ Green = Working
- ❌ Red = Problem found
- 🔵 Blue = Info

**Screenshot the diagnostic page and send it to me!**

---

## 💡 Common Causes of Black Screen

### Cause 1: Page Still Loading
**Symptom:** Black screen, no errors
**Fix:** Wait 5-10 seconds. Phaser.js is 7.5MB and takes time to load.

### Cause 2: JavaScript Not Executing
**Symptom:** Black screen, console shows errors
**Fix:** Check browser console (right-click → Inspect → Console)

### Cause 3: File Paths Wrong
**Symptom:** Console shows "404 Not Found"
**Fix:** Diagnostic will show which files are missing

### Cause 4: Browser Cache
**Symptom:** Old version stuck
**Fix:** Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

---

## 🔧 Quick Checks

### Check 1: Wait for Full Load
Open https://etigerschuss.github.io/ERGo/ and:
1. **Wait 10 seconds** (don't close/refresh)
2. Watch for anything to appear
3. Check browser's loading indicator (spinning icon in tab)

### Check 2: Check Browser Console
1. Right-click on black screen
2. Click "Inspect" or "Inspect Element"
3. Click "Console" tab
4. Look for red error messages
5. **Screenshot and send to me!**

### Check 3: Try Different Browser
- Chrome: https://etigerschuss.github.io/ERGo/
- Firefox: https://etigerschuss.github.io/ERGo/
- Safari: https://etigerschuss.github.io/ERGo/

---

## 📱 Mobile Test

Have your friend try on their phone:
```
https://etigerschuss.github.io/ERGo/
```

Mobile browsers sometimes work differently than desktop!

---

## 🎯 What SHOULD Happen

When working correctly:

**Loading sequence (5-10 seconds):**
1. Black screen appears (game background)
2. Phaser loads (7.5MB file)
3. "Select Your Insects" title appears
4. Insect cards appear
5. Game is ready!

**If stuck on step 1-2:**
- Just loading (wait longer)
- Or error in console (check with Inspect)

---

## 🆘 Next Steps

**Do this NOW:**

1. **Wait 2 minutes** (for diagnostic.html to deploy)
2. **Open:** https://etigerschuss.github.io/ERGo/diagnostic.html
3. **Take screenshot** of all the test results
4. **Send me screenshot**

I'll tell you exactly what's wrong!

---

## 💡 Meanwhile: Test Locally

Your game works perfectly on your computer. While waiting for GitHub Pages fix:

1. **Open PowerShell** in your ERGo folder
2. **Run:**
   ```powershell
   python -m http.server 8000
   ```
3. **Open:** http://localhost:8000
4. **Send your friend your local IP** (from earlier: http://172.20.10.2:8000)

This lets them test if they're on same WiFi!

---

## 📊 Debug Info Needed

To help you, I need:

1. **Diagnostic results:**
   - https://etigerschuss.github.io/ERGo/diagnostic.html
   - Screenshot all tests

2. **Browser console:**
   - Right-click → Inspect → Console
   - Screenshot any red errors

3. **What you see:**
   - Pure black screen?
   - Black with loading icon?
   - White screen?
   - Error message?

4. **How long you waited:**
   - 5 seconds?
   - 30 seconds?
   - 2 minutes?

---

## ⏱️ Timeline

```
Now:     Diagnostic pushed to GitHub
+2 min:  GitHub deploys diagnostic.html
+3 min:  You can access diagnostic page
+5 min:  We know exactly what's wrong
+10 min: Game fixed and working!
```

**Wait 2 minutes, then check the diagnostic!** 🔍
