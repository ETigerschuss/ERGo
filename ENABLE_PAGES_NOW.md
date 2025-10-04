# 🚀 SIMPLE 3-STEP GITHUB PAGES SETUP

Your files are ready! Here's exactly what to do:

---

## Step 1️⃣: Enable GitHub Pages (1 minute)

### Click this link:
👉 **https://github.com/ETigerschuss/ERGo/settings/pages**

### Set these EXACTLY:

```
┌─────────────────────────────────────────┐
│ Build and deployment                    │
├─────────────────────────────────────────┤
│ Source: [Deploy from a branch ▼]        │
│                                         │
│ Branch: [main ▼] [/ (root) ▼] [Save]   │
└─────────────────────────────────────────┘
```

**Important:**
- Source: "Deploy from a branch" (NOT "GitHub Actions")
- Branch: "main"
- Folder: "/ (root)" (NOT "/docs")

### Click the blue **Save** button!

---

## Step 2️⃣: Wait for Deployment (2 minutes)

### Watch it deploy:
👉 **https://github.com/ETigerschuss/ERGo/actions**

You'll see:
```
🔵 pages build and deployment (running...)
```

Wait until it shows:
```
✅ pages build and deployment (completed)
```

Usually takes **1-2 minutes**.

---

## Step 3️⃣: Test Your Game!

### Open this link:
👉 **https://etigerschuss.github.io/ERGo/**

**You should see:**
- Black background
- "Select Your Insects" title
- 16 insect cards in a grid
- Spectral coverage preview at bottom

### Send to your friend:
```
https://etigerschuss.github.io/ERGo/
```

They can play on:
- ✅ iPhone (Safari)
- ✅ Android (Chrome)
- ✅ Desktop browser
- ✅ Tablet

---

## 🔍 Troubleshooting

### If you see blank page:

**1. Hard refresh the browser:**
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`
- Mobile: Clear browser cache

**2. Check browser console:**
- Right-click → Inspect → Console tab
- Look for red error messages
- Send me screenshot if errors appear

**3. Verify deployment finished:**
- Go to: https://github.com/ETigerschuss/ERGo/actions
- Make sure green ✅ appears (not 🔵 or ❌)

### If deployment fails (red ❌):

This is rare, but if you see red X:
1. Go back to Settings → Pages
2. Change folder to "/ (root)" again
3. Click Save
4. Wait for new deployment

---

## 📸 Visual Guide

### What Settings Page Should Look Like:

```
GitHub Pages Settings
─────────────────────────────────────

✅ Your site is live at https://etigerschuss.github.io/ERGo/

Build and deployment
  Source
    ○ GitHub Actions (Use a suggested workflow or create your own)
    ● Deploy from a branch

  Branch
    [main ▼] [/ (root) ▼] [Save]

  ⚠️ Make sure it says "main" and "/ (root)"!
```

### What Actions Page Should Look Like:

```
Workflow runs
─────────────────────────────────────

✅ pages build and deployment
   Deploy to GitHub Pages
   main #abc123
   2 minutes ago
```

### What Your Game Should Look Like:

```
┌──────────────────────────────────────────┐
│  ERGo! - Select Your Insects (0/5)       │
├──────────────────────────────────────────┤
│  [Bee]  [Butterfly]  [Dragonfly]  [Fly] │
│  [Ant]  [Wasp]      [Beetle]     [...]  │
│                                          │
│  Spectral Coverage:                      │
│  UV ●  Blue ●●●  Green ●  Red ○          │
│                                          │
│  [Start Game (Need 1+ insects)]          │
└──────────────────────────────────────────┘
```

---

## ✅ Quick Checklist

Before asking for help, check:

```
□ I went to Settings → Pages
□ I selected "Deploy from a branch"
□ I selected "main" branch
□ I selected "/ (root)" folder
□ I clicked Save
□ I waited 2+ minutes
□ I checked Actions tab shows green ✅
□ I hard-refreshed the browser (Ctrl+Shift+R)
□ I tested on https://etigerschuss.github.io/ERGo/
```

---

## 🎯 TL;DR - Just Do This

1. **Go here:** https://github.com/ETigerschuss/ERGo/settings/pages
2. **Set:** Branch = `main`, Folder = `/ (root)`
3. **Click:** Save
4. **Wait:** 2 minutes
5. **Test:** https://etigerschuss.github.io/ERGo/
6. **Share:** Send link to friend!

---

## 💬 Still Need Help?

Tell me:
1. **Did you enable Pages?** (yes/no)
2. **What does Actions tab show?** (green ✅, blue 🔵, or red ❌)
3. **What do you see at** https://etigerschuss.github.io/ERGo/ **(blank, error, or working?)**

I'll help you fix it! 🐛
