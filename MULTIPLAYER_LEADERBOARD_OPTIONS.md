# 🏆 Multiplayer Leaderboard Options for ERGo!

## Current Status
✅ **Local high scores work perfectly** - Stored in browser's localStorage
❌ **No global/multiplayer leaderboard yet** - Each player only sees their own scores

## Question: Can Players See Each Other's Highscores?

### Short Answer:
**Not automatically with GitHub Pages alone.** You need to add a backend service to store and share scores across players.

---

## 🌐 Options for Global Leaderboards

### Option 1: **Firebase (Recommended - Free & Easy)**
**Best for:** Quick setup, no backend coding needed

**Pros:**
- ✅ Free tier is generous (50k reads/day, 20k writes/day)
- ✅ Real-time updates (see new scores instantly)
- ✅ No server to maintain
- ✅ Works directly with GitHub Pages
- ✅ Simple JavaScript SDK
- ✅ Built-in security rules

**Setup Steps:**
1. Create Firebase project at https://firebase.google.com
2. Enable Firestore database
3. Add Firebase SDK to your HTML
4. Replace localStorage with Firestore calls

**Estimated Time:** 1-2 hours

**Code Example:**
```javascript
// Write score to global leaderboard
await db.collection('leaderboard').add({
    playerName: 'Anonymous',
    level: 1,
    time: 180,
    diamonds: 12000,
    date: new Date(),
    rhodopsins: { monochrome: 1000, red: 500, green: 300, blue: 200 }
});

// Read top 10 scores
const topScores = await db.collection('leaderboard')
    .orderBy('diamonds', 'desc')
    .limit(10)
    .get();
```

---

### Option 2: **Supabase (Modern Alternative)**
**Best for:** More control, PostgreSQL database

**Pros:**
- ✅ Free tier: 500MB database, 2GB bandwidth
- ✅ PostgreSQL database (more powerful queries)
- ✅ Built-in authentication (optional usernames)
- ✅ Real-time subscriptions
- ✅ Works with GitHub Pages

**Setup Steps:**
1. Create project at https://supabase.com
2. Create `leaderboard` table
3. Add Supabase client to your project
4. Query/insert scores via REST API

**Estimated Time:** 2-3 hours

---

### Option 3: **GitHub Gist as Backend (Hacky but Free)**
**Best for:** Very low traffic, experimental

**Pros:**
- ✅ Completely free
- ✅ No signup needed (use your GitHub account)
- ✅ Works with GitHub Pages

**Cons:**
- ❌ Rate limited (60 requests/hour without auth)
- ❌ Slower than real databases
- ❌ Not designed for this purpose
- ❌ No real-time updates

**How it works:**
Store leaderboard as JSON in a GitHub Gist, update via API.

**Estimated Time:** 3-4 hours

---

### Option 4: **Third-Party Leaderboard Services**
**Options:**
- **LootLocker** (free tier: 100 concurrent users)
- **PlayFab** (Microsoft, free tier available)
- **GameSparks** (AWS, more complex)

**Pros:**
- ✅ Built specifically for games
- ✅ Features like player profiles, achievements

**Cons:**
- ❌ More complex setup
- ❌ Overkill for simple leaderboard

---

### Option 5: **Your Own Backend Server**
**Best for:** Full control, learning backend development

**Options:**
- Node.js + Express + MongoDB Atlas (free tier)
- Python + Flask + SQLite (can host on Heroku/Railway)
- PHP + MySQL (traditional hosting)

**Pros:**
- ✅ Complete control
- ✅ Can add any features you want
- ✅ No vendor lock-in

**Cons:**
- ❌ Need to learn backend development
- ❌ Server maintenance required
- ❌ Hosting costs (though free tiers exist)

**Estimated Time:** 1-2 weeks (if learning from scratch)

---

## 🎯 Recommended Solution: Firebase

### Why Firebase?
1. **Zero backend coding** - Just JavaScript in your frontend
2. **Free tier is enough** for hundreds of players
3. **Real-time updates** - See other players' scores live
4. **Security** - Built-in rules prevent cheating
5. **Scales automatically** if game becomes popular
6. **Works perfectly with GitHub Pages**

### Implementation Plan for Firebase

#### 1. Setup (15 minutes)
```bash
# No installation needed, just add to index.html
```

#### 2. Add to `index.html`:
```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>

<script>
    // Your Firebase config (from Firebase Console)
    const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "ergo-game.firebaseapp.com",
        projectId: "ergo-game",
        storageBucket: "ergo-game.appspot.com",
        messagingSenderId: "123456789",
        appId: "YOUR_APP_ID"
    };
    
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
</script>
```

#### 3. Update High Score Functions:
```javascript
// Save score to both localStorage AND Firebase
async saveHighScoreGlobal(level, time, diamonds, rhodopsins) {
    // Keep local save
    this.saveHighScores();
    
    // Also save to global leaderboard
    try {
        await db.collection('leaderboard').add({
            level: level,
            time: time,
            diamonds: diamonds,
            rhodopsins: rhodopsins,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            playerName: 'Anonymous' // Or ask for name
        });
        console.log('✅ Score uploaded to global leaderboard!');
    } catch (error) {
        console.error('❌ Failed to upload score:', error);
        // Game still works, just no global score
    }
}

// Load global leaderboard
async loadGlobalLeaderboard(level) {
    const snapshot = await db.collection('leaderboard')
        .where('level', '==', level)
        .orderBy('time', 'asc') // Fastest times
        .limit(10)
        .get();
    
    const scores = [];
    snapshot.forEach(doc => {
        scores.push(doc.data());
    });
    return scores;
}
```

