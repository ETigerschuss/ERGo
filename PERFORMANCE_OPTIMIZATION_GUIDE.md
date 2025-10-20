# ERGo! Performance Optimization Guide
## Comprehensive Analysis & Strategies for Smooth 30+ Insect Performance

---

## 🎯 Current Performance Status

**Current Implementation (v0.04):**
- ✅ Adaptive frame skipping based on insect count
- ✅ Collectible checking throttled (every 3rd frame)
- ✅ Cleanup every 60 frames
- ⚠️ Potential bottlenecks remain with 30+ insects

---

## 🔍 Performance Bottleneck Analysis

### **1. DEFOGGING SYSTEM** ⚠️ CRITICAL BOTTLENECK

**Current Cost:** O(n × m) where n = insects, m = pixels per radius
- Each insect samples ~300-1000 pixels per frame
- 30 insects × 500 pixels = **15,000 pixel samples/frame**
- Edge detection adds 8 neighbor checks per pixel = **120,000 operations/frame**

**Current Optimizations:**
```javascript
// Adaptive frame skipping
if (insectCount > 40) skipDefogFrame = updateFrameCounter % 4 !== 0; // Skip 3/4 frames
else if (insectCount > 30) skipDefogFrame = updateFrameCounter % 3 !== 0; // Skip 2/3 frames
else if (insectCount > 20) skipDefogFrame = updateFrameCounter % 2 === 0; // Skip 1/2 frames
```

**Remaining Issues:**
- ❌ Still samples EVERY pixel within radius
- ❌ Edge detection runs for EVERY sampled pixel
- ❌ Graphics object creation/destruction per insect per frame
- ❌ `revealedPixels` Set lookup (O(1) but still adds overhead)

---

### **2. GRAPHICS RENDERING** ⚠️ MAJOR BOTTLENECK

**Current Issue:**
```javascript
const graphics = this.make.graphics();
// ... paint pixels ...
this.bwCanvas.draw(graphics, 0, 0);
graphics.destroy();
```

**Problems:**
- Creates/destroys graphics object EVERY frame per insect
- RenderTexture operations are GPU-intensive
- fillCircle() called hundreds of times per insect

**Performance Impact:**
- 30 insects × 500 fillCircle() calls = **15,000 draw calls/frame**

---

### **3. PIXEL SAMPLING** ⚠️ MODERATE BOTTLENECK

**Current Code:**
```javascript
const pixelData = this.imageContext.getImageData(px, py, 1, 1).data;
```

**Issues:**
- `getImageData()` is slow (CPU ↔ GPU sync)
- Called thousands of times per frame
- Forces GPU to wait for CPU

---

### **4. INSECT MOVEMENT & PATHFINDING** ⚠️ MINOR BOTTLENECK

**Current:** Updated every frame for all insects
- 30 insects × movement calculations = moderate cost
- Waypoint calculations
- Distance checks
- Rotation updates

---

### **5. COLLECTIBLE COLLISION DETECTION** ✅ OPTIMIZED

**Current:** Already throttled to every 3rd frame
- Distance checks: O(insects × collectibles)
- Already performant enough

---

## 🚀 OPTIMIZATION STRATEGIES (Prioritized)

### **🏆 PRIORITY 1: Optimize Defogging System**

#### **Strategy A: Spatial Hashing for Revealed Pixels**
Instead of Set, use grid-based tracking:

```javascript
// In create():
this.revealedGrid = new Uint8Array(Math.ceil(imageWidth / 8) * Math.ceil(imageHeight / 8));

// Check if region revealed (much faster):
function isRegionRevealed(px, py) {
    const gridX = Math.floor(px / 8);
    const gridY = Math.floor(py / 8);
    const index = gridY * Math.ceil(imageWidth / 8) + gridX;
    return this.revealedGrid[index] === 1;
}
```

**Benefit:** ~10x faster lookups, lower memory usage

---

