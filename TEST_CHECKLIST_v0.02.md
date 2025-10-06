# ERGo! v0.02 - Quick Test Checklist

## 🧪 Color Vision Tests

### Test 1: Ant (Green-Only Vision)
- [ ] Start game
- [ ] **Expected**: World appears GREEN-tinted ✅
- [ ] **Bug if**: World appears blue or red ❌

### Test 2: Fruit Fly (Blue Vision)  
- [ ] Wait for 5 ants to spawn
- [ ] Fruit fly appears
- [ ] **Expected**: World appears BLUE-tinted ✅
- [ ] **Bug if**: World appears red ❌

### Test 3: Horsefly (Red Vision - Rare!)
- [ ] Progress to 4th Diptera species
- [ ] **Expected**: World appears RED-ORANGE (red+green) ✅
- [ ] **Bug if**: World appears blue ❌

---

## 📱 Mobile Control Tests

### Test 4: Easy Selection
- [ ] Tap on tiny ant (should be easy with 80px radius)
- [ ] Green ring appears
- [ ] **Expected**: Selection on first tap ✅
- [ ] **Bug if**: Need multiple taps ❌

### Test 5: Deselect
- [ ] Tap selected insect again
- [ ] Green ring disappears
- [ ] **Expected**: Deselects immediately ✅
- [ ] **Bug if**: Stays selected ❌

### Test 6: Multi-Waypoint Path
- [ ] Select an insect
- [ ] Tap 3 different locations
- [ ] **Expected**: 
  - ✅ Green circles with numbers 1, 2, 3 appear
  - ✅ Dotted green line connects them
  - ✅ Insect follows path in order
- [ ] **Bug if**: 
  - ❌ No numbers on waypoints
  - ❌ Only goes to last click
  - ❌ Requires Ctrl+Click

### Test 7: Path Following
- [ ] Create 4-waypoint path
- [ ] Watch insect movement
- [ ] **Expected**: Visits 1 → 2 → 3 → 4 in sequence ✅
- [ ] **Bug if**: Skips waypoints or wrong order ❌

### Test 8: Switch Selection
- [ ] Select insect A (create path)
- [ ] Tap insect B
- [ ] **Expected**:
  - ✅ Insect A's path clears, ring disappears
  - ✅ Insect B gets selected with green ring
  - ✅ Waypoint numbers cleaned up
- [ ] **Bug if**: Both stay selected or labels remain ❌

---

## 🐛 Regression Tests

### Test 9: Spawning Order (Should Still Work)
- [ ] Round 1: Ant → Fruit Fly → Ladybug → Cabbage White
- [ ] Round 2: Honeybee → Housefly → Firefly → Hawk Moth
- [ ] **Expected**: Smallest to largest across families ✅

### Test 10: Size Scaling (Should Still Work)
- [ ] Compare ant (2.5mm) vs monarch (95mm)
- [ ] **Expected**: Monarch ~38x bigger visual size ✅

### Test 11: Lifespan Indicators (Should Still Work)
- [ ] Watch insect age
- [ ] Bar goes: Green → Yellow → Red
- [ ] **Expected**: Visual aging feedback ✅

---

## 🎯 Quick Win Tests (< 1 minute)

### Fastest Test Path:
1. **Launch game**
2. **Look at background color** → Should be GREEN (ant vision) ✅
3. **Tap ant** → Green ring appears ✅
4. **Tap 3 locations** → Numbers 1, 2, 3 appear ✅
5. **Watch ant move** → Follows 1 → 2 → 3 ✅
6. **SUCCESS!** All core features working 🎉

### If Any Test Fails:
- Check browser console for errors
- Verify DefogGameAdvanced.js changes applied
- Refresh browser (hard refresh: Ctrl+Shift+R)
- Clear cache if needed

---

## 📊 Success Criteria

✅ **All Fixed**:
- Ant sees green world (not blue)
- Fruit fly sees blue world (not red)  
- Single tap selects/deselects
- Every tap adds numbered waypoint
- 80px tap radius works on mobile
- Waypoint labels clean up properly

❌ **Any Failures**:
- Check error log
- Review FIXES_v0.02.md for details
- Verify spectralWeights logic in defogAtInsect()