#### 4. Show Global + Personal Scores:
- Keep personal best scores (localStorage)
- Add tab/button to view "Global Leaderboard"
- Show top 10 times per level from all players

---

## 🔐 Security Considerations

### Preventing Cheating:
Firebase Security Rules example:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /leaderboard/{score} {
      // Anyone can read
      allow read: if true;
      
      // Only allow reasonable scores
      allow create: if request.resource.data.time > 30 
                    && request.resource.data.time < 3600
                    && request.resource.data.diamonds < 100000;
    }
  }
}
```

### Additional Anti-Cheat:
- Server-side validation (check if time/diamonds ratio is realistic)
- Rate limiting (max 10 submissions per hour per IP)
- Cryptographic signatures (advanced)

---

## 📊 Leaderboard UI Ideas

### Tab System:
```
┌─────────────────────────────────────┐
│  [ Personal Best ]  [ Global Top ]  │
├─────────────────────────────────────┤
│                                     │
│  🏆 Level 1 - Global Leaders       │
│  1. Player123    ⏱️ 2:34  15,000💎│
│  2. SpeedRunner  ⏱️ 2:45  14,500💎│
│  3. BugMaster    ⏱️ 2:50  14,200💎│
│                                     │
└─────────────────────────────────────┘
```

### Combined View:
Show your personal best with highlight:
```
┌─────────────────────────────────────┐
│  Level 1 Leaderboard                │
├─────────────────────────────────────┤
│  1. Player123    ⏱️ 2:34  15,000💎 │
│  2. SpeedRunner  ⏱️ 2:45  14,500💎 │
│  → YOU: 15th     ⏱️ 3:20  12,000💎 ← (highlighted)
│  3. BugMaster    ⏱️ 2:50  14,200💎 │
└─────────────────────────────────────┘
```

---

## 💰 Cost Analysis

### Firebase (Recommended):
- **Free Tier:**
  - 50,000 reads/day
  - 20,000 writes/day
  - 1GB storage
  - 10GB/month bandwidth
  
- **Realistic Usage:**
  - 100 active players/day
  - Each views leaderboard 5 times = 500 reads
  - Each submits 5 scores = 500 writes
  - **Total: Well within free tier!**
  
- **When you'd need to pay:**
  - 1000+ daily active players
  - Still only ~$25/month

### Supabase:
- **Free Tier:**
  - 500MB database
  - 2GB bandwidth
  - Unlimited API requests (rate limited)
  
- **Paid:** $25/month for 8GB database

---

## 🚀 Quick Start Guide (Firebase)

### 1. Create Firebase Project (5 min)
1. Go to https://console.firebase.google.com
2. Click "Add Project"
3. Name it "ERGo-Game"
4. Disable Google Analytics (not needed)
5. Click "Create Project"

### 2. Setup Firestore (3 min)
1. In Firebase Console, click "Firestore Database"
2. Click "Create Database"
3. Choose "Start in test mode" (we'll add security later)
4. Select region closest to your players
5. Click "Enable"

### 3. Get Config (2 min)
1. Click gear icon → Project Settings
2. Scroll to "Your apps"
3. Click web icon (</>)
4. Register app name: "ERGo"
5. Copy the `firebaseConfig` object

### 4. Add to Your Game (30 min)
- Add Firebase SDK to index.html
- Create `firebase-config.js` with your config
- Update high score functions to use Firestore
- Add "Global Leaderboard" button to UI
- Test locally

### 5. Deploy to GitHub Pages (5 min)
- Commit changes
- Push to GitHub
- Wait for GitHub Pages to update
- Test with friends!

---

## 📝 Summary

| Option | Setup Time | Cost | Difficulty | Real-time | Recommended |
|--------|-----------|------|------------|-----------|-------------|
| **Firebase** | 1-2 hrs | Free* | Easy | ✅ Yes | ⭐⭐⭐⭐⭐ |
| Supabase | 2-3 hrs | Free* | Medium | ✅ Yes | ⭐⭐⭐⭐ |
| GitHub Gist | 3-4 hrs | Free | Medium | ❌ No | ⭐⭐ |
| Own Backend | 1-2 wks | Varies | Hard | Depends | ⭐⭐⭐ |

*Free for small/medium games, paid plans available

---

## 🎮 Next Steps

1. **Decide:** Do you want global leaderboards?
2. **Choose:** Firebase (easiest) or Supabase (more features)
3. **Implement:** Follow setup guide above
4. **Test:** Share with friends before going live
5. **Monitor:** Check Firebase usage dashboard weekly

---

## ❓ Questions to Consider

Before implementing:
- **Player names:** Anonymous? Ask for nickname? Email login?
- **Verification:** How to prevent fake scores?
- **Privacy:** Do you need a privacy policy? (GDPR compliance)
- **Moderation:** Who reviews reported scores?
- **Leaderboard types:** Per level? Total? Daily/weekly/all-time?

---

## 📚 Resources

- [Firebase Docs](https://firebase.google.com/docs/firestore)
- [Supabase Docs](https://supabase.com/docs)
- [Phaser + Firebase Tutorial](https://gamedevacademy.org/phaser-3-firebase-tutorial/)
- [Anti-cheat in Web Games](https://www.gabrielgambetta.com/client-side-prediction-server-reconciliation.html)

---

**Need help implementing?** Let me know which option you choose and I can write the complete code! 🚀
