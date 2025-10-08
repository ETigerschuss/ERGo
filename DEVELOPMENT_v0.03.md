# ERGo! v0.03 - Development Notes

## Version Overview
**Focus**: Game interface redesign showing all species per family

## Key Changes from v0.02

### 1. Family Selection Screen Rearrangement
**File**: `src/scenes/StartNew.js`

- **New Layout** (matching game positions):
  - **Top-Left**: Diptera 🪰 (Mosquito, Fruit Fly, Housefly, Horsefly)
  - **Top-Right**: Lepidoptera 🦋 (Hawk Moth, Peacock, Monarch, Cabbage White)
  - **Bottom-Left**: Hymenoptera 🐝 (Ant, Honeybee, Bumblebee, Hornet)
  - **Bottom-Right**: Coleoptera 🪲 (Stag Beetle, Firefly, Ladybug, Rose Chafer)

- **Visual Changes**:
  - Removed family name text (space optimization)
  - Larger emoji (48px → 56px) to compensate
  - Smaller panels (240×250 → 220×220)
  - More compact layout

### 2. Game Interface - Species Boxes
**File**: `src/scenes/DefogGamev0.03.js`

- **All 16 species visible** (4 families × 4 species each)
- **Corner positions match selection screen**
- **2×2 grid per family** in each corner
- **Box dimensions**: 68×60 pixels with 2px spacing
- **Interactive boxes** with hover effects

### 3. Short Species Names
Space-efficient naming for UI:
- "European Hornet" → "Hornet"
- "Vinegar Fly" → "Fruit Fly"
- "Cabbage White" → "Cabbage W."
- Other names shortened appropriately

### 4. Selection Feedback
- Click any species box to select
- Shows temporary popup with:
  - Species name
  - Color vision type
  - Ommatidia count
- Auto-hides after 2 seconds

## Visual Design

### Family Corners Layout
```
┌─────────────────────────────────┐
│ Diptera       Lepidoptera       │
│ 🦟 🪰          🦋 🦋             │
│ 🪰 🪰          🦋 🦋             │
│                                 │
│                                 │
│                                 │
│ Hymenoptera   Coleoptera        │
│ 🐜 🐝          🪲 🪲             │
│ 🐝 🐝          🐞 🪲             │
└─────────────────────────────────┘
```

### Box States
- **Default (selected family)**: Dark blue (#16213e) with green border
- **Default (other families)**: Very dark (#0f1520) with gray border
- **Hover**: Lighter blue (#1a2a4a) with cyan border
- **Interactive**: All boxes clickable with cursor change

## Technical Details

### Species Organization
```javascript
const speciesByFamily = [
    ['ant', 'honeybee', 'bumblebee', 'hornet'],              // [0] Hymenoptera
    ['mosquito', 'vinegar_fly', 'housefly', 'horsefly'],     // [1] Diptera
    ['hawk_moth', 'peacock', 'monarch', 'cabbage_white'],    // [2] Lepidoptera
    ['stag_beetle', 'firefly', 'ladybug', 'rose_chafer']     // [3] Coleoptera
];
```

### Corner Positions
```javascript
const cornerPositions = [
    { x: 10, y: 520, name: 'Hymenoptera' },    // Bottom-left
    { x: 10, y: 10, name: 'Diptera' },         // Top-left  
    { x: 990, y: 10, name: 'Lepidoptera' },    // Top-right
    { x: 990, y: 520, name: 'Coleoptera' }     // Bottom-right
];
```

## Files Modified

1. **src/main.js**
   - Updated import to use `DefogGamev0.03.js`

2. **src/scenes/StartNew.js**
   - Rearranged family positions
   - Removed family name text
   - Increased emoji size
   - Reduced panel size
   - Updated version to v0.03-dev

3. **src/scenes/DefogGamev0.03.js** (NEW)
   - Complete rewrite of game interface
   - All 16 species visible in corners
   - Matching positions to family selection
   - Interactive selection system

## Next Steps for v0.04

Potential features to implement:
- [ ] Actual insect movement and revelation mechanics
- [ ] Species unlocking progression
- [ ] Visual feedback for active species
- [ ] Statistics display (time, coverage, etc.)
- [ ] Multiple simultaneous insects per species
- [ ] Color revelation system integration
- [ ] Sound effects for selections
- [ ] Tutorial/help overlay

## Testing Checklist

- [x] Family selection screen shows correct layout
- [x] All 4 families in correct corners
- [x] Game scene loads without errors
- [x] All 16 species boxes visible
- [x] Corner positions match selection screen
- [x] Species selection shows feedback
- [x] Hover effects work correctly
- [x] Selected family highlighted in green
- [ ] Test with different family selections
- [ ] Verify all emojis display correctly
- [ ] Check on different screen sizes

## Known Issues
None currently - all features working as designed.

## Performance Notes
- No performance issues
- All interactive elements responsive
- Smooth hover transitions
- Clean scene loading

---
**Version**: 0.03-dev  
**Date**: October 8, 2025  
**Status**: Ready for testing and iteration
