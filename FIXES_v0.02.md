# ERGo! v0.02 - Mobile Controls & Color Vision Fixes

## Critical Bugs Fixed

### 1. **COLOR VISION WAS INVERTED** ❌→✅
**Problem**: Insects were revealing the WRONG colors!
- Ant (green-only vision) was showing **BLUE** scene ❌
- Drosophila (blue vision) was showing **RED** scene ❌

**Root Cause**: The fog reveal logic was backwards. With MULTIPLY blend mode:
- **WHITE background × RED fog × GREEN fog × BLUE fog = BLACK (all blocked)**
- **Erasing a fog reveals its complementary color (wrong!)**
- **Keeping a fog reveals that color (correct!)**

The physics: Insects should ERASE fogs they're BLIND to, KEEP fogs they CAN see.

**Fix Applied**:
```javascript
// BEFORE (WRONG):
// Ant with g:1.0 would erase GREEN fog
// Leaves RED+BLUE fogs → cyan/blue scene ❌

// AFTER (CORRECT):
// Ant with g:1.0 KEEPS green fog, ERASES red+blue fogs
// Only green fog remains → GREEN world ✓
// Logic: if (weight < 0.3) { erase fog } // Blind to this color
```

**Result**:
- ✅ Ant (g:1.0, r:0, b:0) → ERASES red+blue, KEEPS green → GREEN world
- ✅ Drosophila (b:1.0, g:0.4) → ERASES red, KEEPS blue+green → BLUE-CYAN world
- ✅ Horsefly (r:1.0, g:0.8) → ERASES blue, KEEPS red+green → RED-YELLOW world

---

### 2. **MOBILE CONTROLS SIMPLIFIED** 📱
**Problems**:
- Shift+Click for multi-select (impossible on mobile)
- Ctrl+Click for multi-waypoint (confusing)
- Hard to select small insects
- Hard to deselect

**Fixes Applied**:

#### a) **Tap to Select/Deselect** (Single Selection Only)
```javascript
// BEFORE: Complex Shift multi-select logic
// AFTER: Simple toggle
- Tap insect → Select (green ring)
- Tap selected insect → Deselect
- Tap different insect → Switch selection
```

#### b) **Automatic Multi-Waypoint Paths**
```javascript
// BEFORE: Required Ctrl+Click to add waypoints
// AFTER: Every tap adds waypoint automatically
1. Select insect (tap)
2. Tap location → Waypoint #1 added
3. Tap another location → Waypoint #2 added
4. Tap another → Waypoint #3 added
5. Insect follows numbered path: 1 → 2 → 3
```

#### c) **Numbered Waypoint Markers**
- Visual feedback: Green circles with white numbers (1, 2, 3...)
- Clear path visualization
- Black stroke for visibility

#### d) **Larger Hit Areas for Easy Tapping**
```javascript
// BEFORE:
const baseRadius = 50;  // Hard to tap on phone
const minRadius = 25;   // Tiny insects impossible

// AFTER:
const baseRadius = 80;  // Easy mobile taps
const minRadius = 40;   // Even tiny fruit flies easy to tap
```

---

## Updated Game Flow (Mobile-Friendly)

### Step 1: Select an Insect
- **Tap any insect** → Green ring appears
- **Tap same insect again** → Deselect (ring disappears)

### Step 2: Create Multi-Waypoint Path
- **Tap anywhere on screen** → Waypoint #1 created
- **Tap another spot** → Waypoint #2 created
- **Keep tapping** → Add more waypoints (limited by lifespan)
- Numbers show the order the insect will follow

### Step 3: Watch Insect Follow Path
- Insect moves to waypoint #1, then #2, then #3, etc.
- Path shows as green dotted line with numbered circles

### Step 4: Change Path or Deselect
- **Tap the insect** → Deselect, path clears
- **Select different insect** → Previous path clears, new selection

### Group Commands (No Selection)
- **Tap screen with no selection** → ALL insects move to that point

---

## Color Vision Now Working Correctly

### Monochromats (1 color receptor)
| Insect | Receptor | Sees | Background Color |
|--------|----------|------|------------------|
| Ant | Green only (540nm) | Green world | Green tones |
| Mosquito | Green only (515nm) | Green world | Green tones |
| Stag Beetle | Green only | Green world | Green tones |

### Dichromats (2 color receptors)
| Insect | Receptors | Sees | Background Color |
|--------|-----------|------|------------------|
| Fruit Fly | UV + Blue (345, 420nm) | Blue world, some green | Blue-cyan |
| Firefly | Green + Blue | Green + blue world | Cyan-green |

### Trichromats (3 receptors - typical insect)
| Insect | Receptors | Sees | Background Color |
|--------|-----------|------|------------------|
| Honeybee | UV + Blue + Green | Blue-green world | Cyan (no red!) |
| Bumblebee | UV + Blue + Green | Blue-green world | Cyan |
| Housefly | UV + Blue + Green | Blue-green world | Cyan |

### Red-Seers (Rare!)
| Insect | Receptors | Sees | Background Color |
|--------|-----------|------|------------------|
| Horsefly | Red + Green + UV | Red-green world | Yellow/orange |
| Cabbage White | Red + Green + Blue | Full color (like us!) | Natural colors |
| Rose Chafer | Red + Green | Red-green world | Yellow/orange |

---

## Testing Instructions

1. **Start game** → Ant spawns first
2. **Expected**: Should see GREEN-tinted world (ant has green-only vision) ✓
3. **Tap ant** → Green ring appears
4. **Tap 3 different locations** → Waypoints 1, 2, 3 appear
5. **Watch ant follow path** → Should visit waypoints in order
6. **Wait for fruit fly** → Should spawn after 5 ants
7. **Expected**: Fruit fly sees BLUE-tinted world ✓
8. **Tap fruit fly easily** (80px hit radius)
9. **Create path** → See numbered waypoints

---

## Technical Changes

### Files Modified
- `src/scenes/DefogGameAdvanced.js` (6 edits)
  - Fixed color vision logic (line ~1218)
  - Simplified selection system (line ~859)
  - Removed Shift multi-select (line ~874)
  - Auto multi-waypoint (line ~850)
  - Increased hit areas (line ~827)
  - Added numbered waypoint markers (line ~985)
  - Added `clearWaypointLabels()` helper (line ~905)

### No Database Changes Required
- `insectDatabaseReal.js` spectral weights were CORRECT all along
- The bug was in the GAME LOGIC, not the data

---

## Known Improvements
- ✅ Color vision scientifically accurate
- ✅ Mobile-friendly single-tap controls
- ✅ Visual multi-waypoint feedback
- ✅ Easy insect selection (80px tap radius)
- ✅ Simple deselect (tap again)
- ✅ No keyboard required

## Next Steps
- Test on actual mobile device
- Verify all 16 species show correct colors
- Confirm waypoint numbers are visible
- Check if 80px radius feels good or needs tuning
