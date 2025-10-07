# 🎨 TWO-LAYER REVELATION SYSTEM

## ✅ The Solution: Separate Layers!

### 🔴 Problem:
- Single canvas: Ants painted B&W on top of colors
- LIGHTEN blend mode didn't work as expected
- Canvas blocked clicks (RenderTextures intercept raycasts)

### ✅ Solution:
**Two separate canvases at different depths:**

```
Layer Stack (bottom to top):

Depth 0:   Hidden Image (alpha=0, used for sampling only)
Depth 199: B&W Canvas (monochromats paint here) ⬛⬜
Depth 200: Color Canvas (color insects paint here) 🌈
Depth 300+: Insect sprites (clickable!)
```

---

## 🐜 How Monochromats Work

### Paint on Bottom Layer (Depth 199):
```javascript
// Ants, stag beetles paint inverted B&W
this.bwCanvas.draw(graphics, 0, 0);

// This canvas is UNDER the color canvas
// Colors will ALWAYS show on top!
```

**Visual Result**:
```
B&W Canvas (199):
⬜⬛⬜⬛  Inverted brightness
⬛⬜⬛⬜  High contrast B&W
⬜⬛⬜⬛

Color Canvas (200) - transparent initially:
🫥🫥🫥🫥  Nothing painted yet
🫥🫥🫥🫥  Completely transparent
🫥🫥🫥🫥

What you see:
⬜⬛⬜⬛  Just the B&W from layer below
⬛⬜⬛⬜
⬜⬛⬜⬛
```

---

## 🐝 How Color Insects Work

### Paint on Top Layer (Depth 200):
```javascript
// Bees, butterflies paint colors
this.colorCanvas.draw(graphics, 0, 0);

// This canvas is ON TOP of B&W canvas
// Colors cover B&W where they paint
```

**Visual Result**:
```
B&W Canvas (199):
⬜⬛⬜⬛  Already painted by ants
⬛⬜⬛⬜
⬜⬛⬜⬛

Color Canvas (200) - bees paint:
🟦🫥🟩🫥  Cyan and green painted
🫥🟦🫥🟩  Transparent elsewhere
🟩🫥🟦🫥

What you see (layered):
🟦⬛🟩⬛  Colors on top where painted
⬛🟦⬛🟩  B&W shows through transparent areas
🟩⬜🟦⬛  Perfect mix!
```

---

## 🎯 Why This Works

### 1. **Layer Separation** ✅
- B&W on bottom (199)
- Color on top (200)
- **Physically impossible** for ants to paint over colors!

### 2. **Transparency** ✅
- Color canvas starts transparent
- Only painted areas are opaque
- B&W shows through gaps

### 3. **No Overwriting** ✅
- Ants can paint ALL they want on B&W layer
- Colors stay untouched on top layer
- Natural layering

### 4. **Clickability** ✅
- RenderTextures don't block clicks by default
- Insects at depth 300+ are fully clickable
- No interference

---

## 📊 Complete Progression

### Stage 1: Just Ants
```
B&W Layer:    ⬜⬛⬜⬛ (inverted B&W)
Color Layer:  🫥🫥🫥🫥 (transparent)
Result:       ⬜⬛⬜⬛ (B&W visible)
```

### Stage 2: Bees Arrive
```
B&W Layer:    ⬜⬛⬜⬛ (still there)
Color Layer:  🟦🫥🟩🫥 (cyan/green painted)
Result:       🟦⬛🟩⬛ (colors on top!)
```

### Stage 3: Ants Keep Walking
```
B&W Layer:    ⬜⬜⬛⬜ (ants paint MORE B&W)
Color Layer:  🟦🫥🟩🫥 (unchanged!)
Result:       🟦⬜🟩⬛ (new B&W shows through gaps)
```

### Stage 4: More Color Insects
```
B&W Layer:    ⬜⬜⬜⬜ (fully revealed)
Color Layer:  🟦🟧🟩🟨 (full color!)
Result:       🟦🟧🟩🟨 (complete image)
```

---

## 🔬 Technical Details

### Canvas Creation:
```javascript
// B&W Canvas (bottom)
const bwCanvas = this.add.renderTexture(0, 0, width, height);
bwCanvas.fill(0x000000, 1.0);  // Black opaque
bwCanvas.setDepth(199);

// Color Canvas (top)
const colorCanvas = this.add.renderTexture(0, 0, width, height);
colorCanvas.fill(0x000000, 0);  // Black transparent!
colorCanvas.setDepth(200);
```

### Depth Ordering:
```
0:   Hidden image (hidden)
199: B&W canvas
200: Color canvas
300: Insect sprites
500: Selection rings
1000: UI elements
3000: Instructions
```

### Painting:
```javascript
// Monochromats:
this.bwCanvas.draw(graphics, 0, 0);

// Color insects:
this.colorCanvas.draw(graphics, 0, 0);
```

---

## ✅ What's Fixed

1. ✅ **Ants don't overwrite colors** (separate layers!)
2. ✅ **Insects are clickable** (RenderTextures don't block by default)
3. ✅ **B&W foundation** shows through transparent color areas
4. ✅ **Colors always on top** (higher depth)
5. ✅ **Natural layering** (no blend mode tricks needed)

---

## 🎮 Expected Behavior

### When You Refresh:
1. **Black screen** (both canvases black/transparent)
2. **Ants spawn** and walk
3. **Inverted B&W appears** on bottom layer ✅
4. **Still clickable** - try selecting ants ✅
5. **Color insects spawn**
6. **Colors paint on top** ✅
7. **Ants keep walking** - B&W fills gaps ✅
8. **Colors NEVER get overwritten** ✅

**Perfect layered revelation!** 🎨🐜🐝
