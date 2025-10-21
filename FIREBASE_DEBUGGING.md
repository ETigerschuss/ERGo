# Firebase Score Upload Debugging Guide

## 🔍 How to Check Why Scores Aren't Saving

### Step 1: Check Browser Console
1. Open https://etigerschuss.github.io/ERGo/
2. Press **F12** to open Developer Tools
3. Click on **"Console"** tab
4. Complete a level to trigger a score save
5. Look for messages starting with:
   - `📤 Uploading score to Firebase...` = Upload attempted
   - `✅ SUCCESS! Score uploaded...` = Upload worked!
   - `❌ FAILED to upload score to Firebase!` = Upload failed

### Step 2: Common Error Messages and Fixes

#### ❌ "permission-denied"
**Problem**: Firestore security rules are blocking writes

**Solution**:
1. Go to https://console.firebase.google.com
2. Select project: **ergo-10d24**
3. Click **"Firestore Database"** in left menu
4. Click **"Rules"** tab at the top
5. Copy and paste these rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read and write for testing
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

6. Click **"Publish"** button
7. Wait for deployment (usually 1-2 minutes)
8. Try submitting a score again

#### ❌ "failed-precondition"
**Problem**: Firestore database not fully initialized

**Solution**:
1. Go to https://console.firebase.google.com
2. Select **ergo-10d24** project
3. Click **"Firestore Database"** 
4. If you see a blue button **"Create database"**, click it
5. Choose **"Start in test mode"**
6. Choose location: **Europe** (or nearest to you)
7. Click **"Enable"**
8. Wait for initialization, then try again

#### ❌ "unauthenticated"
**Problem**: Authentication required (shouldn't happen with test mode)

**Solution**: Same as "permission-denied" - update security rules to allow anonymous writes

#### ⚠️ Firebase not initialized at all
**Problem**: Firebase SDK didn't load or initialize

**Solution**:
1. Check that `firebase-config.js` is loading (check Network tab in DevTools)
2. Verify in console that you see: `✅ Firebase initialized successfully!`
3. If not, check index.html has correct Firebase SDK script tags

### Step 3: Check Firestore Database

After fixing rules and submitting a score:

1. Go to https://console.firebase.google.com
2. Select **ergo-10d24** project
3. Click **"Firestore Database"**
4. Click **"Collections"** tab
5. Look for **"leaderboard"** collection
6. Click on it to see stored documents

You should see documents with fields:
- `level`: 1-5
- `time`: milliseconds
- `diamonds`: score
- `timestamp`: server timestamp
- `version`: 0.04

---

## 🛠️ Testing Checklist

- [ ] Complete a level in game
- [ ] Check browser console for upload messages
- [ ] Open Firestore Console and verify document was created
- [ ] Check that local scores are also saving (localStorage)
- [ ] Try different levels to see if all upload correctly
- [ ] Check that global leaderboard displays scores

---

## 📋 Current Setup Status

**Project**: ergo-10d24  
**Firebase SDK**: compat version (v10.7.1)  
**Database**: Firestore  
**Security Rules**: Need to be set to allow writes  
**Collection**: leaderboard  

---

## ⚡ Quick Fix (Most Likely Solution)

The most common issue is **Firestore Security Rules**. They're probably still in default restrictive mode.

### Fastest Fix:
1. Open Firebase Console: https://console.firebase.google.com
2. Go to **ergo-10d24** project → **Firestore Database** → **Rules**
3. Paste this:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```
4. Click **Publish**
5. Wait 1-2 minutes
6. Try uploading a score again

That's it! Your scores should now save online.

---

## 🔒 Future Security Note

For production, replace the rules above with:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /leaderboard/{document=**} {
      // Only allow reads, writes limited to prevent spam
      allow read: if true;
      allow write: if request.auth == null;
    }
  }
}
```

This allows anonymous writes but could use rate limiting for production.
