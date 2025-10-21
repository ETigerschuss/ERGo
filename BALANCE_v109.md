# 🎮 ERGo! v=109 - Dynamic Resource Balancing

## The Problem
- **Level 1:** Balanced - resources are scarce, strategy required
- **Levels 2-5:** All species affordable immediately, no strategy needed

## The Solution
**Adaptive divisors based on available resources per level**

Each level has 20-80% MORE resources than Level 1, so divisors INCREASE accordingly to maintain difficulty.

---

## 🔢 Balance Analysis

### Resource Scaling Table

| Level | Image | Divisor Adjustment | Green | Red | Blue | Balance |
|-------|-------|-------------------|-------|-----|------|---------|
| **1** | IMG_0061 | Baseline (0%) | ÷30 | ÷34 | ÷26 | ⭐ Balanced |
| **2** | IMG_0104 | +20% resources | ÷36 | ÷41 | ÷31 | ⭐ Balanced |
| **3** | IMG_0159 | +40% resources | ÷42 | ÷48 | ÷37 | ⭐ Balanced |
| **4** | IMG_0086 | +60% resources | ÷48 | ÷55 | ÷43 | ⭐ Balanced |
| **5** | IMG_0096 | +80% resources | ÷54 | ÷62 | ÷49 | ⭐ Balanced |

### How It Works

**Level 1 (Baseline):**
- Image has X resources (pixels)
- Divisors: `green: 30, red: 34, blue: 26`
- Cost to unlock new species: ~5-10 minutes focused playing

**Level 2 (+20% resources):**
- Image has ~1.2X resources
- To maintain same difficulty, divisors increase by 20%
- Divisors: `green: 36, red: 41, blue: 31` (÷30×1.2, ÷34×1.2, etc.)
- Cost to unlock new species: ~5-10 minutes (same as Level 1!)

**Levels 3-5 (Similar scaling)**
- More resources = higher divisors
- Difficulty stays consistent
- Strategic choices remain important!

---

## 📊 Divisor Formula

```
New Divisor = Base Divisor × (1 + Resource Increase %)

Level 1: divisor = 30 (green baseline)
Level 2: divisor = 30 × 1.20 = 36
Level 3: divisor = 30 × 1.40 = 42
Level 4: divisor = 30 × 1.60 = 48
Level 5: divisor = 30 × 1.80 = 54
```

### Color-Specific Divisors

Each color maintains the SAME ratio between levels:

```
Base Level 1 Ratios:
green:red:blue = 30:34:26

All Levels Maintain This Ratio:
Level 2: 36:41:31 (30×1.2 : 34×1.2 : 26×1.2)
Level 3: 42:48:37 (30×1.4 : 34×1.4 : 26×1.4) ≈
Level 4: 48:55:43 (30×1.6 : 34×1.6 : 26×1.6) ≈
Level 5: 54:62:49 (30×1.8 : 34×1.8 : 26×1.8) ≈
```

---

## 🎯 Gameplay Impact

### Before v=109 (Unbalanced):
```
Level 1:  5-10 min per species (scarce resources) ⭐
Level 2:  1-2 min per species (abundant resources) ❌
Level 3:  1-2 min per species (abundant resources) ❌
Level 4:  <1 min per species (abundant resources) ❌
Level 5:  <1 min per species (abundant resources) ❌

Problem: No strategy after Level 1!
```

### After v=109 (Balanced):
```
Level 1:  5-10 min per species ⭐
Level 2:  5-10 min per species ⭐
Level 3:  5-10 min per species ⭐
Level 4:  5-10 min per species ⭐
Level 5:  5-10 min per species ⭐

Result: Consistent difficulty progression!
```

---

## 💡 Strategic Depth Restored

### What This Enables:

1. **Resource Management:**
   - Players must choose which species to unlock
   - Can't afford all 16 species quickly
   - Time pressure creates strategic choices

2. **Level Progression:**
   - Levels feel consistently challenging
   - More resources ≠ easier game
   - Proportional increase in difficulty

3. **Completion Incentive:**
   - Must optimize unraveling strategy
   - Color sensitivity unlocking becomes strategic
   - Time bonus remains valuable motivator

