# Visual Guide - What You Should See

## 1. Selection Screen

```
🐝 Hymenoptera (Bees, Wasps, Ants)
├─ Honeybee    [▌  ][████][███ ]  ← RGB bars show: Low Red, High Green, Med Blue
├─ Bumblebee   [▌  ][█████][███▌]
├─ Hornet      [▌  ][███▌][████]  ← Blue-shifted!
└─ Ant         [▌  ][█████][█▌  ]  ← Green-only

🪰 Diptera (Flies, Mosquitoes)
├─ Housefly    [▌  ][████][█████] ← Cyan-shifted
├─ Hoverfly    [▌  ][███▌][█████] ← STRONG blue!
├─ Mosquito    [▌  ][█████][█   ]
└─ Horsefly    [████][███▌][█   ] ← Rare RED vision!

🦋 Lepidoptera (Butterflies, Moths)
├─ Peacock     [█   ][████][███▌]
├─ Cabbage W.  [█████][████][███▌] ← FULL SPECTRUM!
├─ Monarch     [▌  ][████][███ ]
└─ Hawk Moth   [▌  ][█████][███ ]

🪲 Coleoptera (Beetles)
├─ Ladybug     [▌  ][█████][███ ]
├─ Firefly     [█   ][████][███▌]
├─ Stag Beetle [█   ][█████][█▌  ]
└─ Rose Chafer [███▌][████][█   ] ← Red-green vision!
```

**Legend:**
- [█████] = Strong sensitivity (0.8-1.0)
- [███▌] = Good sensitivity (0.6-0.8)
- [█   ] = Weak sensitivity (0.1-0.3)
- [▌  ] = Minimal sensitivity (<0.1)

---

## 2. Game Screen - Insect Positions

```
┌─────────────────────────────────────────────┐
│  [Hymenoptera]     [Diptera]                │ ← Top panels (outside image)
│                                             │
│    🐝                          🪰           │ ← Insects in corners
│    |||                         |||          │ ← RGB bars under each
│    RGB                         RGB          │
│                                             │
│              🌸 FLOWER 🌸                   │ ← Hidden image
│         (revealed by insects)               │
│                                             │
│                                             │
│    🦋                          🪲           │
│    |||                         |||          │
│    RGB                         RGB          │
│                                             │
│  [Lepidoptera]     [Coleoptera]             │ ← Bottom panels
└─────────────────────────────────────────────┘
```

---

## 3. Expected Color Reveals

### With Green-Only Insects (Ant, Mosquito, Stag Beetle)
```
🌸 Flower revealed as:
╔══════════════╗
║  🟡🟡🟡🟡    ║  ← Yellow/greenish tint
║  🟡🌿🟡🟡    ║  (missing red and blue fog removal)
║  🟡🟡🟡🟡    ║
╚══════════════╝
```

### With Blue Specialist (Hoverfly)
```
🌸 Flower revealed as:
╔══════════════╗
║  🔵🔵🔵🔵    ║  ← Cyan/blue-green tint
║  🔵💠🔵🔵    ║  (missing red fog removal)
║  🔵🔵🔵🔵    ║
╚══════════════╝
```

### With Full Spectrum (Cabbage White)
```
🌸 Flower revealed as:
╔══════════════╗
║  🌸🌸🌸🌸    ║  ← Natural colors! 🎉
║  🌸🌺🌸🌸    ║  (all fog removed)
║  🌸🌸🌸🌸    ║
╚══════════════╝
```

### With Mixed Team (Hornet + Horsefly + Monarch + Rose Chafer)
```
🌸 Flower revealed as:
╔══════════════╗
║  🟢🔵🟡🔴    ║  ← Different colors in different areas
║  🔵🌸🟡🟢    ║  (depending on which insects visited)
║  🟡🟢🔴🔵    ║  Areas with multiple insects = better colors
╚══════════════╝
```

---

## 4. RGB Bar Examples (Actual Scale)

### Cabbage White (Full Spectrum)
```
R: ████████████████▊  (0.95)
G: █████████████████  (0.90)
B: ██████████████    (0.70)
```

### Hoverfly (Blue Specialist)
```
R: █                 (0.10)
G: ███████████████   (0.75)
B: ████████████████  (1.00) ← MAX!
```

### Horsefly (Red Specialist)
```
R: █████████████████  (0.85) ← Rare!
G: ██████████████     (0.70)
B: ███                (0.20)
```

### Ant (Green Monochromat)
```
R: ▌                  (0.05)
G: ████████████████   (1.00) ← MAX!
B: ██████             (0.35)
```

---

## 5. Strategic Combinations

### ❌ Poor Team (Missing Red)
```
Team: Ant + Mosquito + Ladybug + Peacock
Coverage:
  R: ▌▌▌█     = 0.10 average  ← POOR!
  G: █████    = 0.89 average  ← Good
  B: ████     = 0.58 average  ← OK
Result: Yellow-green tinted image
```

### ✅ Good Team (Balanced)
```
Team: Hornet + Horsefly + Monarch + Rose Chafer
Coverage:
  R: ███████  = 0.46 average  ← Better!
  G: ████████ = 0.77 average  ← Good
  B: ████     = 0.48 average  ← OK
Result: Fairly natural colors
```

### ✅✅ Optimal Team (Full Coverage)
```
Team: Hoverfly + Horsefly + Cabbage White + Bumblebee
Coverage:
  R: ████████ = 0.55 average  ← Good!
  G: ████████ = 0.79 average  ← Great!
  B: ████████ = 0.76 average  ← Great!
Result: Natural flower colors! 🌸
```

---

## 6. Gameplay Flow

```
1. Select Insects
   ↓
2. Click to Set Waypoints
   ↓
3. Insects Move & Focus
   ↓
4. Fog Erased (Weighted by RGB)
   ↓
5. Colors Revealed
   ↓
6. Discover: Do I need different insects?
   ↓
7. Switch Species (mid-game panels)
   ↓
8. Better Coverage = Better Colors!
```

---

## 7. Performance Indicators

### What's Normal:
- ✅ Insects move slowly (0.5-1.5 pixels per frame)
- ✅ Blur radius varies (3px to 30px based on ommatidia)
- ✅ Fast insects reveal while moving (blurry)
- ✅ Slow insects need to stop (sharper when focused)
- ✅ RGB bars are small (8px wide x 2-18px tall)

### What's NOT Normal:
- ❌ All insects reveal the same colors
- ❌ Everything is red (old bug - should be fixed!)
- ❌ RGB bars all the same height
- ❌ No color diversity at all
- ❌ Game freezes or crashes

---

## 8. Debug Checklist

If colors look wrong:

```
□ Hard refreshed browser (Ctrl+Shift+R)?
□ Console shows no errors (F12)?
□ RGB bars visible under insects?
□ RGB bars different heights for different insects?
□ Tried Cabbage White (should have tallest bars)?
□ Tried Ant (should have only tall green bar)?
□ Moved insects around flower image?
□ Waited for insects to focus (stand still)?
□ Selected different insect combinations?
□ Cleared browser cache completely?
```

If all checked and still wrong → Report the issue!

---

## 9. Expected Browser Console Output

When game starts:
```
=== GAME STARTING ===
Selected insect IDs: ['honeybee', 'housefly', 'peacock', 'ladybug']
Insects by family: {Hymenoptera: 'honeybee', Diptera: 'housefly', ...}
Spectral fog layers created: R, G, B
Insects will reveal based on their spectralWeights
```

No errors should appear!

---

**Happy Testing! 🧪🐝**
