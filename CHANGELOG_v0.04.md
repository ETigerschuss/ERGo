# ERGo! v0.04 - Release Notes

## 🎮 Play the Game
**Live Demo:** https://etigerschuss.github.io/ERGo/

## 📋 Major Features

### 1. **Rhodopsin System** 🧬
- Renamed "currency/spectrals" to **"Rhodopsin"** for biological accuracy
- Rhodopsin = light-sensitive proteins in photoreceptor cells
- More educational and scientifically sound terminology

### 2. **Unlock-Once Mechanic** 🔓
- **First unlock**: Pay rhodopsin cost to unlock a species
- **Subsequent spawns**: **FREE** - no cost to spawn additional insects!
- Species show "✓ FREE" after unlocking
- Unlocked species always appear available (green border)

### 3. **Biological Species Information** 📊
Species selection now shows real biological specs instead of costs:
- 👁️ Ommatidia count
- 🎨 Color vision spectrum (UV/R/G/B)
- 📡 Receptor types
- 🌈 Spectral sensitivity percentages
- 📏 Physical size
- ⚡ Speed rating
- ⏱️ Lifespan

### 4. **Improved Balance** ⚖️
**Rhodopsin Earning Rates:**
- 🟢 Green: ÷30 (easiest)
- 🔴 Red: ÷35
- 🔵 Blue: ÷26 (fastest)
- ⚫ Monochrome: ÷8

**Defog Radius:**
- Increased by 50% for all insects
- Faster exploration and gameplay

**Silent Unlock:**
- Color rhodopsins unlock automatically at 100 monochrome
- No interrupting popup messages

### 5. **Critical Bug Fixes** 🐛
**Fixed: Monochrome "Stealing" Color Currency**
- Separated pixel tracking: `revealedPixelsMono` + `revealedPixelsColor`
- Now each pixel can award BOTH monochrome AND color rhodopsin independently
- Fair economy regardless of insect order

### 6. **Timer & Scoring System** ⏱️
- Real-time timer during gameplay
- Diamond rewards for fast completion
- Restart Level button
- Top 10 highscores by diamonds
- Top 5 fastest times
- LocalStorage persistence

### 7. **Performance Optimizations** 🚀
- Adaptive frame skipping based on insect count:
  - 40+ insects: Skip 3/4 frames
  - 30+ insects: Skip 2/3 frames  
  - 20+ insects: Skip 1/2 frames
- Performance guide document created

## 🎨 UI Improvements
- Dark background for species selection screen
- Cost indicators hide after unlock
- "FREE" text for unlocked species
- Improved affordability highlighting
- Better visual feedback

## 📁 New Files
- `src/scenes/DefogGamev0.04.js` - Main game scene (4077 lines)
- `src/systems/Currency.js` - Rhodopsin management system
- `src/systems/Collectible.js` - Collectible item system
- `PERFORMANCE_OPTIMIZATION_GUIDE.md` - Optimization strategies

## 🔧 Technical Details

**Cache Version:** v=086

**Major Code Changes:**
- 7 files changed
- 5,267 insertions
- 52 deletions

## 🎯 Game Balance Summary

**Starting Resources:**
- 10 ⚫ Monochrome rhodopsin

**Unlock Progression:**
- Use monochrome insects to earn more monochrome
- At 100 monochrome → Color rhodopsins unlock automatically
- Use color insects to earn 🟢🔴🔵 rhodopsins
- Unlock more species with accumulated rhodopsins

**Conversion Chain:**
- Every 100 ⚫ → 10 🟢 + 2 🔴
- Every 100 🟢 → 10 🔵
- Every 100 🔵 → 10 🔴

## 🙏 Credits
Developed with extensive balancing and testing feedback.

---

**Previous Version:** https://etigerschuss.github.io/ERGo/ (v0.03)
**Current Version:** https://etigerschuss.github.io/ERGo/ (v0.04)
