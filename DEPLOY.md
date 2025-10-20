# 🚀 Quick Deploy Commands

## Before Deploying:

1. **Update firebase-config.js with YOUR Firebase credentials**
2. **Test locally first** (open index.html in browser)
3. **Check console for Firebase initialization**

## Deploy to GitHub:

```powershell
cd "C:\Users\serbe\Desktop\hirnkastl\ERGo!\ERGo!"

git add .

git commit -m "Add global leaderboards with Firebase (v=108)"

git push origin main
```

## After Deploy:

1. Wait 2-5 minutes
2. Visit: https://etigerschuss.github.io/ERGo/
3. Hard refresh: `Ctrl+Shift+R`
4. Complete a level
5. Check highscores - should show "🌐 GLOBAL LEADERBOARD 🌐"

## Files Changed:
- ✅ index.html (added Firebase SDK)
- ✅ firebase-config.js (NEW - needs YOUR config)
- ✅ src/main.js (v=108)
- ✅ src/scenes/DefogGamev0.04.js (Firebase integration)

## Firebase Setup Required:
- See FIREBASE_SETUP_GUIDE.md for complete instructions
- Takes ~15 minutes total
- 100% free for your game's scale
