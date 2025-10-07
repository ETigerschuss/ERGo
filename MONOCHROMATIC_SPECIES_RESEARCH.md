# Monochromatic Insect Vision - Research Summary

## Question: Which insect orders have monochromatic species?

### Research Findings:

#### ✅ HYMENOPTERA (Bees, Wasps, Ants)
**Monochromatic Species:** Ants (most species)
- **Example:** Black Garden Ant (*Formica rufa*), Red Wood Ant (*Lasius niger*)
- **Receptor:** Single green receptor (~525nm)
- **Function:** Edge detection, chemical trail following
- **Game Implementation:** Ant is the FIRST species in Hymenoptera family

#### ✅ DIPTERA (Flies, Mosquitoes)
**Monochromatic Species:** Mosquitoes
- **Example:** Asian Tiger Mosquito (*Aedes albopictus*)
- **Receptor:** Single green receptor (~515nm)
- **Function:** Host detection primarily via CO2 and heat, not vision
- **Game Implementation:** Mosquito is the FIRST species in Diptera family

#### ❌ LEPIDOPTERA (Butterflies, Moths)
**Monochromatic Species:** NONE EXIST
- **All Lepidoptera have color vision** (minimum: UV + Blue + Green = trichromatic)
- **Reason:** Evolved for flower finding, which requires color discrimination
- **Even nocturnal moths** have trichromatic vision (just lack red receptors)
- **Simplest vision:** Hawk moths, small moths (still trichromatic UV+B+G)
- **Game Implementation:** Hawk moth is the FIRST species (no monochromat available)

**Scientific References:**
- Kelber, A. et al. (2002). *Nature* 419:922-925 - "Colour vision in nocturnal hawk moths"
- Briscoe, A.D. & Chittka, L. (2001). *Proc R Soc B* 268:891-898 - "Visual ecology of butterflies"

#### ✅ COLEOPTERA (Beetles)
**Monochromatic Species:** Some large nocturnal beetles
- **Example:** Stag Beetle (*Lucanus cervus*), some Rhinoceros beetles
- **Receptor:** Single green receptor (~525nm)
- **Function:** Nocturnal navigation, rely heavily on pheromones
- **Game Implementation:** Stag beetle is the FIRST species in Coleoptera family

### Game Progression by Family:

```
HYMENOPTERA:
1. Ant          → Monochromat (green only)     → B&W defog
2. Honeybee     → Trichromat (UV+B+G)          → Color defog
3. Bumblebee    → Trichromat+ (better)         → Color defog
4. Hornet       → Trichromat++ (best)          → Color defog

DIPTERA:
1. Mosquito     → Monochromat (green only)     → B&W defog
2. Vinegar Fly  → Hexachromat (6 receptors!)   → Color defog
3. Housefly     → Pentachromat (5 receptors)   → Color defog
4. Hoverfly     → Trichromat (6400 ommatidia)  → Color defog

LEPIDOPTERA: ⚠️ NO MONOCHROMATS AVAILABLE
1. Hawk Moth    → Trichromat (crepuscular)     → Color defog
2. Peacock      → Trichromat+ (diurnal)        → Color defog
3. Monarch      → Trichromat++ (navigator)     → Color defog
4. Cabbage White→ Tetrachromat (red receptor)  → Color defog

COLEOPTERA:
1. Stag Beetle  → Monochromat (green only)     → B&W defog
2. Firefly      → Dichromat (B+G, no UV)       → Color defog
3. Ladybug      → Trichromat (UV+B+G)          → Color defog
4. Rose Chafer  → Trichromat+ (red receptor)   → Color defog
```

### Why Lepidoptera Have No Monochromats:

**Evolutionary Pressure:**
- Butterflies and moths co-evolved with flowering plants (angiosperms)
- Flowers use color as primary signal for pollinators
- Color vision provides **massive survival advantage** for finding nectar
- Even nocturnal moths need UV vision to see white flowers at night
- Result: Natural selection eliminated monochromatic Lepidoptera

**Comparison with Other Orders:**
- **Ants:** Don't need color (use chemical trails, stay on ground)
- **Mosquitoes:** Don't need color (use CO2/heat to find hosts)
- **Stag beetles:** Nocturnal, use pheromones (minimal vision needed)
- **BUT Butterflies/Moths:** MUST find colored flowers → color vision mandatory

### Game Design Implications:

1. **Hymenoptera, Diptera, Coleoptera:** Start with monochromat (B&W painting)
2. **Lepidoptera:** Accept that first species has color vision
   - This is biologically accurate!
   - Alternative: Make hawk moth "defog B&W first" as game mechanic (even though it sees color)
   
3. **Educational Value:** 
   - Players learn that ALL butterflies/moths have color vision
   - Shows how evolution shapes sensory systems
   - Demonstrates diversity across insect orders

### Recommendations:

**Option A: Keep current system (biologically accurate)**
- Lepidoptera starts with hawk moth (color vision)
- Explain in tutorial: "All butterflies and moths see in color!"

**Option B: Game mechanic override**
- Hawk moth still has trichromatic vision (biologically)
- But for gameplay: defogs B&W first, then unlocks color
- Add tooltip: "Simplified for gameplay - real moths see UV+B+G"

**Recommendation:** Choose Option A for educational integrity.

---

*Last updated: October 2025*
*Data sources: See `insectVisionResearch.js` for peer-reviewed references*
