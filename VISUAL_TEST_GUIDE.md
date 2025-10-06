# Visual Test Guide - Quick Reference

## 🎯 What You Should See Now

### Starting Screen (Ladybug Spawns First)
```
┌─────────────────────────────────────┐
│  DIPTERA 🪰                         │  ← Top-left
│  (waiting...)                       │
│                                     │
│           🎨 WORLD VIEW 🎨          │
│     Should be YELLOW/ORANGE         │
│     (Ladybug sees red+green)        │
│                                     │
│                        HYMENOPTERA 🐝│  ← Top-right
│                        (waiting...) │
├─────────────────────────────────────┤
│  COLEOPTERA 🪲              LEPIDOPTERA 🦋│
│  [Loading: ████░░]          (waiting...)  │
│  Ladybug ●●●●●                            │
└───────────────────────────────────────────┘
   ↑ Bottom-left              ↑ Bottom-right
```

---

## 🧪 Quick Test Sequence

### Test 1: Ladybug (First Species)
**Panel**: Bottom-left (🪲 Coleoptera)
**Vision**: Red + Green (no blue)
**Expected World Color**: 🟡 **YELLOW/ORANGE**
**Bug if**: Black screen or wrong color

### Test 2: Fruit Fly (After 5 Ladybugs)
**Panel**: Top-left (🪰 Diptera)
**Vision**: Blue only (strong)
**Expected World Color**: 🔵 **BLUE/CYAN**
**Bug if**: Red or yellow

### Test 3: Ant (After 5 Fruit Flies)
**Panel**: Top-right (🐝 Hymenoptera)
**Vision**: Green only (monochromat)
**Expected World Color**: 🟢 **GREEN**
**Bug if**: Blue or wrong panel

### Test 4: Cabbage White (After 5 Ants)
**Panel**: Bottom-right (🦋 Lepidoptera)
**Vision**: Full trichromat (r:1.0, g:1.0, b:0.8)
**Expected World Color**: 🌈 **FULL COLOR** (slight blue tint)
**Bug if**: Monochrome

---

## 🔬 Understanding the Color Vision

### Multiply Blend Mode Physics
```
Start: WHITE background (255, 255, 255)
       × RED fog (255, 0, 68)
       × GREEN fog (0, 255, 68)
       × BLUE fog (0, 136, 255)
     = BLACK (0, 0, 0) ← All blocked
```

### Ladybug Demasking (r:0.85, g:0.85, b:0.0)
```
Step 1: Check RED fog
  weight = 0.85 ≥ 0.5 → KEEP (don't erase)

Step 2: Check GREEN fog
  weight = 0.85 ≥ 0.5 → KEEP (don't erase)

Step 3: Check BLUE fog
  weight = 0.0 < 0.5 → ERASE
  blindness = 1 - 0.0 = 1.0
  alpha = 0.9 × 1.0 = 0.9 → STRONG ERASE ✓

Result:
  WHITE × RED × GREEN
  = YELLOW/ORANGE ✓
```

### Ant Demasking (r:0.0, g:1.0, b:0.0)
```
Step 1: Check RED fog
  weight = 0.0 < 0.5 → ERASE
  blindness = 1.0 → STRONG ERASE ✓

Step 2: Check GREEN fog
  weight = 1.0 ≥ 0.5 → KEEP (don't erase) ✓

Step 3: Check BLUE fog
  weight = 0.0 < 0.5 → ERASE
  blindness = 1.0 → STRONG ERASE ✓

Result:
  WHITE × GREEN
  = GREEN ✓
```

---

## 📊 Panel Layout (CORRECTED)

```
Array Index → Panel Position → Family
─────────────────────────────────────
    0       → Bottom-left   → 🪲 Coleoptera
    1       → Top-left      → 🪰 Diptera  
    2       → Top-right     → 🐝 Hymenoptera
    3       → Bottom-right  → 🦋 Lepidoptera
```

### Species Progression (Size Order)
```
Round 1 (Smallest):
  Ladybug (6.75mm) → Fruit Fly (2.5mm) → Ant (7.5mm) → Cabbage White (39.5mm)

Round 2:
  Firefly (15mm) → Housefly (10mm) → Honeybee (14.5mm) → Hawk Moth (45mm)

Round 3:
  Rose Chafer (17mm) → Robber Fly (20mm) → Bumblebee (19.5mm) → Peacock (52.5mm)

Round 4 (Largest):
  Stag Beetle (52.5mm) → Horsefly (22.5mm) → Hornet (26.5mm) → Monarch (95mm)
```

---

## ✅ Success Checklist

**Demasking Works:**
- [ ] Screen is NOT black
- [ ] Can see colored world behind fog
- [ ] Color changes with different insects

**Correct Panel Positions:**
- [ ] Bottom-left spawns Coleoptera (ladybug first)
- [ ] Top-left spawns Diptera (fruit fly second)
- [ ] Top-right spawns Hymenoptera (ant third)
- [ ] Bottom-right spawns Lepidoptera (cabbage white fourth)

**Correct Colors:**
- [ ] Ladybug → Yellow/orange world
- [ ] Fruit fly → Blue world
- [ ] Ant → Green world
- [ ] Cabbage white → Full color world

**Mobile Controls:**
- [ ] Easy to tap insects (80px radius)
- [ ] Tap to select → green ring
- [ ] Tap to deselect → ring disappears
- [ ] Tap locations → numbered waypoints appear
- [ ] Insect follows waypoints in order

---

## 🐛 If Something's Wrong

### Black Screen
→ Demasking not working
→ Check browser console for errors
→ Verify blindnessStrength calculation

### Wrong Panel Spawning
→ Array indices mismatched
→ Check speciesByFamily order matches panelPositions

### Wrong Colors
→ spectralWeights might be wrong in database
→ Check threshold (should be 0.5)
→ Verify blindness calculation (1 - weight)

### Can't Select Insects
→ Check hit radius (should be 80px base)
→ Verify sprite.setData('insectIndex') is working
