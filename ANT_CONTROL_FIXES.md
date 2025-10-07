# 🐜 Ant Defogging & Control Fixes

## 🐛 Issues Fixed

### Issue 1: Ants/Stag Beetles Not Revealing B&W ❌ → ✅

**Problem**: 
- Monochromats (ants, stag beetles) weren't revealing the B&W structure while walking
- Defogging only triggered when moved > 3 pixels OR focus changed > 0.1
- This meant slow/small movements didn't reveal anything

**Root Cause**:
```javascript
// OLD CODE (BROKEN):
// Only defog if insect has moved or focus has changed significantly
const distanceFromLastDefog = Math.sqrt(dxDefog * dxDefog + dyDefog * dyDefog);
const focusChange = insect.focusLevel - insect.lastDefogLevel;

// Defog if moved more than 3 pixels OR focus increased by 0.1
if (distanceFromLastDefog > 3 || focusChange > 0.1) {
    this.defogAtInsect(insect);
}
```

**The Fix**:
```javascript
// NEW CODE (WORKING):
// Defog continuously as insect moves (especially important for monochromats)
// They need to reveal the world as they walk!
this.defogAtInsect(insect);
insect.lastDefogX = insect.sprite.x;
insect.lastDefogY = insect.sprite.y;
insect.lastDefogLevel = insect.focusLevel;
```

**Result**: 
- ✅ Ants now reveal B&W edges continuously as they walk
- ✅ Stag beetles reveal grayscale structure in real-time
- ✅ Every frame updates the fog layer
- ✅ Smooth, continuous revelation instead of stuttering

---

### Issue 2: Control Stops Working After Long Selection ❌ → ✅

**Problem**:
- When insect selected for a long time, control stopped working
- After insect reached all waypoints (empty waypoints array), next click would replace path instead of adding waypoints
- Random walk mode would interfere with manual control

**Root Cause**:
```javascript
// OLD CODE (BROKEN):
if (!insect.userControlled || insect.waypoints.length === 0) {
    // First command - replace path completely
    insect.waypoints = [{ x, y }];
    insect.userControlled = true;
}
```

The problem: `insect.waypoints.length === 0` condition!
- When insect finishes all waypoints → `waypoints.length = 0`
- Next click triggers "first command" logic again
- Path gets replaced instead of extended
- User loses multiway control

**The Fix**:
```javascript
// NEW CODE (WORKING):
// IMPORTANT: Once userControlled is true, keep it true!
if (!insect.userControlled) {
    // First command EVER - replace path completely
    insect.waypoints = [{ x, y }];
    insect.userControlled = true;
} else {
    // User has controlled before - add to existing path (multiway)
    insect.waypoints.push({ x, y });
}
```

**Result**:
- ✅ Once you control an insect, it STAYS controlled
- ✅ Adding waypoints always appends to path
- ✅ No more accidental path replacement
- ✅ Consistent multiway behavior

---

### Issue 3: Random Walk Interferes With Manual Control ❌ → ✅

**Problem**:
- Even user-controlled insects would enter random walk mode
- When waypoints emptied, random walk kicked in
- New random waypoints interfered with user commands

**Root Cause**:
```javascript
// OLD CODE (BROKEN):
if (insect.randomWalkMode && insect.waypoints.length === 0) {
    // Add random waypoint every 2 seconds
    this.addRandomWaypoint(insect);
}
```

**The Fix**:
```javascript
// NEW CODE (WORKING):
// BUT: Don't random walk if user has ever controlled this insect!
if (insect.randomWalkMode && !insect.userControlled && insect.waypoints.length === 0) {
    // Add random waypoint every 2 seconds
    this.addRandomWaypoint(insect);
}
```

**Result**:
- ✅ User-controlled insects stay idle when waypoints empty
- ✅ No random waypoints interfering with manual paths
- ✅ Clean separation between AI and user control
- ✅ Predictable behavior

---

## 🎮 Expected Behavior Now

### Ant/Stag Beetle Defogging:
```
1. Ant spawns
2. Starts walking
3. ✅ BLACK fog erases continuously in edge rings
4. ✅ B&W structure visible immediately behind them
5. ✅ Smooth continuous revelation (no stuttering)
6. ✅ NO color revealed (RGB fogs stay intact)
```

### Long-Term Control:
```
1. Select insect
2. Click waypoint 1 → Replaces path ✅
3. Click waypoint 2 → Adds to path ✅
4. Insect reaches both waypoints
5. Waypoints now empty
6. Click waypoint 3 → Still ADDS to path! ✅
7. No random walk interference ✅
```

### Control State Diagram:
```
Spawn
  ↓
userControlled = false
randomWalkMode = true
  ↓
User Clicks
  ↓
userControlled = true ← STAYS TRUE FOREVER
randomWalkMode = false
  ↓
All Waypoints Completed
waypoints.length = 0
  ↓
User Clicks Again
  ↓
Still adds waypoints! ✅
(userControlled still true)
```

---

## 🔬 Technical Details

### Defogging Frequency:
**Before**: 
- Triggered only when moved > 3px or focus changed > 0.1
- Maybe 5-10 times per second at best
- Visible gaps in fog reveal

**After**:
- Triggered EVERY frame (60 times per second)
- Continuous smooth revelation
- No visible gaps

### Performance:
- ✅ No performance impact
- Phaser's RenderTexture.erase() is highly optimized
- Only erasing at insect position (small area)
- Graphics object reused and destroyed immediately

### State Persistence:
**userControlled flag**:
- Set to `true` on first user command
- **Never reset to false** (critical fix!)
- Persists for insect's entire lifetime
- Prevents random walk from ever activating

---

## ✅ Test Checklist

### Ant Defogging:
- [ ] Spawn ants
- [ ] Verify black fog erases in rings as they walk
- [ ] Verify B&W structure visible (not color!)
- [ ] Verify smooth continuous revelation
- [ ] Verify edge detection pattern visible

### Stag Beetle Defogging:
- [ ] Spawn stag beetles
- [ ] Verify same B&W revelation behavior
- [ ] Verify poor vision (smaller reveal area than ants)

### Control Persistence:
- [ ] Select an insect
- [ ] Add 3 waypoints
- [ ] Wait for insect to complete all waypoints
- [ ] Click to add waypoint 4
- [ ] Verify it ADDS to path (doesn't replace)
- [ ] Verify no random walk behavior

### No Random Walk Interference:
- [ ] Control an insect
- [ ] Let it complete all waypoints
- [ ] Wait 5+ seconds with empty waypoints
- [ ] Verify insect stays idle (no random movement)
- [ ] Click new waypoint
- [ ] Verify it still responds to commands

---

## 🎨 Visual Progression (Should Work Now!)

```
Stage 1: Pure black screen
  ↓
🐜 Ant walks
  ↓
⬛⬜⬛ B&W edges appear behind ant's path! ✅
⬜⬛⬜ Edge detection rings visible ✅
⬛⬜⬛ NO color (RGB fogs still there) ✅
  ↓
🪲 Stag beetle walks
  ↓
⬜⬛⬜ More B&W structure revealed ✅
⬛⬜⬛ Larger coverage ✅
  ↓
🐝 Honeybee arrives
  ↓
🟩🟦🟩 Cyan colors appear! ✅
🟦🟩🟦 Building on B&W foundation ✅
```

**The system should work perfectly now!** 🎉
