# ERGo! Spectral Balance Analysis

## Scientific Foundation

### Photoreceptor Model
- **Gaussian sensitivity curves** with ~50nm FWHM (Full Width Half Maximum)
- **Peak wavelengths** from scientific literature for each species
- **RGB mapping**: Blue ~450nm, Green ~550nm, Red ~650nm
- **Exaggeration factor**: 2.0x to enhance gameplay visual diversity

### Color Balance Strategy
Instead of discrete UV/B/G/R channels, each insect now has **weighted RGB sensitivity** based on actual photoreceptor overlap with screen phosphors.

## Spectral Weights by Family

### HYMENOPTERA (🐝 Bees, Wasps, Ants)

| Species | R | G | B | Profile |
|---------|-----|-----|-----|---------|
| **Honeybee** | 0.15 | 0.85 | 0.65 | Strong green (flower detection), moderate blue |
| **Bumblebee** | 0.10 | 0.90 | 0.70 | Very strong green (low-light flowers), good blue |
| **Hornet** | 0.12 | 0.75 | 0.85 | **Blue-shifted** for prey tracking |
| **Ant** | 0.05 | 1.00 | 0.35 | Pure green monochromat (chemical navigation) |

**Family Balance**: Green-dominant with blue variation. Hornet uniquely blue-shifted.

---

### DIPTERA (🪰 Flies, Mosquitoes)

| Species | R | G | B | Profile |
|---------|-----|-----|-----|---------|
| **Housefly** | 0.08 | 0.80 | 0.95 | **Cyan-shifted** (5 photoreceptors, includes 490nm) |
| **Hoverfly** | 0.10 | 0.75 | 1.00 | **Very strong blue** for hovering precision |
| **Mosquito** | 0.03 | 1.00 | 0.25 | Green monochromat (relies on CO2/heat) |
| **Horsefly** | 0.85 | 0.70 | 0.20 | **Strong RED vision** - rare! Hunts warm-blooded prey |

**Family Balance**: Most diverse family! Cyan (housefly), blue (hoverfly), green (mosquito), RED (horsefly).

---

### LEPIDOPTERA (🦋 Butterflies, Moths)

| Species | R | G | B | Profile |
|---------|-----|-----|-----|---------|
| **Peacock** | 0.18 | 0.80 | 0.75 | Balanced trichromat |
| **Cabbage White** | 0.95 | 0.90 | 0.70 | **FULL SPECTRUM** - 6 receptors! Best color vision |
| **Monarch** | 0.12 | 0.85 | 0.68 | UV-enhanced for sun compass navigation |
| **Hawk Moth** | 0.08 | 1.00 | 0.65 | Strong green for nectar flowers at dusk |

**Family Balance**: Cabbage White is the "generalist" with full RGB. Others green-biased.

---

### COLEOPTERA (🪲 Beetles)

| Species | R | G | B | Profile |
|---------|-----|-----|-----|---------|
| **Ladybug** | 0.05 | 1.00 | 0.60 | Very strong green (aphid detection) |
| **Firefly** | 0.15 | 0.95 | 0.75 | Green-blue for bioluminescence (no UV) |
| **Stag Beetle** | 0.15 | 1.00 | 0.30 | Green with yellow shift (poor nocturnal vision) |
| **Rose Chafer** | 0.75 | 0.80 | 0.15 | **Red-green vision** for flower finding |

**Family Balance**: Green-dominant except Rose Chafer with red sensitivity.

---

## Strategic Gameplay Combinations

### RED Coverage (Rare!)
Only **3 insects** have strong red (>0.7):
- Horsefly (0.85) - Diptera
- Cabbage White (0.95) - Lepidoptera  
- Rose Chafer (0.75) - Coleoptera

**Strategy**: Must include at least one of these three!

### BLUE Coverage
Strong blue (>0.7):
- Hornet (0.85) - Hymenoptera ✅
- Housefly (0.95) - Diptera ✅
- Hoverfly (1.00) - Diptera ✅
- Bumblebee (0.70) - Hymenoptera ✅
- Peacock (0.75) - Lepidoptera ✅
- Firefly (0.75) - Coleoptera ✅

**Strategy**: Multiple options, but Diptera/Hymenoptera strongest.

### GREEN Coverage (Common)
Nearly **all insects** have strong green (>0.7) - this is biologically accurate!

### Optimal Team Examples

**Maximum Coverage**:
- Hoverfly (0.10 R, 0.75 G, 1.00 B) - Strong blue
- Cabbage White (0.95 R, 0.90 G, 0.70 B) - Full spectrum
- Any other two

**Balanced Vision**:
- Hornet (0.12 R, 0.75 G, 0.85 B) - Blue specialist
- Horsefly (0.85 R, 0.70 G, 0.20 B) - Red specialist
- Monarch (0.12 R, 0.85 G, 0.68 B) - Green specialist
- Rose Chafer (0.75 R, 0.80 G, 0.15 B) - Red-green

**Poor Coverage** (avoid):
- Ant + Mosquito + Stag Beetle + Ladybug = All green, minimal red/blue!

---

## Visual Result Prediction

### Current Implementation (RGB Fog Layers)

Each insect erases fog proportional to their weights:
- **R fog layer**: Erased by insects with high `r` weight
- **G fog layer**: Erased by insects with high `g` weight  
- **B fog layer**: Erased by insects with high `b` weight

With MULTIPLY blend mode:
- Unerased R fog = image appears **cyan** (no red)
- Unerased G fog = image appears **magenta** (no green)
- Unerased B fog = image appears **yellow** (no blue)

### Expected Color Distribution

**Green-dominant insects** (ant, mosquito, bees):
- Erase G fog completely
- Leave R and B fog → Image appears **yellow-ish** where only they've been

**Blue specialists** (hoverfly, hornet):
- Erase B and G fog strongly
- Leave some R fog → Image appears **cyan-ish**

**Red specialists** (horsefly, rose chafer):
- Erase R and G fog
- Leave B fog → Image appears **yellow-greenish**

**Full spectrum** (cabbage white):
- Erases all RGB fog equally → **Natural colors** revealed!

---

## Scientific Accuracy vs. Gameplay

### What's Accurate:
✅ Green dominance in insects (most flowers reflect green)
✅ UV vision exists but can't be shown on RGB screens
✅ Red vision is rare (horsefly, some butterflies)
✅ Photoreceptor count varies (500-12000 ommatidia)
✅ Gaussian spectral sensitivity curves

### What's Exaggerated:
⚠️ 2x exaggeration factor to spread out RGB weights
⚠️ UV mapped to violet/blue (not physically accurate)
⚠️ Discrete RGB layers instead of continuous spectrum
⚠️ Simplified to 3 channels (real insects may have 2-6 receptors)

### Biological Realism Score: 7/10
Good enough for education, exaggerated enough for gameplay!

---

## Balancing Checklist

- [x] At least 3 insects with strong red (>0.7) ✅ Horsefly, Cabbage White, Rose Chafer
- [x] At least 6 insects with strong blue (>0.7) ✅ Multiple options
- [x] Most insects have strong green (biologically accurate) ✅
- [x] Each family has at least one "specialist" ✅
  - Hymenoptera: Hornet (blue)
  - Diptera: Horsefly (red), Hoverfly (blue)
  - Lepidoptera: Cabbage White (full)
  - Coleoptera: Rose Chafer (red-green)
- [x] No single color channel dominates all 16 insects ✅
- [x] Strategic team building required ✅

## Result
**BALANCED** ✅ - Good distribution with strategic depth!
