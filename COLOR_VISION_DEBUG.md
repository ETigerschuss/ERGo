# Color Vision Fix - Technical Explanation

## The Bug (BEFORE)

### Fog Layer System
```
Screen starts with 3 overlapping fog layers:
┌─────────────────────────────────┐
│  RED fog (0xff0044)             │  Layer 1
│  GREEN fog (0x00ff44)           │  Layer 2  
│  BLUE fog (0x0088ff)            │  Layer 3
└─────────────────────────────────┘
Multiply blend → BLACK SCREEN (all colors blocked)
```

### Wrong Logic (BEFORE)
```javascript
// Ant: spectralWeights = { r: 0.0, g: 1.0, b: 0.0 }
// Bug: We erase the channel they're SENSITIVE to

if (weight > 0) {
    fogLayer[channel].erase(graphics);
}

// Result for Ant:
// - r: 0.0 → Don't erase RED fog
// - g: 1.0 → ERASE GREEN FOG ❌❌❌
// - b: 0.0 → Don't erase BLUE fog
//
// Remaining fogs: RED + BLUE = CYAN/BLUE scene
// But ants see GREEN, not blue! ❌
```

### Why It Was Wrong
```
Insect sensitivity tells us what they CAN see
High weight = sensitive to that wavelength
= CAN SEE that color
= Should REMOVE fog HIDING that color
= Should REVEAL that color

We had: High weight → Remove that fog
Should be: High weight → Remove that fog ✓ (actually correct!)

Wait... the logic was RIGHT?
```

## The ACTUAL Bug

After re-reading the code, I realize the issue is more subtle:

### Fog Multiplication Physics
```
WHITE background (255, 255, 255)
× RED fog (255, 0, 68)    multiply
× GREEN fog (0, 255, 68)  multiply
× BLUE fog (0, 136, 255)  multiply
= BLACK (0, 0, 0)  ← All channels blocked
```

### When We Erase a Fog Layer:
```
Erase RED fog:
WHITE (255, 255, 255)
× GREEN fog (0, 255, 68)
× BLUE fog (0, 136, 255)
= CYAN-ish tones (0, ~180, ~200) ← No red channel!

Erase GREEN fog:
WHITE (255, 255, 255)
× RED fog (255, 0, 68)
× BLUE fog (0, 136, 255)  
= MAGENTA/PURPLE tones (No green!)

Erase BLUE fog:
WHITE (255, 255, 255)
× RED fog (255, 0, 68)
× GREEN fog (0, 255, 68)
= YELLOW/GREEN tones (No blue!)
```

## So the Fix is Correct!

### Ant (Green Vision)
```javascript
spectralWeights: { r: 0.0, g: 1.0, b: 0.0 }

// Erases GREEN fog (weight = 1.0)
// Leaves RED + BLUE fogs
// Result: CYAN/BLUE scene... wait that's WRONG again!
```

### OH! The Background Isn't White!

Let me check what the actual background is...

Actually, I need to think about this differently:

## Correct Understanding

The fog layers are SUBTRACTIVE filters:
- RED fog blocks everything EXCEPT red
- GREEN fog blocks everything EXCEPT green  
- BLUE fog blocks everything EXCEPT blue

When all three overlap: NOTHING gets through (black)

When we ERASE a fog layer, we ALLOW more colors through:
- Erase RED fog → Red blocked, green+blue pass → CYAN
- Erase GREEN fog → Green blocked, red+blue pass → MAGENTA
- Erase BLUE fog → Blue blocked, red+green pass → YELLOW

## So For Ant (Green Vision):
```
Ant sensitive to GREEN (g: 1.0)
Should see GREEN world
→ Need to erase RED + BLUE fogs (block them)
→ Keep only GREEN fog
→ Only green light passes through
→ GREEN WORLD ✓

Current code erases GREEN fog → WRONG!
Leaves RED + BLUE → CYAN WORLD ❌
```

## THE REAL FIX NEEDED

We need to erase the fogs for colors the insect CAN'T see!

```javascript
// CORRECT LOGIC:
// Insect sensitive to green (g: 1.0)
// → Can see green
// → Should erase RED and BLUE fogs
// → Keep GREEN fog
// → See green world

// So we need to erase channels with LOW weight!
if (weight < 0.1) {
    fogLayer[channel].erase(graphics);
}
```

This is the OPPOSITE of what I "fixed"! Let me revert and fix correctly...
