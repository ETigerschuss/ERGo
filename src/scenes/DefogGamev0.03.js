import { INSECT_DATABASE, SUPERFAMILY_EMOJI, COLOR_CHANNELS, SUPERFAMILIES, getInsectsBySuperfamily } from '../data/insectDatabaseReal.js';

export class DefogGame extends Phaser.Scene {

    constructor() {
        super('DefogGame');
    }

    init(data) {
        this.selectedInsects = data.selectedInsects || [];
        this.selectedFamilyIndex = data.selectedFamilyIndex !== undefined ? data.selectedFamilyIndex : 0;
        
        console.log('=== GAME STARTING ===');
        console.log('Selected insect IDs:', this.selectedInsects);
        console.log('Selected family index:', this.selectedFamilyIndex);
        
        // Get full insect data from database - store by family
        this.insectsByFamily = {};
        this.selectedInsects.forEach(id => {
            const data = INSECT_DATABASE[id];
            this.insectsByFamily[data.superfamily] = id;
        });
        
        console.log('Insects by family:', this.insectsByFamily);
        
        // Control state
        this.selectedInsectIndices = []; // Multiple selection support
        this.isMultiSelecting = false;
        
        // Species progression system - organized by VISION QUALITY across families
        this.familyProgression = {
            currentRound: 0,  // 0-3 for worst to best vision
            currentFamilyInRound: this.selectedFamilyIndex,  // Start with selected family!
            spawnCountForCurrentSpecies: 0,
            familiesCompletedInRound: 0  // Track how many families done in this round
        };
        
        // Species organized by VISION QUALITY (worst to best within each family)
        // Each family progresses from simple vision → advanced vision
        // Round 0: Worst vision from each family (monocromats/simple)
        // Round 1: Basic vision (dichromats/limited trichromats)
        // Round 2: Good vision (standard trichromats)
        // Round 3: Best vision (advanced trichromats/tetrachromats)
        this.speciesByFamily = [
            ['ant', 'honeybee', 'bumblebee', 'hornet'],              // Hymenoptera: mono→tri→tri+→tri++ (Index 0)
            ['mosquito', 'vinegar_fly', 'housefly', 'horsefly'],     // Diptera: mono→hexa→penta→tri+red (Index 1)
            ['hawk_moth', 'peacock', 'monarch', 'cabbage_white'],    // Lepidoptera: tri→tri+→tri++→tetra (Index 2)
            ['stag_beetle', 'firefly', 'ladybug', 'rose_chafer']     // Coleoptera: mono→di→tri→tri+red (Index 3)
        ];
        
        // Current species starts with the selected family's first species
        this.currentSpeciesId = this.speciesByFamily[this.selectedFamilyIndex][0];
        this.unlockedFamilies = [0, 1, 2, 3]; // All families unlocked from start
        
        const familyName = SUPERFAMILIES[this.selectedFamilyIndex];
        const firstSpecies = INSECT_DATABASE[this.currentSpeciesId];
        console.log(`Starting with ${familyName} - ${firstSpecies.name} (Family ${this.selectedFamilyIndex}, Round 0)`);
    }

    preload() {
        console.log('Loading image...');
        this.load.image('hiddenImage', 'assets/IMG_0061.jpg');
    }

    create() {
        console.log('=== CREATE STARTED ===');
        
        const width = this.scale.width;
        const height = this.scale.height;

        // Background
        this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0);

        // Add the image
        this.hiddenImage = this.add.image(width / 2, height / 2, 'hiddenImage');
        const scale = Math.min(width / this.hiddenImage.width, height / this.hiddenImage.height);
        this.hiddenImage.setScale(scale);

        // Store image bounds for later use
        this.imageBounds = {
            left: width / 2 - (this.hiddenImage.displayWidth / 2),
            right: width / 2 + (this.hiddenImage.displayWidth / 2),
            top: height / 2 - (this.hiddenImage.displayHeight / 2),
            bottom: height / 2 + (this.hiddenImage.displayHeight / 2)
        };
        console.log('Image bounds:', this.imageBounds);

        // Create fog layers with better visibility
        this.fogLayers = {};
        this.createColorFogLayers(width, height);

        // Create insects array (starts empty - insects spawn over time)
        this.insects = [];

        // Create corner-based family controls
        this.createCornerFamilyControls(width, height);

        // Input handling
        this.setupInputHandlers();
        
        // Start the first spawn timer (12 seconds to reduce lag)
        this.startSpawnTimer(12);

        // Instructions (split into two lines for readability)
        this.add.text(width / 2, 12, 'Click species box to program spawn point | Click insect to select, click to set path', {
            fontSize: '12px',
            color: '#ffffff',
            backgroundColor: '#000000dd',
            padding: { x: 10, y: 3 },
            align: 'center'
        }).setOrigin(0.5).setDepth(3000);
        
        this.add.text(width / 2, 28, 'Mini emojis select insects | Click empty area to command all insects', {
            fontSize: '12px',
            color: '#ffffff',
            backgroundColor: '#000000dd',
            padding: { x: 10, y: 3 },
            align: 'center'
        }).setOrigin(0.5).setDepth(3000);
        
        // Spectral evolution display at bottom
        this.createSpectralEvolutionDisplay(width, height);

