# 🧪 Testing Guide - Spectral Sensitivity System

## What Changed

### Old System (WRONG ❌)
- 4 discrete fog layers: UV, B, G, R with pure colors
- Insects either saw a channel or didn't (binary)
- Result: Everything looked red because most insects erased UV+B+G, leaving only R fog

### New System (CORRECT ✅)
- 3 weighted fog layers: R, G, B
- Each insect erases proportional to their `spectralWeights` {r, g, b}
- Result: Color diversity based on photoreceptor biology!

---

## How to Test

### 1. Start Game
- Select one insect from each family (you must pick 4 total)
- Watch for the new **RGB bar indicators** next to each insect
  - Red bar = red sensitivity
  - Green bar = green sensitivity  
  - Blue bar = blue sensitivity
  - Bar height = strength (0-1)

### 2. Test Individual Insects

**Green Specialists** (expect yellowish reveal):
- 🐝 Ant - Only green, should reveal yellow-ish areas
- 🪰 Mosquito - Only green, similar to ant

**Blue Specialists** (expect cyan-ish reveal):
- 🐝 Hornet - Strong blue, less red → cyan tones
- 🪰 Hoverfly - Very strong blue → bright cyan

**Red Specialists** (expect natural-ish colors):
- 🪰 Horsefly - Strong red+green, weak blue → warm colors
- 🦋 Cabbage White - **Full spectrum** → most natural colors!
- 🪲 Rose Chafer - Red+green → warm natural

### 3. Compare These Combinations

**Test A - All Green (Poor Coverage)**:
- Ant + Mosquito + Ladybug + Stag Beetle
- Expected: Everything looks **yellow** (no red or blue revealed)

**Test B - Balanced Coverage**:
- Hornet (blue) + Horsefly (red) + Monarch (green) + Rose Chafer (red-green)
- Expected: Much better color diversity, closer to natural

**Test C - Optimal Coverage**:
- Hoverfly (blue) + Horsefly (red) + Cabbage White (full) + any 4th
- Expected: **Best color reproduction** - nearly natural image

### 4. Visual Indicators

Look for the **RGB bars** under each insect:
```
Honeybee:  [small red] [tall green] [medium blue]
Horsefly:  [tall red]  [tall green] [tiny blue]
Mosquito:  [tiny red]  [tall green] [tiny blue]
Hoverfly:  [tiny red]  [tall green] [HUGE blue]
```

### 5. Expected Behaviors

**While Moving**:
- Fast insects (housefly, horsefly) reveal blurry areas immediately
- Slow insects (ant, beetle) need to stop

**Color Tones**:
- Areas visited by ONE insect: **Colored** (missing channels)
- Areas visited by MULTIPLE insects: **More natural** (combined coverage)
- Full team coverage: **Natural flower colors**

---

## Success Criteria

✅ **Visual Diversity**: Different insects reveal different color tones
✅ **Strategic Depth**: Poor team = colorful but unnatural, good team = natural colors
✅ **No Red Dominance**: Old bug where everything was red is fixed
✅ **RGB Bars Visible**: Clear visual feedback of each insect's spectral profile
✅ **Biological Sense**: Green common, blue moderate, red rare

---

## Troubleshooting

**If everything still looks red**:
- Check browser console for errors
- Hard refresh: Ctrl+Shift+R (clear cache)
- Verify spectralWeights are in database

**If all insects look the same**:
- Check that spectralWeights differ between species
- Verify RGB bar heights are different

**If colors look wrong**:
- Remember: MULTIPLY blend mode with RGB fog
- Unerased red fog = cyan appearance
- Unerased green fog = magenta appearance
- Unerased blue fog = yellow appearance

---

## Expected Results by Species

| Insect | Reveals | Missing | Appearance |
|--------|---------|---------|------------|
| Ant | Green only | Red, Blue | **Yellow** tint |
| Mosquito | Green only | Red, Blue | **Yellow** tint |
| Honeybee | Green+Blue | Some Red | **Cyan-green** |
| Bumblebee | Green+Blue | Some Red | **Cyan-green** |
| Hornet | Blue+Green | More Red | **Cyan** tint |
| Housefly | Blue+Green (cyan) | Most Red | **Cyan** tint |
| Hoverfly | STRONG Blue+Green | Most Red | **Strong cyan** |
| Horsefly | Red+Green | Blue | **Yellow-warm** |
| Peacock | Balanced | Minimal | **Fairly natural** |
| Cabbage White | Full RGB | None! | **NATURAL** ✨ |
| Monarch | Green+Blue | Some Red | **Cyan-green** |
| Hawk Moth | Strong Green+Blue | Most Red | **Green** tint |
| Ladybug | Strong Green | Red, Blue | **Yellow-green** |
| Firefly | Green+Blue | Some Red | **Cyan-green** |
| Stag Beetle | Green only | Red, Blue | **Yellow-green** |
| Rose Chafer | Red+Green | Blue | **Warm yellow** |

---

## Quick Test Commands

If you want to analyze the spectral weights programmatically:

```javascript
// In browser console
Object.entries(INSECT_DATABASE).forEach(([id, data]) => {
    const w = data.spectralWeights;
    console.log(`${data.name}: R=${w.r.toFixed(2)} G=${w.g.toFixed(2)} B=${w.b.toFixed(2)}`);
});
```

Expected output should show VARIETY in the weights, not all the same!

---

## Next Steps After Testing

If colors look balanced:
- ✅ Mark testing complete
- Consider adding spectral coverage meter in-game
- Maybe add tooltips explaining why colors look different

If still imbalanced:
- Adjust individual insect `spectralWeights` in database
- Tweak exaggeration factor in spectralSensitivity.js
- Consider adjusting fog alpha levels
