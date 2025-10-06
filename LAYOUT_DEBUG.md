# Panel Layout Calculation - Debug

## Current Settings (After Fix):
```javascript
panelWidth = 240
panelHeight = 250
spacing = 15
startY = 150
```

## Layout Positions:

### Top Row (y = 150):
- **Hymenoptera** (Top-Left): x = startX, y = 150
- **Diptera** (Top-Right): x = startX + 240 + 15, y = 150

### Bottom Row (y = 150 + 250 + 15 = 415):
- **Lepidoptera** (Bottom-Left): x = startX, y = 415
- **Coleoptera** (Bottom-Right): x = startX + 240 + 15, y = 415

## Vertical Space Check:
```
Top panels start: 150
Top panels height: 250
Top panels end: 150 + 250 = 400

Gap: 15

Bottom panels start: 415
Bottom panels height: 250
Bottom panels end: 415 + 250 = 665

Screen height: 720
Remaining space: 720 - 665 = 55px margin ✓
```

## All 4 panels should fit! ✓

Total vertical space used: 150 (start) + 250 (panel) + 15 (gap) + 250 (panel) = 665px
Within 720px screen ✓