#### **Strategy B: Reduce Pixel Sampling Density**
```javascript
// Current:
const step = Math.max(4, Math.floor(sampleRadius / 12));

// OPTIMIZED:
const step = Math.max(6, Math.floor(sampleRadius / 8)); // Larger steps

// OR Dynamic based on insect count:
const insectCountFactor = Math.min(3, this.insects.length / 15);
const step = Math.max(6, Math.floor(sampleRadius / 8) * insectCountFactor);
```

**Benefit:** 50% reduction in pixel samples

---

#### **Strategy C: Pre-compute Edge Map**
Calculate edge map ONCE at level start:

```javascript
createEdgeMap() {
    const width = this.hiddenImage.width;
    const height = this.hiddenImage.height;
    this.edgeMap = new Uint8Array(width * height);
    
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const pixelData = this.imageContext.getImageData(x, y, 1, 1).data;
            const brightness = (pixelData[0] + pixelData[1] + pixelData[2]) / 3;
            
            // Check neighbors
            let maxContrast = 0;
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    const neighborData = this.imageContext.getImageData(x + dx, y + dy, 1, 1).data;
                    const neighborBrightness = (neighborData[0] + neighborData[1] + neighborData[2]) / 3;
                    maxContrast = Math.max(maxContrast, Math.abs(brightness - neighborBrightness));
                }
            }
            
            // Store edge strength (0-255)
            this.edgeMap[y * width + x] = Math.min(255, maxContrast);
        }
    }
}

// Then in defogAtInsect():
const edgeStrength = this.edgeMap[py * this.hiddenImage.width + px];
if (edgeStrength > 100) edgeCurrency += 1;
else if (edgeStrength > 50) edgeCurrency += 0.5;
// ... etc
```

**Benefit:** Eliminates 8 neighbor checks per pixel = **90% reduction in edge detection cost**

---

#### **Strategy D: Batch Graphics Operations**
Reuse graphics objects instead of creating/destroying:

```javascript
// In create():
this.insectGraphicsPools = {
    bw: [],
    r: [],
    g: [],
    b: []
};

// Reuse graphics:
function getGraphicsFromPool(type) {
    const pool = this.insectGraphicsPools[type];
    if (pool.length > 0) {
        return pool.pop();
    }
    return this.make.graphics();
}

function returnGraphicsToPool(graphics, type) {
    graphics.clear();
    this.insectGraphicsPools[type].push(graphics);
}
```

**Benefit:** Eliminates create/destroy overhead = **20-30% performance gain**

---

### **🏆 PRIORITY 2: Optimize Rendering Pipeline**

#### **Strategy E: WebGL Shader for Defogging**
Replace canvas operations with custom shader:

```javascript
// Custom fragment shader
const defogShader = `
precision mediump float;
uniform sampler2D uMainSampler;
uniform vec2 uInsectPositions[30];
uniform float uInsectRadii[30];
uniform int uInsectCount;
varying vec2 outTexCoord;

void main() {
    vec4 color = texture2D(uMainSampler, outTexCoord);
    float totalAlpha = 0.0;
    
    for (int i = 0; i < 30; i++) {
        if (i >= uInsectCount) break;
        
        float dist = distance(gl_FragCoord.xy, uInsectPositions[i]);
        if (dist < uInsectRadii[i]) {
            totalAlpha += (1.0 - dist / uInsectRadii[i]);
        }
    }
    
    gl_FragColor = vec4(color.rgb, min(1.0, totalAlpha));
}
`;
```

**Benefit:** GPU-accelerated = **10x faster rendering**

---

#### **Strategy F: Reduce Draw Calls**
Instead of fillCircle() per pixel, use single fillStyle with gradient:

```javascript
// Instead of:
for (each pixel) {
    graphics.fillCircle(x, y, step * 0.5);
}

// Use:
graphics.fillCircle(centerX, centerY, radius); // ONE call with alpha gradient
```

**Benefit:** ~95% reduction in draw calls

