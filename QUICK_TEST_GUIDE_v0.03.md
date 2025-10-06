# Quick Visual Test Guide - v0.03 Updates

## 🎯 What Changed

### Before Launch:
Make sure these 5 image files are in the `assets` folder:
- ✅ `Hymenoptera_Detail_faint.PNG`
- ✅ `Diptera_Detail_faint.PNG`
- ✅ `Lepidoptera_Detail_faint.PNG`
- ✅ `Coleoptera_Detail_faint.PNG`
- ✅ `Drosophila melanogaster drawing.JPG`

---

## 🖼️ Visual Test: Family Selection Screen

### Launch the game and look for these changes:

#### ❌ SHOULD NOT SEE (Removed):
```
❌ 🐜 emoji at top of Hymenoptera panel
❌ 🪰 emoji at top of Diptera panel
❌ 🦋 emoji at top of Lepidoptera panel
❌ 🪲 emoji at top of Coleoptera panel

❌ Yellow text saying "Red Wood Ant"
❌ Yellow text saying "Fruit Fly"
❌ Yellow text saying "Hawk Moth"
❌ Yellow text saying "Stag Beetle"

❌ "Starting Insect:" label
```

#### ✅ SHOULD SEE (New):
```
✅ Scientific illustration image at top of Hymenoptera panel
✅ Scientific illustration image at top of Diptera panel
✅ Scientific illustration image at top of Lepidoptera panel
✅ Scientific illustration image at top of Coleoptera panel

✅ Clean panel with just:
   - Detail image (100×100px)
   - Family name ("Hymenoptera")
   - Attributes (ommatidia, color vision, size, speed)
   - "Click to Start" button
```

---

## 🧪 Test Steps

### Step 1: Launch Game
```
1. Open index.html in browser
2. Click ERGo splash screen
3. → Family selection screen appears
```

### Step 2: Check Hymenoptera Panel (Top-Left)
```
Look for:
✅ Detailed insect illustration (NOT 🐜 emoji)
✅ Text "Hymenoptera"
✅ NO yellow "Red Wood Ant" text
✅ Attributes:
   👁️ 5000 ommatidia
   🎨 G (1 receptors)
   📏 Size: 7.5mm
   ⚡ Speed: 2/5
✅ "Click to Start" button
```

### Step 3: Check Diptera Panel (Top-Right)
```
Look for:
✅ Detailed insect illustration (NOT 🪰 emoji)
✅ Text "Diptera"
✅ NO yellow "Fruit Fly" text
✅ Attributes:
   👁️ 760 ommatidia
   🎨 UV+B (4 receptors)
   📏 Size: 2-3mm
   ⚡ Speed: 3/5
✅ "Click to Start" button
```

### Step 4: Check Lepidoptera Panel (Bottom-Left)
```
Look for:
✅ Detailed insect illustration (NOT 🦋 emoji)
✅ Text "Lepidoptera"
✅ NO yellow "Hawk Moth" text
✅ Attributes visible
✅ "Click to Start" button
```

### Step 5: Check Coleoptera Panel (Bottom-Right)
```
Look for:
✅ Detailed insect illustration (NOT 🪲 emoji)
✅ Text "Coleoptera"
✅ NO yellow "Stag Beetle" text
✅ Attributes visible
✅ "Click to Start" button
```

---

## 🔍 Test "Vinegar Fly" Rename

### Step 6: Click Diptera Panel
```
After clicking "Click to Start" on Diptera:
✅ Species detail screen appears
✅ First card shows "Vinegar Fly (Drosophila)"
✅ NOT "Fruit Fly"
✅ Scientific name: "Drosophila melanogaster"
```

### Step 7: Start Game with Diptera
```
Click "START GAME ▶" button:
✅ Game begins
✅ Console log: Check for "vinegar_fly" (not "fruit_fly")
✅ First insect spawns
✅ Insect labeled as vinegar_fly in debug
```

---

## 🐛 Troubleshooting

### Problem: Images Not Loading
**Symptom**: White boxes or missing images in panels

**Check**:
1. File names match exactly (case-sensitive):
   - `Hymenoptera_Detail_faint.PNG` (uppercase .PNG)
   - `Diptera_Detail_faint.PNG`
   - `Lepidoptera_Detail_faint.PNG`
   - `Coleoptera_Detail_faint.PNG`
   
2. Files are in correct folder:
   ```
   ERGo!\
   └── assets\
       ├── Hymenoptera_Detail_faint.PNG  ✓
       ├── Diptera_Detail_faint.PNG      ✓
       ├── Lepidoptera_Detail_faint.PNG  ✓
       ├── Coleoptera_Detail_faint.PNG   ✓
       └── Drosophila melanogaster drawing.JPG ✓
   ```

3. Check browser console (F12) for errors:
   - Look for 404 errors
   - Look for "Failed to load image" messages

**Fix**: Rename files to match exact case, or update code to match file names

---

### Problem: Still Seeing "Fruit Fly"
**Symptom**: Text shows "Fruit Fly" instead of "Vinegar Fly"

**Check**:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5)
3. Check console for errors
4. Verify insectDatabaseReal.js has "vinegar_fly" key

