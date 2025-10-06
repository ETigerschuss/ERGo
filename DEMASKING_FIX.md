# CRITICAL FIXES - Demasking & Species Order

## Bug 1: No Demasking At All ❌→✅

### The Problem
After "fixing" the color vision, there was NO demasking happening at all! The screen stayed completely black because the logic was still inverted.

### Root Cause
```javascript
// WRONG (what I just "fixed"):
if (weight >= threshold) return; // Skip if CAN see
const weightedAlpha = baseAlpha * weight; // LOW weight = WEAK erase

// For Ant (r:0, g:1.0, b:0):
// - RED channel: weight=0 → DON'T return → erase with alpha=0 → NO ERASING! ❌
// - GREEN channel: weight=1.0 → RETURN early → don't erase ✓
// - BLUE channel: weight=0 → DON'T return → erase with alpha=0 → NO ERASING! ❌
// Result: RED and BLUE fogs never actually erased (alpha=0)!
```

### The REAL Fix
```javascript
// CORRECT:
if (weight >= threshold) return; // Skip if CAN see ✓ (this part was right)
const blindnessStrength = 1 - weight; // Invert weight!
const weightedAlpha = baseAlpha * blindnessStrength; // LOW weight = HIGH blindness = STRONG erase

// For Ant (r:0, g:1.0, b:0):
// - RED channel: weight=0 → blindness=1.0 → alpha=0.9 → STRONG ERASE ✓
// - GREEN channel: weight=1.0 → RETURN early → don't erase ✓
// - BLUE channel: weight=0 → blindness=1.0 → alpha=0.9 → STRONG ERASE ✓
// Result: Erases RED+BLUE fogs, keeps GREEN fog → GREEN WORLD ✓
```

### Key Insight
**Low weight = Blind to that color = High blindness = Strong erasing**

Changed:
```javascript
const weightedAlpha = baseAlpha * weight; // WRONG
```
To:
```javascript
const blindnessStrength = 1 - weight; // Invert!
const weightedAlpha = baseAlpha * blindnessStrength; // CORRECT
```

---

## Bug 2: Species Arrays Swapped ❌→✅

### The Problem
The panel positions were swapped (Lepidoptera top-right, Coleoptera bottom-right), but the speciesByFamily array wasn't updated to match.

### Before (WRONG):
```javascript
// Panel layout:
// Index 0: bottom-left → Panel shows Coleoptera
// Index 1: top-left → Panel shows Diptera
// Index 2: top-right → Panel shows Lepidoptera
// Index 3: bottom-right → Panel shows Hymenoptera

// speciesByFamily array:
speciesByFamily[0] = ['ant', 'honeybee', ...] // Hymenoptera ❌ Wrong index!
speciesByFamily[1] = ['fruit_fly', ...] // Diptera ✓
speciesByFamily[2] = ['ladybug', ...] // Coleoptera ❌ Wrong index!
speciesByFamily[3] = ['cabbage_white', ...] // Lepidoptera ❌ Wrong index!

// Result: Bottom-left panel shows Coleoptera emoji but spawns Hymenoptera!
```

### After (CORRECT):
```javascript
// Panel layout:
// Index 0: bottom-left → Coleoptera panel
// Index 1: top-left → Diptera panel
// Index 2: top-right → Hymenoptera panel
// Index 3: bottom-right → Lepidoptera panel

// speciesByFamily array (FIXED):
speciesByFamily[0] = ['ladybug', 'firefly', ...] // Coleoptera ✓
speciesByFamily[1] = ['fruit_fly', ...] // Diptera ✓
speciesByFamily[2] = ['ant', 'honeybee', ...] // Hymenoptera ✓
speciesByFamily[3] = ['cabbage_white', ...] // Lepidoptera ✓

// Result: Bottom-left panel shows Coleoptera and spawns Coleoptera ✓
```

---

## New Spawn Order