        console.log('=== CREATE COMPLETE ===');
    }

    createColorFogLayers(width, height) {
        // TWO-LAYER APPROACH: B&W layer underneath, Color layer on top
        // Monochromats (ants): Paint B&W on bottom layer
        // Color insects: Paint colors on top layer
        // This ensures colors ALWAYS stay on top!
        
        this.fogLayers = {};
        
        // Hide the original image - we'll paint onto the revelation canvases instead
        this.hiddenImage.setAlpha(0);
        
        // Layer 1 (bottom): B&W revelation layer for monochromats
        const bwCanvas = this.add.renderTexture(0, 0, width, height);
        bwCanvas.setOrigin(0, 0);
        bwCanvas.fill(0x000000, 1.0);  // Start black
        bwCanvas.setDepth(199);  // Below color layers
        this.bwCanvas = bwCanvas;
        
        // Layers 2-4: Color revelation layers - split into 3 RGB channel layers!
        // These paint OVER the B&W layer with normal blending to replace it
        // Red channel layer
        this.colorCanvasR = this.add.renderTexture(0, 0, width, height);
        this.colorCanvasR.setOrigin(0, 0);
        this.colorCanvasR.fill(0x000000, 0);  // Start transparent
        this.colorCanvasR.setDepth(200);
        
        // Green channel layer
        this.colorCanvasG = this.add.renderTexture(0, 0, width, height);
        this.colorCanvasG.setOrigin(0, 0);
        this.colorCanvasG.fill(0x000000, 0);  // Start transparent
        this.colorCanvasG.setDepth(201);
        
        // Blue channel layer
        this.colorCanvasB = this.add.renderTexture(0, 0, width, height);
        this.colorCanvasB.setOrigin(0, 0);
        this.colorCanvasB.fill(0x000000, 0);  // Start transparent
        this.colorCanvasB.setDepth(202);
        
        // Use ADD blend between color channels to mix them together
        // But they use NORMAL blend over the B&W layer (default)
        this.colorCanvasG.setBlendMode(Phaser.BlendModes.ADD);
        this.colorCanvasB.setBlendMode(Phaser.BlendModes.ADD);
        
        // Create an off-screen canvas to read pixel data from the image
        // This is needed because Phaser doesn't have direct pixel access
        this.imageCanvas = document.createElement('canvas');
        this.imageCanvas.width = this.hiddenImage.width;
        this.imageCanvas.height = this.hiddenImage.height;
        this.imageContext = this.imageCanvas.getContext('2d', { willReadFrequently: true });
        
        // Draw the image onto the canvas so we can read pixels
        const imageTexture = this.textures.get('hiddenImage').getSourceImage();
        this.imageContext.drawImage(imageTexture, 0, 0);
        
        console.log('Three-channel revelation system created');
        console.log('Layer 1 (depth 199): B&W for monochromats');
        console.log('Layers 2-4 (depth 200-202): R, G, B channels');
        console.log('Red uses NORMAL blend, Green/Blue use ADD to combine');
        console.log('Color layers paint OVER B&W, replacing it with actual colors!');
        console.log('Each channel accumulates independently based on spectral weights!');
    }

    createSpectrumIndicators(x, y, insectData) {
        // Show sensitivity as colored bars scaled by spectral weights
        // Monochromats get B&W gradient bar, multichromats get RGB bars
        const indicators = [];
        const weights = insectData.spectralWeights || { r: 0.33, g: 0.33, b: 0.33 };
        const isMonochromat = insectData.colorSpectrum.length === 1;
        const maxHeight = 18;
        
        if (isMonochromat) {
            // Black to white gradient bar for monochromats (single bar on right)
            const barX = x + 8;
            
            // Black part (bottom)
            const blackBar = this.add.rectangle(
                barX, 
                y + maxHeight * 0.75,
                8, 
                maxHeight / 2, 
                0x000000, 
                0.9
            ).setDepth(1003);
            blackBar.setStrokeStyle(1, 0x888888, 0.5);
            indicators.push(blackBar);
            
            // White part (top)
            const whiteBar = this.add.rectangle(
                barX, 
                y + maxHeight * 0.25,
                8, 
                maxHeight / 2, 
                0xffffff, 
                0.9
            ).setDepth(1003);
            whiteBar.setStrokeStyle(1, 0x888888, 0.5);
            indicators.push(whiteBar);
            
        } else {
            // RGB bars for multichromats - all on RIGHT side
            const channels = [
                { key: 'r', color: 0xff0000, offset: 0 },
                { key: 'g', color: 0x00ff00, offset: 12 },
                { key: 'b', color: 0x0000ff, offset: 24 }
            ];
            
            channels.forEach(ch => {
                const weight = weights[ch.key];
                const barHeight = Math.max(2, weight * maxHeight);
                
                // All bars positioned to the right, spaced horizontally
                const bar = this.add.rectangle(
                    x + ch.offset, 
                    y + (maxHeight - barHeight) / 2,
                    8, 
                    barHeight, 
                    ch.color, 
                    0.8
                ).setDepth(1003);
                bar.setStrokeStyle(1, 0xffffff, 0.5);
                indicators.push(bar);
            });
        }
        
        return indicators;
    }

    createCornerFamilyControls(width, height) {
        // Create control panels in all 4 corners (one per family)
        // NEW v0.03: Each corner shows ALL 4 species in a HORIZONTAL ROW (1x4)
        // Corner positions match family selection and speciesByFamily array order:
        // Position boxes just above/below image bounds to avoid overlap
        
        const cornerPositions = [
            { x: 10, y: this.imageBounds.bottom + 10, corner: 'bottom-left' },   // Hymenoptera - below image
            { x: 10, y: 10, corner: 'top-left' },       // Diptera - top of screen
            { x: width - 310, y: 10, corner: 'top-right' },  // Lepidoptera - top of screen (wider for 4 boxes)
            { x: width - 310, y: this.imageBounds.bottom + 10, corner: 'bottom-right' } // Coleoptera - below image
        ];
        
        // Short display names for UI
        // Latin names for species boxes (genus only - first word)
        const shortNames = {
            ant: 'Formica', honeybee: 'Apis', bumblebee: 'Bombus', hornet: 'Vespa',
            mosquito: 'Aedes', vinegar_fly: 'Drosophila', housefly: 'Musca', horsefly: 'Tabanus',
            hawk_moth: 'Macroglossum', peacock: 'Aglais', monarch: 'Danaus', cabbage_white: 'Pieris',
            stag_beetle: 'Lucanus', firefly: 'Photinus', ladybug: 'Coccinella', rose_chafer: 'Cetonia'
        };
        
        // Species box dimensions - more compact
        const boxWidth = 72;
        const boxHeight = 60; // Reduced from 80
        const spacing = 2;
        
        this.familyControls = [];
        this.speciesBoxes = []; // Store all species boxes for highlighting
        
        SUPERFAMILIES.forEach((superfamily, familyIndex) => {
            const cornerPos = cornerPositions[familyIndex];
            const species = this.speciesByFamily[familyIndex];
            const isSelectedFamily = (familyIndex === this.selectedFamilyIndex);
            
            // Create HORIZONTAL ROW of 4 species boxes for this family
            const speciesBoxesForFamily = [];
            
            for (let i = 0; i < 4; i++) {
                const speciesId = species[i];
                const insectData = INSECT_DATABASE[speciesId];
                
                // Horizontal position (1x4 row)
                const boxX = cornerPos.x + i * (boxWidth + spacing);
                const boxY = cornerPos.y;
                
                // Determine if this is current or next species
                const isCurrent = (speciesId === this.currentSpeciesId);
                const isNext = this.isNextSpecies(familyIndex, i);
                
                // Species box background
                let boxColor = 0x0f1520; // Default dark
                let borderColor = 0x333333; // Default gray
                
                if (isCurrent) {
                    boxColor = 0x16213e; // Active blue
                    borderColor = 0x00ff00; // Green for current
                } else if (isNext) {
                    boxColor = 0x1a1a0e; // Yellowish tint
                    borderColor = 0xffaa00; // Yellow for next
                }
                
                const box = this.add.rectangle(
                    boxX, boxY, boxWidth, boxHeight, 
                    boxColor, 0.9
                ).setOrigin(0).setDepth(3000); // HIGH DEPTH - in front of everything
                box.setStrokeStyle(2, borderColor);
                
                // Make box interactive for current/next species
                if (isCurrent || isNext) {
                    box.setInteractive({ useHandCursor: true });
                }
                
                // Loading bar above box (for current species only initially)
                const loadingBarBg = this.add.rectangle(
                    boxX, boxY - 3, boxWidth, 3, 0x333333, 0.8
                ).setOrigin(0).setDepth(3001);
                
                const loadingBarFill = this.add.rectangle(
                    boxX, boxY - 3, 0, 3, 0x00ff00, 1
                ).setOrigin(0).setDepth(3002);
                
                loadingBarFill.setVisible(isCurrent); // Only show for current species
                loadingBarBg.setVisible(isCurrent);
                
                // Waypoint indicator (shows if waypoint is programmed)
                const waypointIndicator = this.add.circle(
                    boxX + boxWidth - 8, boxY + 8, 5, 0x00ff00, 0
                ).setDepth(3003);
                waypointIndicator.setStrokeStyle(2, 0x00ff00);
                waypointIndicator.setVisible(false); // Hidden until waypoint set
                
                // Emoji (larger for current/next) - positioned on LEFT side
                const emoji = this.getSpeciesEmoji(speciesId);
                const emojiSize = isCurrent ? '24px' : (isNext ? '20px' : '16px');
                const emojiY = boxY + 14;
                const emojiX = boxX + 14; // Left side positioning
                const emojiText = this.add.text(
                    emojiX, 
                    emojiY + 3, // Offset down to prevent top cropping
                    emoji, 
                    { fontSize: emojiSize }
                ).setOrigin(0.5, 0.35).setDepth(3001); // Adjusted Y origin for emoji ascent
                
                // Sensitivity bars on RIGHT side (after emoji on left)
                const weights = insectData.spectralWeights || { r: 0.33, g: 0.33, b: 0.33 };
                const isMonochromat = insectData.colorSpectrum.length === 1;
                const barWidth = 4;
                const maxBarHeight = 10;
                const barStartX = boxX + boxWidth - 18; // Right side of box
                
                const sensitivityBars = [];
                
                if (isMonochromat) {
                    // Black to white gradient bar for monochromats
                    const barX = barStartX;
                    const barHeight = maxBarHeight;
                    
                    // Create gradient bar using two rectangles (black bottom, white top)
                    const blackPart = this.add.rectangle(
                        barX,
                        emojiY + barHeight / 4,
                        barWidth,
                        barHeight / 2,
                        0x000000,
                        0.9
                    ).setOrigin(0.5, 0.5).setDepth(3001);
                    blackPart.setStrokeStyle(1, 0x888888, 0.4);
                    
                    const whitePart = this.add.rectangle(
                        barX,
                        emojiY - barHeight / 4,
                        barWidth,
                        barHeight / 2,
                        0xffffff,
                        0.9
                    ).setOrigin(0.5, 0.5).setDepth(3001);
                    whitePart.setStrokeStyle(1, 0x888888, 0.4);
                    
                    sensitivityBars.push(blackPart, whitePart);
                } else {
                    // RGB bars for multichromats - ALL on RIGHT side
                    const channels = [
                        { key: 'r', color: 0xff0000 },
                        { key: 'g', color: 0x00ff00 },
                        { key: 'b', color: 0x0000ff }
                    ];
                    
                    channels.forEach((ch, idx) => {
                        const weight = weights[ch.key];
                        const barHeight = Math.max(2, weight * maxBarHeight);
                        
                        // All bars on RIGHT side, spaced horizontally
                        const barX = barStartX - (2 - idx) * 6; // Right to left: R, G, B
                        
                        const bar = this.add.rectangle(
                            barX,
                            emojiY,
                            barWidth,
                            barHeight,
                            ch.color,
                            0.7
                        ).setOrigin(0.5, 0.5).setDepth(3001);
                        bar.setStrokeStyle(1, 0xffffff, 0.4);
                        sensitivityBars.push(bar);
                    });
                }
                
                // Short name BELOW emoji and bars
                const nameColor = isCurrent ? '#00ff00' : (isNext ? '#ffaa00' : '#888888');
                const nameText = this.add.text(
                    boxX + boxWidth / 2,
                    boxY + 30,
                    shortNames[speciesId] || insectData.name,
                    {
                        fontSize: '7px',
                        color: nameColor,
                        align: 'center'
                    }
                ).setOrigin(0.5, 0.5).setDepth(3001);
                
                // Mini emoji container BELOW name row (freed up space!)
                const miniEmojiY = boxY + 40;
                const miniEmojiContainer = this.add.container(boxX, miniEmojiY).setDepth(3004);
                
                // Store box data for later updates
                const boxData = {
                    familyIndex,
                    speciesIndex: i,
                    speciesId,
                    box,
                    boxX,
                    boxY,
                    emojiText,
                    nameText,
                    sensitivityBars,
                    loadingBarBg,
                    loadingBarFill,
                    waypointIndicator,
                    miniEmojiContainer,
                    miniEmojis: [], // Will store mini emoji sprites
                    programmedWaypoint: null, // Will store {x, y} when waypoint is set
                    isCurrent,
                    isNext
                };
                
                // Attach click handler to ALL boxes (but only make current/next interactive)
                box.on('pointerdown', (pointer) => {
                    console.log(`📦 BOX CLICK HANDLER FIRED for ${boxData.speciesId}`);
                    if (!pointer.event.shiftKey && !pointer.event.ctrlKey) {
                        // Stop event propagation to prevent insect selection
                        if (pointer.event && pointer.event.stopPropagation) {
                            pointer.event.stopPropagation();
                        }
                        this.handleSpeciesBoxClick(boxData, pointer);
                    }
                });
                
                box.on('pointerover', () => {
                    if (boxData.isCurrent || boxData.isNext) {
                        const hoverColor = boxData.isCurrent ? 0x1a2a5e : 0x2a2a1e;
                        box.setFillStyle(hoverColor, 1);
                    }
                });
                
                box.on('pointerout', () => {
                    if (boxData.isCurrent || boxData.isNext) {
                        const normalColor = boxData.isCurrent ? 0x16213e : 0x1a1a0e;
                        box.setFillStyle(normalColor, 0.9);
                    }
                });
                
                speciesBoxesForFamily.push(boxData);
                this.speciesBoxes.push(boxData);
            }
            
            // Family emoji removed - cleaner look in game
            
            // Store control data
            this.familyControls.push({
                superfamily,
                familyIndex,
                speciesBoxes: speciesBoxesForFamily,
                spawnPosition: { 
                    x: cornerPos.x + boxWidth,
                    y: cornerPos.y + boxHeight
                },
                isUnlocked: true,
                isActive: isSelectedFamily
            });
        });
        
        // Initialize box highlights and click handlers
        this.updateSpeciesBoxHighlights();
    }

    isNextSpecies(familyIndex, speciesIndex) {
        // Determine if this species is next to spawn
        const nextFamilyIndex = this.getNextFamilyIndex();
        const nextRound = this.getNextRound();
        
        return (familyIndex === nextFamilyIndex && speciesIndex === nextRound);
    }
    
    getNextFamilyIndex() {
        // Get the next family that will spawn
        let nextFamily = this.familyProgression.currentFamilyInRound + 1;
        if (nextFamily >= 4) nextFamily = 0;
        return nextFamily;
    }
    
    getNextRound() {
        // Get the next round (species within family)
        const familiesLeft = 4 - this.familyProgression.familiesCompletedInRound - 1;
        if (familiesLeft > 0) {
            // Same round, different family
            return this.familyProgression.currentRound;
        } else {
            // Next round
            let nextRound = this.familyProgression.currentRound + 1;
            if (nextRound >= 4) nextRound = 0;
            return nextRound;
        }
    }
    
    handleSpeciesBoxClick(boxData, pointer) {
        // Click on current (green) or next (yellow) species box to open waypoint mode
        // Next click on the image sets ONE waypoint for this species
        console.log(`Species box clicked: ${boxData.speciesId} (${boxData.isCurrent ? 'CURRENT' : 'NEXT'})`);
        
        // IMPORTANT: Deselect all insects to avoid conflict with waypoint mode
        this.insects.forEach(insect => {
            if (insect && insect.isSelected) {
                insect.isSelected = false;
                insect.selectionRing.setAlpha(0);
                if (insect.spectrumIndicators) {
                    insect.spectrumIndicators.forEach(ind => ind.setVisible(false));
                }
                if (insect.lifespanCircle) insect.lifespanCircle.setVisible(false);
                if (insect.lifespanCircleBg) insect.lifespanCircleBg.setAlpha(0);
            }
        });
        this.selectedInsectIndices = [];
        
        // Enter waypoint programming mode
        this.waypointProgrammingMode = true;
        this.waypointProgrammingSpecies = boxData;
        
        // Visual feedback - make box pulse
        this.tweens.add({
            targets: boxData.box,
            alpha: 0.6,
            duration: 200,
            yoyo: true,
            repeat: 1
        });
        
        // Show instruction
        if (this.waypointInstruction) {
            this.waypointInstruction.destroy();
        }
        
        const instructionColor = boxData.isCurrent ? '#00ff00' : '#ffaa00';
        const speciesName = INSECT_DATABASE[boxData.speciesId].name;
        
        this.waypointInstruction = this.add.text(
            640, 45,
            `Click on image to set spawn point for ${speciesName}`,
            {
                fontSize: '16px',
                color: instructionColor,
                backgroundColor: '#000000dd',
                padding: { x: 20, y: 10 }
            }
        ).setOrigin(0.5).setDepth(5000);
        
        // Auto-hide after 3 seconds
        this.time.delayedCall(3000, () => {
            if (this.waypointInstruction) {
                this.waypointInstruction.destroy();
                this.waypointInstruction = null;
            }
        });
    }
    
    updateMiniEmojis() {
        // Update mini emoji displays for all species boxes
        if (!this.speciesBoxes || !this.insects) return;
        
        this.speciesBoxes.forEach(boxData => {
            // Clear existing mini emojis
            boxData.miniEmojis.forEach(mini => mini.destroy());
            boxData.miniEmojis = [];
            
            // Find all insects of this species
            const insectsOfThisSpecies = this.insects.filter(insect => 
                insect.insectId === boxData.speciesId && !insect.isDead
            );
            
            // Create mini emojis (max 10 shown)
            const maxShow = 10;
            const toShow = insectsOfThisSpecies.slice(0, maxShow);
            const emoji = this.getSpeciesEmoji(boxData.speciesId);
            
            toShow.forEach((insect, index) => {
                const miniX = (index % 5) * 14 + 2; // 5 per row
                const miniY = Math.floor(index / 5) * 14;
                
                // Create tiny lifespan circle around mini-emoji
                const lifespanRatio = 1 - (insect.age / insect.lifespan);
                const circleRadius = 7;
                const circleGraphics = this.add.graphics().setDepth(2003);
                
                // Determine color based on lifespan
                let circleColor;
                if (lifespanRatio > 0.5) {
                    circleColor = 0x00ff00; // Green
                } else if (lifespanRatio > 0.25) {
                    circleColor = 0xffaa00; // Yellow
                } else {
                    circleColor = 0xff0000; // Red
                }
                
                // Draw arc showing remaining lifespan
                circleGraphics.lineStyle(1.5, circleColor, 0.6);
                circleGraphics.beginPath();
                const startAngle = -90; // Start from top
                const endAngle = startAngle + (360 * lifespanRatio);
                circleGraphics.arc(
                    miniX + circleRadius,
                    miniY + circleRadius,
                    circleRadius,
                    Phaser.Math.DegToRad(startAngle),
                    Phaser.Math.DegToRad(endAngle),
                    false
                );
                circleGraphics.strokePath();
                
                boxData.miniEmojiContainer.add(circleGraphics);
                boxData.miniEmojis.push(circleGraphics);
                
                // Store reference to update later
                insect.miniLifespanCircle = circleGraphics;
                insect.miniLifespanCirclePos = { x: miniX + circleRadius, y: miniY + circleRadius };
                
                const miniEmoji = this.add.text(miniX + circleRadius, miniY + circleRadius + 1.5, emoji, {
                    fontSize: '12px'
                }).setOrigin(0.5, 0.35).setDepth(2004); // Adjusted Y origin for emoji ascent
                
                // Highlight if this insect is currently selected
                if (insect.isSelected) {
                    miniEmoji.setTint(0x00ff00);
                    miniEmoji.setScale(1.3);
                }
                
                // Make clickable
                miniEmoji.setInteractive({ useHandCursor: true });
                miniEmoji.on('pointerdown', () => {
                    this.selectInsectFromMini(insect);
                });
                
                // Hover effect
                miniEmoji.on('pointerover', () => {
                    if (!insect.isSelected) {
                        miniEmoji.setScale(1.2);
                    }
                });
                miniEmoji.on('pointerout', () => {
                    if (!insect.isSelected) {
                        miniEmoji.setScale(1.0);
                    }
                });
                
                boxData.miniEmojiContainer.add(miniEmoji);
                boxData.miniEmojis.push(miniEmoji);
            });
            
            // Show count if more than max
            if (insectsOfThisSpecies.length > maxShow) {
                const countText = this.add.text(2, 28, `+${insectsOfThisSpecies.length - maxShow}`, {
                    fontSize: '8px',
                    color: '#ffaa00'
                }).setOrigin(0).setDepth(2004);
                
                boxData.miniEmojiContainer.add(countText);
                boxData.miniEmojis.push(countText);
            }
        });
    }
    
    selectInsectFromMini(insect) {
        // Select an insect by clicking its mini emoji
        console.log(`Selected insect from mini emoji: ${insect.insectId}`);
        
        // Deselect all insects and hide their indicators
        this.insects.forEach(i => {
            i.isSelected = false;
            i.selectionRing.setAlpha(0);
            // Hide indicators for deselected insects
            if (i.spectrumIndicators) {
                i.spectrumIndicators.forEach(ind => ind.setVisible(false));
            }
            if (i.lifespanCircle) i.lifespanCircle.setVisible(false);
            if (i.lifespanCircleBg) i.lifespanCircleBg.setAlpha(0);
        });
        
        // Select this insect and show indicators
        insect.isSelected = true;
        // DON'T show selection ring - only lifespan circle
        insect.selectionRing.setAlpha(0);
        
        // HIDE sensitivity bars, SHOW circular lifespan when selected via mini-emoji
        if (insect.spectrumIndicators) {
            insect.spectrumIndicators.forEach(ind => ind.setVisible(false));
        }
        if (insect.lifespanCircle) insect.lifespanCircle.setVisible(true);
        if (insect.lifespanCircleBg) insect.lifespanCircleBg.setAlpha(1);
        
        // Clear previous selection indices
        this.selectedInsectIndices = [insect.index];
        
        // Show path if waypoints exist
        this.redrawInsectPath(insect);
    }
    
    redrawInsectPath(insect) {
        // Redraw the path for an insect with appropriate color
        if (!insect.pathGraphics) return;
        
        insect.pathGraphics.clear();
        
        if (insect.waypoints && insect.waypoints.length > 0) {
            // Determine path color based on species
            const isCurrent = (insect.insectId === this.currentSpeciesId);
            const isNext = this.isNextSpecies(
                this.getCurrentFamilyIndexForSpecies(insect.insectId),
                this.getCurrentSpeciesIndexForSpecies(insect.insectId)
            );
            
            const pathColor = isCurrent ? 0x00ff00 : (isNext ? 0xffaa00 : 0x4444ff);
            
            insect.pathGraphics.lineStyle(2, pathColor, 0.6);
            insect.pathGraphics.beginPath();
            insect.pathGraphics.moveTo(insect.sprite.x, insect.sprite.y);
            
            insect.waypoints.forEach(waypoint => {
                insect.pathGraphics.lineTo(waypoint.x, waypoint.y);
            });
            
            insect.pathGraphics.strokePath();
            
            // Draw waypoint dots
            insect.waypoints.forEach(waypoint => {
                insect.pathGraphics.fillStyle(pathColor, 0.8);
                insect.pathGraphics.fillCircle(waypoint.x, waypoint.y, 4);
            });
        }
    }
    
    getCurrentFamilyIndexForSpecies(speciesId) {
        // Find which family this species belongs to
        for (let i = 0; i < this.speciesByFamily.length; i++) {
            if (this.speciesByFamily[i].includes(speciesId)) {
                return i;
            }
        }
        return -1;
    }
    
    getCurrentSpeciesIndexForSpecies(speciesId) {
        // Find which index within family this species is
        const familyIndex = this.getCurrentFamilyIndexForSpecies(speciesId);
        if (familyIndex === -1) return -1;
        return this.speciesByFamily[familyIndex].indexOf(speciesId);
    }
    
    updateSpeciesBoxHighlights() {
        // Update all species boxes to reflect current/next status
        if (!this.speciesBoxes) return;
        
        this.speciesBoxes.forEach(boxData => {
            const isCurrent = (boxData.speciesId === this.currentSpeciesId);
            const isNext = this.isNextSpecies(boxData.familyIndex, boxData.speciesIndex);
            
            // Update box appearance
            let boxColor = 0x0f1520;
            let borderColor = 0x333333;
            let nameColor = '#888888';
            let emojiSize = '20px';
            
            if (isCurrent) {
                boxColor = 0x16213e;
                borderColor = 0x00ff00;
                nameColor = '#00ff00';
                emojiSize = '28px';
            } else if (isNext) {
                boxColor = 0x1a1a0e;
                borderColor = 0xffaa00;
                nameColor = '#ffaa00';
                emojiSize = '24px';
            }
            
            boxData.box.setFillStyle(boxColor, 0.9);
            boxData.box.setStrokeStyle(2, borderColor);
            boxData.nameText.setColor(nameColor);
            boxData.emojiText.setFontSize(emojiSize);
            
            // Update loading bar visibility
            const showLoadingBar = isCurrent;
            boxData.loadingBarBg.setVisible(showLoadingBar);
            boxData.loadingBarFill.setVisible(showLoadingBar);
            
            // Update waypoint marker color when species becomes current
            if (boxData.waypointMarker && boxData.programmedWaypoint) {
                const markerColor = isCurrent ? 0x00ff00 : 0xffaa00;
                boxData.waypointMarker.setFillStyle(markerColor, 0.6);
                boxData.waypointMarker.setStrokeStyle(2, markerColor);
            }
            if (boxData.waypointIndicator && boxData.programmedWaypoint) {
                const indicatorColor = isCurrent ? 0x00ff00 : 0xffaa00;
                boxData.waypointIndicator.setFillStyle(indicatorColor, 1);
                boxData.waypointIndicator.setStrokeStyle(2, indicatorColor);
            }
            
            // Update interactivity (only current and next can be clicked)
            if (isCurrent || isNext) {
                // Make interactive if not already
                if (!boxData.box.input) {
                    console.log(`🔧 Making box interactive for ${boxData.speciesId} (${isCurrent ? 'CURRENT' : 'NEXT'})`);
                    boxData.box.setInteractive({ useHandCursor: true });
                }
            } else if (!isCurrent && !isNext && boxData.box.input) {
                // Disable interactivity for inactive boxes
                boxData.box.disableInteractive();
            }
            
            boxData.isCurrent = isCurrent;
            boxData.isNext = isNext;
        });
        
        // Update mini emojis to show active insects
        this.updateMiniEmojis();
    }

    createFamilyPanel(pos, superfamily, familyIndex, isUnlocked, isActive = false) {
        const panelWidth = 220;
        const panelHeight = 140;
        
        let panelX = pos.x;
        let panelY = pos.y;
        
        // Panel background (greyed out if locked)
        const panel = this.add.rectangle(panelX, panelY, panelWidth, panelHeight, 
            isUnlocked ? 0x1a1a2e : 0x0a0a0a, 0.95);
        panel.setStrokeStyle(3, isUnlocked ? 0xffcc00 : 0x333333);
        panel.setDepth(2000);
        
        // Family emoji and title
        const titleY = panelY - panelHeight / 2 + 20;
        const emoji = SUPERFAMILY_EMOJI[superfamily];
        this.add.text(panelX, titleY, `${emoji} ${superfamily}`, {
            fontSize: '14px',
            color: isUnlocked ? '#ffcc00' : '#666666',
            align: 'center',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(2001).setAlpha(isUnlocked ? 1 : 0.5);
        
        if (!isUnlocked) {
            // Locked indicator
            const lockedText = this.add.text(panelX, panelY, '🔒 Locked', {
                fontSize: '18px',
                color: '#666666'
            }).setOrigin(0.5).setDepth(2001);
            
            return { 
                panel, 
                superfamily, 
                familyIndex, 
                panelX, 
                panelY, 
                isUnlocked: false, 
                lockedText: lockedText 
            };
        }
        
        // Current species display (only for unlocked, active family)
        const buttonY = panelY + 10;
        
        // Species button
        const speciesButton = this.add.rectangle(panelX, buttonY, panelWidth - 20, 60, 
            isActive ? 0x16213e : 0x0a0a0a, 0.9);
        speciesButton.setStrokeStyle(2, isActive ? 0x00ff00 : 0x333333);
        speciesButton.setDepth(2001);
        
        // Species info (only shown for active family)
        let speciesEmoji = null;
        let speciesName = null;
        let loadingTimer = null;
        let loadingBarBg = null;
        let loadingBarFill = null;
        
        if (isActive) {
            const currentSpecies = INSECT_DATABASE[this.currentSpeciesId];
            const emojiText = this.getSpeciesEmoji(this.currentSpeciesId);
            
            speciesEmoji = this.add.text(panelX - 70, buttonY, emojiText, {
                fontSize: '32px'
            }).setOrigin(0.5).setDepth(2002);
            
            speciesName = this.add.text(panelX - 45, buttonY - 10, currentSpecies.name, {
                fontSize: '12px',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0, 0.5).setDepth(2002);
            
            // Loading bar background (smaller - 100px width, 6px height)
            loadingBarBg = this.add.rectangle(panelX - 45, buttonY + 10, 100, 6, 0x333333, 0.8);
            loadingBarBg.setOrigin(0, 0.5).setDepth(2002);
            
            // Loading bar fill (grows from 0 to full)
            loadingBarFill = this.add.rectangle(panelX - 45, buttonY + 10, 0, 6, 0x00ff00, 1);
            loadingBarFill.setOrigin(0, 0.5).setDepth(2003);
            
            loadingTimer = this.add.text(panelX - 45, buttonY + 8, '5s', {
                fontSize: '9px',
                color: '#ffaa00',
                fontStyle: 'bold'
            }).setOrigin(0, 0.5).setDepth(2004);
            
            // Store for updates
            this.currentSpeciesEmoji = speciesEmoji;
            this.currentSpeciesName = speciesName;
            this.loadingTimer = loadingTimer;
            this.loadingBarBg = loadingBarBg;
            this.loadingBarFill = loadingBarFill;
        } else {
            const waitingText = this.add.text(panelX, buttonY, 'Waiting...', {
                fontSize: '12px',
                color: '#666666'
            }).setOrigin(0.5).setDepth(2002);
            
            // Store reference to remove it later when family becomes active
            if (!this.waitingTexts) this.waitingTexts = {};
            this.waitingTexts[familyIndex] = waitingText;
        }
        
        // Stats below button
        const statsY = panelY + panelHeight / 2 - 20;
        const statsText = this.add.text(panelX, statsY, `Progress: 0/20`, {
            fontSize: '10px',
            color: '#aaaaaa'
        }).setOrigin(0.5).setDepth(2001);
        
        return { 
            panel,
            superfamily,
            familyIndex,
            panelX,
            panelY: buttonY,
            isUnlocked: true,
            isActive,
            speciesButton,
            speciesEmoji,
            speciesName,
            loadingTimer,
            loadingBarBg,
            loadingBarFill,
            statsText,
            spawnPosition: { x: panelX, y: buttonY }
        };
    }

    getSpeciesEmoji(insectId) {
        const emojiMap = {
            // Hymenoptera
            'ant': '🐜',
            'honeybee': '🐝',
            'bumblebee': '🐝',
            'hornet': '🐝',
            // Diptera
            'mosquito': '🦟',
            'housefly': '🪰',
            'vinegar_fly': '🪰',
            'horsefly': '🪰',
            'robber_fly': '🪰',
            // Lepidoptera
            'cabbage_white': '🦋',
            'hawk_moth': '🦋',
            'peacock': '🦋',
            'peacock_butterfly': '🦋',  // Alternative name support
            'monarch': '🦋',
            // Coleoptera
            'ladybug': '🐞',
            'firefly': '🐞',
            'rose_chafer': '🐞',
            'stag_beetle': '🪲'
        };
        return emojiMap[insectId] || '🐛';
    }

    getInsectSizeScale(insectData) {
        // Parse size from format like "4-11mm" or "15mm"
        const sizeStr = insectData.size;
        let sizeMm = 10; // default
        
        if (sizeStr.includes('-')) {
            // Range like "4-11mm" - take average
            const parts = sizeStr.split('-');
            const min = parseFloat(parts[0]);
            const max = parseFloat(parts[1]);
            sizeMm = (min + max) / 2;
        } else {
            // Single value like "15mm"
            sizeMm = parseFloat(sizeStr);
        }
        
        // Scale: 2mm (Drosophila) = 0.4x, 10mm (average) = 1.0x, 50mm (large butterfly) = 2.5x
        // Formula: scale = 0.2 + (sizeMm / 20)
        const scale = 0.2 + (sizeMm / 20);
        return Math.max(0.3, Math.min(3.0, scale)); // Clamp between 0.3x and 3.0x
    }

    startSpawnTimer(totalSeconds = 12) {
        // v0.03: Update loading bar on current species box
        let countdown = totalSeconds;
        
        // Find current species box
        const currentBox = this.speciesBoxes?.find(box => box.isCurrent);
        
        // Update timer and loading bar every 100ms for smooth animation
        const timerEvent = this.time.addEvent({
            delay: 100,
            repeat: totalSeconds * 10 - 1,
            callback: () => {
                const elapsed = totalSeconds - countdown;
                const progress = elapsed / totalSeconds;
                
                // Update loading bar if current box exists
                if (currentBox && currentBox.loadingBarFill) {
                    const boxWidth = 72; // Same as species box width
                    currentBox.loadingBarFill.width = boxWidth * progress;
                }
            }
        });
        
        // Update countdown every second
        this.time.addEvent({
            delay: 1000,
            repeat: totalSeconds - 1,
            callback: () => {
                countdown--;
            }
        });
        
        // After countdown, spawn the insect
        this.time.delayedCall(totalSeconds * 1000, () => {
            this.spawnInsectFromPanel();
        });
    }

    spawnInsectFromPanel() {
        const activeFamilyIndex = this.familyProgression.currentFamilyInRound;
        const activePanel = this.familyControls.find(c => c.familyIndex === activeFamilyIndex);
        
        if (!activePanel || !activePanel.spawnPosition) {
            console.error('No active panel found for family:', activeFamilyIndex);
            return;
        }
        
        const insectId = this.currentSpeciesId;
        console.log(`Attempting to spawn insectId: ${insectId}, Round: ${this.familyProgression.currentRound}, Family: ${this.familyProgression.currentFamilyInRound}`);
        
        const insectData = INSECT_DATABASE[insectId];
        
        if (!insectData) {
            console.error(`CRITICAL ERROR: insectId '${insectId}' not found in database!`);
            console.error(`Available species for family ${activeFamilyIndex}:`, this.speciesByFamily[activeFamilyIndex]);
            return;
        }
        
        const emoji = this.getSpeciesEmoji(insectId);
        
        console.log(`Spawning ${insectData.name} (#${this.familyProgression.spawnCountForCurrentSpecies + 1}/5)`);
        
        // Spawn at panel position
        const startX = activePanel.spawnPosition.x;
        const startY = activePanel.spawnPosition.y;
        
        // Create the insect sprite
        const insectSprite = this.add.text(startX, startY, emoji, {
            fontSize: '28px'
        }).setOrigin(0.5).setDepth(1000); // High depth to stay above all revelation layers!
        
        // Calculate realistic size scaling based on insect's actual size
        const sizeScale = this.getInsectSizeScale(insectData);
        insectSprite.setScale(sizeScale);
        
        // Get the index before setting up click handlers
        const index = this.insects.length;
        
        // Make insect sprite HIGHLY clickable with generous hit area
        const hitAreaSize = Math.max(40, 60 * sizeScale); // Minimum 40px, scales with size
        insectSprite.setInteractive({
            hitArea: new Phaser.Geom.Circle(0, 0, hitAreaSize),
            hitAreaCallback: Phaser.Geom.Circle.Contains,
            useHandCursor: true
        });
        
        // Store index directly on sprite's data - will be updated in update loop
        insectSprite.setData('insectIndex', index);
        
        // NOTE: Click handling is done by the global pointerdown listener in setupInputHandlers()
        // Individual sprite handlers are REMOVED to prevent auto-selection bugs
        
        // Create spectrum indicators (HIDDEN by default - only show when selected)
        const spectrumIndicators = this.createSpectrumIndicators(startX, startY + 30, insectData);
        spectrumIndicators.forEach(ind => ind.setVisible(false));
        
        // Circular lifespan indicator around insect (HIDDEN by default)
        const ringRadius = 25 * sizeScale;
        
        // Background circle (dark red/gray)
        const lifespanCircleBg = this.add.circle(startX, startY, ringRadius + 4, 0x000000, 0).setDepth(1009);
        lifespanCircleBg.setStrokeStyle(2, 0x440000, 0.4);
        lifespanCircleBg.setAlpha(0); // Hidden by default
        
        // Foreground arc (green, will shrink as lifetime decreases)
        const lifespanCircle = this.add.graphics().setDepth(1010);
        lifespanCircle.setVisible(false); // Hidden by default
        
        // Selection ring - scale with insect size (hidden by default)
        const selectionRing = this.add.circle(startX, startY, ringRadius, 0xffffff, 0).setDepth(1011);
        selectionRing.setStrokeStyle(3, 0x00ff00);
        selectionRing.setAlpha(0); // Hidden by default
        
        // Focus ring - slightly larger (REMOVED - we don't want it visible)
        const focusRing = this.add.circle(startX, startY, ringRadius + 3, 0xffffff, 0).setDepth(1008);
        focusRing.setStrokeStyle(2, 0xffaa00, 0.5);
        focusRing.setAlpha(0); // Always hidden
        
        // Path graphics - MUST be above revelation canvases (199, 200) to be visible!
        const pathGraphics = this.add.graphics().setDepth(252);
        
        const insect = {
            sprite: insectSprite,
            selectionRing: selectionRing,
            focusRing: focusRing,
            lifespanCircle: lifespanCircle,
            lifespanCircleBg: lifespanCircleBg,
            lifespanCircleRadius: ringRadius + 4,
            data: insectData,
            insectId: insectId,
            index: index,
            superfamily: insectData.superfamily,
            spectrumIndicators: spectrumIndicators,
            sizeScale: sizeScale,
            isSelected: false,
            userControlled: false, // NEW: Track if user has given commands
            waypoints: [],
            currentWaypoint: null,
            pathGraphics: pathGraphics,
            timeAtPosition: 0,
            lastPosition: { x: startX, y: startY },
            focusLevel: 0.5, // Start with base focus so insects can defog while moving
            lastDefogX: startX,
            lastDefogY: startY,
            lastDefogLevel: 0,
            randomWalkMode: true,
            randomWalkTimer: 0,
            age: 0,
            lifespan: insectId === 'ant' ? 180000 : 90000 / insectData.speed // Ants live 180s (3min), others 90s/speed (18-90s)
        };
        
        this.insects.push(insect);
        
        // Check if there's a programmed waypoint for this species (ONE-TIME USE)
        const speciesBox = this.speciesBoxes?.find(box => box.speciesId === insectId);
        if (speciesBox && speciesBox.programmedWaypoint) {
            // Use programmed waypoint for THIS ONE insect
            insect.waypoints = [speciesBox.programmedWaypoint];
            insect.randomWalkMode = false;
            insect.userControlled = true;
            
            // Draw the path
            this.drawPath(insect);
            
            console.log(`✓ ${insectData.name} spawned with programmed waypoint at (${speciesBox.programmedWaypoint.x}, ${speciesBox.programmedWaypoint.y})`);
            
            // CLEAR the waypoint after using it (one-time use only)
            speciesBox.programmedWaypoint = null;
            speciesBox.waypointIndicator.setVisible(false);
            if (speciesBox.waypointMarker) {
                speciesBox.waypointMarker.destroy();
                speciesBox.waypointMarker = null;
            }
            console.log(`   Waypoint cleared - ready for next programming`);
        } else {
            // Add random waypoint to start walking
            this.addRandomWaypoint(insect);
        }
        
        // Update mini emoji display (new insect spawned)
        this.updateMiniEmojis();
        
        // Progress to next species
        this.progressToNextSpecies();
        
        // Start next spawn timer (12 seconds to prevent lag)
        this.startSpawnTimer(12);
    }

    addRandomWaypoint(insect) {
        // Generate random position within image bounds
        const padding = 50;
        const randomX = this.imageBounds.left + padding + Math.random() * (this.imageBounds.right - this.imageBounds.left - 2 * padding);
        const randomY = this.imageBounds.top + padding + Math.random() * (this.imageBounds.bottom - this.imageBounds.top - 2 * padding);
        
        insect.waypoints = [{ x: randomX, y: randomY }];
        insect.randomWalkMode = true;
    }

    progressToNextSpecies() {
        this.familyProgression.spawnCountForCurrentSpecies++;
        
        // Update progress display
        const activePanel = this.familyControls.find(c => c.familyIndex === this.familyProgression.currentFamilyIndex);
        if (activePanel && activePanel.statsText) {
            const totalSpawns = this.familyProgression.currentFamilyIndex * 20 + this.familyProgression.currentSpeciesInFamily * 5 + this.familyProgression.spawnCountForCurrentSpecies;
            activePanel.statsText.setText(`Progress: ${totalSpawns}/80`);
        }
        
        // After spawning the appropriate number, move to next species
        // Spawn counts based on actual insect body size for balance:
        // - Tiny insects (ant 4-11mm): 10 spawns (equivalent to 1 stag beetle)
        // - Small insects (honeybee 11-18mm, ladybug 5-8mm): 5 spawns
        // - Medium insects (bumblebee 11-28mm, firefly 10-20mm): 3 spawns
        // - Large Lepidoptera (hawk moth 40-50mm, monarch 90-100mm): 1 spawn each
        // - Very large beetles (stag beetle 30-75mm): 2 spawns
        const familyIdx = this.familyProgression.currentFamilyInRound;
        const sizeRound = this.familyProgression.currentRound;
        const currentSpecies = this.speciesByFamily[familyIdx][sizeRound];
        
        // Define spawn counts per species for balanced gameplay
        let spawnsNeeded = 3; // Default
        if (currentSpecies === 'ant') spawnsNeeded = 10; // Tiny - 10 ants = 1 stag beetle
        else if (currentSpecies === 'stag_beetle') spawnsNeeded = 1; // Very large beetle - only 1!
        else if (familyIdx === 2) spawnsNeeded = 1; // All Lepidoptera are large (40-100mm)
        else if (sizeRound === 0) spawnsNeeded = 5; // Small starting insects (mosquito, firefly)
        else if (sizeRound === 1) spawnsNeeded = 4; // Medium-small insects
        else if (sizeRound >= 2) spawnsNeeded = 3; // Medium-large insects
        
        if (this.familyProgression.spawnCountForCurrentSpecies >= spawnsNeeded) {
            this.familyProgression.spawnCountForCurrentSpecies = 0;
            this.familyProgression.currentFamilyInRound++;
            this.familyProgression.familiesCompletedInRound++;
            
            // Wrap family index to 0-3 range
            if (this.familyProgression.currentFamilyInRound >= 4) {
                this.familyProgression.currentFamilyInRound = 0;
            }
            
            // After cycling through all 4 families, move to next round
            if (this.familyProgression.familiesCompletedInRound >= 4) {
                this.familyProgression.familiesCompletedInRound = 0;
                this.familyProgression.currentRound++;
                
                console.log(`Round ${this.familyProgression.currentRound - 1} complete! Moving to Round ${this.familyProgression.currentRound} (next vision tier)`);
                
                // After all 4 rounds (all vision levels), loop back to start
                if (this.familyProgression.currentRound >= 4) {
                    this.familyProgression.currentRound = 0;
                    console.log('All vision levels complete! Looping back to simplest vision.');
                }
            }
            
            // Update current species ID
            const familyIdx = this.familyProgression.currentFamilyInRound;
            const sizeRound = this.familyProgression.currentRound;
            this.currentSpeciesId = this.speciesByFamily[familyIdx][sizeRound];
            
            // Calculate next spawn count
            const nextSpecies = this.currentSpeciesId;
            let nextSpawnsNeeded = 3; // Default
            if (nextSpecies === 'ant') nextSpawnsNeeded = 10; // Tiny
            else if (nextSpecies === 'stag_beetle') nextSpawnsNeeded = 1; // Very large beetle - only 1!
            else if (familyIdx === 2) nextSpawnsNeeded = 1; // All Lepidoptera
            else if (sizeRound === 0) nextSpawnsNeeded = 5; // Small starting insects
            else if (sizeRound === 1) nextSpawnsNeeded = 4; // Medium-small
            else if (sizeRound >= 2) nextSpawnsNeeded = 3; // Medium-large
            
            const familyName = SUPERFAMILIES[familyIdx];
            console.log(`Next species: ${this.currentSpeciesId} (${familyName}, Round ${sizeRound}) - will spawn ${nextSpawnsNeeded}x`);
            
            // Update species box highlights (NEW for v0.03!)
            this.updateSpeciesBoxHighlights();
            
            // Update active panel display (REMOVED - we don't use panels in v0.03)
            // this.updateActivePanelDisplay();
        }
    }

    // OLD v0.02 - not needed in v0.03 since all families are visible from start
    /*
    unlockFamilyPanel(familyIndex) {
        const panel = this.familyControls.find(c => c.familyIndex === familyIndex);
        if (!panel || panel.isUnlocked) return;
        
        console.log(`🔓 Unlocking family ${familyIndex}: ${panel.superfamily}`);
        
        // Mark as unlocked
        panel.isUnlocked = true;
        
        // Update panel background and border colors
        if (panel.panel) {
            panel.panel.setFillStyle(0x1a1a2e, 0.95);
            panel.panel.setStrokeStyle(3, 0xffcc00);
        }
        
        // Remove locked text
        if (panel.lockedText) {
            panel.lockedText.destroy();
            panel.lockedText = null;
        }
        
        // Create species button
        const panelWidth = 220;
        const buttonY = panel.panelY + 10;
        
        panel.speciesButton = this.add.rectangle(panel.panelX, buttonY, panelWidth - 20, 60, 0x0a0a0a, 0.9);
        panel.speciesButton.setStrokeStyle(2, 0x333333);
        panel.speciesButton.setDepth(2001);
        
        // Add "Waiting..." text for now
        this.add.text(panel.panelX, buttonY, 'Waiting...', {
            fontSize: '12px',
            color: '#666666'
        }).setOrigin(0.5).setDepth(2002);
        
        // Add stats text
        panel.statsText = this.add.text(panel.panelX, panel.panelY + 70 - 20, `Progress: 0/20`, {
            fontSize: '10px',
            color: '#aaaaaa'
        }).setOrigin(0.5).setDepth(2001);
        
        panel.spawnPosition = { x: panel.panelX, y: buttonY };
    }
    */

    // OLD v0.02 panel display - not used in v0.03
    /*
    updateActivePanelDisplay() {
        // Deactivate all panels
        this.familyControls.forEach(control => {
            if (control.speciesButton) {
                control.speciesButton.setFillStyle(0x0a0a0a, 0.9);
                control.speciesButton.setStrokeStyle(2, 0x333333);
            }
            control.isActive = false;
        });
        
        // Activate current family's panel
        const activePanel = this.familyControls.find(c => c.familyIndex === this.familyProgression.currentFamilyInRound);
        
        if (activePanel && activePanel.isUnlocked) {
            activePanel.isActive = true;
            
            // Remove "Waiting..." text if it exists for this family
            if (this.waitingTexts && this.waitingTexts[activePanel.familyIndex]) {
                this.waitingTexts[activePanel.familyIndex].destroy();
                delete this.waitingTexts[activePanel.familyIndex];
            }
            
            const emoji = this.getSpeciesEmoji(this.currentSpeciesId);
            const species = INSECT_DATABASE[this.currentSpeciesId];
            const buttonY = activePanel.panelY || (activePanel.panel.y + 10);
            
            // Make button active
            if (activePanel.speciesButton) {
                activePanel.speciesButton.setFillStyle(0x16213e, 0.9);
                activePanel.speciesButton.setStrokeStyle(2, 0x00ff00);
            }
            
            // Create or update UI elements if they don't exist
            if (!activePanel.speciesEmoji) {
                const panelX = activePanel.panelX || activePanel.panel.x;
                
                activePanel.speciesEmoji = this.add.text(panelX - 70, buttonY, emoji, {
                    fontSize: '32px'
                }).setOrigin(0.5).setDepth(2002);
                
                activePanel.speciesName = this.add.text(panelX - 45, buttonY - 10, species.name, {
                    fontSize: '12px',
                    color: '#ffffff',
                    fontStyle: 'bold'
                }).setOrigin(0, 0.5).setDepth(2002);
                
                // Smaller loading bar (100px width, 6px height)
                activePanel.loadingBarBg = this.add.rectangle(panelX - 45, buttonY + 10, 100, 6, 0x333333, 0.8);
                activePanel.loadingBarBg.setOrigin(0, 0.5).setDepth(2002);
                
                activePanel.loadingBarFill = this.add.rectangle(panelX - 45, buttonY + 10, 0, 6, 0x00ff00, 1);
                activePanel.loadingBarFill.setOrigin(0, 0.5).setDepth(2003);
                
                activePanel.loadingTimer = this.add.text(panelX - 45, buttonY + 8, '5s', {
                    fontSize: '9px',
                    color: '#ffaa00',
                    fontStyle: 'bold'
                }).setOrigin(0, 0.5).setDepth(2004);
            } else {
                // Update existing elements
                activePanel.speciesEmoji.setText(emoji);
                activePanel.speciesName.setText(species.name);
                activePanel.loadingBarFill.width = 0;
                activePanel.loadingTimer.setText('5s');
                activePanel.loadingTimer.setColor('#ffaa00');
            }
            
            // Update global references
            this.currentSpeciesEmoji = activePanel.speciesEmoji;
            this.currentSpeciesName = activePanel.speciesName;
            this.loadingTimer = activePanel.loadingTimer;
            this.loadingBarFill = activePanel.loadingBarFill;
        }
    }
    */

    createSpectralEvolutionDisplay(width, height) {
        // Simple display showing spectral vision progression
        const panelX = width / 2;
        const panelY = height - 30;
    }

    setupInputHandlers() {
        // Enable keyboard for shift and ctrl detection
        this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.ctrlKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL);
        
        // Track hovered insect for visual feedback
        this.hoveredInsect = null;
        
        // Hover feedback - show subtle ring on mouseover
        this.input.on('pointermove', (pointer) => {
            let newHoveredInsect = null;
            let closestDistance = Infinity;
            
            this.insects.forEach((insect, index) => {
                const dx = pointer.x - insect.sprite.x;
                const dy = pointer.y - insect.sprite.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                // Match click radius: 50px base, minimum 25px for tiny insects
                const baseRadius = 50;
                const minRadius = 25;
                const hoverRadius = Math.max(minRadius, baseRadius * (insect.sizeScale || 1));
                
                if (distance < hoverRadius && distance < closestDistance) {
                    closestDistance = distance;
                    newHoveredInsect = index;
                }
            });
            
            // Update hover state
            if (this.hoveredInsect !== newHoveredInsect) {
                // Clear previous hover
                if (this.hoveredInsect !== null && this.insects[this.hoveredInsect]) {
                    const prevInsect = this.insects[this.hoveredInsect];
                    if (!prevInsect.isSelected) {
                        prevInsect.selectionRing.setAlpha(0);
                    }
                }
                
                // Set new hover
                this.hoveredInsect = newHoveredInsect;
                if (this.hoveredInsect !== null) {
                    const insect = this.insects[this.hoveredInsect];
                    if (!insect.isSelected) {
                        // Show subtle white ring on hover
                        insect.selectionRing.setStrokeStyle(3, 0xffffff, 0.6);
                        insect.selectionRing.setAlpha(0.4);
                    }
                }
            }
        });
        
        // MOBILE-FRIENDLY CONTROL SYSTEM
        // State machine logic:
        // 1. No selection + click insect → SELECT insect
        // 2. Has selection + click same insect → DESELECT (toggle off)
        // 3. Has selection + click different insect → SWITCH selection to new insect
        // 4. Has selection + click empty area → ADD WAYPOINT to path
        // 5. No selection + click empty area → GROUP COMMAND (all insects move)
        
        this.input.on('pointerdown', (pointer) => {
            console.log(`🖱️ CLICK at (${pointer.x}, ${pointer.y})`);
            
            // Check if we clicked on an interactive game object (like a species box)
            // If so, skip our processing and let that object's handler deal with it
            let clickOnSpeciesBox = false;
            const clickedObjects = this.input.hitTestPointer(pointer);
            if (clickedObjects.length > 0) {
                // Check if any clicked object is a species box
                clickOnSpeciesBox = clickedObjects.some(obj => {
                    return this.speciesBoxes?.some(boxData => boxData.box === obj);
                });
                if (clickOnSpeciesBox) {
                    console.log('🚫 Click on interactive box - letting box handler deal with it');
                    // Don't return - let Phaser dispatch the event to the box
                    // But don't process this click in our logic below
                }
            }
            
            // Skip all our click processing if this was on a species box
            if (clickOnSpeciesBox) {
                return;
            }
            
            // CHECK FOR WAYPOINT PROGRAMMING MODE FIRST
            if (this.waypointProgrammingMode && this.waypointProgrammingSpecies) {
                console.log('🎯 WAYPOINT MODE ACTIVE - Click detected at', pointer.x, pointer.y);
                // User is setting a waypoint for a species box
                const boxData = this.waypointProgrammingSpecies;
                
                // Check if click is within image bounds
                const withinImage = pointer.x >= this.imageBounds.left && 
                                  pointer.x <= this.imageBounds.right &&
                                  pointer.y >= this.imageBounds.top && 
                                  pointer.y <= this.imageBounds.bottom;
                
                console.log('Within image bounds?', withinImage, this.imageBounds);
                
                if (withinImage) {
                    // Calculate maximum distance based on lifespan
                    const insectData = INSECT_DATABASE[boxData.speciesId];
                    const insectSpeed = insectData.speed || 1;
                    const lifespan = boxData.speciesId === 'ant' ? 180000 : 90000 / insectSpeed;
                    const maxDistance = (lifespan / 1000) * insectSpeed * 30; // pixels = (seconds) * (speed factor) * 30
                    
                    // Get spawn position (image center)
                    const spawnX = this.imageBounds.left + (this.imageBounds.right - this.imageBounds.left) / 2;
                    const spawnY = this.imageBounds.top + (this.imageBounds.bottom - this.imageBounds.top) / 2;
                    
                    // Calculate distance from spawn to clicked point
                    const dx = pointer.x - spawnX;
                    const dy = pointer.y - spawnY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    // Limit waypoint to max distance
                    let waypointX = pointer.x;
                    let waypointY = pointer.y;
                    
                    if (distance > maxDistance) {
                        // Clamp to max distance in the same direction
                        const ratio = maxDistance / distance;
                        waypointX = spawnX + dx * ratio;
                        waypointY = spawnY + dy * ratio;
                        console.log(`⚠️ Waypoint too far (${distance.toFixed(0)}px > ${maxDistance.toFixed(0)}px), clamping to max lifespan distance`);
                    }
                    
                    // Set the waypoint (possibly clamped)
                    boxData.programmedWaypoint = { x: waypointX, y: waypointY };
                    
                    // Update waypoint indicator
                    const indicatorColor = boxData.isCurrent ? 0x00ff00 : 0xffaa00;
                    boxData.waypointIndicator.setFillStyle(indicatorColor, 1);
                    boxData.waypointIndicator.setStrokeStyle(2, indicatorColor);
                    boxData.waypointIndicator.setVisible(true);
                    
                    // Visual feedback at waypoint location (use actual waypoint, not click position)
                    const waypointMarker = this.add.circle(
                        waypointX, waypointY, 8, indicatorColor, 0.6
                    ).setDepth(250);
                    waypointMarker.setStrokeStyle(2, indicatorColor);
                    
                    // Store marker reference on box data
                    if (boxData.waypointMarker) {
                        boxData.waypointMarker.destroy();
                    }
                    boxData.waypointMarker = waypointMarker;
                    
                    console.log(`✓ Waypoint set for ${boxData.speciesId} at (${waypointX.toFixed(0)}, ${waypointY.toFixed(0)}) - max distance: ${maxDistance.toFixed(0)}px`);
                    
                    // Show confirmation
                    if (this.waypointInstruction) {
                        this.waypointInstruction.destroy();
                    }
                    const confirmColor = boxData.isCurrent ? '#00ff00' : '#ffaa00';
                    this.waypointInstruction = this.add.text(
                        640, 45,
                        '✓ Spawn point set!',
                        {
                            fontSize: '16px',
                            color: confirmColor,
                            backgroundColor: '#000000dd',
                            padding: { x: 20, y: 10 }
                        }
                    ).setOrigin(0.5).setDepth(5000);
                    
                    this.time.delayedCall(1500, () => {
                        if (this.waypointInstruction) {
                            this.waypointInstruction.destroy();
                            this.waypointInstruction = null;
                        }
                    });
                }
                
                // Exit waypoint programming mode
                this.waypointProgrammingMode = false;
                this.waypointProgrammingSpecies = null;
                return;
            }
            
            // Check if we clicked on a species box
            // Let the box's own click handler deal with it - don't block it here
            // (Box handlers are attached in updateSpeciesBoxHighlights)
            
            // Ignore clicks on control panels (legacy check)
            if (this.controlPanelBounds) {
                const inPanel = this.controlPanelBounds.corners.some(corner => {
                    return pointer.x >= corner.left && pointer.x <= corner.right &&
                           pointer.y >= corner.top && pointer.y <= corner.bottom;
                });
                if (inPanel) {
                    console.log('🚫 Click ignored - on control panel');
                    return;
                }
            }
            
            // CRITICAL: Only process clicks within the image bounds
            // This prevents mini-emoji clicks and other UI elements from triggering commands
            const withinImage = pointer.x >= this.imageBounds.left && 
                              pointer.x <= this.imageBounds.right &&
                              pointer.y >= this.imageBounds.top && 
                              pointer.y <= this.imageBounds.bottom;
            
            if (!withinImage) {
                console.log(`🚫 Click outside image bounds (${Math.round(pointer.x)}, ${Math.round(pointer.y)}) - ignoring`);
                return;
            }
            
            // STEP 1: Check if we clicked on an insect
            let clickedInsectIndex = null;
            let closestDistance = Infinity;
            
            this.insects.forEach((insect, index) => {
                const dx = pointer.x - insect.sprite.x;
                const dy = pointer.y - insect.sprite.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Click radius matches selection ring size more closely
                const baseRadius = 25; // Was 80, now much tighter
                const clickRadius = baseRadius * (insect.sizeScale || 1);
                
                if (distance < clickRadius && distance < closestDistance) {
                    closestDistance = distance;
                    clickedInsectIndex = index;
                }
            });
            
            // STEP 2: Determine action based on state
            const hasSelection = this.selectedInsectIndices.length > 0;
            const currentlySelectedIndex = hasSelection ? this.selectedInsectIndices[0] : null;
            const clickedOnInsect = clickedInsectIndex !== null;
            
            if (clickedOnInsect) {
                const clickedSameInsect = (clickedInsectIndex === currentlySelectedIndex);
                
                if (clickedSameInsect) {
                    // Case 2: Clicking on already-selected insect → DESELECT (toggle off)
                    console.log('🔄 Toggle: Deselecting insect');
                    this.selectInsect(clickedInsectIndex, false);
                } else {
                    // Case 1 or 3: Select new insect (or switch selection)
                    if (hasSelection) {
                        console.log('🔄 Switching selection to different insect');
                    } else {
                        console.log('✅ Selecting insect');
                    }
                    this.selectInsect(clickedInsectIndex, false);
                }
            } else {
                // Clicked on empty area (already verified within image bounds above)
                if (hasSelection) {
                    // Case 4: Add waypoint to selected insect's path
                    console.log(`📍 Adding waypoint at (${Math.round(pointer.x)}, ${Math.round(pointer.y)})`);
                    this.addWaypoint(pointer.x, pointer.y, true); // Always add to path
                } else {
                    // Case 5: Group command - all insects move
                    console.log(`🐝 GROUP COMMAND: All insects to (${Math.round(pointer.x)}, ${Math.round(pointer.y)})`);
                    this.addGroupWaypoint(pointer.x, pointer.y);
                }
            }
        });
    }

    selectInsect(index, addToSelection = false) {
        // Validate index
        if (index < 0 || index >= this.insects.length) {
            console.warn(`⚠️ Invalid insect index: ${index} (total: ${this.insects.length})`);
            return;
        }
        
        const insect = this.insects[index];
        
        if (!insect || !insect.sprite) {
            console.error(`❌ Insect at index ${index} not found or invalid!`);
            return;
        }
        
        console.log(`🎯 Selecting insect ${index}: ${insect.data.name}`);
        
        // SIMPLE: Click to toggle selection
        if (insect.isSelected) {
            // Deselect this insect - hide path and indicators
            insect.isSelected = false;
            // Keep selection ring hidden
            insect.selectionRing.setAlpha(0);
            insect.pathGraphics.clear();
            insect.spectrumIndicators.forEach(ind => ind.setVisible(false));
            insect.lifespanCircle.setVisible(false);
            insect.lifespanCircleBg.setAlpha(0);
            this.selectedInsectIndices = [];
            console.log(`❌ Deselected ${insect.data.name}`);
            return;
        }
        
        // Deselect all other insects first
        this.insects.forEach((otherInsect, i) => {
            if (otherInsect && i !== index) {
                otherInsect.isSelected = false;
                if (otherInsect.selectionRing) otherInsect.selectionRing.setAlpha(0);
                if (otherInsect.pathGraphics) otherInsect.pathGraphics.clear();
                // Hide indicators for deselected insects
                if (otherInsect.spectrumIndicators) {
                    otherInsect.spectrumIndicators.forEach(ind => ind.setVisible(false));
                }
                if (otherInsect.lifespanCircle) otherInsect.lifespanCircle.setVisible(false);
                if (otherInsect.lifespanCircleBg) otherInsect.lifespanCircleBg.setAlpha(0);
                // Reset user control flag when deselecting
                otherInsect.userControlled = false;
            }
        });
        
        // Select this insect and show its current path
        this.selectedInsectIndices = [index];
        insect.isSelected = true;
        insect.userControlled = false; // Reset - next click will REPLACE path
        // DON'T show selection ring - only lifespan circle
        insect.selectionRing.setAlpha(0);
        
        // HIDE sensitivity indicators when selected, SHOW circular lifespan
        insect.spectrumIndicators.forEach(ind => ind.setVisible(false));
        insect.lifespanCircle.setVisible(true);
        insect.lifespanCircleBg.setAlpha(1);
        
        // Show current path immediately (all waypoints the insect has)
        if (insect.waypoints && insect.waypoints.length > 0) {
            this.drawPath(insect);
            console.log(`✅ Selected: ${insect.data.name} - showing ${insect.waypoints.length} waypoints`);
        } else {
            console.log(`✅ Selected: ${insect.data.name} - no waypoints yet (random walk mode)`);
        }
    }

    addWaypoint(x, y, addToPath = false) {
        if (this.selectedInsectIndices.length === 0) {
            console.log('⚠️ No insect selected');
            return;
        }
        
        // Get selected insect
        const index = this.selectedInsectIndices[0];
        const insect = this.insects[index];
        
        if (!insect) {
            console.error(`❌ Insect at index ${index} not found!`);
            return;
        }
        
        // Calculate total distance if we add this waypoint
        let totalDistance = 0;
        let lastX = insect.sprite.x;
        let lastY = insect.sprite.y;
        
        // Add distance for existing waypoints
        insect.waypoints.forEach(wp => {
            const dx = wp.x - lastX;
            const dy = wp.y - lastY;
            totalDistance += Math.sqrt(dx * dx + dy * dy);
            lastX = wp.x;
            lastY = wp.y;
        });
        
        // Add distance for new waypoint
        const dx = x - lastX;
        const dy = y - lastY;
        const newSegmentDistance = Math.sqrt(dx * dx + dy * dy);
        totalDistance += newSegmentDistance;
        
        // Calculate maximum distance based on REMAINING lifespan and speed
        const speed = insect.data.speed || 1;
        const remainingLifespan = insect.lifespan - insect.age; // Remaining lifetime in milliseconds
        const maxDistance = (remainingLifespan / 1000) * speed * 30; // pixels = (seconds) * (speed factor) * 30
        
        // Check if path exceeds remaining lifetime
        if (totalDistance > maxDistance) {
            console.log(`⚠️ Path too long! Total: ${totalDistance.toFixed(0)}px, Max remaining: ${maxDistance.toFixed(0)}px`);
            
            // Blink insect twice to show path is complete
            this.tweens.add({
                targets: insect.sprite,
                alpha: 0.3,
                duration: 150,
                yoyo: true,
                repeat: 3, // Blinks twice (yoyo counts as one)
                onComplete: () => {
                    insect.sprite.setAlpha(1);
                    // Deselect the insect
                    insect.isSelected = false;
                    insect.selectionRing.setAlpha(0);
                    if (insect.spectrumIndicators) {
                        insect.spectrumIndicators.forEach(ind => ind.setVisible(false));
                    }
                    if (insect.lifespanCircle) insect.lifespanCircle.setVisible(false);
                    if (insect.lifespanCircleBg) insect.lifespanCircleBg.setAlpha(0);
                    this.selectedInsectIndices = [];
                    console.log(`✓ Path complete - insect deselected`);
                }
            });
            return; // Don't add the waypoint
        }
        
        // SMART PATH SYSTEM:
        // First click after selection = REPLACE path (reprogram)
        // Subsequent clicks = ADD to path (multiway)
        // IMPORTANT: Once userControlled is true, keep it true!
        if (!insect.userControlled) {
            // First command EVER - replace path completely
            insect.waypoints = [{ x, y }];
            insect.userControlled = true;
            console.log(`🎯 New path for ${insect.data.name} → (${Math.round(x)}, ${Math.round(y)})`);
        } else {
            // User has controlled before - add to existing path (multiway)
            insect.waypoints.push({ x, y });
            const waypointNum = insect.waypoints.length;
            console.log(`📍 Waypoint ${waypointNum} added for ${insect.data.name} → (${Math.round(x)}, ${Math.round(y)}) [${totalDistance.toFixed(0)}/${maxDistance.toFixed(0)}px]`);
        }
        
        insect.randomWalkMode = false; // Disable random walk - user is controlling
        
        // Redraw path
        this.drawPath(insect);
    }

    addGroupWaypoint(x, y) {
        if (this.insects.length === 0) return;
        
        console.log(`🐝 GROUP COMMAND: All ${this.insects.length} insects moving to (${Math.round(x)}, ${Math.round(y)})`);
        
        // Send all insects to the clicked position
        this.insects.forEach(insect => {
            insect.waypoints = [{ x, y }]; // Single waypoint for group command
            insect.randomWalkMode = true; // Will resume random walk after reaching target
        });
    }

    drawPath(insect) {
        insect.pathGraphics.clear();
        
        // Only draw path if this insect is selected
        if (!insect.isSelected) return;
        
        if (insect.waypoints.length === 0) return;
        
        // Draw dotted line from current position through all waypoints
        insect.pathGraphics.lineStyle(3, 0x00ff00, 0.7);
        
        let startX = insect.sprite.x;
        let startY = insect.sprite.y;
        
        insect.waypoints.forEach((waypoint, i) => {
            // Draw dotted line
            this.drawDottedLine(insect.pathGraphics, startX, startY, waypoint.x, waypoint.y);
            
            // Draw simple waypoint marker (NO NUMBERS)
            insect.pathGraphics.fillStyle(0x00ff00, 0.6);
            insect.pathGraphics.fillCircle(waypoint.x, waypoint.y, 8);
            insect.pathGraphics.lineStyle(2, 0xffffff, 0.8);
            insect.pathGraphics.strokeCircle(waypoint.x, waypoint.y, 8);
            
            startX = waypoint.x;
            startY = waypoint.y;
        });
    }

    drawDottedLine(graphics, x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const dashLength = 10;
        const gapLength = 8;
        const totalLength = dashLength + gapLength;
        const numSegments = Math.floor(distance / totalLength);
        
        for (let i = 0; i < numSegments; i++) {
            const startRatio = (i * totalLength) / distance;
            const endRatio = (i * totalLength + dashLength) / distance;
            
            const startX = x1 + dx * startRatio;
            const startY = y1 + dy * startRatio;
            const endX = x1 + dx * endRatio;
            const endY = y1 + dy * endRatio;
            
            graphics.beginPath();
            graphics.moveTo(startX, startY);
            graphics.lineTo(endX, endY);
            graphics.strokePath();
        }
    }

    update(time, delta) {
        // Track if we need to update mini emojis
        let insectsChanged = false;
        
        // Age insects and remove dead ones
        this.insects = this.insects.filter(insect => {
            insect.age += delta;
            
            if (insect.age >= insect.lifespan) {
                // Insect died - check if it was selected
                const wasSelected = insect.isSelected;
                const selectedIndex = this.selectedInsectIndices.indexOf(insect.index);
                
                // Clean up
                insect.sprite.destroy();
                insect.selectionRing.destroy();
                insect.focusRing.destroy();
                insect.lifespanCircle.destroy();
                insect.lifespanCircleBg.destroy();
                insect.pathGraphics.destroy();
                insect.spectrumIndicators.forEach(ind => ind.destroy());
                
                // Don't clear selection here - let the re-indexing logic handle it
                console.log(`💀 ${insect.data.name} died after ${(insect.age/1000).toFixed(1)}s`);
                
                insectsChanged = true; // Mark that we need to update mini emojis
                return false; // Remove from array
            }
            
            // Update circular lifespan indicator
            const lifespanRatio = 1 - (insect.age / insect.lifespan);
            
            // Color shift: green -> yellow -> red as life decreases
            let color;
            if (lifespanRatio > 0.5) {
                color = 0x00ff00; // Green
            } else if (lifespanRatio > 0.25) {
                color = 0xffaa00; // Yellow
            } else {
                color = 0xff0000; // Red
            }
            
            // Update main lifespan circle (around selected insect)
            if (insect.lifespanCircle && insect.lifespanCircle.visible) {
                insect.lifespanCircle.clear();
                
                // Draw arc (starts from top, goes clockwise)
                const startAngle = -90; // Start from top
                const endAngle = startAngle + (360 * lifespanRatio);
                const radius = insect.lifespanCircleRadius;
                
                insect.lifespanCircle.lineStyle(3, color, 0.8);
                insect.lifespanCircle.beginPath();
                insect.lifespanCircle.arc(
                    insect.sprite.x,
                    insect.sprite.y,
                    radius,
                    Phaser.Math.DegToRad(startAngle),
                    Phaser.Math.DegToRad(endAngle),
                    false
                );
                insect.lifespanCircle.strokePath();
            }
            
            // Update mini lifespan circle (in species box)
            if (insect.miniLifespanCircle && insect.miniLifespanCirclePos) {
                insect.miniLifespanCircle.clear();
                
                const startAngle = -90;
                const endAngle = startAngle + (360 * lifespanRatio);
                const radius = 7;
                
                insect.miniLifespanCircle.lineStyle(1.5, color, 0.6);
                insect.miniLifespanCircle.beginPath();
                insect.miniLifespanCircle.arc(
                    insect.miniLifespanCirclePos.x,
                    insect.miniLifespanCirclePos.y,
                    radius,
                    Phaser.Math.DegToRad(startAngle),
                    Phaser.Math.DegToRad(endAngle),
                    false
                );
                insect.miniLifespanCircle.strokePath();
            }
            
            return true; // Keep alive
        });
        
        // Update indices after filtering and maintain selection
        const oldSelectedIndices = [...this.selectedInsectIndices];
        const selectedInsects = oldSelectedIndices.map(idx => this.insects[idx]).filter(i => i); // Get actual insect objects
        
        this.insects.forEach((insect, newIdx) => {
            const oldIdx = insect.index;
            insect.index = newIdx;
            // Update the index stored in sprite data
            insect.sprite.setData('insectIndex', newIdx);
        });
        
        // Update selectedInsectIndices to match new indices
        this.selectedInsectIndices = [];
        selectedInsects.forEach(selectedInsect => {
            if (selectedInsect && selectedInsect.index !== undefined) {
                this.selectedInsectIndices.push(selectedInsect.index);
            }
        });
        
        // CRITICAL: Create a copy of insects array to prevent iterator issues during modification
        const insectsSnapshot = [...this.insects];
        
        insectsSnapshot.forEach(insect => {
            // Safety check: insect may have been removed
            if (!insect || !insect.sprite || !insect.sprite.active) return;
            
            // Random walk mode - add new waypoint when current one is reached
            // BUT: Don't random walk if user has ever controlled this insect!
            if (insect.randomWalkMode && !insect.userControlled && insect.waypoints.length === 0) {
                insect.randomWalkTimer += delta;
                if (insect.randomWalkTimer > 2000) { // Every 2 seconds
                    this.addRandomWaypoint(insect);
                    insect.randomWalkTimer = 0;
                    // If this insect is selected, show the new random path
                    if (insect.isSelected) {
                        this.drawPath(insect);
                    }
                }
            }
            
            // Track movement for temporal resolution
            const dx = insect.sprite.x - insect.lastPosition.x;
            const dy = insect.sprite.y - insect.lastPosition.y;
            const distanceMoved = Math.sqrt(dx * dx + dy * dy);
            
            if (distanceMoved < 0.5) {
                // Stationary - increase focus (temporal resolution)
                const temporalResolution = insect.data.ommatidia / 6000;
                const focusSpeed = temporalResolution * 0.0008;
                insect.timeAtPosition += delta;
                insect.focusLevel = Math.min(1, insect.focusLevel + focusSpeed * delta);
            } else {
                // Moving - instant partial reveal for fast insects, delay for slow
                insect.timeAtPosition = 0;
                const movementVision = insect.data.speed / 5;
                insect.focusLevel = Math.max(movementVision * 0.4, insect.focusLevel - 0.002 * delta);
            }
            
            insect.lastPosition.x = insect.sprite.x;
            insect.lastPosition.y = insect.sprite.y;
            
            // Move along waypoint path
            if (insect.waypoints && insect.waypoints.length > 0) {
                const targetWaypoint = insect.waypoints[0];
                const moved = this.moveInsectToward(insect, targetWaypoint.x, targetWaypoint.y, delta);
                
                // Check if reached waypoint
                const dx = targetWaypoint.x - insect.sprite.x;
                const dy = targetWaypoint.y - insect.sprite.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 5) {
                    // Reached waypoint, remove it and redraw path
                    insect.waypoints.shift();
                    this.drawPath(insect);
                }
            }
            
            // Defog continuously as insect moves (especially important for monochromats)
            // They need to reveal the world as they walk!
            this.defogAtInsect(insect);
            insect.lastDefogX = insect.sprite.x;
            insect.lastDefogY = insect.sprite.y;
            insect.lastDefogLevel = insect.focusLevel;
        });
        
        // Update mini emojis if insects changed (death or new spawn)
        if (insectsChanged) {
            this.updateMiniEmojis();
        }
        
        // Periodically update mini emojis (every 2 seconds) to keep them in sync
        if (!this.lastMiniEmojiUpdate) this.lastMiniEmojiUpdate = 0;
        this.lastMiniEmojiUpdate += delta;
        if (this.lastMiniEmojiUpdate > 2000) {
            this.updateMiniEmojis();
            this.lastMiniEmojiUpdate = 0;
        }
    }

    moveInsectToward(insect, targetX, targetY, delta) {
        const speed = insect.data.speed * 0.05; // Balanced speed for path completion
        const dx = targetX - insect.sprite.x;
        const dy = targetY - insect.sprite.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 1) {
            const moveDistance = Math.min(speed * delta, distance);
            insect.sprite.x += (dx / distance) * moveDistance;
            insect.sprite.y += (dy / distance) * moveDistance;
            
            // Move selection ring
            insect.selectionRing.x = insect.sprite.x;
            insect.selectionRing.y = insect.sprite.y;
            
            // Move lifespan circle background
            insect.lifespanCircleBg.x = insect.sprite.x;
            insect.lifespanCircleBg.y = insect.sprite.y;
            
            // Lifespan circle (graphics) is redrawn in update loop at sprite position
            
            // Focus ring is always hidden - don't show it
            insect.focusRing.x = insect.sprite.x;
            insect.focusRing.y = insect.sprite.y;
            insect.focusRing.setAlpha(0); // Always hidden
            
            insect.spectrumIndicators.forEach((indicator, i) => {
                const spacing = 14;
                const startX = insect.sprite.x - (insect.spectrumIndicators.length * spacing / 2);
                indicator.x = startX + i * spacing;
                indicator.y = insect.sprite.y + 30;
            });
            
            return true;
        }
        
        return false;
    }

    defogAtInsect(insect) {
        const x = insect.sprite.x;
        const y = insect.sprite.y;
        
        // Scale defog radius based on actual insect size
        const sizeScale = insect.sizeScale || 1.0;
        const baseRadius = insect.data.defogRadius;
        const scaledRadius = baseRadius * sizeScale;
        
        // Adjust reveal radius based on focus level
        const effectiveRadius = scaledRadius * Math.max(0.3, insect.focusLevel);
        
        // Get spectral weights for this insect
        const weights = insect.data.spectralWeights || { r: 0.33, g: 0.33, b: 0.33 };
        
        // Check if this is a monochromat (only one receptor) - ants & stag beetles!
        const isMonochromat = insect.data.spectrum.length === 1;
        
        // Convert screen coordinates to image coordinates
        const imageX = ((x - this.imageBounds.left) / this.hiddenImage.displayWidth) * this.hiddenImage.width;
        const imageY = ((y - this.imageBounds.top) / this.hiddenImage.displayHeight) * this.hiddenImage.height;
        
        // MONOCHROMATS: Paint inverted brightness (B&W contrast inversion) on B&W layer
        if (isMonochromat) {
            const graphics = this.make.graphics();
            
            // Sample a grid of pixels around the insect to paint inverted brightness
            const sampleRadius = Math.ceil(effectiveRadius);
            // Adaptive step size: larger radius = bigger steps for performance
            const step = Math.max(4, Math.floor(sampleRadius / 12)); // Increased for better performance
            
            let pixelsPainted = 0;
            
            // Cache scale factors
            const scaleX = this.hiddenImage.width / this.hiddenImage.displayWidth;
            const scaleY = this.hiddenImage.height / this.hiddenImage.displayHeight;
            
            for (let dy = -sampleRadius; dy <= sampleRadius; dy += step) {
                for (let dx = -sampleRadius; dx <= sampleRadius; dx += step) {
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist > sampleRadius) continue;
                    
                    // Calculate position in original image (with cached scales)
                    const px = Math.floor(imageX + dx * scaleX);
                    const py = Math.floor(imageY + dy * scaleY);
                    
                    // Bounds check
                    if (px < 0 || px >= this.hiddenImage.width || py < 0 || py >= this.hiddenImage.height) continue;
                    
                    // Sample pixel from canvas
                    const pixelData = this.imageContext.getImageData(px, py, 1, 1).data;
                    const r = pixelData[0];
                    const g = pixelData[1];
                    const b = pixelData[2];
                    
                    // Calculate brightness (luminance)
                    const brightness = (r + g + b) / 3;
                    
                    // INVERT: dark becomes light, light becomes dark
                    const inverted = 255 - brightness;
                    
                    // Paint inverted brightness as grayscale
                    const gray = Phaser.Display.Color.GetColor(inverted, inverted, inverted);
                    
                    // Fade based on distance from center
                    const alpha = (1 - dist / sampleRadius) * insect.focusLevel * 0.9;
                    
                    graphics.fillStyle(gray, alpha);
                    graphics.fillCircle(x + dx, y + dy, step * 0.5); // Reduced from 0.6 for less overdraw
                    
                    pixelsPainted++;
                }
            }
            
            // Paint onto B&W layer (depth 199 - UNDER color layer!)
            this.bwCanvas.draw(graphics, 0, 0);
            graphics.destroy();
            
            if (pixelsPainted > 0 && Math.random() < 0.05) { // Log only 5% of the time
                console.log(`🐜 Ant painted ${pixelsPainted} B&W pixels on bottom layer`);
            }
            return;
        }
        
        // COLOR INSECTS: Paint each RGB channel separately with weight-based alpha
        // Channels with low spectral sensitivity get low alpha (accumulate slowly)
        // Channels with high spectral sensitivity get high alpha (accumulate quickly)
        
        const sampleRadius = Math.ceil(effectiveRadius);
        // Adaptive step size: larger radius = bigger steps for performance
        const step = Math.max(4, Math.floor(sampleRadius / 12)); // Increased for better performance
        
        // Create separate graphics for each channel
        const graphicsR = this.make.graphics();
        const graphicsG = this.make.graphics();
        const graphicsB = this.make.graphics();
        
        let pixelsPainted = 0;
        
        // Cache scale factors
        const scaleX = this.hiddenImage.width / this.hiddenImage.displayWidth;
        const scaleY = this.hiddenImage.height / this.hiddenImage.displayHeight;
        
        for (let dy = -sampleRadius; dy <= sampleRadius; dy += step) {
            for (let dx = -sampleRadius; dx <= sampleRadius; dx += step) {
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > sampleRadius) continue;
                
                // Calculate position in original image (with cached scales)
                const px = Math.floor(imageX + dx * scaleX);
                const py = Math.floor(imageY + dy * scaleY);
                
                // Bounds check
                if (px < 0 || px >= this.hiddenImage.width || py < 0 || py >= this.hiddenImage.height) continue;
                
                // Sample pixel from canvas
                const pixelData = this.imageContext.getImageData(px, py, 1, 1).data;
                const r = pixelData[0];
                const g = pixelData[1];
                const b = pixelData[2];
                
                // Base alpha from distance and focus
                const baseFalloff = (1 - dist / sampleRadius) * insect.focusLevel;
                
                // Each channel gets its own alpha based on spectral weight
                // Low weight = low alpha = slow accumulation
                // High weight = high alpha = fast accumulation
                const alphaR = baseFalloff * weights.r * 0.3; // Increased for faster buildup
                const alphaG = baseFalloff * weights.g * 0.3;
                const alphaB = baseFalloff * weights.b * 0.3;
                
                // Paint each channel separately
                // Red channel - paint only red component
                if (r > 0 && alphaR > 0) {
                    const redColor = Phaser.Display.Color.GetColor(r, 0, 0);
                    graphicsR.fillStyle(redColor, alphaR);
                    graphicsR.fillCircle(x + dx, y + dy, step * 0.5); // Reduced for less overdraw
                }
                
                // Green channel - paint only green component
                if (g > 0 && alphaG > 0) {
                    const greenColor = Phaser.Display.Color.GetColor(0, g, 0);
                    graphicsG.fillStyle(greenColor, alphaG);
                    graphicsG.fillCircle(x + dx, y + dy, step * 0.5);
                }
                
                // Blue channel - paint only blue component
                if (b > 0 && alphaB > 0) {
                    const blueColor = Phaser.Display.Color.GetColor(0, 0, b);
                    graphicsB.fillStyle(blueColor, alphaB);
                    graphicsB.fillCircle(x + dx, y + dy, step * 0.5);
                }
                
                pixelsPainted++;
            }
        }
        
        // Paint each channel onto its respective layer
        // ADD blend mode will combine them into full color
        this.colorCanvasR.draw(graphicsR, 0, 0);
        this.colorCanvasG.draw(graphicsG, 0, 0);
        this.colorCanvasB.draw(graphicsB, 0, 0);
        
        graphicsR.destroy();
        graphicsG.destroy();
        graphicsB.destroy();
        
        if (pixelsPainted > 0 && Math.random() < 0.05) {
            console.log(`🐝 ${insect.data.name} painted ${pixelsPainted} pixels (alphas: r:${(weights.r * 0.15).toFixed(2)} g:${(weights.g * 0.15).toFixed(2)} b:${(weights.b * 0.15).toFixed(2)})`);
        }
    }
}
