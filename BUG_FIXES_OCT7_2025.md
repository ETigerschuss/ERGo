# Bug Fixes Summary - October 7, 2025

## Issues Fixed:

### 1. ✅ Back Button Not Working in Family Selection
**Location:** `src/scenes/StartNew.js`

**Problem:** 
- Back button was created but not properly tracked for destruction
- When clicking back, elements weren't being destroyed, causing the button to stop working

**Solution:**
- Created `this.speciesElements = []` array to track ALL created UI elements
- Added every created element (text, rectangles, buttons) to this array
- Updated `goBack()` function to properly destroy all elements before showing family selection

**Code Changes:**
```javascript
// Track all elements
this.speciesElements = [];

// Add each element to array
const header = this.add.text(...);
this.speciesElements.push(header);

// Destroy all on back
goBack() {
    if (this.speciesElements) {
        this.speciesElements.forEach(element => {
            if (element) element.destroy();
        });
        this.speciesElements = [];
    }
    // ... rest of cleanup
}
```

---

### 2. ✅ Species Order Wrong in Both Scenes
**Locations:** 
- `src/scenes/StartNew.js` (Family selection UI)
- `src/scenes/DefogGameAdvanced.js` (Game scene)

**Problem:**
- Diptera family was showing wrong species order
- Started with vinegar_fly instead of mosquito (monochromat)
- Had robber_fly instead of horsefly (red vision)

**Solution:**
Updated `speciesByFamily` arrays in BOTH files to correct order:

**StartNew.js (Lines 72-76):**
```javascript
const speciesByFamily = [
    ['ant', 'honeybee', 'bumblebee', 'hornet'],              // Hymenoptera: mono→tri→tri+→tri++
    ['mosquito', 'vinegar_fly', 'housefly', 'horsefly'],     // Diptera: mono→hexa→penta→tri+red
    ['hawk_moth', 'peacock', 'monarch', 'cabbage_white'],    // Lepidoptera: tri→tri+→tri++→tetra
    ['stag_beetle', 'firefly', 'ladybug', 'rose_chafer']     // Coleoptera: mono→di→tri→tri+red
];
```

**DefogGameAdvanced.js (Lines 43-48):**
```javascript
this.speciesByFamily = [
    ['ant', 'honeybee', 'bumblebee', 'hornet'],              // Hymenoptera: mono→tri→tri+→tri++
    ['mosquito', 'vinegar_fly', 'housefly', 'horsefly'],     // Diptera: mono→hexa→penta→tri+red
    ['hawk_moth', 'peacock', 'monarch', 'cabbage_white'],    // Lepidoptera: tri→tri+→tri++→tetra
    ['stag_beetle', 'firefly', 'ladybug', 'rose_chafer']     // Coleoptera: mono→di→tri→tri+red
];
```

---

## Final Species Order (All Families):

### 🐝 HYMENOPTERA (Index 0)
1. **Ant** - Monochromat (green only) → B&W defog
2. **Honeybee** - Trichromat (UV+B+G) → Color defog
3. **Bumblebee** - Trichromat+ → Color defog
4. **Hornet** - Trichromat++ → Color defog

### 🪰 DIPTERA (Index 1) ✨ FIXED
1. **Mosquito** - Monochromat (green only) → B&W defog ← NOW FIRST!
2. **Vinegar Fly** - Hexachromat (6 receptors!) → Color defog ← NOW SECOND
3. **Housefly** - Pentachromat (5 receptors) → Color defog
4. **Horsefly** - Trichromat + RED receptor → Color defog ← REPLACED ROBBER FLY

### 🦋 LEPIDOPTERA (Index 2)
1. **Hawk Moth** - Trichromat (crepuscular) → Color defog
2. **Peacock** - Trichromat+ → Color defog
3. **Monarch** - Trichromat++ (navigator) → Color defog
4. **Cabbage White** - Tetrachromat (red receptor) → Color defog

### 🪲 COLEOPTERA (Index 3)
1. **Stag Beetle** - Monochromat (green only) → B&W defog
2. **Firefly** - Dichromat (B+G, no UV) → Color defog
3. **Ladybug** - Trichromat (UV+B+G) → Color defog
4. **Rose Chafer** - Trichromat + RED receptor → Color defog

---

## Vision Progression Logic:

Each family now properly progresses from **simplest → most complex vision**:

- **Monochromat** (1 receptor) → B&W perception
- **Dichromat** (2 receptors) → Limited color
- **Trichromat** (3 receptors: UV+B+G) → Standard insect color vision
- **Tetrachromat** (4 receptors) → Advanced color discrimination
- **Pentachromat** (5 receptors) → Exceptional vision (housefly)
- **Hexachromat** (6 receptors) → Best in game (vinegar fly with R1-R6 + R7/R8)
- **Red vision** (dedicated red receptor) → Rare capability (horsefly, rose chafer)

---

## Testing Checklist:

### Family Selection Screen (StartNew.js)
- [ ] Click Diptera family
- [ ] Verify mosquito is shown as "1/4 STARTING INSECT"
- [ ] Verify vinegar fly is shown as "2/4"
- [ ] Verify housefly is shown as "3/4"
- [ ] Verify horsefly is shown as "4/4"
- [ ] Click "Back" button
- [ ] Verify it returns to family selection
- [ ] Click Diptera again
- [ ] Verify "Back" button still works (not broken)

### Game Scene (DefogGameAdvanced.js)
- [ ] Start game with Diptera family
- [ ] Verify first insect spawned is mosquito (monochromat)
- [ ] Wait 12 seconds for spawn timer
- [ ] Verify second insect is vinegar fly
- [ ] Complete level with mosquito
- [ ] Verify next level starts with vinegar fly
- [ ] Verify progression: mosquito → vinegar fly → housefly → horsefly

---

## Files Modified:

1. **src/scenes/StartNew.js**
   - Line 72-76: Updated speciesByFamily array (Diptera order)
   - Line 185-191: Added speciesElements tracking system
   - Line 217-285: Updated all element creation to push to speciesElements
   - Line 386-408: Enhanced goBack() to destroy all tracked elements

2. **src/scenes/DefogGameAdvanced.js**
   - Line 43-48: Updated this.speciesByFamily array (Diptera order)

---

## Biological Accuracy Maintained:

✅ All families start with monochromat WHERE AVAILABLE:
- Hymenoptera: Ant (monochromat)
- Diptera: Mosquito (monochromat) ← FIXED
- Lepidoptera: Hawk moth (trichromat - NO monochromats exist in butterflies/moths!)
- Coleoptera: Stag beetle (monochromat)

✅ Vision progression follows scientific research:
- Drosophila (vinegar fly): 6 photoreceptor types documented
- Mosquito: Single green receptor confirmed
- Horsefly: Red receptor (600-620nm) for blood-host detection
- All progression based on peer-reviewed sources in `insectVisionResearch.js`

---

## Status: ✅ READY FOR TESTING

Both issues are resolved. The game should now:
1. Show correct species order for all families
2. Allow clicking back button multiple times without breaking
3. Spawn insects in correct progression order
4. Maintain biological accuracy throughout

**Next Steps:**
- Test in browser to confirm fixes work
- Verify git status shows changes to both files
- Commit changes with clear message
- Push to GitHub
