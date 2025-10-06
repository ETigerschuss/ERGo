# Quick Start Guide - Control System

## 🎮 How to Play (Mobile-Friendly)

### Step 1: Select an Insect 🐜
**Action**: Tap on any insect
**Result**: Green ring appears around it
**Console**: "✅ Selecting insect"

```
Before:          After:
  🐜              🐜 ← Green ring!
```

---

### Step 2: Program the Path 📍
**Action**: Tap on ground (first location)
**Result**: Waypoint #1 appears with dotted line
**Console**: "📍 Adding waypoint at (x, y)"

```
  🐜 ................ ①  ← Waypoint 1
```

**Action**: Tap on ground (second location)
**Result**: Waypoint #2 appears

```
  🐜 ................ ① ................ ②  ← Waypoint 2
```

**Action**: Tap on ground (third location)
**Result**: Waypoint #3 appears

```
  🐜 ................ ① ................ ② ................ ③  ← Waypoint 3
```

---

### Step 3: Watch It Move! 🚀
The insect automatically follows: Current position → ① → ② → ③

---

### Step 4: Deselect (Optional) ⭕
**Action**: Tap on the selected insect again
**Result**: Ring and path disappear
**Console**: "🔄 Toggle: Deselecting insect"

---

## 🎯 Control Reference Card

| Situation | Action | Result |
|-----------|--------|--------|
| **Nothing selected** | Tap insect | SELECT it (green ring) |
| **Insect selected** | Tap ground | ADD waypoint to path |
| **Insect selected** | Tap same insect | DESELECT (toggle off) |
| **Insect selected** | Tap different insect | SWITCH selection |
| **Nothing selected** | Tap ground | ALL insects move there |
| **Any state** | Tap panel | Ignored (no action) |

---

## 📊 Visual Feedback Guide

### Selection Ring Colors
- **No ring**: Not selected
- **White ring (faint)**: Hovering over (desktop only)
- **Green ring (bright)**: Selected and ready for path programming

### Waypoint Markers
- **Green circle with number**: Waypoint position (1, 2, 3...)
- **White text**: Waypoint number for easy tracking
- **Dotted green line**: Path the insect will follow

### Lifespan Bar (Top of Insect)
- **Green bar**: Healthy, lots of life left
- **Yellow bar**: Middle-aged, moderate life
- **Red bar**: Old, near end of life
- **Shorter bar**: Less time = fewer waypoints allowed

---

## 🚀 Quick Demo Sequence

### Example: Send an ant to 3 flowers

```
1. TAP ANT
   → Green ring appears
   → Console: "✅ Selecting insect"

2. TAP FLOWER 1 (position 200, 150)
   → Waypoint "1" appears
   → Console: "📍 Adding waypoint at (200, 150)"
   → Dotted line from ant to ①

3. TAP FLOWER 2 (position 400, 300)
   → Waypoint "2" appears
   → Console: "📍 Adding waypoint at (400, 300)"
   → Line extends: ant → ① → ②

4. TAP FLOWER 3 (position 600, 200)
   → Waypoint "3" appears
   → Console: "📍 Adding waypoint at (600, 200)"
   → Complete path: ant → ① → ② → ③

5. WATCH
   → Ant moves to ①
   → Then to ②
   → Finally to ③
   → Path complete!

6. TAP ANT (optional - to deselect)
   → Ring disappears
   → Path clears
   → Console: "🔄 Toggle: Deselecting insect"
```

---

## 🐛 Troubleshooting

### "I can't add waypoints!"
✅ **Solution**: Make sure you've selected an insect first (green ring visible)

### "Nothing happens when I tap!"
✅ **Solution**: Check if you're tapping on the control panel (corners). Taps on panels are ignored.

### "The insect doesn't follow my path!"
✅ **Solution**: Check the lifespan bar. If it's red/short, the insect might die before reaching distant waypoints.

### "I accidentally moved all insects!"
✅ **Solution**: You tapped ground with no selection. This is the "group command" feature. Just select an insect to use individual control.

### "How do I deselect?"
✅ **Solution**: Tap on the selected insect again (toggle off).

---

## 🎨 Game Layout (New Order)

```
┌─────────────────────────────────────────────┐
│  🪰 DIPTERA                  🦋 LEPIDOPTERA │
│  (Top-left)                  (Top-right)    │
│  fruit_fly                   cabbage_white  │
│  housefly                    hawk_moth      │
│  robber_fly                  peacock        │
│  horsefly                    monarch        │
│                                             │
│              🎨 GAME AREA 🎨                │
│          (Tap here for waypoints!)          │
│                                             │
│  🐝 HYMENOPTERA            🪲 COLEOPTERA    │
│  (Bottom-left)             (Bottom-right)   │
│  ant ●●●●● ← STARTS HERE!  ladybug         │
│  honeybee                  firefly          │
│  bumblebee                 rose_chafer      │
│  hornet                    stag_beetle      │
└─────────────────────────────────────────────┘
```

**Starting Species**: Ant (Hymenoptera, bottom-left)

---

## 🎯 Pro Tips

### Efficient Path Programming
- **Plan ahead**: Look at lifespan bar before adding many waypoints
- **Short paths for old insects**: Red bar = keep paths short
- **Long paths for young insects**: Green bar = can reach many waypoints

### Multiple Insects
- **Select, program, deselect, repeat**: Control each insect individually
- **Group command**: Tap ground with no selection to move everyone at once
- **Switch quickly**: Tap different insect to switch without deselecting first

### Visual Clarity
- **Numbered waypoints**: Follow the numbers to understand the path
- **Dotted lines**: Show the route the insect will take
- **Green rings**: Always show what's currently selected

---

## ✅ Success Indicators

**You're using the controls correctly if:**

1. ✅ You can select insects with one tap (green ring appears)
2. ✅ You can add multiple waypoints by tapping ground repeatedly
3. ✅ Numbers appear on waypoints (1, 2, 3, ...)
4. ✅ Insects follow the numbered path in order
5. ✅ You can deselect by tapping the insect again
6. ✅ Console shows clear feedback (check browser F12 console)

**All working? Great! You've mastered the controls!** 🎉

---

## 🔬 Advanced Features

### Lifespan-Based Limits
The game automatically calculates max waypoints based on:
- Remaining lifespan (time until death)
- Movement speed (pixels per millisecond)
- Average waypoint distance (200px)

Formula: `maxWaypoints = remainingLife / timePerWaypoint`

### Waypoint Rejection
If you try to add too many waypoints:
```
Console: "⚠️ [Insect Name] can't reach more waypoints (lifespan limit: X)"
```

### Random Walk Mode
- Group commands enable random walk after reaching waypoint
- Individual paths disable random walk (full manual control)

---

## 📱 Mobile vs Desktop

### Mobile (Touch)
- ✅ Large tap areas (80px radius)
- ✅ Single-finger control
- ✅ No keyboard needed
- ✅ Optimized for phones/tablets

### Desktop (Mouse)
- ✅ Same controls work
- ✅ Bonus: Hover effects (white ring preview)
- ✅ Console logs in browser (F12)
- ✅ Precise clicking

**Both platforms use identical logic!**

---

## 🎮 Game Start Sequence

1. **Game loads**: Ant spawns in bottom-left panel
2. **Ant appears**: Moving randomly (default behavior)
3. **You select ant**: Green ring appears
4. **You tap ground**: Waypoint #1 created
5. **Ant moves**: Follows your command!
6. **More ants spawn**: After 5 ants, next family appears
7. **Progression continues**: 16 species total across 4 families

**Enjoy controlling your insect colony!** 🐝🪰🦋🪲