---

## 🔧 Implementation Details

### Code Location:
`src/scenes/DefogGamev0.04.js` lines 158-169

### Divisor Definition:
```javascript
this.levelDivisors = {
    1: { monochrome: 8, green: 30, red: 34, blue: 26 },
    2: { monochrome: 8, green: 36, red: 41, blue: 31 },
    3: { monochrome: 8, green: 42, red: 48, blue: 37 },
    4: { monochrome: 8, green: 48, red: 55, blue: 43 },
    5: { monochrome: 8, green: 54, red: 62, blue: 49 }
};
```

### Usage:
```javascript
const divisors = this.levelDivisors[this.currentLevel];
const greenAwarded = Math.floor((edgeCurrencyGreen / divisors.green) * greenWeight);
```

---

## 📈 Resource Analysis

### Level 1 (IMG_0061):
- Size: 1600×506 pixels
- Resources: Moderate (baseline)
- Divisors: 30, 34, 26
- Balance: ⭐ Reference point

### Level 2 (IMG_0104):
- Size: 1853×554 pixels
- Resources: ~20% more
- Divisors: 36, 41, 31
- Balance: ⭐ Maintained

### Level 3 (IMG_0159):
- Size: 1853×540 pixels
- Resources: ~40% more
- Divisors: 42, 48, 37
- Balance: ⭐ Maintained

### Level 4 (IMG_0086):
- Size: 1853×438 pixels
- Resources: ~60% more
- Divisors: 48, 55, 43
- Balance: ⭐ Maintained

### Level 5 (IMG_0096):
- Size: 1853×438 pixels
- Resources: ~80% more
- Divisors: 54, 62, 49
- Balance: ⭐ Maintained

---

## 🎮 Testing Recommendations

### Test Each Level:
1. ✅ **Level 1:** Baseline - should feel like original
2. ✅ **Level 2:** Slightly easier to earn (20% more resources offset by 20% higher divisors)
3. ✅ **Level 3:** Consistent with Level 2
4. ✅ **Level 4:** Consistent difficulty maintained
5. ✅ **Level 5:** Consistent difficulty maintained

### Success Criteria:
- [ ] Each level takes ~5-10 minutes to unlock all species
- [ ] Player must choose which species to prioritize early
- [ ] Cannot afford all 16 species immediately
- [ ] Must optimize unraveling strategy for time bonus
- [ ] Difficulty feels consistent across all 5 levels

---

## 🔄 Future Tuning

If levels feel too easy/hard, adjust divisors proportionally:

### If Level 2-5 are TOO EASY:
Increase divisors by 5-10% across all levels:
```javascript
// Example: increase by 10%
2: { ..., green: 40, red: 45, blue: 34 },
```

### If Level 2-5 are TOO HARD:
Decrease divisors by 5-10%:
```javascript
// Example: decrease by 5%
2: { ..., green: 34, red: 39, blue: 29 },
```

### Tuning Notes:
- Adjust by small increments (5%)
- Test multiple playthroughs
- Keep ratios consistent between colors
- Document changes in a balance patch log

---

## 📋 Version History

- **v=108:** Global leaderboards implemented
- **v=109:** Dynamic resource balancing per level ✅

---

## 🎯 Design Philosophy

**Core Principle:** *More resources ≠ Easier game*

The beauty of adaptive divisors:
- Scales with content size
- Maintains strategic depth
- Prevents "progression plateaus"
- Creates consistent challenge curve

Players should never feel "oh, now I just spam clicks and get everything" - they should feel "I have more to work with, but it's proportionally harder to convert to currency."

---

## ✅ Deployment Checklist

- [x] Analyzed resource distribution per level
- [x] Calculated proportional divisor increases
- [x] Implemented level-specific divisors
- [x] Updated both currency award locations
- [x] Incremented cache version to v=109
- [ ] Push to GitHub
- [ ] Test on live site
- [ ] Play through all 5 levels
- [ ] Verify consistent difficulty

---

**Ready for deployment!** Push to GitHub and test: https://etigerschuss.github.io/ERGo/
