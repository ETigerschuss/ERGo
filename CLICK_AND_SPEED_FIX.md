# ✅ Fixed Click Detection & Path Control Balance

## 🎯 What Was Fixed

### Issue 1: Click Radius Too Wide
**Problem**: Could select insects from 80+ pixels away, especially big insects  
**Cause**: `baseRadius = 80` with scaling made huge click areas

**Fixed**:
```javascript
// OLD (Too wide):
const baseRadius = 80;
const minRadius = 40;
const clickRadius = Math.max(minRadius, baseRadius * sizeScale);
// Result: 40-160+ pixel radius!

// NEW (Tight):
const baseRadius = 25; // Much smaller
const clickRadius = baseRadius * sizeScale;
// Result: 12.5-50 pixel radius (matches ring size)
```

### Issue 2: Path Length vs Lifetime Mismatch
**Problem**: Insects too slow to complete paths before dying  
**Cause**: Speed 0.01 + long lifespans = can't reach waypoints

**Fixed**:
```javascript
// Speed increased:
const speed = insect.data.speed * 0.05; // Was 0.01, now 0.05 (5x faster)

// Lifespans reduced to match:
lifespan: insectId === 'ant' ? 180000 : 90000 / insectData.speed
// Ants: 180s (3 min) instead of 240s (4 min)
// Others: 18-90s instead of 24-120s
```

## 📊 New Timing Balance

| Insect | Speed Stat | Move Speed | Lifespan | Can Travel |
|--------|-----------|------------|----------|------------|
| Ant (slow) | 1 | 0.05 | 180s | ~900px |
| Honeybee | 3 | 0.15 | 30s | ~450px |
| Housefly | 4 | 0.20 | 22.5s | ~450px |
| Horsefly (fast) | 5 | 0.25 | 18s | ~450px |

**Result**: Insects can now complete 2-4 waypoint paths within their lifetime!

## 🎮 Click Detection Sizes

| Insect Size | Scale | Click Radius |
|-------------|-------|--------------|
| Tiny (fly) | 0.5 | 12.5px |
| Small (bee) | 0.8 | 20px |
| Normal (ant) | 1.0 | 25px |
| Large (beetle) | 1.5 | 37.5px |
| Huge (moth) | 2.0 | 50px |

**Much tighter** - now you need to click close to the actual insect!

## ✅ Expected Behavior Now

1. **Selection**:
   - Must click very close to insect center
   - Big insects slightly easier but not extreme
   - Matches visual ring size better

2. **Path Control**:
   - Insects move 5x faster
   - Can complete multiway paths (3-4 waypoints)
   - Die after reasonable time exploring

3. **Gameplay Feel**:
   - More precise control required
   - Insects feel more "alive" (faster movement)
   - Better balance between control and lifetime

## 🧪 Test It

1. **Tight Selection**:
   - Try clicking far from an insect → shouldn't select
   - Click near center → selects
   - Big insects still have larger area but reasonable

2. **Path Completion**:
   - Select an insect
   - Set 3 waypoints across the screen
   - Watch it complete the path before dying

3. **Speed Feel**:
   - Insects should move at a reasonable pace
   - Not too slow (old 0.01)
   - Not too fast (feels natural)

**Refresh and test!** 🎮