**Fix**: 
```javascript
// Should be:
vinegar_fly: {
    name: "Vinegar Fly (Drosophila)",
    // ...
}

// NOT:
fruit_fly: {
    name: "Fruit Fly (Drosophila)",
    // ...
}
```

---

### Problem: Still Seeing Yellow Text Overlays
**Symptom**: Yellow species names still appear in panels

**Check**:
1. Clear browser cache
2. Verify StartNew.js doesn't have this code:
   ```javascript
   // This should be REMOVED:
   this.add.text(centerX, pos.y + 123, firstSpecies.name, {
       fontSize: '13px',
       color: '#ffaa00',  // ← Yellow overlay
       fontStyle: 'bold'
   }).setOrigin(0.5);
   ```

**Fix**: Code has been updated - refresh should fix it

---

### Problem: Images Too Faint
**Symptom**: Detail images barely visible

**Options**:
1. **Increase image opacity** in image editor
2. **Use brighter versions** if available
3. **Code fix**: Add tint/alpha adjustment:
   ```javascript
   const detailImage = this.add.image(centerX, pos.y + 50, imageKeys[index]);
   detailImage.setDisplaySize(100, 100);
   detailImage.setAlpha(1.5);  // Brighten (max 1.0 normally, but can try)
   ```

---

## ✅ Success Criteria

### Visual:
- [ ] All 4 panels show detailed illustrations (not emojis)
- [ ] No yellow species names visible
- [ ] Clean, professional appearance
- [ ] Images scale to 100×100px
- [ ] All panels are clickable

### Functional:
- [ ] "Vinegar Fly" appears in Diptera species list
- [ ] Game launches correctly with any family
- [ ] Console shows "vinegar_fly" references
- [ ] No errors in browser console

### Educational:
- [ ] Scientific illustrations visible
- [ ] Correct terminology (vinegar fly, not fruit fly)
- [ ] Family-level organization clear
- [ ] Attributes readable and accurate

---

## 📸 Screenshot Checklist

### Capture These Views:
1. **Family Selection Screen** (main view)
   - All 4 panels visible
   - Detail images showing
   - No yellow text overlays

2. **Diptera Species Detail** (after clicking Diptera)
   - "Vinegar Fly (Drosophila)" as first species
   - Scientific name visible
   - 4 species cards shown

3. **In-Game Console** (F12)
   - Look for "vinegar_fly" references
   - No "fruit_fly" references
   - No image loading errors

---

## 🎮 Quick Test Script

```
1. Launch game
   → Splash screen appears
   
2. Click anywhere on splash
   → Family selection appears
   
3. Visual check:
   ✓ 4 detail images (not emojis)
   ✓ No yellow species names
   ✓ Clean panel layout
   
4. Click "Diptera" panel
   → Species detail appears
   
5. Check first species:
   ✓ "Vinegar Fly (Drosophila)"
   ✓ NOT "Fruit Fly"
   
6. Click "START GAME ▶"
   → Game begins
   
7. Console check (F12):
   ✓ Look for "vinegar_fly"
   ✓ No "fruit_fly" references
   ✓ No errors
   
8. Result: ✅ All updates working!
```

---

## 🎯 Expected Final Look

### Family Selection Screen Layout:
```
┌──────────────────────────────────────────┐
│          ERGo! v0.02-dev                 │
│    Explore the world through insect      │
│               eyes                        │
│                                           │
│        Choose Your Family                 │
│                                           │
│  ┌────────────┐      ┌────────────┐     │
│  │  [IMAGE]   │      │  [IMAGE]   │     │
│  │Hymenoptera │      │  Diptera   │     │
│  │ 👁️ 5000    │      │  👁️ 760    │     │
│  │ 🎨 G       │      │  🎨 UV+B   │     │
│  │ 📏 7.5mm   │      │  📏 2-3mm  │     │
│  │ ⚡ 2/5     │      │  ⚡ 3/5    │     │
│  │[Click to   │      │[Click to   │     │
│  │  Start]    │      │  Start]    │     │
│  └────────────┘      └────────────┘     │
│                                           │
│  ┌────────────┐      ┌────────────┐     │
│  │  [IMAGE]   │      │  [IMAGE]   │     │
│  │Lepidoptera │      │Coleoptera  │     │
│  │ [Attrs]    │      │  [Attrs]   │     │
│  │[Click to   │      │[Click to   │     │
│  │  Start]    │      │  Start]    │     │
│  └────────────┘      └────────────┘     │
└──────────────────────────────────────────┘
```

**Key Features**:
- Clean, scientific appearance
- Detail images replace emojis
- No cluttered text overlays
- Professional educational tool

---

## ✨ What You Accomplished

1. ✅ **Upgraded visuals** from cartoon emojis to scientific illustrations
2. ✅ **Cleaned up UI** by removing redundant yellow text
3. ✅ **Improved accuracy** with correct "Vinegar Fly" terminology
4. ✅ **Enhanced education** with realistic insect morphology
5. ✅ **Maintained functionality** - all features still work

**Result**: A more professional, educational, and scientifically accurate game! 🎓🔬🎮
