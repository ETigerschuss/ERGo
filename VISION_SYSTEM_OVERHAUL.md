# ✅ Vision System Overhaul - Grayscale Monochromats + Color Revelation

## 🎨 Revolutionary Vision System

### The New Concept: **Grayscale First, Color Later**

**Monochromats (Ants & Stag Beetles)**:
- Reveal **ONLY luminance** (brightness/edges)
- Create **black & white** version of image
- **NO color information** revealed
- Edge detection with ring patterns

**Color-Vision Insects (Bees, Flies, Butterflies)**:
- Reveal **color information** based on their receptors
- Build on the grayscale foundation
- Each insect reveals the colors **they can see**
- Full-spectrum insects reveal all colors

## 🐛 Issues Fixed

### 1. Stag Beetle Vision Too Good ❌ → ✅

**Problem**: Stag beetle had decent vision despite being monochromat
```javascript
// OLD (Wrong):
ommatidia: 2500,  // Too many!
spectralWeights: { r: 0.0, g: 1.0, b: 0.0 }  // Was revealing colors
defogRadius: 45
```

**Fixed**: Now matches biological reality
```javascript
// NEW (Correct):
ommatidia: 800,  // Poor vision - nocturnal, relies on pheromones
spectralWeights: { r: 0.15, g: 1.0, b: 0.2 }  // Edge detection only
defogRadius: 50  // Large area but GRAYSCALE only
```

**Result**: 
- Stag beetle now has poor vision (800 ommatidia vs ant's 1200)
- Reveals large areas but ONLY in grayscale
- Edge detector like ants
- Biologically accurate!

### 2. Peacock Butterfly Not Controllable ❌ → ✅

**Problem**: Missing from emoji map alternative names

**Fixed**: Added peacock_butterfly variant
```javascript
'peacock': '🦋',
'peacock_butterfly': '🦋',  // Now supports both names
```

### 3. Ants Revealing Color ❌ → ✅

**Problem**: Ants with single photoreceptor were revealing colored world

**Fixed**: Monochromats now reveal ONLY grayscale
```javascript
if (isMonochromat) {
    // Reveal EQUALLY from all R/G/B channels
    // Result: Black & white (luminance only)
    fogLayer.erase(graphics);  // Same for R, G, and B
}
```

## 🎮 How The New System Works

### Stage 1: Monochromats (Ants, Stag Beetles)
```
Initial state: [Full RGB Fog]
After ants:    [Grayscale image visible - edges/brightness only]
               ├─ R fog: Partially erased (equally)
               ├─ G fog: Partially erased (equally)  
               └─ B fog: Partially erased (equally)
Result: Black & white edges and shapes
```

### Stage 2: Dichromats (Most Insects)
```
Starting from: [Grayscale base]
After bees:    [Grayscale + Green & Blue revealed]
               ├─ R fog: Still there (bees can't see red)
               ├─ G fog: Removed (bees see green!)
               └─ B fog: Removed (bees see blue!)
Result: Cyan/green tinted world (no red yet)
```

### Stage 3: Trichromats with Red (Rose Chafer)
```
Starting from: [Grayscale + some colors]
After chafer:  [Grayscale + Green & Red revealed]
               ├─ R fog: Removed! (chafer sees red)
               ├─ G fog: Removed
               └─ B fog: Still there (chafer can't see blue)
Result: Yellow/green world (no blue)
```

### Stage 4: Full-Spectrum (Cabbage White)
```
Starting from: [Partial color]
After white:   [FULL COLOR!]
               ├─ R fog: GONE
               ├─ G fog: GONE
               └─ B fog: GONE
Result: Complete full-color image revealed!
```

## 📊 Insect Vision Comparison

| Insect | Receptors | Ommatidia | Reveals | Color Contribution |
|--------|-----------|-----------|---------|-------------------|
| **Ant** | 1 (G) | 1200 | Grayscale edges | B&W foundation |
| **Stag Beetle** | 1 (G) | 800 | Grayscale | B&W foundation |
| Honeybee | 3 (UV,B,G) | 5000 | Green+Blue | Cyan tint |
| Housefly | 3 (UV,B,G) | 3000 | Green+Blue | Cyan tint |
| Peacock | 3 (UV,B,G) | 12000 | Green+Blue | Cyan tint |
| Rose Chafer | 3 (UV,G,R) | 3500 | Green+Red | Yellow tint |
| **Cabbage White** | 6! (UV,B,G,R++) | 10000 | ALL colors | Full color! |

## 🎨 Visual Progression Example

```
1. Start: Complete fog (vivid R+G+B overlay)
   🟥🟩🟦🟥🟩🟦
   🟥🟩🟦🟥🟩🟦

2. After Ants: Grayscale shapes visible
   ⬜⬛⬜⬛⬜⬛  <- Edges clear
   ⬛⬜⬛⬜⬛⬜  <- No color yet!

3. After Bees: Cyan/green tones appear
   🟩🟦🟩🟦🟩🟦  <- Green+Blue
   🟦🟩🟦🟩🟦🟩  <- Still no red

4. After Rose Chafer: Warm tones added
   🟨🟩🟨🟩🟨🟩  <- Red+Green
   🟩🟨🟩🟨🟩🟨  <- Still no blue

5. After Cabbage White: Full color!
   🌈🌈🌈🌈🌈🌈  <- Everything visible
   🌈🌈🌈🌈🌈🌈  <- Complete image
```

## 🔬 Biological Accuracy

### Monochromats (1 receptor):
- **See**: Brightness contrast, edges, shapes
- **Don't see**: Any color information
- **Example**: Like human night vision (rods only)
- **In game**: Grayscale edge detection

### Dichromats (2 receptors):
- **See**: Limited color (like red-green colorblind humans)
- **Don't see**: Full color spectrum
- **Example**: Most mammals (dogs, cats)
- **In game**: Partial color reveal

### Trichromats (3 receptors):
- **See**: Good color vision
- **Don't see**: UV, some spectral details
- **Example**: Humans (R+G+B)
- **In game**: Most colors revealed

### Tetrachromats (4+ receptors):
- **See**: Colors beyond human imagination
- **Don't see**: Nothing! (Within visible spectrum)
- **Example**: Some butterflies, birds
- **In game**: FULL color revelation!

## ✅ Expected Gameplay

1. **Early Game (Ants/Stag Beetles)**:
   - See grayscale edges
   - No colors yet
   - Build spatial understanding
   - Edge detection helps navigation

2. **Mid Game (Bees, Flies, Most Butterflies)**:
   - Colors start appearing
   - Cyan/green tinted world
   - Better detail visibility
   - Different insects reveal different aspects

3. **Late Game (Specialized Insects)**:
   - More colors unlock
   - Rose chafer adds reds
   - Monarch adds specific wavelengths

4. **End Game (Cabbage White)**:
   - FULL COLOR revealed!
   - 6 photoreceptors unlock everything
   - Complete image visible

## 🧪 Test Checklist

- [ ] Start with ants → see grayscale only
- [ ] Stag beetle → also grayscale (poor vision)
- [ ] Honeybee → cyan/green colors appear
- [ ] Peacock → can be selected and controlled
- [ ] Rose chafer → warm tones added
- [ ] Cabbage white → full color!

**Refresh and experience the progressive color revelation!** 🎨✨
