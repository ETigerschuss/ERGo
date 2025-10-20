# 🚀 Firebase Setup & Deployment Guide for ERGo!

## ✅ What's New in v=108

- **Global Leaderboards** - Players can now see each other's high scores!
- **Top 5 Per Level** - Shows the 5 fastest times for each level
- **Automatic Upload** - Scores automatically sync to Firebase when you beat a level
- **Fallback Mode** - If Firebase isn't configured, game works with local scores

---

## 📋 Step-by-Step Firebase Setup (15 minutes)

### Step 1: Create Firebase Project (5 min)

1. **Go to Firebase Console:**
   - Visit: https://console.firebase.google.com
   - Sign in with your Google account

2. **Create New Project:**
   - Click "Add project" or "Create a project"
   - Project name: `ERGo-Game` (or any name you prefer)
   - Click "Continue"

3. **Disable Google Analytics:**
   - Toggle OFF "Enable Google Analytics" (not needed for leaderboards)
   - Click "Create project"
   - Wait 30 seconds for project creation
   - Click "Continue"

### Step 2: Setup Firestore Database (3 min)

1. **Navigate to Firestore:**
   - In Firebase Console, click "Build" in left sidebar
   - Click "Firestore Database"
   - Click "Create database"

2. **Choose Security Rules:**
   - Select **"Start in test mode"** (we'll secure it in Step 4)
   - Click "Next"

3. **Choose Location:**
   - Select region closest to your players (e.g., `us-central`, `europe-west1`)
   - Click "Enable"
   - Wait ~1 minute for database creation

### Step 3: Get Your Firebase Config (2 min)

1. **Register Web App:**
   - Click the gear icon ⚙️ next to "Project Overview"
   - Click "Project settings"
   - Scroll down to "Your apps"
   - Click the `</>` (Web) icon
   - App nickname: `ERGo-Web`
   - ✅ Check "Also set up Firebase Hosting" (optional but recommended)
   - Click "Register app"

2. **Copy Configuration:**
   - You'll see a `firebaseConfig` object like this:
   ```javascript
   const firebaseConfig = {
       apiKey: "AIzaSyC-EXAMPLE-KEY",
       authDomain: "ergo-game.firebaseapp.com",
       projectId: "ergo-game-12345",
       storageBucket: "ergo-game-12345.appspot.com",
       messagingSenderId: "123456789012",
       appId: "1:123456789012:web:abcdef1234567890"
   };
   ```
   - Copy this entire object

3. **Update firebase-config.js:**
   - Open `firebase-config.js` in your project
   - **Replace** the placeholder values with your actual config:
   ```javascript
   const firebaseConfig = {
       apiKey: "YOUR_ACTUAL_API_KEY",  // ← Replace this
       authDomain: "your-project.firebaseapp.com",  // ← Replace this
       projectId: "your-project-id",  // ← Replace this
       storageBucket: "your-project-id.appspot.com",  // ← Replace this
       messagingSenderId: "123456789",  // ← Replace this
       appId: "your-app-id"  // ← Replace this
   };
   ```
   - Save the file

### Step 4: Configure Security Rules (5 min)

**IMPORTANT:** The "test mode" rules expire in 30 days. Set up proper security now!

1. **Go to Firestore Rules:**
   - In Firebase Console, click "Firestore Database"
   - Click "Rules" tab

2. **Replace with These Security Rules:**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /leaderboard/{score} {
         // Anyone can read leaderboard
         allow read: if true;
         
         // Allow writes with validation
         allow create: if 
           // Validate required fields exist
           request.resource.data.keys().hasAll(['level', 'time', 'diamonds', 'rhodopsins', 'timestamp', 'dateStr', 'playerName', 'version'])
           // Level must be 1-5
           && request.resource.data.level >= 1 
           && request.resource.data.level <= 5
           // Time must be reasonable (30 seconds to 1 hour)
           && request.resource.data.time >= 30 
           && request.resource.data.time <= 3600
           // Diamonds must be reasonable (0 to 50,000)
           && request.resource.data.diamonds >= 0 
           && request.resource.data.diamonds <= 50000
           // Version must be string
           && request.resource.data.version is string;
       }
     }
   }
   ```

3. **Publish Rules:**
   - Click "Publish"
   - You should see "Rules published successfully"

**What these rules do:**
- ✅ Anyone can read the leaderboard (view scores)
- ✅ Anyone can submit scores (create)
- ✅ Prevent impossible scores (time/diamond validation)
- ✅ Prevent spam (level must be 1-5)
- ❌ Nobody can update or delete existing scores

---

## 🌐 Deploy to GitHub Pages

### Option A: GitHub Web Interface (Easiest)

1. **Commit Your Changes:**
   - Go to your GitHub repository: https://github.com/ETigerschuss/ERGo
   - Click "Add file" → "Upload files"
   - Drag and drop all changed files:
     - `index.html`
     - `firebase-config.js` (with YOUR Firebase config)
     - `src/main.js`
     - `src/scenes/DefogGamev0.04.js`
   - Commit message: "Add global leaderboards with Firebase (v=108)"
   - Click "Commit changes"

2. **Wait for Deployment:**
   - GitHub Pages auto-deploys in ~2 minutes
   - Visit: https://etigerschuss.github.io/ERGo/
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

### Option B: Git Command Line (If you prefer)

```powershell
# Navigate to your project
cd "C:\Users\serbe\Desktop\hirnkastl\ERGo!\ERGo!"

# Stage all changes
git add .