---

### **🏆 PRIORITY 3: Optimize Pixel Sampling**

#### **Strategy G: Cache Image Data**
Pre-fetch entire image data once:

```javascript
// In create():
this.cachedImageData = this.imageContext.getImageData(
    0, 0, 
    this.hiddenImage.width, 
    this.hiddenImage.height
).data;

// Then access directly:
function getPixel(px, py) {
    const i = (py * this.hiddenImage.width + px) * 4;
    return {
        r: this.cachedImageData[i],
        g: this.cachedImageData[i + 1],
        b: this.cachedImageData[i + 2]
    };
}
```

**Benefit:** Eliminates slow getImageData() calls = **50% faster pixel access**

---

### **🏆 PRIORITY 4: Optimize Insect Updates**

#### **Strategy H: Spatial Partitioning**
Only update insects visible on screen:

```javascript
// Grid-based culling
const grid = new Map();
insects.forEach(insect => {
    const cellX = Math.floor(insect.sprite.x / 200);
    const cellY = Math.floor(insect.sprite.y / 200);
    const key = `${cellX},${cellY}`;
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key).push(insect);
});

// Only update insects in visible cells
const visibleCells = getVisibleCells(camera);
visibleCells.forEach(cell => {
    const insects = grid.get(cell) || [];
    insects.forEach(insect => updateInsect(insect));
});
```

**Benefit:** ~30% reduction when many off-screen insects

---

#### **Strategy I: Throttle Non-Critical Updates**
```javascript
// Update rotation/scale less frequently
if (this.updateFrameCounter % 3 === 0) {
    updateInsectVisuals(insect);
}

// Update waypoint less frequently for far insects
const distFromCamera = distance(insect, camera);
if (distFromCamera > 500 && this.updateFrameCounter % 5 !== 0) {
    return; // Skip this insect
}
```

**Benefit:** 20-40% reduction in update cost

---

### **🏆 PRIORITY 5: Optimize Memory Usage**

#### **Strategy J: Object Pooling for Particles**
```javascript
// Particle pool
this.particlePool = [];

spawnParticle() {
    if (this.particlePool.length > 0) {
        const particle = this.particlePool.pop();
        particle.setActive(true).setVisible(true);
        return particle;
    }
    return this.add.circle(...);
}

recycleParticle(particle) {
    particle.setActive(false).setVisible(false);
    this.particlePool.push(particle);
}
```

**Benefit:** Reduces GC pauses

---

## 📊 IMPLEMENTATION PRIORITY MATRIX

| Strategy | Impact | Difficulty | Time | Priority |
|----------|--------|------------|------|----------|
| **C: Pre-compute Edge Map** | 🔥🔥🔥 | ⭐⭐ | 2h | **HIGHEST** |
| **G: Cache Image Data** | 🔥🔥🔥 | ⭐ | 30min | **HIGHEST** |
| **B: Reduce Sampling** | 🔥🔥 | ⭐ | 15min | **HIGH** |
| **D: Graphics Pooling** | 🔥🔥 | ⭐⭐ | 1h | **HIGH** |
| **A: Spatial Hashing** | 🔥🔥 | ⭐⭐⭐ | 2h | MEDIUM |
| **F: Reduce Draw Calls** | 🔥🔥🔥 | ⭐⭐⭐⭐ | 4h | MEDIUM |
| **E: WebGL Shader** | 🔥🔥🔥🔥 | ⭐⭐⭐⭐⭐ | 8h | LOW (advanced) |
| **H: Spatial Partitioning** | 🔥 | ⭐⭐⭐ | 2h | LOW |
| **I: Throttle Updates** | 🔥 | ⭐ | 30min | LOW |
| **J: Object Pooling** | 🔥 | ⭐⭐ | 1h | LOW |

---

## 🎯 QUICK WINS (Implement First)

