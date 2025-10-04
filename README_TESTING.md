# ERGo! - Spectral Vision Game 🐝🪰🦋🪲

## Ready to Test! ✅

The spectral sensitivity system is now fully implemented and ready for testing.

---

## Quick Start

### 1. Open the Game
The game should already be open in your browser at:
**http://localhost:8000**

If not, just open that URL in Chrome/Firefox/Edge.

### 2. HARD REFRESH (Important!)
Press **Ctrl + Shift + R** (or Cmd + Shift + R on Mac) to clear cache and load the new code.

### 3. Select Your Insects
- Pick ONE insect from each family (4 total required)
- Look for the **RGB bars** under each insect showing their color vision
- Different insects have wildly different spectral profiles!

### 4. Explore and Discover
- Click to move insects around the flower image
- Watch how different insects reveal different colors
- Try to combine insects to see the full natural image

---

## What to Look For

### ✨ New Visual Features

**RGB Sensitivity Bars** - Under each insect, you'll see three colored bars:
- 🔴 **Red bar** - Red light sensitivity (rare!)
- 🟢 **Green bar** - Green light sensitivity (common)
- 🔵 **Blue bar** - Blue light sensitivity (moderate)

**Bar height** = How well they see that color (0-100%)

### 🎨 Color Diversity

Different insects reveal different colors:

**🟡 Yellow-tinted reveals:**
- Ant (green-only vision)
- Mosquito (green-only vision)
- Stag Beetle (mostly green)

**🔵 Cyan-tinted reveals:**
- Hoverfly (very strong blue!)
- Hornet (blue-shifted)
- Housefly (cyan-shifted)

**🌈 Natural colors:**
- **Cabbage White** (best - 6 photoreceptors!)
- Horsefly (red + green)
- Rose Chafer (red + green)

### 🧪 Test Combinations

**Poor Coverage (expect weird colors):**
- Ant + Mosquito + Stag Beetle + Ladybug
- All green → Everything looks yellow!

**Balanced (expect decent colors):**
- Hornet + Horsefly + Monarch + Rose Chafer
- Mix of blue, red, green → Better balance

**Optimal (expect natural colors):**
- Hoverfly + Horsefly + Cabbage White + any 4th
- Full RGB coverage → Most realistic flower colors!

---

## How It Works (Science!)

### Photoreceptor Model
Each insect has 1-6 photoreceptor types with peak sensitivities at specific wavelengths:
- **UV**: 340-360nm (can't display on screen, mapped to blue)
- **Blue**: 420-460nm
- **Green**: 515-560nm
- **Red**: 600-640nm (rare in insects!)

### Gaussian Spectral Curves
Real photoreceptors have bell-curve sensitivity, not sharp cutoffs. We calculate overlap with screen RGB phosphors to create realistic weights.

### Why Different Colors?
- **MULTIPLY blend mode** with RGB fog layers
- Each insect erases fog based on their spectral weights
- Remaining fog tints the image
- More insects = more channels revealed = more natural colors

---

## Known Behaviors (Not Bugs!)

✅ **Green is everywhere** - Biologically accurate! Most insects see green best.

✅ **Red is rare** - Only 3 insects have strong red vision (horsefly, cabbage white, rose chafer).

✅ **Areas look colored** - That's the point! You need the right combination to see natural colors.

✅ **Fast insects reveal blurry** - Temporal resolution system (speed vs. ommatidia count).

✅ **Colors differ from reality** - We're simulating insect vision, not human vision!

---

## Troubleshooting

### Everything looks red/weird
- **Hard refresh!** Ctrl + Shift + R
- Clear browser cache completely
- Check browser console (F12) for errors

### Can't see RGB bars
- Make sure you hard refreshed
- Check that insects are selected
- RGB bars are small (8px wide) under each insect emoji

### Insects won't move
- Left-click to set waypoint
- Shift + Click to select multiple insects
- Insects move very slowly (intentional for gameplay)

### Colors still look wrong
- Try different insect combinations
- Remember: Poor team = weird colors (strategic gameplay!)
- Cabbage White should reveal most natural colors

---

## For Developers

### Files Changed
- ✅ `src/data/spectralSensitivity.js` - NEW: Gaussian photoreceptor calculations
- ✅ `src/data/insectDatabaseReal.js` - Added `spectralWeights: {r, g, b}` to all 16 insects
- ✅ `src/scenes/DefogGameAdvanced.js` - Weighted RGB fog system, RGB bar indicators
- ✅ `SPECTRAL_BALANCE.md` - Complete scientific analysis
- ✅ `TESTING_GUIDE.md` - Detailed testing instructions

### Console Debug
Open browser console (F12) and type:
```javascript
// See all spectral weights
Object.entries(INSECT_DATABASE).forEach(([id, data]) => {
    const w = data.spectralWeights;
    console.log(`${data.name}: R=${w.r.toFixed(2)} G=${w.g.toFixed(2)} B=${w.b.toFixed(2)}`);
});
```

### Adjust Balance
Edit `src/data/insectDatabaseReal.js` and modify `spectralWeights` values (0.0 to 1.0).

---

## Feedback Wanted!

Please test and report:
1. ✅ Does color diversity look better than before?
2. ✅ Are RGB bars visible and informative?
3. ✅ Does strategic insect selection matter?
4. ✅ Are the colors balanced (no single color dominates)?
5. ✅ Is it educational and fun?

---

## Version
**ERGo! v2.0 - Spectral Sensitivity System**
October 4, 2025

Implemented by GitHub Copilot with scientific photoreceptor modeling, Gaussian spectral curves, and gameplay-optimized exaggeration (2x factor).

---

**Ready to explore insect vision! 🔬🌸**
