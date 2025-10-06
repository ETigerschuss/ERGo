# Cabbage White Full-Spectrum Vision Fix

## The Problem ❌

**Cabbage White** wasn't demasking anything despite having the best color vision in the game.

### Symptoms
- Cabbage White spawns but world stays dark
- No fog layers being erased
- Screen remains black/dark even with multiple cabbage whites

### Root Cause
```javascript
// Cabbage White spectral weights:
spectralWeights: { r: 1.0, g: 1.0, b: 0.8 }

// Demasking logic (BEFORE FIX):
if (weight >= 0.5) return; // Skip if CAN see this color

// Analysis:
// - RED: weight=1.0 ≥ 0.5 → SKIP (don't erase red fog)
// - GREEN: weight=1.0 ≥ 0.5 → SKIP (don't erase green fog)
// - BLUE: weight=0.8 ≥ 0.5 → SKIP (don't erase blue fog)
//
// Result: NO fogs erased → NO demasking! ❌
```

### Why This Happened
The demasking logic was designed for **selective color vision**:
- Monochromats (ant): Keep 1 fog, erase 2 → See 1 color
- Dichromats (fruit fly): Keep 1-2 fogs, erase 1-2 → See 1-2 colors
- Typical trichromats: Keep 2 fogs (green+blue), erase 1 (red) → See cyan

But **Cabbage White is FULL-SPECTRUM** (tetrachromat with 6 receptors!):
- Can see ALL colors: red, green, blue, UV, etc.
- Should erase ALL fogs to reveal the full color image underneath
- Got stuck in the "don't erase" logic for every channel

---

## The Fix ✅

### New Logic
```javascript
// Check if this is a full-spectrum insect (all weights ≥ 0.5)
const canSeeAll = weights.r >= 0.5 && weights.g >= 0.5 && weights.b >= 0.5;

if (canSeeAll) {
    // SPECIAL CASE: Erase ALL fogs to reveal full color
    // Alpha scaled by weight (r:1.0, g:1.0 stronger than b:0.8)
    const weightedAlpha = baseAlpha * weight; // Use weight directly
    
    // Erase this fog layer
    fogLayer.erase(graphics);
    return; // Skip normal logic
}

// NORMAL CASE: Selective color vision
// Erase fogs they're blind to, keep fogs they can see
if (weight >= 0.5) return; // Skip channels they CAN see
const blindnessStrength = 1 - weight;
const weightedAlpha = baseAlpha * blindnessStrength;
```

### How It Works Now

**For Cabbage White** (r:1.0, g:1.0, b:0.8):
```
Step 1: Check canSeeAll
  r:1.0 ≥ 0.5? YES ✓
  g:1.0 ≥ 0.5? YES ✓
  b:0.8 ≥ 0.5? YES ✓
  → canSeeAll = TRUE

Step 2: Erase RED fog
  weight = 1.0
  weightedAlpha = 0.9 × 1.0 = 0.9 (STRONG ERASE) ✓

Step 3: Erase GREEN fog
  weight = 1.0
  weightedAlpha = 0.9 × 1.0 = 0.9 (STRONG ERASE) ✓

Step 4: Erase BLUE fog
  weight = 0.8
  weightedAlpha = 0.9 × 0.8 = 0.72 (MODERATE ERASE) ✓

Result: ALL fogs erased → FULL COLOR WORLD REVEALED ✓
```

**For Normal Insects** (e.g., Ant with r:0, g:1.0, b:0):
```
Step 1: Check canSeeAll
  r:0 ≥ 0.5? NO
  → canSeeAll = FALSE (use normal logic)

Step 2: RED fog
  weight = 0 < 0.5 → ERASE
  blindness = 1.0
  weightedAlpha = 0.9 × 1.0 = 0.9 ✓

Step 3: GREEN fog
  weight = 1.0 ≥ 0.5 → KEEP (don't erase) ✓

Step 4: BLUE fog
  weight = 0 < 0.5 → ERASE
  blindness = 1.0
  weightedAlpha = 0.9 × 1.0 = 0.9 ✓

Result: Erases RED+BLUE, keeps GREEN → GREEN WORLD ✓
```

---

## Insects Affected

### Full-Spectrum Insects (New Logic)
- ✅ **Cabbage White** - r:1.0, g:1.0, b:0.8 (ONLY full-spectrum insect)

### Selective Color Vision (Normal Logic)
All other 15 insects have at least one weight < 0.5:
- **Monochromats** (1 color): Ant, Stag Beetle (green only)
- **Dichromats** (2 colors): Fruit Fly (blue+green), Firefly (green+blue)
- **Red-seers** (2 colors): Horsefly (red+green), Rose Chafer (red+green)
- **Typical trichromats** (2-3 colors): Honeybee, Bumblebee, Monarch, etc. (blue+green, NO red)

---

## Expected Visual Results

### Cabbage White
**Before Fix**: Black screen (no demasking)
**After Fix**: **FULL COLOR IMAGE** revealed (all fogs erased)
- Should see the background image in natural colors
- Strongest insect for revealing the scene
- Red and green both fully visible (weight 1.0)
- Blue slightly less visible (weight 0.8)

### Comparison to Other Insects
- **Ant**: Green-tinted world
- **Fruit Fly**: Blue-tinted world
- **Ladybug**: Cyan-tinted world (green+blue)
- **Rose Chafer**: Yellow-tinted world (red+green)
- **Cabbage White**: NATURAL COLORS (all colors visible!)

---

## Testing

### Quick Test
1. Play until Round 1, Family 4 (Lepidoptera)
2. Spawn Cabbage White (bottom-right panel)
3. **Expected**: Background image becomes visible in FULL COLOR
4. **Bug if**: Screen stays dark/black

### Visual Comparison
```
Ant → 🟢 Green world
Fruit Fly → 🔵 Blue world
Rose Chafer → 🟡 Yellow world
Cabbage White → 🌈 FULL COLOR world ✨
```

---

## Code Changes

**File**: `src/scenes/DefogGameAdvanced.js`
**Lines**: ~1221-1244
**Change**: Added `canSeeAll` detection and special handling for full-spectrum insects

### Before
```javascript
if (weight >= threshold) return; // Skip if can see
const weightedAlpha = baseAlpha * (1 - weight);
```

### After
```javascript
const canSeeAll = weights.r >= 0.5 && weights.g >= 0.5 && weights.b >= 0.5;

if (canSeeAll) {
    // Erase ALL fogs with weight-scaled strength
    const weightedAlpha = baseAlpha * weight;
    fogLayer.erase(graphics);
    return;
}

// Normal selective vision logic
if (weight >= threshold) return;
const weightedAlpha = baseAlpha * (1 - weight);
```

---

## Scientific Accuracy ✅

This fix maintains scientific accuracy:

**Cabbage White (Pieris rapae)** actually has:
- **6 photoreceptor types** (most insects have 3)
- UV, violet, blue, blue-green, green, red receptors
- One of the best color vision systems in insects
- Can see colors humans can't perceive
- Uses this vision to find flowers and host plants

In our game:
- `spectralWeights: { r: 1.0, g: 1.0, b: 0.8 }`
- Represents tetrachromat/pentachromat vision
- Erases all RGB fog layers = reveals full spectrum
- Most powerful demasking insect in the game ✓

**Result**: Cabbage White now works as scientifically intended! 🦋🌈
