# How to Push v0.01 to GitHub Pages

## The Issue:
Your current git installation is missing the `git-remote-https` helper, which prevents pushing via HTTPS.

## Solution Options:

### Option 1: Use GitHub Desktop (EASIEST) ✅
1. Download GitHub Desktop from: https://desktop.github.com/
2. Open GitHub Desktop
3. Add this repository: File → Add Local Repository
4. Select: `c:\Users\serbe\Desktop\hirnkastl\ERGo!\ERGo!`
5. Click "Push origin" button
6. Done! Your site will update in ~1 minute

### Option 2: Install Full Git for Windows
1. Download from: https://git-scm.com/download/win
2. Install with default options
3. Restart VS Code
4. Run: `git push -f origin main`

### Option 3: Manual Upload via GitHub Web Interface
1. Go to: https://github.com/ETigerschuss/ERGo
2. Click "Add file" → "Upload files"
3. Drag and drop ALL files from: `c:\Users\serbe\Desktop\hirnkastl\ERGo!\ERGo!`
4. Commit message: "Update to v0.01 - Working spectral sensitivity version"
5. Click "Commit changes"

---

## What's Ready to Push:

**Main branch is now at v0.01** (commit `035ae3d`)
- ✅ All 16 species working
- ✅ Spectral sensitivity system
- ✅ 4 superfamilies (Hymenoptera, Lepidoptera, Diptera, Coleoptera)
- ✅ Select 1 insect per family
- ✅ Click to control, waypoint system
- ✅ RGB fog layers reveal based on vision
- ✅ Focus mechanics (moving vs stationary)

**Branch structure:**
- `main` → v0.01 (ready to push for your friends)
- `v0.02-dev` → v0.02 work in progress (saved for later)

---

## After Pushing:

Your friends can test at: **https://etigerschuss.github.io/ERGo/**

It should show:
1. Insect selection screen with all 16 species
2. Click 1 insect from each of 4 families
3. Start game
4. Click insects to select them
5. Click elsewhere to set waypoints
6. Watch them reveal the image with their unique color vision!

---

## Recommended: Use GitHub Desktop

It's the simplest way to avoid git command-line issues. Just install it, add the repo, and click "Push". 

Then we can continue fixing v0.02 locally! 🐜
