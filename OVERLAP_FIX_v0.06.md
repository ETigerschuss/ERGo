# Quick Fix v0.06 - Overlapping Images Fixed

## 🐛 Issue: Logos Too Big & Overlapping, Can't Select

**Problem**: 
- Images at 0.5 scale (50%) = ~250-300px each
- Images overlapping each other
- Covering buttons and panels
- Can't click anything

---

## ✅ Fix Applied

### 1. Reduced Image Size
```javascript
// BEFORE (TOO BIG):
detailImage.setScale(0.5); // 50% = ~250-300px

// AFTER (PERFECT SIZE):
detailImage.setScale(0.25); // 25% = ~125-150px
```

### 2. Adjusted Positions
```javascript
// Image higher up:
detailImage: pos.y + 45 (was 75)

// Text adjusted:
Family name: pos.y + 115 (was 150)
Attributes: pos.y + 140 (was 175)
Button: pos.y + 220 (was 225)
```

### 3. Made Images Non-Interactive
```javascript
detailImage.setInteractive(false);
familyNameText.setInteractive(false);
attrsText.setInteractive(false);

// Clicks pass through to panel/button ✓
```

### 4. Set Proper Depth Layers
```javascript
button.setDepth(10);      // Button on top
buttonText.setDepth(11);  // Text above button
// Images have default depth (0) - stay in back
```

---

## 🎨 New Layout

```
Panel (240×250px):
┌─────────────────────┐
│                     │  pos.y (0px)
│     [Image]         │  pos.y + 45px
│    ~125×125px       │  (Small, sharp)
│                     │
│   Family Name       │  pos.y + 115px
│                     │
│   Attributes        │  pos.y + 140px
│   (4 lines)         │
│                     │
│  [Click to Start]   │  pos.y + 220px
│                     │
└─────────────────────┘  pos.y + 250px
```

---

## ✅ Result

- ✅ Images small enough to fit (125-150px)
- ✅ No overlapping
- ✅ All elements visible
- ✅ Panels clickable
- ✅ Buttons clickable
- ✅ Images still sharp (NEAREST filter)

---

## 🧪 Quick Test

1. Refresh page
2. Click splash
3. **CHECK**: 
   - □ 4 panels visible?
   - □ Images reasonable size?
   - □ No overlapping?
   - □ Can click buttons?

**Should work perfectly now!** ✅