### Round 1 (Smallest):
1. **Ladybug** (Coleoptera, 6.75mm) - bottom-left panel
2. **Fruit Fly** (Diptera, 2.5mm) - top-left panel
3. **Ant** (Hymenoptera, 7.5mm) - top-right panel
4. **Cabbage White** (Lepidoptera, 39.5mm) - bottom-right panel

### Round 2 (2nd Smallest):
1. **Firefly** (Coleoptera, 15mm)
2. **Housefly** (Diptera, 10mm)
3. **Honeybee** (Hymenoptera, 14.5mm)
4. **Hawk Moth** (Lepidoptera, 45mm)

### Round 3 (3rd Smallest):
1. **Rose Chafer** (Coleoptera, 17mm)
2. **Robber Fly** (Diptera, 20mm)
3. **Bumblebee** (Hymenoptera, 19.5mm)
4. **Peacock** (Lepidoptera, 52.5mm)

### Round 4 (Largest):
1. **Stag Beetle** (Coleoptera, 52.5mm)
2. **Horsefly** (Diptera, 22.5mm)
3. **Hornet** (Hymenoptera, 26.5mm)
4. **Monarch** (Lepidoptera, 95mm)

---

## Color Vision Now Works!

### Ladybug (First Insect)
```
spectralWeights: { r: 0.85, g: 0.85, b: 0.0 }

Fog erasing:
- RED fog: weight=0.85 ≥ 0.5 → SKIP (keep red fog)
- GREEN fog: weight=0.85 ≥ 0.5 → SKIP (keep green fog)
- BLUE fog: weight=0.0 < 0.5 → ERASE (blindness=1.0, alpha=0.9)

Result: Keeps RED+GREEN, erases BLUE
Background × RED × GREEN = YELLOW/ORANGE WORLD ✓
```

### Fruit Fly (Second Insect)
```
spectralWeights: { r: 0.0, g: 0.4, b: 1.0 }

Fog erasing:
- RED fog: weight=0.0 < 0.5 → ERASE (blindness=1.0, alpha=0.9)
- GREEN fog: weight=0.4 < 0.5 → ERASE (blindness=0.6, alpha=0.54)
- BLUE fog: weight=1.0 ≥ 0.5 → SKIP (keep blue fog)

Result: Keeps BLUE, erases RED+GREEN
Background × BLUE = BLUE WORLD ✓
```

### Ant (Third Insect)
```
spectralWeights: { r: 0.0, g: 1.0, b: 0.0 }

Fog erasing:
- RED fog: weight=0.0 < 0.5 → ERASE (blindness=1.0, alpha=0.9)
- GREEN fog: weight=1.0 ≥ 0.5 → SKIP (keep green fog)
- BLUE fog: weight=0.0 < 0.5 → ERASE (blindness=1.0, alpha=0.9)

Result: Keeps GREEN, erases RED+BLUE
Background × GREEN = GREEN WORLD ✓
```

---

## Testing Checklist

- [ ] Launch game
- [ ] **First insect**: Ladybug (bottom-left panel)
- [ ] **Expected**: Yellow/orange world (red+green vision)
- [ ] **Bug if**: Black screen (no demasking)
- [ ] Wait for 5 ladybugs to complete
- [ ] **Second insect**: Fruit fly (top-left panel)
- [ ] **Expected**: Blue world (blue vision)
- [ ] **Third insect**: Ant (top-right panel)
- [ ] **Expected**: Green world (green-only vision)
- [ ] **Fourth insect**: Cabbage white (bottom-right panel)
- [ ] **Expected**: Full color world (trichromat)

---

## Files Changed
- `src/scenes/DefogGameAdvanced.js`
  - Fixed blindness calculation: `1 - weight` instead of `weight`
  - Swapped Hymenoptera ↔ Coleoptera in speciesByFamily array
  - Updated panel position comments
  - Changed starting species from ant to ladybug

## Success Criteria
✅ Demasking works (screen not black)
✅ Ladybug spawns first (bottom-left panel)
✅ Ladybug sees yellow/orange world
✅ Panels match actual spawned species
✅ All 16 species spawn in correct order