### **Step 1: Cache Image Data (30 minutes)**
```javascript
// Add to create() after loading image:
this.cachedImageData = this.imageContext.getImageData(
    0, 0, 
    this.hiddenImage.width, 
    this.hiddenImage.height
).data;

// Replace all getImageData(px, py, 1, 1) with:
const i = (py * this.hiddenImage.width + px) * 4;
const r = this.cachedImageData[i];
const g = this.cachedImageData[i + 1];
const b = this.cachedImageData[i + 2];
```

---

### **Step 2: Increase Sampling Step (15 minutes)**
```javascript
// In defogAtInsect(), change:
const step = Math.max(4, Math.floor(sampleRadius / 12));
// TO:
const baseStep = Math.max(6, Math.floor(sampleRadius / 8));
const insectFactor = Math.min(2, this.insects.length / 20);
const step = Math.floor(baseStep * insectFactor);
```

---

### **Step 3: Pre-compute Edge Map (2 hours)**
Implement Strategy C from above.

---

## 🔬 EXPECTED PERFORMANCE GAINS

**Current Performance (30 insects):**
- FPS: ~30-40 (stuttery)
- Frame time: ~25-33ms

**After Quick Wins (Steps 1-3):**
- FPS: ~55-60 (smooth!)
- Frame time: ~16-18ms
- **Improvement: 50-80% faster**

**After All HIGH Priority:**
- FPS: 60 (locked)
- Frame time: ~10-12ms
- **Improvement: 2-3x faster**

**With WebGL Shader (ultimate):**
- FPS: 60 (locked, even with 100+ insects)
- Frame time: ~5-8ms
- **Improvement: 5x faster**

---

## 🛠️ DEBUGGING PERFORMANCE

### **Add Performance Monitor**
```javascript
// In update():
if (this.updateFrameCounter % 60 === 0) {
    const avgFPS = this.game.loop.actualFps;
    const frameTime = this.game.loop.delta;
    console.log(`📊 FPS: ${avgFPS.toFixed(1)} | Frame Time: ${frameTime.toFixed(1)}ms | Insects: ${this.insects.length}`);
}
```

### **Profile Specific Functions**
```javascript
const startTime = performance.now();
this.defogAtInsect(insect);
const endTime = performance.now();
console.log(`Defog time: ${(endTime - startTime).toFixed(2)}ms`);
```

---

## 📈 PHASER-SPECIFIC OPTIMIZATIONS

### **1. Disable Auto-Clear**
```javascript
// In config:
render: {
    clearBeforeRender: false // Don't clear every frame
}
```

### **2. Reduce Physics Overhead**
```javascript
// If not using physics for insects:
this.physics.world.enable(insect, Phaser.Physics.Arcade.Body);
// Change to simple sprite movement
```

### **3. Use Sprite Sheets**
- Combine all insect sprites into one texture atlas
- Reduces texture swapping

### **4. Batch Render Textures**
```javascript
// Group similar operations:
this.bwCanvas.beginDraw();
insects.forEach(insect => {
    this.bwCanvas.draw(insect.graphics);
});
this.bwCanvas.endDraw();
```

---

## 🎮 FINAL RECOMMENDATIONS

**For Immediate 60 FPS with 30 insects:**
1. ✅ Cache image data (Step 1)
2. ✅ Increase sampling step (Step 2)
3. ✅ Pre-compute edge map (Step 3)
4. ✅ Graphics object pooling (Strategy D)

**Implementation time: ~4 hours**
**Expected result: Smooth 60 FPS with 30-40 insects**

---

## 🚀 BEYOND 30 INSECTS

For 50+ insects smooth performance:
- Implement WebGL shader (Strategy E)
- Spatial partitioning (Strategy H)
- Multi-threaded edge detection (Web Workers)

---

**Current Status:** v0.04 with basic optimizations
**Target:** 60 FPS with 30+ insects
**Achievable:** YES with HIGH priority optimizations (4-6 hours work)

---

*Document Version: 1.0*
*Last Updated: 2025-10-20*