# Commit with message
git commit -m "Add global leaderboards with Firebase (v=108)"

# Push to GitHub
git push origin main
```

**Wait 2 minutes**, then visit your GitHub Pages site!

---

## ✅ Testing Checklist

After deployment, test these features:

### Local Testing (Before Push):
1. ✅ Open `index.html` locally in browser
2. ✅ Check browser console for "✅ Firebase initialized successfully!"
3. ✅ Complete a level
4. ✅ Check console for "✅ Score uploaded to global leaderboard!"
5. ✅ Click "Highscores" button
6. ✅ Verify you see "🌐 GLOBAL LEADERBOARD 🌐" title
7. ✅ Check if your score appears in top 5

### After GitHub Pages Deployment:
1. ✅ Visit: https://etigerschuss.github.io/ERGo/
2. ✅ Hard refresh page (Ctrl+Shift+R)
3. ✅ Complete a level
4. ✅ View highscores
5. ✅ Ask a friend to play and check if you see their score!

---

## 🔍 Troubleshooting

### Problem: "Firebase not initialized" in console

**Solution:**
1. Check `firebase-config.js` has your actual Firebase config (not placeholders)
2. Make sure `index.html` loads Firebase SDK before `firebase-config.js`
3. Clear browser cache and hard refresh

### Problem: "Permission denied" when viewing scores

**Solution:**
1. Go to Firestore Rules in Firebase Console
2. Make sure rules include `allow read: if true;`
3. Click "Publish"

### Problem: Can't submit scores

**Solution:**
1. Check Firestore Rules have `allow create:` with validation
2. Open browser console and look for error messages
3. Verify your score values are within limits (time: 30-3600s, diamonds: 0-50000)

### Problem: Scores not showing up

**Solution:**
1. Go to Firebase Console → Firestore Database → Data
2. Check if `leaderboard` collection exists
3. Click into a document to verify data structure
4. If empty, try completing a level again

### Problem: GitHub Pages shows old version

**Solution:**
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Clear browser cache completely
3. Try incognito/private browsing mode
4. Wait 5 minutes for CDN propagation

---

## 📊 Monitoring Your Leaderboard

### View All Scores:
1. Go to Firebase Console
2. Click "Firestore Database"
3. Click "Data" tab
4. Click `leaderboard` collection
5. See all submitted scores!

### Check Usage:
1. Firebase Console → "Usage and billing"
2. Free tier limits:
   - 50,000 reads/day
   - 20,000 writes/day
   - 1 GB storage
3. Your game will stay well within free tier (unless you get 1000+ players/day!)

---

## 🎮 For Players

Once deployed, share this link with friends:
**https://etigerschuss.github.io/ERGo/**

They can:
- Play the game
- Submit their scores automatically
- See the global top 5 for each level
- Compete for fastest times!

---

## 🔐 Security Notes

### Current Setup:
- ✅ Read-only access for everyone (safe)
- ✅ Score validation prevents cheating
- ✅ No personal data collected
- ✅ Anonymous submissions

### Future Improvements (Optional):
- Add player names (input field)
- Add authentication (Google/Email sign-in)
- Add rate limiting (prevent spam)
- Add server-side validation (extra security)

---

## 📈 Next Steps

### After Firebase is working:

1. **Add Player Names:**
   - Add input field in game UI
   - Save name to localStorage
   - Include in score submission

2. **Add More Stats:**
   - Most diamonds earned
   - Most rhodopsins collected
   - Fastest completion per species

3. **Add Achievements:**
   - First to complete all 5 levels
   - Fastest overall time
   - Most efficient path

4. **Add Daily/Weekly Leaderboards:**
   - Filter by timestamp
   - Reset weekly
   - Special rewards

---

## 🆘 Need Help?

### Quick Links:
- **Firebase Documentation:** https://firebase.google.com/docs/firestore
- **Firebase Console:** https://console.firebase.google.com
- **GitHub Pages Settings:** https://github.com/ETigerschuss/ERGo/settings/pages

### Common Questions:

**Q: Is Firebase free?**
A: Yes! Free tier is very generous. Your game will cost $0 unless you get thousands of players.

**Q: Can players cheat?**
A: Security rules prevent impossible scores. For extra security, add server-side validation.

**Q: What if I hit the free tier limits?**
A: Very unlikely unless you go viral. Paid tier is only $25/month and scales automatically.

**Q: Can I see who's playing?**
A: Scores are anonymous. Add authentication if you want user accounts.

**Q: How do I delete fake scores?**
A: Go to Firestore Database → Data → Find document → Click trash icon

---

## ✅ Deployment Checklist

Before pushing to GitHub, verify:

- [ ] Firebase project created
- [ ] Firestore database enabled
- [ ] Security rules configured
- [ ] `firebase-config.js` updated with YOUR config (not placeholders!)
- [ ] Tested locally (scores upload successfully)
- [ ] All files committed to git
- [ ] Pushed to GitHub
- [ ] Waited 2-5 minutes for GitHub Pages deployment
- [ ] Tested on live site
- [ ] Shared link with friends to test multiplayer!

---

## 🎉 You're Done!

Your game now has **global leaderboards**! Players worldwide can compete for the fastest times.

**Live URL:** https://etigerschuss.github.io/ERGo/

Share it and watch the competition heat up! 🔥🏆

---

## 📝 Version History

- **v=107**: Personal best scores per level
- **v=108**: Global leaderboards with Firebase 🌐

---

**Questions or issues?** Check the Firebase Console first, then review this guide!
