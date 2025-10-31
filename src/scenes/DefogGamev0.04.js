import { INSECT_DATABASE, SUPERFAMILY_EMOJI, COLOR_CHANNELS, SUPERFAMILIES, getInsectsBySuperfamily, UNLOCK_COSTS } from '../data/insectDatabaseReal.js';
import { CurrencySystem } from '../systems/Currency.js';
import { CollectibleSystem } from '../systems/Collectible.js';

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
        
        // Multi-level system - different images for each level
        const levelImages = [
            'assets/IMG_0061.jpg',  // Level 1 (1600x506)
            'assets/IMG_0104.jpg',  // Level 2 (1853x554) - closest aspect ratio
            'assets/IMG_0159.jpg',  // Level 3 (1853x540)
            'assets/IMG_0086.jpg',  // Level 4 (1853x438)
            'assets/IMG_0096.jpg',  // Level 5 (1853x438)
        ];
        
        // Get current level from game registry (defaults to 1)
        this.currentLevel = this.registry.get('currentLevel') || 1;
        const imageIndex = Math.min(this.currentLevel - 1, levelImages.length - 1);
        const imagePath = levelImages[imageIndex];
        
        console.log(`📊 Loading Level ${this.currentLevel} image: ${imagePath}`);
        
        // Remove old cached image if it exists
        if (this.textures.exists('hiddenImage')) {
            console.log('🗑️ Removing old cached image...');
            this.textures.remove('hiddenImage');
        }
        
        this.load.image('hiddenImage', imagePath);
        
        // Load final reward image
        if (!this.textures.exists('finalReward')) {
            this.load.image('finalReward', 'assets/Drosophila melanogaster drawing.JPG');
        }
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
        
        // ========== RHODOPSIN SYSTEM v0.04 ==========
        // Rhodopsin: light-sensitive proteins in photoreceptor cells
        // Different rhodopsins absorb different wavelengths
        // Monochrome → Red/Green/Blue specialized rhodopsins
        // Initialize color vision state
        this.colorVisionUnlocked = false;
        this.colorSaturation = 0.0;
        
        // Initialize rhodopsin system
        this.currencySystem = new CurrencySystem(this);
        // v0.04: Start with 10 monochrome rhodopsin so players can buy starting species!
        this.currencySystem.setCurrency('monochrome', 10);
        console.log('💰 Rhodopsin system initialized - starting with 10 monochrome!');
        
        // Create timer UI (between Vespa and Lucanus)
        this.createTimerUI();
        
        // Initialize collectible system
        this.collectibleSystem = new CollectibleSystem(this, this.currencySystem);
        
        // Spawn collectibles on the image
        const imageTexture = this.textures.get('hiddenImage');
        this.collectibleSystem.spawnCollectiblesOnImage(imageTexture, this.hiddenImage);
        console.log('✅ Collectible system enabled');
        
        // v0.04: Track revealed pixels for edge-based rhodopsin harvesting
        // SEPARATE tracking for monochrome and color to ensure fair rhodopsin awards
        this.revealedPixelsMono = new Set(); // Track pixels revealed by monochrome insects
        this.revealedPixelsColor = new Set(); // Track pixels revealed by color insects
        this.totalRevealablePixels = this.hiddenImage.width * this.hiddenImage.height;
        console.log(`📊 Total revealable pixels: ${this.totalRevealablePixels}`);
        
        // Track unlocked insects
        this.unlockedInsects = []; // Start with nothing
        this.activeSpecies = new Set(); // Track which species currently have living insects (prevent re-spawn)
        this.activeFamilies = new Map(); // Track which families are active: family -> speciesId
        this.greenCurrencyUnlocked = false; // Unlock green rhodopsin at 100 monochrome
        
        // Timer and level completion tracking
        this.levelStartTime = null; // Will be set when user clicks START on intro screen
        this.levelCompleted = false;
        this.timerStopped = false;
        this.finalTime = 0;
        
        // Level-specific divisors for resource balance (based on ACTUAL PIXEL COUNT)
        // Pixel counts: L1=809,600 | L2=1,025,762 (×1.267) | L3=1,000,620 (×1.236) | L4/5=811,014 (×1.002)
        // Formula: divisor = baseDivisor × (pixelsLevel1 / pixelsLevelN)
        // More pixels = HIGHER divisor = harder to earn (maintains difficulty)
        this.levelDivisors = {
            1: { monochrome: 8, green: 30, red: 34, blue: 26 },      // Baseline (809,600 pixels)
            2: { monochrome: 10, green: 38, red: 43, blue: 33 },     // Highest divisors (1,025,762 pixels - 26.7% more)
            3: { monochrome: 10, green: 37, red: 42, blue: 32 },     // High divisors (1,000,620 pixels - 23.6% more)
            4: { monochrome: 8, green: 30, red: 34, blue: 26 },      // Nearly same (811,014 pixels - 0.2% more)
            5: { monochrome: 8, green: 30, red: 34, blue: 26 }       // Nearly same (811,014 pixels - 0.2% more)
        };
        
        // High score system - load from localStorage
        this.loadHighScores();
        
        console.log('🔓 Starting unlocked insects:', this.unlockedInsects);
        console.log('💰 Starting with 10 monochrome - buy your first species!');
        console.log(`📊 Level ${this.currentLevel} divisors:`, this.levelDivisors[this.currentLevel]);
        // ==========================================

        // Create insects array (starts empty - insects spawn over time)
        this.insects = [];

        // Create corner-based family controls
        this.createCornerFamilyControls(width, height);

        // Input handling
        this.setupInputHandlers();
        
        // v0.04: DISABLE automatic spawning - manual purchase system only
        // this.startSpawnTimer(15);
        console.log('⚠️ Automatic spawning disabled - click species boxes to unlock/spawn');

        // Anweisungen (in zwei Zeilen aufgeteilt für bessere Lesbarkeit)
        this.add.text(width / 2, 12, 'Klicke auf Art-Box um Insekten freizuschalten | Klicke auf Insekt zum Auswählen, klicke um Pfad zu setzen', {
            fontSize: '12px',
            color: '#ffffff',
            backgroundColor: '#000000dd',
            padding: { x: 10, y: 3 },
            align: 'center'
        }).setOrigin(0.5).setDepth(3000);
        
        this.add.text(width / 2, 28, 'Mini-Emojis wählen Insekten | Klicke auf leeren Bereich um alle Insekten zu befehligen', {
            fontSize: '12px',
            color: '#ffffff',
            backgroundColor: '#000000dd',
            padding: { x: 10, y: 3 },
            align: 'center'
        }).setOrigin(0.5).setDepth(3000);
        
        // Spectral evolution display at bottom
        this.createSpectralEvolutionDisplay(width, height);

        console.log('=== CREATE COMPLETE ===');
        
        // Show introduction screen with rules (timer starts when user clicks START)
        this.showIntroductionScreen();
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
            { x: 10, y: 45, corner: 'top-left' },       // Diptera - moved down to avoid text (was 10)
            { x: width - 570, y: 45, corner: 'top-right' },  // Lepidoptera - adjusted for wider boxes (was width - 320)
            { x: width - 570, y: this.imageBounds.bottom + 10, corner: 'bottom-right' } // Coleoptera - adjusted for wider boxes
        ];
        
        // Short display names for UI
        // Latin names for species boxes (genus only - first word)
        const shortNames = {
            ant: 'Formica', honeybee: 'Apis', bumblebee: 'Bombus', hornet: 'Vespa',
            mosquito: 'Aedes', vinegar_fly: 'Drosophila', housefly: 'Musca', horsefly: 'Tabanus',
            hawk_moth: 'Macroglossum', peacock: 'Aglais', monarch: 'Danaus', cabbage_white: 'Pieris',
            stag_beetle: 'Lucanus', firefly: 'Photinus', ladybug: 'Coccinella', rose_chafer: 'Cetonia'
        };
        
        // Species box dimensions - much larger for better visibility
        const boxWidth = 137; // 80% wider (76 * 1.8 = 137)
        const boxHeight = 100; // 25% taller (80 * 1.25 = 100)
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
                
                // v0.04: Determine box appearance based on unlock/affordability
                const isUnlocked = this.unlockedInsects.includes(speciesId);
                const costs = UNLOCK_COSTS[speciesId];
                // Unlocked species are always affordable (FREE!)
                const canAfford = isUnlocked || this.currencySystem.canAfford(costs);
                
                // Species box background
                let boxColor = 0x0f1520; // Default dark (locked & can't afford)
                let borderColor = 0x333333; // Default gray
                
                if (isUnlocked) {
                    boxColor = 0x16213e; // Blue for unlocked
                    borderColor = 0x00ff00; // Green border for unlocked
                } else if (canAfford) {
                    boxColor = 0x1a2a1a; // Slight green tint (affordable)
                    borderColor = 0x44aa44; // Green-ish (can purchase)
                }
                
                const box = this.add.rectangle(
                    boxX, boxY, boxWidth, boxHeight, 
                    boxColor, 0.9
                ).setOrigin(0).setDepth(3000); // HIGH DEPTH - in front of everything
                box.setStrokeStyle(2, borderColor);
                
                // v0.04: Make ALL boxes interactive for purchase/spawn system
                box.setInteractive({ useHandCursor: true });
                
                // Keep old variables for compatibility (will phase out)
                const isCurrent = isUnlocked;
                const isNext = false; // No longer using "next" concept
                
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
                    emojiY - 3, // Moved up more
                    emoji, 
                    { 
                        fontSize: emojiSize,
                        padding: { top: 4, bottom: 0 }
                    }
                ).setOrigin(0.5, 0.25).setDepth(3001); // Lower Y origin for emoji ascent
                
                // Sensitivity bars on RIGHT side (after emoji on left)
                const weights = insectData.spectralWeights || { r: 0.33, g: 0.33, b: 0.33 };
                const isMonochromat = insectData.colorSpectrum.length === 1;
                const barWidth = 24; // Double the width (was 12)
                const maxBarHeight = 14; // Taller bars (was 10)
                const barStartX = boxX + boxWidth - 34; // Moved left by one bar size (was -10)
                
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
                        const barX = barStartX - (2 - idx) * 28; // Doubled spacing for doubled width (was 14)
                        
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
                const nameColor = isUnlocked ? '#00ff00' : (canAfford ? '#44ff44' : '#888888');
                const nameText = this.add.text(
                    boxX + boxWidth / 2,
                    boxY + 35,
                    shortNames[speciesId] || insectData.name,
                    {
                        fontSize: '18px', // Increased for better readability
                        color: nameColor,
                        align: 'center',
                        fontStyle: 'bold' // Make it bold for better visibility
                    }
                ).setOrigin(0.5, 0.5).setDepth(3001);
                
                // Mini emoji container BELOW name row - more space with much taller boxes
                const miniEmojiY = boxY + 50; // Increased from 45 for 100px tall boxes
                const miniEmojiContainer = this.add.container(boxX, miniEmojiY).setDepth(3010); // Higher depth than box (3000)
                
                // v0.04: Add cost/unlock indicators (show ALL costs)
                let costIndicators = [];
                if (!isUnlocked && costs) {
                    // Show ALL costs (multiple currency types stacked)
                    const icons = { monochrome: '⚫', red: '🔴', green: '🟢', blue: '🔵' };
                    let yOffset = 0;
                    
                    for (let [type, amount] of Object.entries(costs)) {
                        if (amount > 0) {
                            const icon = icons[type];
                            const costText = this.add.text(
                                boxX + boxWidth / 2,
                                boxY + boxHeight - 12 - yOffset,
                                `${icon}${amount}`,
                                {
                                    fontSize: '11px',
                                    color: canAfford ? '#44ff44' : '#ffaa00',
                                    align: 'center',
                                    fontStyle: 'bold'
                                }
                            ).setOrigin(0.5, 0.5).setDepth(3001);
                            
                            costIndicators.push(costText);
                            yOffset += 14; // Stack vertically
                        }
                    }
                } else if (isUnlocked) {
                    // Show checkmark for unlocked
                    const checkmark = this.add.text(
                        boxX + boxWidth - 10,
                        boxY + 5,
                        '✓',
                        {
                            fontSize: '16px',
                            color: '#00ff00',
                            fontStyle: 'bold'
                        }
                    ).setOrigin(0.5, 0).setDepth(3001);
                    costIndicators.push(checkmark);
                }
                
                // Store box data for later updates
                const boxData = {
                    familyIndex,
                    speciesIndex: i,
                    speciesId,
                    box,
                    boxX,
                    boxY,
                    boxWidth,
                    boxHeight,
                    emojiText,
                    nameText,
                    sensitivityBars,
                    loadingBarBg,
                    loadingBarFill,
                    waypointIndicator,
                    miniEmojiContainer,
                    miniEmojis: [], // Will store mini emoji sprites
                    blockedIndicator: null, // Will be created when needed for accessibility
                    blinkTween: null, // Will store blinking animation for affordable species
                    costIndicators, // v0.04: Cost displays (array)
                    programmedWaypoint: null, // Will store {x, y} when waypoint is set
                    isCurrent,
                    isNext
                };
                
                // Attach click handler to ALL boxes (but only make current/next interactive)
                box.on('pointerdown', (pointer) => {
                    console.log(`📦 BOX CLICK HANDLER FIRED for ${boxData.speciesId}`);
                    // Don't handle box click if a mini-emoji was just clicked
                    if (this.miniEmojiClicked) {
                        console.log(`⚠️ Ignoring box click - mini-emoji was clicked`);
                        return;
                    }
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
        // v0.04: Click on species box to UNLOCK/BUY insect OR select/unselect active insects
        const insectId = boxData.speciesId;
        const insectData = INSECT_DATABASE[insectId];
        const costs = UNLOCK_COSTS[insectId];
        const family = insectData.superfamily;
        
        console.log(`📦 Species box clicked: ${insectData.name} (${family})`);
        
        // NEW: If species is currently active AND unlocked, toggle selection of all individuals
        if (this.activeSpecies.has(insectId) && this.unlockedInsects.includes(insectId)) {
            const insectsOfThisSpecies = this.insects.filter(i => 
                i.insectId === insectId && !i.isDead
            );
            
            if (insectsOfThisSpecies.length > 0) {
                // Check if any are currently selected
                const anySelected = insectsOfThisSpecies.some(i => i.isSelected);
                
                if (anySelected) {
                    // UNSELECT all of this species
                    console.log(`🔴 Unselecting all ${insectData.name} (${insectsOfThisSpecies.length} insects)`);
                    insectsOfThisSpecies.forEach(insect => {
                        insect.isSelected = false;
                        insect.selectionRing.setAlpha(0);
                        if (insect.spectrumIndicators) {
                            insect.spectrumIndicators.forEach(ind => ind.setVisible(false));
                        }
                        if (insect.lifespanCircle) insect.lifespanCircle.setVisible(false);
                        if (insect.lifespanCircleBg) insect.lifespanCircleBg.setAlpha(0);
                    });
                    this.selectedInsectIndices = [];
                } else {
                    // SELECT all of this species
                    console.log(`🟢 Selecting all ${insectData.name} (${insectsOfThisSpecies.length} insects)`);
                    
                    // First deselect everything
                    this.insects.forEach(i => {
                        i.isSelected = false;
                        i.selectionRing.setAlpha(0);
                        if (i.spectrumIndicators) {
                            i.spectrumIndicators.forEach(ind => ind.setVisible(false));
                        }
                        if (i.lifespanCircle) i.lifespanCircle.setVisible(false);
                        if (i.lifespanCircleBg) i.lifespanCircleBg.setAlpha(0);
                    });
                    
                    // Then select all of this species
                    this.selectedInsectIndices = [];
                    insectsOfThisSpecies.forEach(insect => {
                        insect.isSelected = true;
                        insect.timeAtPosition = 0; // Reset idle timer when selected
                        // Show lifespan circle for selected insects
                        if (insect.lifespanCircle) insect.lifespanCircle.setVisible(true);
                        if (insect.lifespanCircleBg) insect.lifespanCircleBg.setAlpha(1);
                        this.selectedInsectIndices.push(insect.index);
                    });
                }
                
                // Update mini emojis to show selection state
                this.updateMiniEmojis();
                return;
            }
        }
        
        // If species is active but NOT unlocked (shouldn't happen), show message
        if (this.activeSpecies.has(insectId)) {
            console.log(`⏸️ ${insectData.name} are still alive! Wait for them to die before spawning more.`);
            console.log(`   → Can only spawn ONCE until all die`);
            this.showSpeciesActiveMessage(insectId, insectData.name);
            return;
        }
        
        // NEW: Check if another species from same family is active
        if (this.activeFamilies.has(family)) {
            const activeSpeciesInFamily = this.activeFamilies.get(family);
            const activeSpeciesData = INSECT_DATABASE[activeSpeciesInFamily];
            console.log(`🚫 Family ${family} is occupied by ${activeSpeciesData.name}!`);
            console.log(`   → Only ONE species per family at a time`);
            console.log(`   → Wait for ${activeSpeciesData.name} to die, then you can spawn this species`);
            this.showFamilyBlockedMessage(family, activeSpeciesData.name);
            return;
        }
        
        // Check if already unlocked - FREE to spawn additional times!
        if (this.unlockedInsects.includes(insectId)) {
            console.log(`✅ ${insectData.name} already unlocked - spawning for FREE!`);
            this.manualSpawnSpecies(insectId);
            return;
        }
        
        // Not unlocked - try to purchase for first time
        const canAfford = this.currencySystem.canAfford(costs);
        
        if (canAfford) {
            // Purchase directly without confirmation dialog!
            console.log(`💰 Purchasing ${insectData.name} for first time...`);
            this.currencySystem.spend(costs);
            this.unlockedInsects.push(insectId);
            console.log(`🔓 UNLOCKED: ${insectData.name}! Total unlocked: ${this.unlockedInsects.length}`);
            
            // Check for level completion
            this.checkLevelCompletion();
            this.showUnlockMessage(insectData.name);
            this.updateSpeciesBoxHighlights();
            this.manualSpawnSpecies(insectId);
        } else {
            // Can't afford - show what's needed
            this.showInsufficientResourcesMessage(insectId, costs);
        }
    }
    
    manualSpawnSpecies(insectId) {
        // Spawn a specific species immediately (bypassing timer system)
        const insectData = INSECT_DATABASE[insectId];
        const family = insectData.superfamily;
        
        console.log(`🐛 manualSpawnSpecies called for: ${insectId} (${insectData.name})`);
        
        // IMMEDIATELY mark as active to prevent race conditions from double-clicks
        this.activeSpecies.add(insectId);
        this.activeFamilies.set(family, insectId);
        console.log(`🔒 PRE-LOCK: ${insectData.name} marked as ACTIVE`);
        console.log(`🔒 PRE-LOCK: Family ${family} now occupied`);
        console.log(`   → Active species:`, Array.from(this.activeSpecies));
        console.log(`   → Active families:`, Array.from(this.activeFamilies.entries()).map(([f,s]) => `${f}→${s}`));
        
        // Update box highlights immediately to show red boxes
        this.updateSpeciesBoxHighlights();
        
        // Find the family for this insect
        const familyIndex = this.speciesByFamily.findIndex(family => family.includes(insectId));
        if (familyIndex === -1) {
            console.error(`❌ Cannot find family for ${insectId}`);
            return;
        }
        
        console.log(`✓ Found family index: ${familyIndex} for ${insectId}`);
        
        const activePanel = this.familyControls.find(c => c.familyIndex === familyIndex);
        if (!activePanel || !activePanel.spawnPosition) {
            console.error(`❌ No panel found for family ${familyIndex}`);
            console.log(`Available panels:`, this.familyControls.map(c => ({ family: c.familyIndex, hasPos: !!c.spawnPosition })));
            return;
        }
        
        console.log(`✓ Found panel with spawn position:`, activePanel.spawnPosition);
        
        // Calculate spawn count
        let spawnsNeeded;
        if (insectId === 'ant') spawnsNeeded = 10;
        else if (insectId === 'mosquito' || insectId === 'vinegar_fly') spawnsNeeded = 8;
        else if (insectId === 'ladybug') spawnsNeeded = 7;
        else if (insectId === 'honeybee') spawnsNeeded = 5;
        else if (insectId === 'housefly') spawnsNeeded = 5;
        else if (insectId === 'firefly') spawnsNeeded = 4;
        else if (insectId === 'bumblebee') spawnsNeeded = 3;
        else if (insectId === 'hoverfly') spawnsNeeded = 3;
        else if (insectId === 'hornet') spawnsNeeded = 2;
        else if (insectId === 'horsefly' || insectId === 'robber_fly') spawnsNeeded = 2;
        else if (insectId === 'rose_chafer') spawnsNeeded = 2;
        else if (insectId === 'stag_beetle') spawnsNeeded = 1;
        else if (insectId === 'hawk_moth') spawnsNeeded = 1;
        else if (insectId === 'monarch') spawnsNeeded = 1;
        else if (insectId === 'peacock') spawnsNeeded = 1;
        else if (insectId === 'cabbage_white') spawnsNeeded = 1;
        else spawnsNeeded = 2;
        
        console.log(`🐛 Manually spawning ${spawnsNeeded} ${insectData.name}`);
        
        // v0.04: Auto-unlock green rhodopsin if spawning a trichromat
        // Check if this insect can see multiple colors (has R, G, or B in spectrum)
        const isTrichromat = insectData.colorSpectrum && insectData.colorSpectrum.length >= 2;
        if (isTrichromat && !this.greenCurrencyUnlocked) {
            console.log(`🌈 Auto-unlocking color rhodopsins - ${insectData.name} is a trichromat!`);
            this.greenCurrencyUnlocked = true;
            // Don't show the flashy unlock animation for starting species
        }
        
        const emoji = this.getSpeciesEmoji(insectId);
        const startX = activePanel.spawnPosition.x;
        const startY = activePanel.spawnPosition.y;
        
        console.log(`🎯 Spawning at position: (${startX}, ${startY}) with emoji: ${emoji}`);
        
        // Spawn all individuals
        for (let i = 0; i < spawnsNeeded; i++) {
            console.log(`  → Spawning individual ${i + 1}/${spawnsNeeded}`);
            this.spawnSingleInsect(insectData, insectId, emoji, startX, startY, null);
        }
        
        console.log(`✅ Spawned ${spawnsNeeded} insects. Total insects now: ${this.insects.length}`);
        console.log(`🔒 CONFIRMED: ${insectData.name} active, family ${family} occupied`);
        
        this.updateMiniEmojis();
    }
    
    showPurchaseConfirmation(insectId, insectData, costs) {
        // Show a confirmation dialog for purchase
        console.log(`💬 showPurchaseConfirmation called for: ${insectData.name}`);
        console.log(`   Costs:`, costs);
        console.log(`   Current currencies:`, this.currencySystem.getCurrencies());
        
        const width = this.scale.width;
        const height = this.scale.height;
        
        // Create overlay
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7)
            .setOrigin(0)
            .setDepth(9000)
            .setInteractive();
        
        // Create dialog box
        const dialogWidth = 500;
        const dialogHeight = 300;
        const dialogX = width / 2;
        const dialogY = height / 2;
        
        const dialogBg = this.add.rectangle(dialogX, dialogY, dialogWidth, dialogHeight, 0x1a1a2e, 1)
            .setDepth(9001)
            .setStrokeStyle(3, 0x00ff00);
        
        // Title
        const title = this.add.text(dialogX, dialogY - 100, `Unlock ${insectData.name}?`, {
            fontSize: '28px',
            color: '#00ff00',
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(9002);
        
        // Cost display
        let costY = dialogY - 50;
        const costTexts = [];
        for (let [type, amount] of Object.entries(costs)) {
            if (amount > 0) {
                const icon = { monochrome: '⚫', red: '🔴', green: '🟢', blue: '🔵' }[type];
                const have = this.currencySystem.getCurrencies()[type];
                const color = have >= amount ? '#44ff44' : '#ff4444';
                
                const costText = this.add.text(dialogX, costY, 
                    `${icon} ${amount} ${type} (you have: ${have})`, {
                    fontSize: '18px',
                    color: color,
                    fontFamily: 'Arial'
                }).setOrigin(0.5).setDepth(9002);
                
                costTexts.push(costText);
                costY += 30;
            }
        }
        
        // Buttons
        const buttonY = dialogY + 80;
        
        // Confirm button
        const confirmBtn = this.add.rectangle(dialogX - 80, buttonY, 140, 50, 0x00aa00, 1)
            .setDepth(9001)
            .setInteractive({ useHandCursor: true })
            .setStrokeStyle(2, 0x00ff00);
        
        const confirmText = this.add.text(dialogX - 80, buttonY, 'UNLOCK', {
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(9002);
        
        // Cancel button
        const cancelBtn = this.add.rectangle(dialogX + 80, buttonY, 140, 50, 0xaa0000, 1)
            .setDepth(9001)
            .setInteractive({ useHandCursor: true })
            .setStrokeStyle(2, 0xff0000);
        
        const cancelText = this.add.text(dialogX + 80, buttonY, 'CANCEL', {
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(9002);
        
        // Button interactions
        confirmBtn.on('pointerover', () => confirmBtn.setFillStyle(0x00ff00));
        confirmBtn.on('pointerout', () => confirmBtn.setFillStyle(0x00aa00));
        confirmBtn.on('pointerdown', () => {
            console.log(`✓ Confirm button clicked for ${insectData.name}`);
            
            // Purchase!
            if (this.currencySystem.spend(costs)) {
                this.unlockedInsects.push(insectId);
                console.log(`🔓 UNLOCKED: ${insectData.name}! Total unlocked: ${this.unlockedInsects.length}`);
                this.showUnlockMessage(insectData.name);
                
                // Update highlights to show it's now unlocked
                this.updateSpeciesBoxHighlights();
                
                // Spawn immediately
                this.manualSpawnSpecies(insectId);
            } else {
                console.error(`❌ Failed to spend currency for ${insectData.name}`);
            }
            
            // Close dialog
            overlay.destroy();
            dialogBg.destroy();
            title.destroy();
            costTexts.forEach(t => t.destroy());
            confirmBtn.destroy();
            confirmText.destroy();
            cancelBtn.destroy();
            cancelText.destroy();
        });
        
        cancelBtn.on('pointerover', () => cancelBtn.setFillStyle(0xff0000));
        cancelBtn.on('pointerout', () => cancelBtn.setFillStyle(0xaa0000));
        cancelBtn.on('pointerdown', () => {
            // Close dialog
            overlay.destroy();
            dialogBg.destroy();
            title.destroy();
            costTexts.forEach(t => t.destroy());
            confirmBtn.destroy();
            confirmText.destroy();
            cancelBtn.destroy();
            cancelText.destroy();
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
                const miniX = (index % 5) * 18 + 2; // 5 per row, increased spacing to 18px
                const miniY = Math.floor(index / 5) * 18; // Increased vertical spacing too
                
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
                
                // Create mini-emoji text (positioned relative to container)
                const miniEmoji = this.add.text(miniX + circleRadius, miniY + circleRadius - 6, emoji, {
                    fontSize: '12px',
                    padding: { top: 2, bottom: 0 }
                }).setOrigin(0.5, 0.5).setDepth(3015); // Changed to 0.5, 0.5 for centered hit area
                
                // Highlight if this insect is currently selected
                if (insect.isSelected) {
                    miniEmoji.setTint(0x00ff00);
                    miniEmoji.setScale(1.3);
                }
                
                // Make clickable with explicit hit area and cursor - moved down significantly
                const hitArea = new Phaser.Geom.Rectangle(-8, 4, 16, 16); // Moved Y from -8 to 4 (12px down)
                miniEmoji.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
                miniEmoji.input.cursor = 'pointer';
                miniEmoji.on('pointerdown', (pointer) => {
                    console.log(`🐛 MINI-EMOJI CLICK for ${insect.insectId}`);
                    // Mark that a mini-emoji was clicked to prevent box click
                    this.miniEmojiClicked = true;
                    // Stop event propagation to prevent box click handler from firing
                    if (pointer.event) {
                        pointer.event.stopPropagation();
                    }
                    this.selectInsectFromMini(insect);
                    // Reset flag after a very short delay
                    this.time.delayedCall(10, () => {
                        this.miniEmojiClicked = false;
                    });
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
                
                // Add to container for proper positioning
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
        console.log(`🎯 Selected insect from mini emoji: ${insect.insectId}, index: ${insect.index}`);
        
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
        insect.timeAtPosition = 0; // Reset idle timer when selected
        console.log(`✅ Insect ${insect.insectId} marked as selected`);
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
        
        // Update mini-emojis to reflect new selection
        this.updateMiniEmojis();
    }
    
    redrawInsectPath(insect) {
        // Redraw the path for an insect with appropriate color
        if (!insect.pathGraphics) return;
        
        insect.pathGraphics.clear();
        
        if (insect.waypoints && insect.waypoints.length > 0) {
            // v0.04: Path color based on unlock status (green if unlocked)
            const isUnlocked = this.unlockedInsects.includes(insect.insectId);
            const pathColor = isUnlocked ? 0x00ff00 : 0x4444ff;
            
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
        if (!this.speciesBoxes) return;
        
        // Get all currently active species (max 3 total across all families)
        const allActiveSpecies = this.getAllActiveSpecies();
        const atSpeciesLimit = allActiveSpecies.length >= 3;
        
        // CRITICAL FIX: Rebuild activeFamilies from scratch based on CURRENT living insects
        // This ensures we never have stale family locks
        this.activeFamilies.clear();
        this.insects.forEach(insect => {
            if (!insect.isDead) {
                const family = insect.superfamily;
                const speciesId = insect.insectId;
                if (!this.activeFamilies.has(family)) {
                    this.activeFamilies.set(family, speciesId);
                }
            }
        });
        
        this.speciesBoxes.forEach(boxData => {
            const speciesId = boxData.speciesId;
            const insectData = INSECT_DATABASE[speciesId];
            const family = insectData.superfamily;
            const isUnlocked = this.unlockedInsects.includes(speciesId);
            const costs = UNLOCK_COSTS[speciesId];
            // Unlocked species are always affordable (FREE!)
            const canAfford = isUnlocked || this.currencySystem.canAfford(costs);
            
            // Check if this species is currently active
            const isSpeciesActive = allActiveSpecies.includes(speciesId);
            
            // Check if family has a different species active
            const familyHasOtherSpecies = this.activeFamilies.has(family) && 
                                          this.activeFamilies.get(family) !== speciesId;
            
            // Check if blocked: at 3-species total limit OR family has different species active
            const isBlocked = (atSpeciesLimit && !isSpeciesActive) || familyHasOtherSpecies;
            
            let boxColor = 0x0f1520; // Default: dark gray (locked, can't afford)
            let borderColor = 0x333333;
            let nameColor = '#888888';
            let emojiSize = '20px';
            
            // Priority: Check blocks first, then affordability, then unlock status
            if (isBlocked) {
                // BLOCKED: 3 species limit OR family occupied by different species
                // Make RED very obvious - darker red background, bright red border
                boxColor = 0x3a0808; // Darker red tint (more visible)
                borderColor = 0xff0000; // Bright red border
                nameColor = '#ff3333'; // Bright red name
                emojiSize = '20px';
                
                // Stop any blinking animation
                if (boxData.blinkTween) {
                    boxData.blinkTween.stop();
                    boxData.blinkTween = null;
                }
            } else if (isUnlocked) {
                // Unlocked (always FREE and affordable!)
                boxColor = 0x16213e; // Blue
                borderColor = 0x00ff00; // Green border
                nameColor = '#00ff00';
                emojiSize = '28px';
                
                // Stop any blinking animation
                if (boxData.blinkTween) {
                    boxData.blinkTween.stop();
                    boxData.blinkTween = null;
                }
            } else if (canAfford) {
                // Not unlocked but CAN afford to unlock - ADD STRONG BLINKING!
                boxColor = 0x1a2a1a; // Green tint
                borderColor = 0x44aa44;
                nameColor = '#44ff44';
                emojiSize = '24px';
                
                // Add STRONGER blinking animation to draw attention
                if (!boxData.blinkTween) {
                    boxData.blinkTween = this.tweens.add({
                        targets: boxData.box,
                        alpha: 0.5, // Fade down to 50% (was 70% - now more noticeable)
                        duration: 800, // 0.8 seconds (was 1.2s - now faster)
                        yoyo: true, // Fade back up
                        repeat: -1, // Infinite loop
                        ease: 'Sine.easeInOut'
                    });
                }
            } else {
                // Locked and can't afford - stop any blinking
                if (boxData.blinkTween) {
                    boxData.blinkTween.stop();
                    boxData.blinkTween = null;
                }
            }
            // else: stays default gray (locked + can't afford)
            
            boxData.box.setFillStyle(boxColor, 0.9);
            boxData.box.setStrokeStyle(2, borderColor);
            boxData.nameText.setColor(nameColor);
            boxData.emojiText.setFontSize(emojiSize);
            
            // Show/hide blocked indicator (🚫) for colorblind accessibility
            // ONLY show if NOT unlocked AND blocked
            // Position: BOTTOM RIGHT corner (separate from unlock tick in top right)
            if (!isUnlocked && isBlocked) {
                // Create blocked indicator if it doesn't exist
                if (!boxData.blockedIndicator) {
                    boxData.blockedIndicator = this.add.text(
                        boxData.boxX + boxData.boxWidth - 12,
                        boxData.boxY + boxData.boxHeight - 8,  // BOTTOM right instead of top
                        '🚫',
                        {
                            fontSize: '20px'
                        }
                    ).setOrigin(0.5).setDepth(3002);
                }
                boxData.blockedIndicator.setVisible(true);
            } else {
                // Hide blocked indicator when available OR when unlocked
                if (boxData.blockedIndicator) {
                    boxData.blockedIndicator.setVisible(false);
                }
            }
            
            // Disable interaction for blocked boxes to prevent spam clicking
            if (isBlocked) {
                boxData.box.disableInteractive();
            } else {
                // Re-enable interaction when unblocked
                if (!boxData.box.input) {
                    boxData.box.setInteractive({ useHandCursor: true });
                } else {
                    // Already has input, just make sure it's enabled
                    boxData.box.input.enabled = true;
                }
            }
            
            // Update loading bar visibility (only for unlocked species)
            const showLoadingBar = isUnlocked;
            boxData.loadingBarBg.setVisible(showLoadingBar);
            boxData.loadingBarFill.setVisible(showLoadingBar);
            
            // v0.04: Update cost indicator dynamically - destroy old ones
            if (boxData.costIndicators && boxData.costIndicators.length > 0) {
                boxData.costIndicators.forEach(indicator => indicator.destroy());
                boxData.costIndicators = [];
            }
            
            // Show costs ONLY for locked species, checkmark for unlocked
            if (costs) {
                boxData.costIndicators = [];
                
                if (!isUnlocked) {
                    // NOT unlocked - show costs
                    const icons = { monochrome: '⚫', red: '🔴', green: '🟢', blue: '🔵' };
                    const currencies = this.currencySystem.getCurrencies();
                    let yOffset = 0;
                    
                    for (let [type, amount] of Object.entries(costs)) {
                        if (amount > 0) {
                            const icon = icons[type];
                            const have = currencies[type];
                            const canAffordThis = have >= amount;
                            const costText = this.add.text(
                                boxData.boxX + boxData.boxWidth / 2,
                                boxData.boxY + boxData.boxHeight - 12 - yOffset,
                                `${icon}${have}/${amount}`,
                                {
                                    fontSize: '10px',
                                    color: canAffordThis ? '#44ff44' : '#ff6666',
                                    align: 'center',
                                    fontStyle: 'bold'
                                }
                            ).setOrigin(0.5, 0.5).setDepth(3001);
                            
                            boxData.costIndicators.push(costText);
                            yOffset += 12;
                        }
                    }
                } else {
                    // UNLOCKED - show checkmark and "FREE" text
                    const checkmark = this.add.text(
                        boxData.boxX + boxData.boxWidth - 10,
                        boxData.boxY + 5,
                        '✓',
                        {
                            fontSize: '16px',
                            color: '#00ff00',
                            fontStyle: 'bold'
                        }
                    ).setOrigin(0.5, 0).setDepth(3001);
                    boxData.costIndicators.push(checkmark);
                    
                    const freeText = this.add.text(
                        boxData.boxX + boxData.boxWidth / 2,
                        boxData.boxY + boxData.boxHeight - 12,
                        'FREE',
                        {
                            fontSize: '11px',
                            color: '#00ff00',
                            fontStyle: 'bold'
                        }
                    ).setOrigin(0.5, 0.5).setDepth(3001);
                    boxData.costIndicators.push(freeText);
                }
            }
            
            // Update waypoint marker color (green if unlocked, gray if not)
            if (boxData.waypointMarker && boxData.programmedWaypoint) {
                const markerColor = isUnlocked ? 0x00ff00 : 0x666666;
                boxData.waypointMarker.setFillStyle(markerColor, 0.6);
                boxData.waypointMarker.setStrokeStyle(2, markerColor);
            }
            if (boxData.waypointIndicator && boxData.programmedWaypoint) {
                const indicatorColor = isUnlocked ? 0x00ff00 : 0x666666;
                boxData.waypointIndicator.setFillStyle(indicatorColor, 1);
                boxData.waypointIndicator.setStrokeStyle(2, indicatorColor);
            }
            
            // v0.04: All boxes are interactive (can purchase any species)
            if (!boxData.box.input) {
                boxData.box.setInteractive({ useHandCursor: true });
            }
            
            // Store for compatibility
            boxData.isCurrent = isUnlocked;
            boxData.isNext = false; // No longer used
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
                    const boxWidth = 137; // Same as species box width (updated to 137)
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
            // Try to spawn - if unlock fails (insufficient resources), retry in 5 seconds
            const spawnSuccess = this.spawnInsectFromPanel();
            if (!spawnSuccess) {
                console.log('⏸️ Spawn delayed - insufficient resources. Retrying in 5 seconds...');
                this.startSpawnTimer(5); // Retry sooner
            }
        });
    }

    spawnInsectFromPanel() {
        const activeFamilyIndex = this.familyProgression.currentFamilyInRound;
        const activePanel = this.familyControls.find(c => c.familyIndex === activeFamilyIndex);
        
        if (!activePanel || !activePanel.spawnPosition) {
            console.error('No active panel found for family:', activeFamilyIndex);
            return false;
        }
        
        const insectId = this.currentSpeciesId;
        const insectData = INSECT_DATABASE[insectId];
        
        if (!insectData) {
            console.error(`CRITICAL ERROR: insectId '${insectId}' not found in database!`);
            console.error(`Available species for family ${activeFamilyIndex}:`, this.speciesByFamily[activeFamilyIndex]);
            return false;
        }
        
        // ========== SPECIES LIMIT CHECK ==========
        // 1. Max 3 species TOTAL across all families
        const allActiveSpecies = this.getAllActiveSpecies();
        
        // 2. Only 1 species per family
        const activeFamilySpecies = this.getActiveSpeciesForFamily(activeFamilyIndex);
        
        // Check if trying to spawn a new species (not already active)
        if (!allActiveSpecies.includes(insectId)) {
            // Check total limit (3 species max)
            if (allActiveSpecies.length >= 3) {
                console.warn(`❌ Cannot spawn ${insectData.name} - Maximum 3 species total already active`);
                this.showSpeciesLimitMessage(allActiveSpecies);
                return false;
            }
            
            // Check family limit (1 species per family)
            if (activeFamilySpecies.length >= 1) {
                const activeInFamily = activeFamilySpecies[0];
                const activeData = INSECT_DATABASE[activeInFamily];
                console.warn(`❌ Cannot spawn ${insectData.name} - ${activeData.name} already active in this family`);
                this.showFamilyLimitMessage(activeData.name);
                return false;
            }
        }
        // =====================================================================
        
        // ========== v0.04 UNLOCK CHECK ==========
        // Check if this insect is unlocked
        if (!this.unlockedInsects.includes(insectId)) {
            const costs = UNLOCK_COSTS[insectId];
            
            // Check if player can afford it
            if (this.currencySystem.canAfford(costs)) {
                // Spend currency and unlock
                if (this.currencySystem.spend(costs)) {
                    this.unlockedInsects.push(insectId);
                    console.log(`🔓 UNLOCKED: ${insectData.name}!`);
                    this.showUnlockMessage(insectData.name);
                } else {
                    console.warn(`❌ Cannot unlock ${insectData.name} - insufficient resources`);
                    this.showInsufficientResourcesMessage(insectId, costs);
                    return false; // Don't spawn - RETURN FALSE
                }
            } else {
                console.warn(`❌ Cannot afford ${insectData.name}`);
                this.showInsufficientResourcesMessage(insectId, costs);
                return false; // Don't spawn - RETURN FALSE
            }
        }
        // ==========================================
        
        // Calculate how many to spawn based on actual insect body size
        // Smaller insects spawn more individuals to balance gameplay
        let spawnsNeeded;
        
        // Size-based spawn counts (based on actual body length)
        if (insectId === 'ant') spawnsNeeded = 10; // 4-11mm - smallest
        else if (insectId === 'mosquito' || insectId === 'vinegar_fly') spawnsNeeded = 8; // 2-10mm, 2-3mm
        else if (insectId === 'ladybug') spawnsNeeded = 7; // 5.5-8mm
        else if (insectId === 'honeybee') spawnsNeeded = 5; // 11-18mm
        else if (insectId === 'housefly') spawnsNeeded = 5; // 8-12mm
        else if (insectId === 'firefly') spawnsNeeded = 4; // 10-20mm
        else if (insectId === 'bumblebee') spawnsNeeded = 3; // 11-28mm
        else if (insectId === 'hoverfly') spawnsNeeded = 3; // 15mm
        else if (insectId === 'hornet') spawnsNeeded = 2; // 18-35mm
        else if (insectId === 'horsefly' || insectId === 'robber_fly') spawnsNeeded = 2; // 20-30mm
        else if (insectId === 'rose_chafer') spawnsNeeded = 2; // Medium beetle
        // All large insects: 1 individual only
        else if (insectId === 'stag_beetle') spawnsNeeded = 1; // 30-75mm - very large
        else if (insectId === 'hawk_moth') spawnsNeeded = 1; // 40-50mm
        else if (insectId === 'monarch') spawnsNeeded = 1; // 90-100mm - largest
        else if (insectId === 'peacock') spawnsNeeded = 1; // 50-55mm
        else if (insectId === 'cabbage_white') spawnsNeeded = 1; // 32-47mm
        else spawnsNeeded = 2; // Default for any others
        
        console.log(`Spawning ALL ${spawnsNeeded} ${insectData.name} simultaneously`);
        
        const emoji = this.getSpeciesEmoji(insectId);
        const startX = activePanel.spawnPosition.x;
        const startY = activePanel.spawnPosition.y;
        
        // Check if there's a programmed waypoint for this species
        const speciesBox = this.speciesBoxes?.find(box => box.speciesId === insectId);
        const programmedWaypoint = speciesBox?.programmedWaypoint || null;
        
        // Spawn all individuals at once
        for (let i = 0; i < spawnsNeeded; i++) {
            this.spawnSingleInsect(insectData, insectId, emoji, startX, startY, programmedWaypoint);
        }
        
        // Clear programmed waypoint after using it (one-time use for whole group)
        if (programmedWaypoint && speciesBox) {
            speciesBox.programmedWaypoint = null;
            speciesBox.waypointIndicator.setVisible(false);
            if (speciesBox.waypointMarker) {
                speciesBox.waypointMarker.destroy();
                speciesBox.waypointMarker = null;
            }
            console.log(`Waypoint cleared after spawning ${spawnsNeeded} insects`);
        }
        
        // Update mini emoji display
        this.updateMiniEmojis();
        
        // Progress to next species
        this.familyProgression.spawnCountForCurrentSpecies = spawnsNeeded;
        this.progressToNextSpecies();
        
        // Start next spawn timer (15 seconds to prevent too many insects)
        this.startSpawnTimer(15);
        
        return true; // SUCCESS
    }

    spawnSingleInsect(insectData, insectId, emoji, startX, startY, programmedWaypoint = null) {
        // Spawn at panel position with slight random offset to avoid complete overlap
        const offsetX = (Math.random() - 0.5) * 30;
        const offsetY = (Math.random() - 0.5) * 30;
        const spawnX = startX + offsetX;
        const spawnY = startY + offsetY;
        
        // Create the insect sprite
        const insectSprite = this.add.text(spawnX, spawnY, emoji, {
            fontSize: '28px',
            padding: { top: 4, bottom: 0 } // Prevent emoji top cropping
        }).setOrigin(0.5, 0.25).setDepth(1000); // Adjusted Y origin for emoji ascent
        
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
        const spectrumIndicators = this.createSpectrumIndicators(spawnX, spawnY + 30, insectData);
        spectrumIndicators.forEach(ind => ind.setVisible(false));
        
        // Circular lifespan indicator around insect (HIDDEN by default)
        const ringRadius = 25 * sizeScale;
        
        // Background circle (dark red/gray)
        const lifespanCircleBg = this.add.circle(spawnX, spawnY, ringRadius + 4, 0x000000, 0).setDepth(1009);
        lifespanCircleBg.setStrokeStyle(2, 0x440000, 0.4);
        lifespanCircleBg.setAlpha(0); // Hidden by default
        
        // Foreground arc (green, will shrink as lifetime decreases)
        const lifespanCircle = this.add.graphics().setDepth(1010);
        lifespanCircle.setVisible(false); // Hidden by default
        
        // Selection ring - scale with insect size (hidden by default)
        const selectionRing = this.add.circle(spawnX, spawnY, ringRadius, 0xffffff, 0).setDepth(1011);
        selectionRing.setStrokeStyle(3, 0x00ff00);
        selectionRing.setAlpha(0); // Hidden by default
        
        // Focus ring - slightly larger (REMOVED - we don't want it visible)
        const focusRing = this.add.circle(spawnX, spawnY, ringRadius + 3, 0xffffff, 0).setDepth(1008);
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
            commonName: insectData.name, // For collection messages
            index: index,
            superfamily: insectData.superfamily,
            colorSpectrum: insectData.colorSpectrum || [], // Color receptors (R, G, B, UV)
            spectralWeights: insectData.revealWeights || { r: 0, g: 0, b: 0 }, // For collection amounts
            spectrumIndicators: spectrumIndicators,
            sizeScale: sizeScale,
            isSelected: false,
            userControlled: false, // NEW: Track if user has given commands
            waypoints: [],
            currentWaypoint: null,
            pathGraphics: pathGraphics,
            timeAtPosition: 0,
            lastPosition: { x: spawnX, y: spawnY },
            focusLevel: 0.5, // Start with base focus so insects can defog while moving
            lastDefogX: spawnX,
            lastDefogY: spawnY,
            lastDefogLevel: 0,
            defogActivity: 0, // v0.04: Track recent defogging activity (0-100) for currency multiplier
            randomWalkMode: true,
            randomWalkTimer: 0,
            age: 0,
            spawnDelay: 500, // v0.04: Wait 500ms before defogging to prevent spawn freeze
            lifespan: insectId === 'ant' ? 117000 : 90000 / insectData.speed // Ants live 117s (35% shorter), others 90s/speed (18-90s)
        };
        
        this.insects.push(insect);
        
        // ========== v0.04 COLOR VISION UNLOCK ==========
        // Check if this is the first trichromat (color vision unlocked!)
        if (!this.colorVisionUnlocked && insect.data.colorSpectrum && insect.data.colorSpectrum.length > 1) {
            this.unlockColorVision();
        }
        // ==========================================
        
        // Use programmed waypoint if provided, otherwise add random waypoint
        if (programmedWaypoint) {
            insect.waypoints = [programmedWaypoint];
            insect.randomWalkMode = false;
            insect.userControlled = true;
            this.drawPath(insect);
        } else {
            // Add random waypoint to start walking
            this.addRandomWaypoint(insect);
        }
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
            
            // Check if we clicked on a mini-emoji first
            const clickedObjects = this.input.hitTestPointer(pointer);
            if (clickedObjects.length > 0) {
                // Check if any clicked object is a mini-emoji (check all species boxes)
                const clickedMiniEmoji = this.speciesBoxes?.some(boxData => {
                    return boxData.miniEmojis?.some(miniEmoji => clickedObjects.includes(miniEmoji));
                });
                
                if (clickedMiniEmoji) {
                    console.log('⚠️ Ignoring global click - mini-emoji was clicked');
                    return; // Exit early - let mini-emoji handler deal with it
                }
            }
            
            // Check if a mini-emoji was just clicked - if so, skip ALL processing
            if (this.miniEmojiClicked) {
                console.log('⚠️ Ignoring global click - mini-emoji flag set');
                return;
            }
            
            // Check if we clicked on an interactive game object (like a species box)
            // If so, skip our processing and let that object's handler deal with it
            let clickOnSpeciesBox = false;
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
                    const lifespan = boxData.speciesId === 'ant' ? 117000 : 90000 / insectSpeed; // Ants: 117s (35% shorter)
                    // FIXED: Match movement speed formula (speed * 0.05 * delta * frames)
                    // Movement: speed * 0.05 pixels per millisecond ≈ speed * 50 pixels per second (at 60fps)
                    // Max distance = (lifespan in seconds) * (speed * 50)
                    const maxDistance = (lifespan / 1000) * insectSpeed * 50; // pixels = (seconds) * (speed factor) * 50
                    
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
            
            // Debug logging
            if (!clickedOnInsect) {
                console.log(`🖱️ Click on empty area - hasSelection: ${hasSelection}, selectedIndices: [${this.selectedInsectIndices}]`);
            }
            
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
                    // Case 4: Add waypoint to selected insect(s) path
                    const selectedCount = this.selectedInsectIndices.length;
                    console.log(`📍 Adding waypoint at (${Math.round(pointer.x)}, ${Math.round(pointer.y)}) to ${selectedCount} selected insect(s)`);
                    this.addWaypointToSelected(pointer.x, pointer.y);
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
        insect.timeAtPosition = 0; // Reset idle timer when selected
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
        // FIXED: Match movement speed formula (speed * 0.05 * delta * frames)
        // Movement: speed * 0.05 pixels per millisecond ≈ speed * 50 pixels per second (at 60fps)
        const maxDistance = (remainingLifespan / 1000) * speed * 50; // pixels = (seconds) * (speed factor) * 50
        
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

    addWaypointToSelected(x, y) {
        // Add waypoint to ALL selected insects
        if (this.selectedInsectIndices.length === 0) {
            console.log('⚠️ No insects selected');
            return;
        }
        
        console.log(`📍 Adding waypoint to ${this.selectedInsectIndices.length} selected insect(s)`);
        
        let anyPathTooLong = false;
        let successCount = 0;
        
        // Add waypoint to each selected insect
        this.selectedInsectIndices.forEach(index => {
            const insect = this.insects[index];
            if (!insect || insect.isDead) return;
            
            // For first user command, IGNORE any spawn waypoints and just check direct distance
            // This is the key fix - spawn waypoints shouldn't block user commands!
            let totalDistance = 0;
            
            if (!insect.userControlled) {
                // First user command - just check direct distance from current position
                const dx = x - insect.sprite.x;
                const dy = y - insect.sprite.y;
                totalDistance = Math.sqrt(dx * dx + dy * dy);
                
                console.log(`  ${insect.data.name} [FIRST CMD]: checking direct distance = ${totalDistance.toFixed(0)}px`);
            } else {
                // Has existing USER waypoints - calculate full path
                let lastX = insect.sprite.x;
                let lastY = insect.sprite.y;
                
                // Add distance for existing USER waypoints only
                insect.waypoints.forEach(wp => {
                    const dx = wp.x - lastX;
                    const dy = wp.y - lastY;
                    totalDistance += Math.sqrt(dx * dx + dy * dy);
                    lastX = wp.x;
                    lastY = wp.y;
                });
                
                // Add distance to new waypoint
                const dx = x - lastX;
                const dy = y - lastY;
                totalDistance += Math.sqrt(dx * dx + dy * dy);
                
                console.log(`  ${insect.data.name} [ADD TO PATH]: total path = ${totalDistance.toFixed(0)}px (${insect.waypoints.length} existing waypoints)`);
            }
            
            // Check against remaining lifespan
            const speed = insect.data.speed * 0.05; // pixels per millisecond
            const remainingLifespan = insect.lifespan - insect.age;
            // FIXED: Increased multiplier from 50 to 600 for more reasonable max distances
            // Speed 1 (slow): 90s × 0.05 × 600 = 2700px
            // Speed 2 (normal): 60s × 0.10 × 600 = 3600px
            // Speed 4 (fast): 30s × 0.20 × 600 = 3600px
            const maxDistance = (remainingLifespan / 1000) * speed * 600;
            
            console.log(`  Max distance: ${maxDistance.toFixed(0)}px, age: ${(insect.age/1000).toFixed(1)}s / ${(insect.lifespan/1000).toFixed(1)}s`);
            
            if (totalDistance > maxDistance) {
                console.log(`  ⚠️ Path TOO LONG for ${insect.data.name}! (${totalDistance.toFixed(0)} > ${maxDistance.toFixed(0)})`);
                anyPathTooLong = true;
                
                // Blink this insect to show path is too long
                this.tweens.add({
                    targets: insect.sprite,
                    alpha: 0.3,
                    duration: 150,
                    yoyo: true,
                    repeat: 3,
                    onComplete: () => {
                        insect.sprite.setAlpha(1);
                    }
                });
                return; // Skip this insect
            }
            
            // Add waypoint - replace any spawn waypoints for first command
            if (!insect.userControlled) {
                // First command - CLEAR spawn waypoints and replace with user command
                insect.waypoints = [{ x, y }];
                insect.userControlled = true;
                console.log(`  🎯 First user command - replaced spawn path for ${insect.data.name}`);
            } else {
                // Add to existing path
                insect.waypoints.push({ x, y });
                console.log(`  📍 Added waypoint to ${insect.data.name} (now ${insect.waypoints.length} waypoints)`);
            }
            
            insect.randomWalkMode = false;
            this.drawPath(insect);
            successCount++;
        });
        
        console.log(`✅ Waypoint added to ${successCount}/${this.selectedInsectIndices.length} insects`);
        
        // If ANY insects had path too long, deselect all after animation
        if (anyPathTooLong && successCount === 0) {
            // ALL insects failed - deselect everything
            this.time.delayedCall(600, () => {
                this.insects.forEach(insect => {
                    insect.isSelected = false;
                    insect.selectionRing.setAlpha(0);
                    if (insect.spectrumIndicators) {
                        insect.spectrumIndicators.forEach(ind => ind.setVisible(false));
                    }
                    if (insect.lifespanCircle) insect.lifespanCircle.setVisible(false);
                    if (insect.lifespanCircleBg) insect.lifespanCircleBg.setAlpha(0);
                });
                this.selectedInsectIndices = [];
                this.updateMiniEmojis();
                console.log(`✓ All deselected (all paths too long)`);
            });
        }
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
        if (!this.updateFrameCounter) this.updateFrameCounter = 0;
        this.updateFrameCounter++;
        
        // PERFORMANCE: AGGRESSIVE frame skipping based on insect count (kicks in at 5 insects)
        const insectCount = this.insects.length;
        let skipDefogFrame = false;
        
        if (insectCount >= 15) {
            skipDefogFrame = this.updateFrameCounter % 5 !== 0; // Skip 4/5 frames (80% skip)
        } else if (insectCount >= 10) {
            skipDefogFrame = this.updateFrameCounter % 4 !== 0; // Skip 3/4 frames (75% skip)
        } else if (insectCount >= 5) {
            skipDefogFrame = this.updateFrameCounter % 2 === 0; // Skip 1/2 frames (50% skip)
        }
        
        // Update timer display
        if (this.timerText) {
            this.updateTimer();
        }
        
        if (this.collectibleSystem && this.updateFrameCounter % 3 === 0) {
            this.collectibleSystem.checkCollection(this.insects);
        }
        
        // Clean up activeSpecies Set and activeFamilies Map every 30 frames (more responsive)
        if (this.updateFrameCounter % 30 === 0) {
            const activeSpeciesIds = new Set(this.insects.map(i => i.insectId));
            const currentActiveFamilies = new Map(); // Rebuild based on current insects
            
            let speciesChanged = false;
            let familiesChanged = false;
            
            // Rebuild active species set
            for (const speciesId of this.activeSpecies) {
                if (!activeSpeciesIds.has(speciesId)) {
                    this.activeSpecies.delete(speciesId);
                    console.log(`🔓 [Periodic cleanup] Removed ${speciesId} from activeSpecies`);
                    speciesChanged = true;
                }
            }
            
            // Rebuild activeFamilies based on CURRENT insects
            // For each family, find which species are alive
            for (const insect of this.insects) {
                if (!insect.isDead) {
                    const family = insect.superfamily;
                    const speciesId = insect.insectId;
                    
                    // If family already has a species, check if it's the same
                    if (currentActiveFamilies.has(family)) {
                        // Multiple species from same family - keep the first one encountered
                        // (This shouldn't happen normally, but defensive coding)
                        const existingSpecies = currentActiveFamilies.get(family);
                        if (existingSpecies !== speciesId) {
                            console.warn(`⚠️ [Periodic cleanup] Family ${family} has multiple species: ${existingSpecies} and ${speciesId}`);
                        }
                    } else {
                        currentActiveFamilies.set(family, speciesId);
                    }
                }
            }
            
            // Check if families changed
            if (this.activeFamilies.size !== currentActiveFamilies.size) {
                familiesChanged = true;
            } else {
                // Check if same families with same species
                for (const [family, speciesId] of currentActiveFamilies) {
                    if (this.activeFamilies.get(family) !== speciesId) {
                        familiesChanged = true;
                        break;
                    }
                }
            }
            
            // Replace activeFamilies with the rebuilt version
            this.activeFamilies = currentActiveFamilies;
            
            // Update UI if anything changed
            if (speciesChanged || familiesChanged) {
                console.log(`🔄 [Periodic cleanup] State changed - updating UI`);
                this.updateSpeciesBoxHighlights();
            }
            
            // Log if families changed
            if (this.updateFrameCounter % 120 === 0) { // Log every 2 seconds
                console.log(`📊 [Periodic cleanup] Active families:`, Array.from(this.activeFamilies.entries()).map(([f, s]) => `${f}→${s}`));
            }
        }
        
        let insectsChanged = false;
        
        // IMPORTANT: Capture selected insects BEFORE filtering
        const oldSelectedIndices = [...this.selectedInsectIndices];
        const selectedInsects = oldSelectedIndices.map(idx => this.insects[idx]).filter(i => i && i.sprite); // Get actual insect objects
        const selectedInsectIds = new Set(selectedInsects.map(i => i.index)); // Store original indices to detect deaths
        
        // Age insects and remove dead ones
        this.insects = this.insects.filter(insect => {
            insect.age += delta;
            
            if (insect.age >= insect.lifespan) {
                // Insect died - check if it was selected
                const wasSelected = selectedInsectIds.has(insect.index);
                
                // v0.04: Store species ID before destroying
                const dyingSpeciesId = insect.insectId; // Changed from speciesId to insectId
                
                // Clean up
                insect.sprite.destroy();
                insect.selectionRing.destroy();
                insect.focusRing.destroy();
                insect.lifespanCircle.destroy();
                insect.lifespanCircleBg.destroy();
                insect.pathGraphics.destroy();
                insect.spectrumIndicators.forEach(ind => ind.destroy());
                
                console.log(`💀 ${insect.data.name} died after ${(insect.age/1000).toFixed(1)}s${wasSelected ? ' (was SELECTED)' : ''}`);
                
                // NEW: If a selected insect died, mark that we need to clear selection
                if (wasSelected) {
                    insectsChanged = true; // Will trigger clearing selection below
                }
                
                // v0.04: Check if this was the last insect of this species
                // Check remaining insects EXCLUDING this one
                const anyRemaining = this.insects.filter(i => i !== insect).some(i => i.insectId === dyingSpeciesId); // Changed from speciesId to insectId
                console.log(`   → Checking if last: anyRemaining=${anyRemaining}, activeSpecies.has=${this.activeSpecies.has(dyingSpeciesId)}`);
                
                if (!anyRemaining && this.activeSpecies.has(dyingSpeciesId)) {
                    this.activeSpecies.delete(dyingSpeciesId);
                    const dyingSpeciesData = INSECT_DATABASE[dyingSpeciesId];
                    const family = dyingSpeciesData.superfamily;
                    console.log(`🔓 All ${dyingSpeciesData.name} have died - can respawn now!`);
                    console.log(`   → Active species remaining:`, Array.from(this.activeSpecies));
                    
                    // FIXED: Check if ANY OTHER species from this family are still alive
                    // Filter out the dying insect AND check for different species IDs
                    const otherFamilySpecies = this.insects.filter(i => 
                        i !== insect && // Not the dying insect
                        i.superfamily === family && // Same family
                        i.insectId !== dyingSpeciesId // Different species
                    );
                    
                    console.log(`   → Checking family ${family}: otherFamilySpecies count = ${otherFamilySpecies.length}`);
                    
                    if (otherFamilySpecies.length === 0) {
                        // NO other species from this family alive - family is FREE!
                        this.activeFamilies.delete(family);
                        console.log(`🔓 Family ${family} is now COMPLETELY FREE - you can spawn ANY species from this family!`);
                    } else {
                        // Family still has other species alive - DON'T delete it
                        const otherSpeciesId = otherFamilySpecies[0].insectId;
                        const otherSpeciesData = INSECT_DATABASE[otherSpeciesId];
                        console.log(`⚠️ Family ${family} still has ${otherSpeciesData.name} alive (${otherFamilySpecies.length} individuals) - family remains occupied`);
                    }
                    
                    console.log(`   → Active families remaining:`, Array.from(this.activeFamilies.keys()));
                    // Update box highlights to reflect current state
                    this.updateSpeciesBoxHighlights();
                }
                
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
        
        // Update indices after filtering (selectedInsects already captured before filter)
        this.insects.forEach((insect, newIdx) => {
            const oldIdx = insect.index;
            insect.index = newIdx;
            // Update the index stored in sprite data
            insect.sprite.setData('insectIndex', newIdx);
        });
        
        // Check if any selected insects died by comparing surviving insects with captured selection
        const survivingSelectedInsects = selectedInsects.filter(selectedInsect => 
            selectedInsect && this.insects.includes(selectedInsect)
        );
        
        // If ANY selected insect died, CLEAR the entire selection (don't jump to next)
        if (survivingSelectedInsects.length < selectedInsects.length) {
            console.log(`🔴 Selected insect(s) died - clearing selection (${selectedInsects.length} → ${survivingSelectedInsects.length} survivors)`);
            this.selectedInsectIndices = [];
            // Hide indicators for any survivors
            survivingSelectedInsects.forEach(insect => {
                insect.isSelected = false;
                if (insect.lifespanCircle) insect.lifespanCircle.setVisible(false);
                if (insect.lifespanCircleBg) insect.lifespanCircleBg.setAlpha(0);
                if (insect.selectionRing) insect.selectionRing.setAlpha(0);
                if (insect.pathGraphics) insect.pathGraphics.clear();
            });
        } else if (survivingSelectedInsects.length > 0) {
            // All selected insects survived - update their indices
            this.selectedInsectIndices = [];
            survivingSelectedInsects.forEach(selectedInsect => {
                this.selectedInsectIndices.push(selectedInsect.index);
                
                // Make sure visual indicators are shown
                selectedInsect.isSelected = true;
                selectedInsect.lifespanCircle.setVisible(true);
                selectedInsect.lifespanCircleBg.setAlpha(1);
                selectedInsect.selectionRing.setAlpha(0); // Keep ring hidden
                
                // IMPORTANT: Preserve user control when selection transfers
                // This ensures the next click controls this insect, not "command all"
                if (selectedInsect.userControlled) {
                    selectedInsect.userControlled = true; // Keep user control flag
                }
                
                // Redraw path if exists
                if (selectedInsect.waypoints && selectedInsect.waypoints.length > 0) {
                    this.drawPath(selectedInsect);
                }
                
                console.log(`✅ Preserved selection: ${selectedInsect.data.name} at new index ${selectedInsect.index}`);
            });
        }
        
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
                
                // NEW: If unselected and idle for 3 seconds with no waypoints, start random walking
                if (!insect.isSelected && insect.waypoints.length === 0 && insect.timeAtPosition > 3000) {
                    console.log(`🚶 ${insect.data.name} idle for 3s - starting random walk`);
                    this.addRandomWaypoint(insect);
                    insect.timeAtPosition = 0; // Reset idle timer
                }
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
            // Performance: Skip defogging on some frames when there are many insects
            if (!skipDefogFrame) {
                this.defogAtInsect(insect);
                insect.lastDefogX = insect.sprite.x;
                insect.lastDefogY = insect.sprite.y;
                insect.lastDefogLevel = insect.focusLevel;
            } else {
                // v0.04: Decay defog activity when not actively defogging (skipped frame)
                if (insect.defogActivity > 0) {
                    insect.defogActivity = Math.max(0, insect.defogActivity - 2); // Decay by 2 per skipped frame
                }
            }
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
        const scaledRadius = baseRadius * sizeScale * 1.5; // Increased by 50% for more reveal
        
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
            let edgeCurrency = 0; // v0.04: Track edge detection for rhodopsin harvesting
            
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
                    
                    // v0.04: Check if this pixel was already revealed BY MONOCHROME INSECTS
                    const pixelKey = `${px},${py}`;
                    const isNewPixelMono = !this.revealedPixelsMono.has(pixelKey);
                    
                    // Sample pixel from canvas
                    const pixelData = this.imageContext.getImageData(px, py, 1, 1).data;
                    const r = pixelData[0];
                    const g = pixelData[1];
                    const b = pixelData[2];
                    
                    // Calculate brightness (luminance)
                    const brightness = (r + g + b) / 3;
                    
                    // v0.04: EDGE DETECTION for rhodopsin - only award for NEW monochrome pixels
                    if (isNewPixelMono) {
                        // Sample neighbors to detect edges (contrast)
                        let maxContrast = 0;
                        for (let ny = -1; ny <= 1; ny++) {
                            for (let nx = -1; nx <= 1; nx++) {
                                if (nx === 0 && ny === 0) continue;
                                const npx = px + nx;
                                const npy = py + ny;
                                if (npx >= 0 && npx < this.hiddenImage.width && npy >= 0 && npy < this.hiddenImage.height) {
                                    const neighborData = this.imageContext.getImageData(npx, npy, 1, 1).data;
                                    const neighborBrightness = (neighborData[0] + neighborData[1] + neighborData[2]) / 3;
                                    const contrast = Math.abs(brightness - neighborBrightness);
                                    maxContrast = Math.max(maxContrast, contrast);
                                }
                            }
                        }
                        
                        // Award rhodopsin based on edge strength (high contrast = more rhodopsin)
                        if (maxContrast > 100) {
                            edgeCurrency += 1; // Strong edge
                        } else if (maxContrast > 50) {
                            edgeCurrency += 0.5; // Medium edge
                        } else if (maxContrast > 20) {
                            edgeCurrency += 0.1; // Weak edge
                        }
                        
                        this.revealedPixelsMono.add(pixelKey); // Mark as revealed for MONOCHROME
                    }
                    
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
            
            // Get level-specific divisors for resource balance
            const divisors = this.levelDivisors[this.currentLevel];
            
            if (edgeCurrency > 0) {
                const greenWeight = weights.g || 1.0;
                const currencyAwarded = Math.floor((edgeCurrency / divisors.monochrome) * greenWeight);
                
                if (currencyAwarded > 0) {
                    this.currencySystem.add('monochrome', currencyAwarded);
                }
                
                // Check if we should unlock green currency
                if (!this.greenCurrencyUnlocked && this.currencySystem.getCurrencies().monochrome >= 100) {
                    this.greenCurrencyUnlocked = true;
                    this.showGreenCurrencyUnlock();
                }
            }
            
            // v0.04: Track defogging activity
            insect.defogActivity = Math.min(100, Math.max(0, pixelsPainted * 0.5));
            
            if (pixelsPainted > 0 && Math.random() < 0.05) { // Log only 5% of the time
                console.log(`🐜 Ant painted ${pixelsPainted} B&W pixels (activity: ${insect.defogActivity.toFixed(1)})`);
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
        const graphicsMono = this.make.graphics(); // v0.04: Color insects also reveal monochrome
        
        let pixelsPainted = 0;
        let edgeCurrency = 0; // v0.04: Track monochrome edge detection
        let edgeCurrencyGreen = 0; // v0.04: Track edge detection for green currency
        let edgeCurrencyRed = 0;
        let edgeCurrencyBlue = 0;
        
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
                
                // v0.04: Check if this pixel was already revealed BY COLOR INSECTS
                const pixelKey = `${px},${py}`;
                const isNewPixelColor = !this.revealedPixelsColor.has(pixelKey);
                
                // Sample pixel from canvas
                const pixelData = this.imageContext.getImageData(px, py, 1, 1).data;
                const r = pixelData[0];
                const g = pixelData[1];
                const b = pixelData[2];
                
                // v0.04: Combined edge detection (single neighbor loop for performance)
                const isNewPixelMono = !this.revealedPixelsMono.has(pixelKey);
                const shouldDetectColorEdges = this.greenCurrencyUnlocked && isNewPixelColor;
                
                if (isNewPixelMono || shouldDetectColorEdges) {
                    const brightness = (r + g + b) / 3;
                    let maxContrast = 0;
                    let maxContrastR = 0, maxContrastG = 0, maxContrastB = 0;
                    
                    // Single neighbor loop for both monochrome and color edge detection
                    for (let ny = -1; ny <= 1; ny++) {
                        for (let nx = -1; nx <= 1; nx++) {
                            if (nx === 0 && ny === 0) continue;
                            const npx = px + nx;
                            const npy = py + ny;
                            if (npx >= 0 && npx < this.hiddenImage.width && npy >= 0 && npy < this.hiddenImage.height) {
                                const neighborData = this.imageContext.getImageData(npx, npy, 1, 1).data;
                                
                                // Monochrome edge detection
                                if (isNewPixelMono) {
                                    const neighborBrightness = (neighborData[0] + neighborData[1] + neighborData[2]) / 3;
                                    const contrast = Math.abs(brightness - neighborBrightness);
                                    maxContrast = Math.max(maxContrast, contrast);
                                }
                                
                                // Color edge detection
                                if (shouldDetectColorEdges) {
                                    maxContrastR = Math.max(maxContrastR, Math.abs(r - neighborData[0]));
                                    maxContrastG = Math.max(maxContrastG, Math.abs(g - neighborData[1]));
                                    maxContrastB = Math.max(maxContrastB, Math.abs(b - neighborData[2]));
                                }
                            }
                        }
                    }
                    
                    // Award monochrome rhodopsin
                    if (isNewPixelMono) {
                        if (maxContrast > 100) {
                            edgeCurrency += 1;
                        } else if (maxContrast > 50) {
                            edgeCurrency += 0.5;
                        } else if (maxContrast > 20) {
                            edgeCurrency += 0.1;
                        }
                        this.revealedPixelsMono.add(pixelKey);
                    }
                    
                    // Award color rhodopsin
                    if (shouldDetectColorEdges) {
                        if (maxContrastR > 100) edgeCurrencyRed += 1;
                        else if (maxContrastR > 50) edgeCurrencyRed += 0.5;
                        else if (maxContrastR > 20) edgeCurrencyRed += 0.1;
                        
                        if (maxContrastG > 100) edgeCurrencyGreen += 1;
                        else if (maxContrastG > 50) edgeCurrencyGreen += 0.5;
                        else if (maxContrastG > 20) edgeCurrencyGreen += 0.1;
                        
                        if (maxContrastB > 100) edgeCurrencyBlue += 1;
                        else if (maxContrastB > 50) edgeCurrencyBlue += 0.5;
                        else if (maxContrastB > 20) edgeCurrencyBlue += 0.1;
                        
                        this.revealedPixelsColor.add(pixelKey);
                    }
                }
                
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
                
                // v0.04: Color insects also reveal monochrome layer
                const brightness = (r + g + b) / 3;
                const inverted = 255 - brightness;
                const gray = Phaser.Display.Color.GetColor(inverted, inverted, inverted);
                const monoAlpha = baseFalloff * 0.9;
                graphicsMono.fillStyle(gray, monoAlpha);
                graphicsMono.fillCircle(x + dx, y + dy, step * 0.5);
                
                pixelsPainted++;
            }
        }
        
        // Paint each channel onto its respective layer
        // ADD blend mode will combine them into full color
        this.colorCanvasR.draw(graphicsR, 0, 0);
        this.colorCanvasG.draw(graphicsG, 0, 0);
        this.colorCanvasB.draw(graphicsB, 0, 0);
        
        // v0.04: Color insects also reveal monochrome layer (always)
        this.bwCanvas.draw(graphicsMono, 0, 0);
        
        graphicsR.destroy();
        graphicsG.destroy();
        graphicsB.destroy();
        graphicsMono.destroy();
        
        // Get level-specific divisors for resource balance
        const divisors = this.levelDivisors[this.currentLevel];
        
        // v0.04: Color insects also award monochrome rhodopsin
        if (edgeCurrency > 0) {
            const monoAwarded = Math.floor(edgeCurrency / divisors.monochrome);
            if (monoAwarded > 0) {
                this.currencySystem.add('monochrome', monoAwarded);
            }
        }
        
        if (this.greenCurrencyUnlocked) {
            if (edgeCurrencyGreen > 0) {
                const greenWeight = weights.g || 1.0;
                const greenAwarded = Math.floor((edgeCurrencyGreen / divisors.green) * greenWeight);
                if (greenAwarded > 0) {
                    this.currencySystem.add('green', greenAwarded);
                }
            }
            if (edgeCurrencyRed > 0) {
                const redWeight = weights.r || 1.0;
                const redAwarded = Math.floor((edgeCurrencyRed / divisors.red) * redWeight);
                if (redAwarded > 0) {
                    this.currencySystem.add('red', redAwarded);
                }
            }
            if (edgeCurrencyBlue > 0) {
                const blueWeight = weights.b || 1.0;
                const blueAwarded = Math.floor((edgeCurrencyBlue / divisors.blue) * blueWeight);
                if (blueAwarded > 0) {
                    this.currencySystem.add('blue', blueAwarded);
                }
            }
        }
        
        // v0.04: Check if we should unlock green currency (color insects earning monochrome)
        if (!this.greenCurrencyUnlocked && this.currencySystem.getCurrencies().monochrome >= 100) {
            this.greenCurrencyUnlocked = true;
            this.showGreenCurrencyUnlock();
        }
        
        // v0.04: Track defogging activity
        insect.defogActivity = Math.min(100, Math.max(0, pixelsPainted * 0.5));
        
        if (pixelsPainted > 0 && Math.random() < 0.05) {
            console.log(`🐝 ${insect.data.name} painted ${pixelsPainted} pixels (activity: ${insect.defogActivity.toFixed(1)})`);
        }
    }
    
    // ========== v0.04 CURRENCY SYSTEM METHODS ==========
    
    unlockColorVision() {
        this.colorVisionUnlocked = true;
        console.log('🌈 COLOR VISION UNLOCKED!');
        
        // Visual transition - flash effect
        this.cameras.main.flash(1500, 255, 255, 255, false);
        
        // Fade in color layers
        this.tweens.add({
            targets: [this.colorCanvasR, this.colorCanvasG, this.colorCanvasB],
            alpha: { from: 0.3, to: 0.7 },
            duration: 3000,
            ease: 'Sine.easeInOut'
        });
        
        // Fade out monochrome dominance
        this.tweens.add({
            targets: this.monoCanvas,
            alpha: { from: 1.0, to: 0.3 },
            duration: 3000,
            ease: 'Sine.easeInOut'
        });
        
        // Show message
        const width = this.scale.width;
        const height = this.scale.height;
        const message = this.add.text(width / 2, height / 2, '🌈 COLOR VISION UNLOCKED!\nYou can now see Red, Green & Blue resources!', {
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#000000dd',
            padding: { x: 30, y: 20 },
            align: 'center',
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(10000).setScrollFactor(0);
        
        // Animate message
        this.tweens.add({
            targets: message,
            scale: { from: 0, to: 1 },
            alpha: { from: 0, to: 1 },
            duration: 500,
            ease: 'Back.easeOut'
        });
        
        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: message,
                alpha: 0,
                duration: 500,
                onComplete: () => message.destroy()
            });
        });
        
        // Reveal colored collectibles
        if (this.collectibleSystem) {
            this.collectibleSystem.revealColoredCollectibles();
        }
    }
    
    showUnlockMessage(insectName) {
        const width = this.scale.width;
        const message = this.add.text(width / 2, 60, `🔓 UNLOCKED: ${insectName}!`, {
            fontSize: '24px',
            color: '#00ff00',
            backgroundColor: '#000000dd',
            padding: { x: 20, y: 10 },
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(9000).setScrollFactor(0);
        
        this.tweens.add({
            targets: message,
            y: 80,
            alpha: { from: 1, to: 0 },
            duration: 2000,
            ease: 'Quad.easeOut',
            onComplete: () => message.destroy()
        });
    }
    
    showGreenCurrencyUnlock() {
        const width = this.scale.width;
        const height = this.scale.height;
        
        // Flash effect
        this.cameras.main.flash(1500, 100, 255, 100, false);
        
        // Big message
        const message = this.add.text(width / 2, height / 2, 
            '🧬 NEW RHODOPSINS EVOLVED!\n100 Monochrome earned!\nYou can now get species with color sensitivity!', {
            fontSize: '28px',
            color: '#00ff00',
            backgroundColor: '#000000dd',
            padding: { x: 30, y: 20 },
            fontStyle: 'bold',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5).setDepth(10000).setScrollFactor(0);
        
        message.setScale(0);
        this.tweens.add({
            targets: message,
            scale: 1,
            duration: 500,
            ease: 'Back.easeOut'
        });
        
        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: message,
                alpha: 0,
                duration: 500,
                onComplete: () => message.destroy()
            });
        });
    }
    
    showSpeciesActiveMessage(insectId, speciesName) {
        const width = this.scale.width;
        
        const message = this.add.text(width / 2, 60, 
            `⏸️ ${speciesName} are still alive!\nWait for them to die before spawning more.`, {
            fontSize: '20px',
            color: '#ffaa00',
            backgroundColor: '#000000dd',
            padding: { x: 20, y: 10 },
            align: 'center',
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(9000).setScrollFactor(0);
        
        this.tweens.add({
            targets: message,
            y: 100,
            alpha: { from: 1, to: 0 },
            duration: 3000,
            ease: 'Quad.easeOut',
            onComplete: () => message.destroy()
        });
    }
    
    showFamilyBlockedMessage(family, activeSpeciesName) {
        const width = this.scale.width;
        const familyEmoji = SUPERFAMILY_EMOJI[family] || '🐛';
        
        const message = this.add.text(width / 2, 60, 
            `🚫 ${familyEmoji} Family ${family} occupied!\n${activeSpeciesName} are still active.`, {
            fontSize: '20px',
            color: '#ff6666',
            backgroundColor: '#000000dd',
            padding: { x: 20, y: 10 },
            align: 'center',
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(9000).setScrollFactor(0);
        
        this.tweens.add({
            targets: message,
            y: 100,
            alpha: { from: 1, to: 0 },
            duration: 3000,
            ease: 'Quad.easeOut',
            onComplete: () => message.destroy()
        });
    }
    
    getAllActiveSpecies() {
        // Get all unique species IDs that currently have living insects on the field
        // ACROSS ALL FAMILIES (maximum 3 total)
        const activeSpecies = new Set();
        
        this.insects.forEach(insect => {
            if (!insect.isDead) {
                activeSpecies.add(insect.insectId);
            }
        });
        
        return Array.from(activeSpecies);
    }
    
    getActiveSpeciesForFamily(familyIndex) {
        // Get all unique species IDs that currently have living insects on the field
        // from the specified family
        const activeSpecies = new Set();
        
        this.insects.forEach(insect => {
            if (!insect.isDead && insect.superfamily === familyIndex) {
                activeSpecies.add(insect.insectId);
            }
        });
        
        return Array.from(activeSpecies);
    }
    
    showSpeciesLimitMessage(activeSpeciesIds) {
        const width = this.scale.width;
        
        // Get names of active species
        const speciesNames = activeSpeciesIds.map(id => {
            const data = INSECT_DATABASE[id];
            return data ? data.name : id;
        }).join(', ');
        
        const message = this.add.text(width / 2, 60, 
            `❌ Maximum 3 species active!\nActive: ${speciesNames}\nWait for one to finish before spawning another.`, {
            fontSize: '18px',
            color: '#ff4444',
            backgroundColor: '#000000dd',
            padding: { x: 20, y: 10 },
            align: 'center',
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(9000).setScrollFactor(0);
        
        this.tweens.add({
            targets: message,
            y: 100,
            alpha: { from: 1, to: 0 },
            duration: 3500,
            ease: 'Quad.easeOut',
            onComplete: () => message.destroy()
        });
    }
    
    showFamilyLimitMessage(activeSpeciesName) {
        const width = this.scale.width;
        
        const message = this.add.text(width / 2, 60, 
            `❌ Only 1 species per family!\n${activeSpeciesName} is already active.\nWait for it to finish first.`, {
            fontSize: '18px',
            color: '#ff4444',
            backgroundColor: '#000000dd',
            padding: { x: 20, y: 10 },
            align: 'center',
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(9000).setScrollFactor(0);
        
        this.tweens.add({
            targets: message,
            y: 100,
            alpha: { from: 1, to: 0 },
            duration: 3500,
            ease: 'Quad.easeOut',
            onComplete: () => message.destroy()
        });
    }
    
    showInsufficientResourcesMessage(insectId, costs) {
        const width = this.scale.width;
        const insectData = INSECT_DATABASE[insectId];
        const currencies = this.currencySystem.getCurrencies();
        
        // Build cost string
        let costStr = '';
        let missing = [];
        for (let [type, amount] of Object.entries(costs)) {
            if (amount > 0) {
                const icon = { monochrome: '⚫', red: '🔴', green: '🟢', blue: '🔵' }[type];
                const have = currencies[type];
                const need = amount;
                const deficit = need - have;
                if (deficit > 0) {
                    missing.push(`${icon} ${deficit} more ${type}`);
                }
            }
        }
        
        const message = this.add.text(width / 2, 60, 
            `❌ Need more resources for ${insectData.name}:\n${missing.join(', ')}`, {
            fontSize: '18px',
            color: '#ff4444',
            backgroundColor: '#000000dd',
            padding: { x: 20, y: 10 },
            align: 'center',
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(9000).setScrollFactor(0);
        
        this.tweens.add({
            targets: message,
            y: 100,
            alpha: { from: 1, to: 0 },
            duration: 3000,
            ease: 'Quad.easeOut',
            onComplete: () => message.destroy()
        });
    }
    
    createTimerUI() {
        const width = this.scale.width;
        const height = this.scale.height;
        
        // Timer display between Vespa (Hymenoptera) and Lucanus (Coleoptera)
        const timerX = width / 2;
        const timerY = height - 95; // Bottom center between species rows
        
        // Background panel (taller to fit restart button)
        this.timerPanel = this.add.rectangle(timerX, timerY, 155, 115, 0x0a0a14, 0.85)
            .setOrigin(0.5)
            .setDepth(2000)
            .setScrollFactor(0);
        
        // Timer title
        this.timerTitle = this.add.text(timerX, timerY - 35, 'Time', {
            fontSize: '14px',
            color: '#ffffff',
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(2001).setScrollFactor(0);
        
        // Timer display
        this.timerText = this.add.text(timerX, timerY - 10, '00:00', {
            fontSize: '24px',
            color: '#ffaa00',
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(2001).setScrollFactor(0);
        
        // Restart Level button (always visible)
        this.restartLevelButton = this.add.rectangle(timerX, timerY + 20, 140, 28, 0xaa3333, 1)
            .setOrigin(0.5)
            .setDepth(2001)
            .setScrollFactor(0)
            .setInteractive({ useHandCursor: true });
        
        this.restartLevelButtonText = this.add.text(timerX, timerY + 20, 'Restart Level', {
            fontSize: '13px',
            color: '#ffffff',
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(2002).setScrollFactor(0);
        
        this.restartLevelButton.on('pointerdown', () => {
            // Restart the current scene
            this.scene.restart();
        });
        
        this.restartLevelButton.on('pointerover', () => {
            this.restartLevelButton.setFillStyle(0xcc4444);
        });
        
        this.restartLevelButton.on('pointerout', () => {
            this.restartLevelButton.setFillStyle(0xaa3333);
        });
        
        // Finish Level button (hidden initially, appears below restart button)
        this.finishLevelButton = this.add.rectangle(timerX, timerY + 50, 140, 28, 0x00aa00, 1)
            .setOrigin(0.5)
            .setDepth(2001)
            .setScrollFactor(0)
            .setInteractive({ useHandCursor: true })
            .setVisible(false);
        
        this.finishLevelButtonText = this.add.text(timerX, timerY + 50, 'Finish Level', {
            fontSize: '13px',
            color: '#ffffff',
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(2002).setScrollFactor(0).setVisible(false);
        
        this.finishLevelButton.on('pointerdown', () => {
            console.log(`📍 "Finish Level" button clicked!`);
            // Show diamond reward screen with "Next Level" and "Highscores" buttons
            this.showDiamondRewardScreen();
        });
        
        this.finishLevelButton.on('pointerover', () => {
            this.finishLevelButton.setFillStyle(0x00cc00);
        });
        
        this.finishLevelButton.on('pointerout', () => {
            this.finishLevelButton.setFillStyle(0x00aa00);
        });
    }
    
    updateTimer() {
        if (this.timerStopped) return;
        
        // Don't update timer until level has started (intro screen dismissed)
        if (!this.levelStartTime) {
            this.timerText.setText('00:00');
            return;
        }
        
        const elapsedMs = Date.now() - this.levelStartTime;
        const seconds = Math.floor(elapsedMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        
        const timeString = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        this.timerText.setText(timeString);
    }
    
    checkLevelCompletion() {
        // Level 1: Only the first 16 species (4 per family × 4 families)
        const level1Species = [];
        SUPERFAMILIES.forEach((superfamily, familyIndex) => {
            const species = this.speciesByFamily[familyIndex];
            level1Species.push(...species.slice(0, 4)); // First 4 from each family
        });
        
        const totalLevel1Species = level1Species.length; // Should be 16
        const unlockedInLevel1 = this.unlockedInsects.filter(id => level1Species.includes(id)).length;
        
        console.log(`📊 Level ${this.currentLevel} Progress: ${unlockedInLevel1}/${totalLevel1Species} species unlocked`);
        
        // Check if all level species are unlocked
        if (unlockedInLevel1 >= totalLevel1Species && !this.levelCompleted) {
            console.log(`🎉 ============================================`);
            console.log(`🎉 LEVEL ${this.currentLevel} COMPLETE! All 16 species unlocked!`);
            console.log(`🎉 ============================================`);
            this.levelCompleted = true;
            
            // Stop timer
            this.timerStopped = true;
            this.finalTime = Date.now() - this.levelStartTime;
            console.log(`⏱️ Final time: ${this.finalTime}ms (${this.formatTime(this.finalTime)})`);
            
            // Capture rhodopsin values for diamond score
            this.finalRhodopsins = this.currencySystem.getCurrencies();
            this.finalDiamondScore = this.calculateDiamondScore(this.finalRhodopsins, this.finalTime);
            console.log(`💎 Final diamond score: ${this.finalDiamondScore}`);
            console.log(`🧬 Final rhodopsins:`, this.finalRhodopsins);
            
            // DON'T show leaderboard yet - wait for user to click "Finish Level"
            console.log(`✅ Level complete - waiting for user to click "Finish Level" button`);
            
            // Show finish level button
            this.finishLevelButton.setVisible(true);
            this.finishLevelButtonText.setVisible(true);
        }
    }
    
    showLevelCompleteMessage() {
        const width = this.scale.width;
        const height = this.scale.height;
        
        // Update high score for this level
        const isNewBest = this.updateHighScore(
            this.currentLevel, 
            this.finalTime, 
            this.finalDiamondScore,
            this.finalRhodopsins
        );
        const currentBest = this.highScores.levels[this.currentLevel];
        
        const nextLevel = this.currentLevel + 1;
        const maxLevel = 5; // We have 5 levels now
        const hasNextLevel = nextLevel <= maxLevel;
        
        // Check if all levels are now completed
        const allLevelsCompleted = this.checkAllLevelsCompleted();
        
        // Create overlay
        const overlay = this.add.rectangle(0, 0, width * 2, height * 2, 0x000000, 0.85)
            .setOrigin(0).setDepth(10000).setScrollFactor(0);
        
        // Title with NEW BEST indicator
        const titleText = isNewBest 
            ? `🏆 LEVEL ${this.currentLevel} - NEW BEST TIME! 🏆`
            : `✅ LEVEL ${this.currentLevel} COMPLETE!`;
        
        const message = this.add.text(width / 2, height / 2 - 140, 
            titleText, {
            fontSize: '42px',
            color: isNewBest ? '#FFD700' : '#00ff00',
            backgroundColor: '#000000dd',
            padding: { x: 30, y: 20 },
            align: 'center',
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(10001).setScrollFactor(0);
        
        // Current time
        const timeText = this.add.text(width / 2, height / 2 - 70,
            `Your Time: ${this.formatTime(this.finalTime)}`, {
            fontSize: '32px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(10001).setScrollFactor(0);
        
        // Best time info
        let bestInfoText = '';
        if (isNewBest) {
            bestInfoText = '✨ New personal record! ✨';
        } else {
            bestInfoText = `Best Time: ${this.formatTime(currentBest.time)}`;
        }
        
        const bestText = this.add.text(width / 2, height / 2 - 30,
            bestInfoText, {
            fontSize: '24px',
            color: isNewBest ? '#FFD700' : '#aaaaaa',
            fontFamily: 'Arial',
            fontStyle: 'italic'
        }).setOrigin(0.5).setDepth(10001).setScrollFactor(0);
        
        // Date achieved
        const dateText = this.add.text(width / 2, height / 2 + 5,
            `Achieved: ${currentBest.dateFormatted}`, {
            fontSize: '16px',
            color: '#888888',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(10001).setScrollFactor(0);
        
        // Progress indicator
        const completedLevels = Object.values(this.highScores.levels).filter(l => l !== null).length;
        const progressText = this.add.text(width / 2, height / 2 + 40,
            `Levels Completed: ${completedLevels}/5`, {
            fontSize: '22px',
            color: '#ffaa00',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(10001).setScrollFactor(0);
        
        // Diamond-style high score display
        const diamondBg = this.add.graphics();
        diamondBg.fillStyle(0x1a1a1a, 0.9);
        diamondBg.lineStyle(3, 0xFFD700);
        
        // Diamond shape (rotated square)
        const diamondSize = 200;
        const diamondX = width / 2;
        const diamondY = height / 2 + 160;
        
        diamondBg.beginPath();
        diamondBg.moveTo(diamondX, diamondY - diamondSize / 2); // Top
        diamondBg.lineTo(diamondX + diamondSize / 2, diamondY); // Right
        diamondBg.lineTo(diamondX, diamondY + diamondSize / 2); // Bottom
        diamondBg.lineTo(diamondX - diamondSize / 2, diamondY); // Left
        diamondBg.closePath();
        diamondBg.fillPath();
        diamondBg.strokePath();
        diamondBg.setDepth(10001).setScrollFactor(0);
        
        // Diamond content - show this level's best with diamond score
        const diamondTitle = this.add.text(diamondX, diamondY - 65,
            `💎 LEVEL ${this.currentLevel} 💎`, {
            fontSize: '20px',
            color: '#FFD700',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(10002).setScrollFactor(0);
        
        const diamondScore = this.add.text(diamondX, diamondY - 35,
            `${currentBest.diamonds || this.finalDiamondScore}💎`, {
            fontSize: '28px',
            color: '#FFD700',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(10002).setScrollFactor(0);
        
        const diamondBestTime = this.add.text(diamondX, diamondY,
            `Time: ${this.formatTime(currentBest.time)}`, {
            fontSize: '18px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(10002).setScrollFactor(0);
        
        const diamondDate = this.add.text(diamondX, diamondY + 25,
            currentBest.dateFormatted, {
            fontSize: '12px',
            color: '#aaaaaa',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(10002).setScrollFactor(0);
        
        // Show rhodopsin breakdown
        const rho = currentBest.rhodopsins || this.finalRhodopsins;
        const diamondRhodopsin = this.add.text(diamondX, diamondY + 50,
            `⚫${rho.monochrome} 🔴${rho.red} 🟢${rho.green} 🔵${rho.blue}`, {
            fontSize: '14px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(10002).setScrollFactor(0);
        
        const diamondComplete = this.add.text(diamondX, diamondY + 75,
            `✓ ${completedLevels}/5 Complete`, {
            fontSize: '16px',
            color: '#00ff00',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(10002).setScrollFactor(0);
        
        let buttonsY = height / 2 + 285;
        
        // Next Level button or Final Reward button
        if (allLevelsCompleted && !hasNextLevel) {
            // Show "View Final Reward" button
            const rewardButton = this.add.text(width / 2, buttonsY,
                '🎁 View Final Reward 🎁', {
                fontSize: '32px',
                color: '#ffffff',
                backgroundColor: '#FFD700',
                padding: { x: 30, y: 15 },
                align: 'center',
                fontStyle: 'bold',
                fontFamily: 'Arial'
            }).setOrigin(0.5).setDepth(10001).setScrollFactor(0);
            
            rewardButton.setInteractive({ useHandCursor: true });
            rewardButton.on('pointerover', () => {
                rewardButton.setStyle({ backgroundColor: '#FFE44D' });
                rewardButton.setScale(1.05);
            });
            rewardButton.on('pointerout', () => {
                rewardButton.setStyle({ backgroundColor: '#FFD700' });
                rewardButton.setScale(1);
            });
            rewardButton.on('pointerdown', () => {
                // Hide this dialog
                overlay.destroy();
                message.destroy();
                timeText.destroy();
                bestText.destroy();
                dateText.destroy();
                progressText.destroy();
                diamondBg.destroy();
                diamondTitle.destroy();
                diamondScore.destroy();
                diamondBestTime.destroy();
                diamondDate.destroy();
                diamondRhodopsin.destroy();
                diamondComplete.destroy();
                rewardButton.destroy();
                diamondComplete.destroy();
                rewardButton.destroy();
                
                // Show final reward screen
                this.showFinalRewardScreen();
            });
            
            // Pulse animation
            this.tweens.add({
                targets: rewardButton,
                scale: { from: 1, to: 1.1 },
                duration: 800,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
        } else if (hasNextLevel) {
            // Next Level button
            const nextLevelButton = this.add.text(width / 2, buttonsY,
                `▶ Next Level (${nextLevel})`, {
                fontSize: '32px',
                color: '#ffffff',
                backgroundColor: '#00aa00',
                padding: { x: 30, y: 15 },
                align: 'center',
                fontStyle: 'bold',
                fontFamily: 'Arial'
            }).setOrigin(0.5).setDepth(10001).setScrollFactor(0);
            
            nextLevelButton.setInteractive({ useHandCursor: true });
            nextLevelButton.on('pointerover', () => {
                nextLevelButton.setStyle({ backgroundColor: '#00ff00' });
            });
            nextLevelButton.on('pointerout', () => {
                nextLevelButton.setStyle({ backgroundColor: '#00aa00' });
            });
            nextLevelButton.on('pointerdown', () => {
                // Save next level and restart scene
                this.registry.set('currentLevel', nextLevel);
                this.scene.restart();
            });
        }
        
        // Pulse animation for title
        this.tweens.add({
            targets: message,
            scale: { from: 0.95, to: 1.05 },
            duration: 1000,
            yoyo: true,
            repeat: 2,
            ease: 'Sine.easeInOut'
        });
    }
    
    showDiamondRewardScreen() {
        const width = this.scale.width;
        const height = this.scale.height;
        
        // Calculate diamonds from rhodopsins (already calculated and stored)
        const timeSeconds = Math.floor(this.finalTime / 1000);
        const currencies = this.finalRhodopsins;
        const totalDiamonds = this.finalDiamondScore;
        
        // Calculate individual diamond components for animation
        const diamondsFromMono = Math.floor(currencies.monochrome * 0.5);
        const diamondsFromRed = Math.floor(currencies.red * 10);
        const diamondsFromGreen = Math.floor(currencies.green * 2);
        const diamondsFromBlue = Math.floor(currencies.blue * 5);
        
        // Calculate time bonus
        let timeBonus;
        if (timeSeconds < 180) timeBonus = 5000;
        else if (timeSeconds < 240) timeBonus = 4000;
        else if (timeSeconds < 300) timeBonus = 3000;
        else if (timeSeconds < 360) timeBonus = 2500;
        else if (timeSeconds < 420) timeBonus = 2000;
        else if (timeSeconds < 480) timeBonus = 1500;
        else if (timeSeconds < 540) timeBonus = 1000;
        else if (timeSeconds < 600) timeBonus = 800;
        else timeBonus = Math.max(100, Math.floor(4800 / timeSeconds));
        
        console.log(`💎 Diamond Rewards: Mono=${diamondsFromMono}, Red=${diamondsFromRed}, Green=${diamondsFromGreen}, Blue=${diamondsFromBlue}, Time Bonus=${timeBonus}, Total=${totalDiamonds}`);
        
        // Check if there's a next level or if this is the final level
        const nextLevel = this.currentLevel + 1;
        const maxLevel = 5;
        const hasNextLevel = nextLevel <= maxLevel;
        const allLevelsCompleted = this.checkAllLevelsCompleted();
        
        // Create overlay
        const overlay = this.add.rectangle(0, 0, width * 2, height * 2, 0x000000, 0.9)
            .setOrigin(0).setDepth(10000).setScrollFactor(0);
        
        // Time display
        const minutes = Math.floor(timeSeconds / 60);
        const secs = timeSeconds % 60;
        const timeStr = `${minutes}:${secs.toString().padStart(2, '0')}`;
        
        const timeDisplay = this.add.text(width / 2, 80, `⏱️ Time: ${timeStr}`, {
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(10001).setScrollFactor(0);
        
        // Title
        const title = this.add.text(width / 2, 140, `💎 Level ${this.currentLevel} Complete! 💎`, {
            fontSize: '48px',
            color: '#ffaa00',
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(10001).setScrollFactor(0);
        
        // Conversion displays (will be animated)
        const timeConversionText = this.add.text(width / 2, 200, `⏱️ ${timeSeconds}s → 0 💎`, {
            fontSize: '24px',
            color: '#ffaa00',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(10001).setScrollFactor(0);
        
        const monoConversionText = this.add.text(width / 2, 240, `⚫ ${currencies.monochrome} → 0 💎`, {
            fontSize: '20px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(10001).setScrollFactor(0);
        
        const redConversionText = this.add.text(width / 2, 270, `🔴 ${currencies.red} → 0 💎`, {
            fontSize: '20px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(10001).setScrollFactor(0);
        
        const greenConversionText = this.add.text(width / 2, 300, `🟢 ${currencies.green} → 0 💎`, {
            fontSize: '20px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(10001).setScrollFactor(0);
        
        const blueConversionText = this.add.text(width / 2, 330, `🔵 ${currencies.blue} → 0 💎`, {
            fontSize: '20px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(10001).setScrollFactor(0);
        
        // Total diamonds display
        const totalText = this.add.text(width / 2, 380, `Total: 0 💎`, {
            fontSize: '40px',
            color: '#ffaa00',
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(10001).setScrollFactor(0).setAlpha(0);
        
        // Next Level OR Final Reward button (hidden initially)
        const nextButtonY = 460;
        let nextButton, nextButtonText;
        
        if (allLevelsCompleted && !hasNextLevel) {
            // Show "View Final Reward" button
            nextButton = this.add.rectangle(width / 2 - 120, nextButtonY, 220, 50, 0xFFD700, 1)
                .setOrigin(0.5)
                .setDepth(10001)
                .setScrollFactor(0)
                .setAlpha(0);
            
            nextButtonText = this.add.text(width / 2 - 120, nextButtonY, '🎁 Final Reward', {
                fontSize: '24px',
                color: '#000000',
                fontStyle: 'bold',
                fontFamily: 'Arial'
            }).setOrigin(0.5).setDepth(10002).setScrollFactor(0).setAlpha(0);
        } else if (hasNextLevel) {
            // Show "Next Level" button
            nextButton = this.add.rectangle(width / 2 - 120, nextButtonY, 200, 50, 0x00aa00, 1)
                .setOrigin(0.5)
                .setDepth(10001)
                .setScrollFactor(0)
                .setAlpha(0);
            
            nextButtonText = this.add.text(width / 2 - 120, nextButtonY, `▶ Level ${nextLevel}`, {
                fontSize: '24px',
                color: '#ffffff',
                fontStyle: 'bold',
                fontFamily: 'Arial'
            }).setOrigin(0.5).setDepth(10002).setScrollFactor(0).setAlpha(0);
        }
        
        // Highscores button (right side)
        const highscoresButton = this.add.rectangle(width / 2 + 120, nextButtonY, 180, 50, 0x4444aa, 1)
            .setOrigin(0.5)
            .setDepth(10001)
            .setScrollFactor(0)
            .setAlpha(0);
        
        const highscoresText = this.add.text(width / 2 + 120, nextButtonY, '📊 Highscores', {
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(10002).setScrollFactor(0).setAlpha(0);
        
        // Button handlers
        if (nextButton) {
            nextButton.on('pointerover', () => {
                nextButton.setFillStyle(allLevelsCompleted && !hasNextLevel ? 0xFFE44D : 0x00cc00);
            });
            
            nextButton.on('pointerout', () => {
                nextButton.setFillStyle(allLevelsCompleted && !hasNextLevel ? 0xFFD700 : 0x00aa00);
            });
            
            nextButton.on('pointerdown', () => {
                if (allLevelsCompleted && !hasNextLevel) {
                    // Go to final reward screen
                    this.showFinalRewardScreen();
                } else {
                    // Go to next level
                    this.registry.set('currentLevel', nextLevel);
                    this.scene.restart();
                }
            });
        }
        
        highscoresButton.on('pointerover', () => {
            highscoresButton.setFillStyle(0x5555cc);
        });
        
        highscoresButton.on('pointerout', () => {
            highscoresButton.setFillStyle(0x4444aa);
        });
        
        highscoresButton.on('pointerdown', () => {
            this.showHighscores();
        });
        
        // ANIMATION SEQUENCE
        let currentTotalDiamonds = 0;
        
        // Step 1: Animate time bonus (1.2 seconds)
        this.time.delayedCall(500, () => {
            this.animateConversion(
                timeConversionText,
                timeSeconds,
                0,
                timeBonus,
                '⏱️',
                's',
                1200,
                (diamonds) => {
                    currentTotalDiamonds = diamonds;
                }
            );
        });
        
        // Step 2: Animate monochrome conversion (1.2 seconds)
        this.time.delayedCall(1900, () => {
            this.animateConversion(
                monoConversionText,
                currencies.monochrome,
                0,
                diamondsFromMono,
                '⚫',
                '',
                1200,
                (diamonds) => {
                    currentTotalDiamonds += diamonds;
                }
            );
        });
        
        // Step 3: Animate red conversion (1.2 seconds)
        this.time.delayedCall(3300, () => {
            this.animateConversion(
                redConversionText,
                currencies.red,
                0,
                diamondsFromRed,
                '🔴',
                '',
                1200,
                (diamonds) => {
                    currentTotalDiamonds += diamonds;
                }
            );
        });
        
        // Step 4: Animate green conversion (1.2 seconds)
        this.time.delayedCall(4700, () => {
            this.animateConversion(
                greenConversionText,
                currencies.green,
                0,
                diamondsFromGreen,
                '🟢',
                '',
                1200,
                (diamonds) => {
                    currentTotalDiamonds += diamonds;
                }
            );
        });
        
        // Step 5: Animate blue conversion (1.2 seconds)
        this.time.delayedCall(6100, () => {
            this.animateConversion(
                blueConversionText,
                currencies.blue,
                0,
                diamondsFromBlue,
                '🔵',
                '',
                1200,
                (diamonds) => {
                    currentTotalDiamonds += diamonds;
                }
            );
        });
        
        // Step 6: Show total and animate sum (1.5 seconds)
        this.time.delayedCall(7500, () => {
            totalText.setAlpha(1);
            this.animateTotalSum(totalText, totalDiamonds, 1500, false);
            
            // Show buttons after total animation
            this.time.delayedCall(1700, () => {
                if (nextButton) {
                    nextButton.setAlpha(1).setInteractive({ useHandCursor: true });
                    nextButtonText.setAlpha(1);
                }
                highscoresButton.setAlpha(1).setInteractive({ useHandCursor: true });
                highscoresText.setAlpha(1);
                
                const buttonTargets = nextButton ? 
                    [nextButton, nextButtonText, highscoresButton, highscoresText] :
                    [highscoresButton, highscoresText];
                
                this.tweens.add({
                    targets: buttonTargets,
                    scale: { from: 0.8, to: 1 },
                    duration: 300,
                    ease: 'Back.easeOut'
                });
            });
        });
    }

    showIntroductionScreen() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Create semi-transparent overlay
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);
        overlay.setDepth(10000);

        // Title
        const title = this.add.text(width / 2, 50, `📋 Level ${this.currentLevel} - How to Play`, {
            fontSize: '40px',
            fontFamily: 'Arial',
            color: '#ffdd00',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        title.setDepth(10001);

        // Explanation header
        const explainHeader = this.add.text(width / 2, 110, '🧬 About Rhodopsins & Color Sensitivities:', {
            fontSize: '22px',
            fontFamily: 'Arial',
            color: '#00ffff',
            fontStyle: 'bold'
        });
        explainHeader.setOrigin(0.5);
        explainHeader.setDepth(10001);

        const explainText = this.add.text(width / 2, 145, 'Insects reveal the picture and earn rhodopsins (⚫🔴🟢🔵)\nbased on their color sensitivity. Use rhodopsins to unlock new species!', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#aaaaaa',
            align: 'center',
            lineSpacing: 4
        });
        explainText.setOrigin(0.5);
        explainText.setDepth(10001);

        // Rule 1
        const rule1 = this.add.text(width / 2, 200, '⏱️ Unlock all 16 species as quick as possible', {
            fontSize: '22px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        rule1.setOrigin(0.5);
        rule1.setDepth(10001);

        const rule1sub = this.add.text(width / 2, 225, 'to earn time bonus diamonds!', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#aaaaaa'
        });
        rule1sub.setOrigin(0.5);
        rule1sub.setDepth(10001);

        // Rule 2
        const rule2 = this.add.text(width / 2, 265, '🖼️ Unravel as much of the picture as possible', {
            fontSize: '22px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        rule2.setOrigin(0.5);
        rule2.setDepth(10001);

        const rule2sub = this.add.text(width / 2, 290, 'to convert rhodopsins into diamonds!', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#aaaaaa'
        });
        rule2sub.setOrigin(0.5);
        rule2sub.setDepth(10001);

        // Rule 3
        const rule3 = this.add.text(width / 2, 330, '🚫 Only 1 species per family allowed', {
            fontSize: '22px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        rule3.setOrigin(0.5);
        rule3.setDepth(10001);

        const rule3sub = this.add.text(width / 2, 355, 'Wait till species disappears before spawning another from same family', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#aaaaaa'
        });
        rule3sub.setOrigin(0.5);
        rule3sub.setDepth(10001);

        // Rule 4
        const rule4 = this.add.text(width / 2, 395, '⚠️ Maximum 3 species active at the same time', {
            fontSize: '22px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        rule4.setOrigin(0.5);
        rule4.setDepth(10001);

        const rule4sub = this.add.text(width / 2, 420, 'Choose your strategy wisely!', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#aaaaaa'
        });
        rule4sub.setOrigin(0.5);
        rule4sub.setDepth(10001);

        // Start button
        const buttonY = 480;
        const startButton = this.add.rectangle(width / 2, buttonY, 300, 60, 0x00aa00);
        startButton.setDepth(10001);
        startButton.setInteractive({ useHandCursor: true });

        const startButtonText = this.add.text(width / 2, buttonY, '▶ START LEVEL', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        startButtonText.setOrigin(0.5);
        startButtonText.setDepth(10002);

        // Button hover effects
        startButton.on('pointerover', () => {
            startButton.setFillStyle(0x00cc00);
            this.tweens.add({
                targets: startButton,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 100
            });
        });

        startButton.on('pointerout', () => {
            startButton.setFillStyle(0x00aa00);
            this.tweens.add({
                targets: startButton,
                scaleX: 1,
                scaleY: 1,
                duration: 100
            });
        });

        // Start button click - start the timer and remove intro
        startButton.on('pointerdown', () => {
            // Start the timer NOW
            this.levelStartTime = Date.now();
            
            // Remove all intro elements
            overlay.destroy();
            title.destroy();
            explainHeader.destroy();
            explainText.destroy();
            rule1.destroy();
            rule1sub.destroy();
            rule2.destroy();
            rule2sub.destroy();
            rule3.destroy();
            rule3sub.destroy();
            rule4.destroy();
            rule4sub.destroy();
            startButton.destroy();
            startButtonText.destroy();
        });

        // Fade in animation
        overlay.setAlpha(0);
        title.setAlpha(0);
        explainHeader.setAlpha(0);
        explainText.setAlpha(0);
        rule1.setAlpha(0);
        rule1sub.setAlpha(0);
        rule2.setAlpha(0);
        rule2sub.setAlpha(0);
        rule3.setAlpha(0);
        rule3sub.setAlpha(0);
        rule4.setAlpha(0);
        rule4sub.setAlpha(0);
        startButton.setAlpha(0);
        startButtonText.setAlpha(0);

        this.tweens.add({
            targets: [overlay, title, explainHeader, explainText, rule1, rule1sub, rule2, rule2sub, rule3, rule3sub, rule4, rule4sub, startButton, startButtonText],
            alpha: 1,
            duration: 400,
            ease: 'Power2'
        });
    }
    
    animateConversion(textObject, fromValue, toValue, diamondValue, emoji, suffix, duration, onComplete) {
        const stepTime = 50; // Update every 50ms
        const steps = duration / stepTime;
        const valueDecrement = (fromValue - toValue) / steps;
        const diamondIncrement = diamondValue / steps;
        
        let currentValue = fromValue;
        let currentDiamonds = 0;
        let step = 0;
        
        const timer = this.time.addEvent({
            delay: stepTime,
            repeat: steps - 1,
            callback: () => {
                step++;
                currentValue = Math.max(toValue, fromValue - (valueDecrement * step));
                currentDiamonds = Math.min(diamondValue, Math.floor(diamondIncrement * step));
                
                textObject.setText(`${emoji} ${Math.floor(currentValue)}${suffix} → ${currentDiamonds} 💎`);
                
                if (step >= steps) {
                    textObject.setText(`${emoji} ${toValue}${suffix} → ${diamondValue} 💎`);
                    if (onComplete) onComplete(diamondValue);
                }
            }
        });
    }
    
    animateTotalSum(textObject, finalTotal, duration, isNewBest) {
        const stepTime = 50;
        const steps = duration / stepTime;
        const increment = finalTotal / steps;
        
        let currentTotal = 0;
        let step = 0;
        
        // Pulse animation (more intense if new best)
        this.tweens.add({
            targets: textObject,
            scale: { from: isNewBest ? 0.8 : 0.9, to: isNewBest ? 1.2 : 1.1 },
            duration: isNewBest ? 600 : 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Count up animation
        const timer = this.time.addEvent({
            delay: stepTime,
            repeat: steps - 1,
            callback: () => {
                step++;
                currentTotal = Math.min(finalTotal, Math.floor(increment * step));
                textObject.setText(`Total: ${currentTotal} 💎`);
                
                if (step >= steps) {
                    textObject.setText(`Total: ${finalTotal} 💎`);
                }
            }
        });
    }
    
    displayLevelCompletionLeaderboard(level, allScores, playerScore, playerRank) {
        // Display leaderboard immediately after level completion
        // Shows: Top 3 scores + player position if outside top 3
        // Highlights player's current run with "(you)" and green background
        
        console.log(`🏆 Displaying Level ${level} completion leaderboard`);
        
        const width = this.scale.width;
        const height = this.scale.height;
        
        // Create semi-transparent overlay - ULTRA HIGH DEPTH to be in front of EVERYTHING (including diamond screen)
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);
        overlay.setDepth(20000);
        
        // Title
        const title = this.add.text(width / 2, 100, `LEVEL ${level} COMPLETE!`, {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '48px',
            fontStyle: 'bold',
            color: '#00ff88',
            stroke: '#000000',
            strokeThickness: 4
        });
        title.setOrigin(0.5);
        title.setDepth(20001);
        
        // Subtitle with rank
        const rankColor = playerRank === 1 ? '#FFD700' : playerRank === 2 ? '#C0C0C0' : playerRank === 3 ? '#CD7F32' : '#00ff88';
        const subtitle = this.add.text(width / 2, 160, `YOUR RANK: #${playerRank}`, {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '32px',
            fontStyle: 'bold',
            color: rankColor,
            stroke: '#000000',
            strokeThickness: 3
        });
        subtitle.setOrigin(0.5);
        subtitle.setDepth(20001);
        
        // Display top 3 scores
        let yPos = 230;
        const topScores = allScores.slice(0, 3);
        
        topScores.forEach((score, index) => {
            const rank = index + 1;
            const isPlayer = score.isLocal === true;
            
            // Rank color
            const colors = ['#FFD700', '#C0C0C0', '#CD7F32']; // Gold, Silver, Bronze
            const color = colors[index];
            
            // Background highlight for player
            if (isPlayer) {
                const bg = this.add.rectangle(width / 2, yPos, width * 0.8, 50, 0x00ff88, 0.3);
                bg.setDepth(20000);
            }
            
            // Display: #1 PlayerName - 3:45 (2500💎)
            const nameText = isPlayer ? `${score.playerName} (you)` : score.playerName;
            const text = this.add.text(width / 2, yPos, 
                `#${rank}  ${nameText} - ${this.formatTime(score.time)} (${score.diamonds}💎)`, {
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '24px',
                fontStyle: isPlayer ? 'bold' : 'normal',
                color: isPlayer ? '#00ff88' : color,
                stroke: '#000000',
                strokeThickness: 2
            });
            text.setOrigin(0.5);
            text.setDepth(20001);
            
            yPos += 60;
        });
        
        // If player is outside top 3, show their position separately
        if (playerRank > 3) {
            yPos += 20; // Extra spacing
            
            // Highlight background
            const bg = this.add.rectangle(width / 2, yPos, width * 0.8, 50, 0x00ff88, 0.3);
            bg.setDepth(20000);
            
            const text = this.add.text(width / 2, yPos, 
                `#${playerRank}  ${playerScore.playerName} (you) - ${this.formatTime(playerScore.time)} (${playerScore.diamonds}💎)`, {
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '24px',
                fontStyle: 'bold',
                color: '#00ff88',
                stroke: '#000000',
                strokeThickness: 2
            });
            text.setOrigin(0.5);
            text.setDepth(20001);
        }
        
        // Close button
        const closeButton = this.add.text(width / 2, height - 100, 'CONTINUE', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '28px',
            fontStyle: 'bold',
            color: '#ffffff',
            backgroundColor: '#00ff88',
            padding: { x: 30, y: 15 }
        });
        closeButton.setOrigin(0.5);
        closeButton.setDepth(20001);
        closeButton.setInteractive({ useHandCursor: true });
        
        closeButton.on('pointerover', () => {
            closeButton.setStyle({ backgroundColor: '#00cc66' });
        });
        
        closeButton.on('pointerout', () => {
            closeButton.setStyle({ backgroundColor: '#00ff88' });
        });
        
        closeButton.on('pointerdown', () => {
            // Clean up
            overlay.destroy();
            title.destroy();
            subtitle.destroy();
            closeButton.destroy();
            
            // Destroy all score texts and backgrounds
            this.children.list.forEach(child => {
                if (child.depth === 20000 || child.depth === 20001) {
                    child.destroy();
                }
            });
            
            console.log('✅ Leaderboard closed - proceeding to next level');
            
            // Check if there's a next level
            const nextLevel = this.currentLevel + 1;
            const maxLevel = 5;
            
            if (nextLevel <= maxLevel) {
                // Go to next level
                console.log(`🚀 Loading Level ${nextLevel}...`);
                this.registry.set('currentLevel', nextLevel);
                this.scene.restart();
            } else {
                // All levels complete! Show final congratulations
                console.log(`🎉 All levels complete!`);
                this.showAllLevelsCompleteScreen();
            }
        });
        
        console.log('✅ Leaderboard displayed');
    }
    
    async showHighscores() {
        // Trigger the full leaderboard flow: name → download → rank → display → submit
        console.log('📊 Highscores button clicked - starting leaderboard flow');
        await this.collectPlayerNameThenSaveScore(
            this.currentLevel,
            this.finalTime,
            this.finalDiamondScore,
            this.finalRhodopsins
        );
    }

    showNameInputDialog() {
        return new Promise((resolve) => {
            const width = this.scale.width;
            const height = this.scale.height;
            
            console.log('🎯 Opening name input dialog...');
            
            // Create input overlay
            const inputOverlay = this.add.rectangle(0, 0, width * 2, height * 2, 0x000000, 0.85)
                .setOrigin(0).setDepth(12000).setScrollFactor(0).setInteractive();
            
            // Create dialog box
            const dialogWidth = 500;
            const dialogHeight = 250;
            const dialogBg = this.add.rectangle(width / 2, height / 2, dialogWidth, dialogHeight, 0x1a1a2e, 1)
                .setDepth(12001).setScrollFactor(0)
                .setStrokeStyle(3, 0x00ff00);
            
            // Title
            const titleText = this.add.text(width / 2, height / 2 - 80, 'Enter Your Name', {
                fontSize: '28px',
                color: '#00ff00',
                fontStyle: 'bold',
                fontFamily: 'Arial'
            }).setOrigin(0.5).setDepth(12002).setScrollFactor(0);
            
            // Subtitle
            const subtitleText = this.add.text(width / 2, height / 2 - 50, '(Press Enter or click OK)', {
                fontSize: '14px',
                color: '#88ff88',
                fontFamily: 'Arial'
            }).setOrigin(0.5).setDepth(12002).setScrollFactor(0);
            
            // HTML Input (using DOM)
            const inputElement = document.createElement('input');
            inputElement.type = 'text';
            inputElement.maxLength = '20';
            inputElement.placeholder = 'Your name...';
            inputElement.value = '';
            inputElement.style.position = 'fixed';
            inputElement.style.width = '300px';
            inputElement.style.height = '40px';
            inputElement.style.fontSize = '18px';
            inputElement.style.padding = '10px';
            inputElement.style.left = (window.innerWidth / 2 - 150) + 'px';
            inputElement.style.top = (window.innerHeight / 2 - 20) + 'px';
            inputElement.style.zIndex = '10001';
            inputElement.style.border = '2px solid #00ff00';
            inputElement.style.backgroundColor = '#111111';
            inputElement.style.color = '#00ff00';
            inputElement.style.fontFamily = 'Arial';
            inputElement.style.outline = 'none';
            document.body.appendChild(inputElement);
            
            // Wait a frame then focus
            setTimeout(() => {
                inputElement.focus();
                inputElement.select();
                console.log('✅ Input focused and selected');
            }, 100);
            
            // OK button
            const okBtn = this.add.rectangle(width / 2 - 120, height / 2 + 50, 200, 50, 0x00aa00, 1)
                .setDepth(12001).setScrollFactor(0)
                .setInteractive({ useHandCursor: true })
                .setStrokeStyle(2, 0x00ff00);
            
            const okText = this.add.text(width / 2 - 120, height / 2 + 50, 'OK', {
                fontSize: '20px',
                color: '#ffffff',
                fontStyle: 'bold',
                fontFamily: 'Arial'
            }).setOrigin(0.5).setDepth(12002).setScrollFactor(0);
            
            // Cancel button
            const cancelBtn = this.add.rectangle(width / 2 + 120, height / 2 + 50, 200, 50, 0xaa0000, 1)
                .setDepth(12001).setScrollFactor(0)
                .setInteractive({ useHandCursor: true })
                .setStrokeStyle(2, 0xff0000);
            
            const cancelText = this.add.text(width / 2 + 120, height / 2 + 50, 'Cancel', {
                fontSize: '20px',
                color: '#ffffff',
                fontStyle: 'bold',
                fontFamily: 'Arial'
            }).setOrigin(0.5).setDepth(12002).setScrollFactor(0);
            
            let resolved = false;
            
            const cleanupDialog = () => {
                if (resolved) return; // Prevent double-cleanup
                resolved = true;
                inputOverlay.destroy();
                dialogBg.destroy();
                titleText.destroy();
                subtitleText.destroy();
                okBtn.destroy();
                okText.destroy();
                cancelBtn.destroy();
                cancelText.destroy();
                if (inputElement.parentNode) {
                    document.body.removeChild(inputElement);
                }
            };
            
            const handleSubmit = () => {
                if (resolved) return;
                const name = inputElement.value.trim() || 'Anonymous';
                console.log(`✅ Name submitted: ${name}`);
                cleanupDialog();
                resolve(name);
            };
            
            okBtn.on('pointerdown', handleSubmit);
            
            cancelBtn.on('pointerdown', () => {
                if (resolved) return;
                console.log('❌ Name input cancelled');
                cleanupDialog();
                resolve(null);
            });
            
            // Allow Enter key to submit
            inputElement.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    handleSubmit();
                }
            });
            
            // Prevent Escape key from closing
            inputElement.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    e.preventDefault();
                }
            });
            
            okBtn.on('pointerover', () => okBtn.setFillStyle(0x00ff00));
            okBtn.on('pointerout', () => okBtn.setFillStyle(0x00aa00));
            cancelBtn.on('pointerover', () => cancelBtn.setFillStyle(0xff0000));
            cancelBtn.on('pointerout', () => cancelBtn.setFillStyle(0xaa0000));
        });
    }

    // LOCALSTORAGE SCORE SAVING
    saveScore(timeSeconds, diamonds) {
        try {
            const scores = this.getScores();
            
            // Add new score
            scores.push({
                time: timeSeconds,
                diamonds: diamonds,
                date: new Date().toISOString()
            });
            
            // Keep last 50 scores
            if (scores.length > 50) {
                scores.sort((a, b) => b.diamonds - a.diamonds); // Sort by diamonds (best first)
                scores.splice(50); // Keep top 50
            }
            
            localStorage.setItem('ergo_level1_scores', JSON.stringify(scores));
            console.log(`💾 Saved score: ${timeSeconds}s, ${diamonds}💎`);
            
            // Also submit to Firebase if available
            this.submitScoreToFirebase(timeSeconds, diamonds);
        } catch (e) {
            console.error('Failed to save score:', e);
        }
    }
    
    submitScoreToFirebase(timeSeconds, diamonds) {
        // Get Firebase instance
        if (!window.firebaseInitialized || !window.firebaseDB) {
            console.log('⚠️ Firebase not available - score saved locally only');
            return;
        }
        
        try {
            const db = window.firebaseDB;
            
            // Get player name from localStorage (should already be set)
            let playerName = localStorage.getItem('playerName') || 'Anonymous';
            
            console.log(`📤 Submitting score to Firebase: ${playerName} - ${timeSeconds}s, ${diamonds}💎, Level ${this.currentLevel}`);
            
            // Submit score to Firestore
            db.collection('leaderboard').add({
                level: this.currentLevel,
                playerName: playerName,
                time: timeSeconds,
                diamonds: diamonds,
                date: new Date().toISOString(),
                timestamp: Math.floor(Date.now() / 1000)
            }).then((docRef) => {
                console.log(`✅ Score submitted to Firebase! Document ID: ${docRef.id}`);
            }).catch((error) => {
                console.error('❌ Failed to submit score to Firebase:', error);
                console.error('Error code:', error.code);
                console.error('Error message:', error.message);
            });
        } catch (e) {
            console.error('Exception while submitting to Firebase:', e);
        }
    }
    
    getScores() {
        try {
            const data = localStorage.getItem('ergo_level1_scores');
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Failed to load scores:', e);
            return [];
        }
    }
    
    getBestTime() {
        const scores = this.getScores();
        if (scores.length === 0) return Infinity;
        return Math.min(...scores.map(s => s.time));
    }
    
    getBestDiamonds() {
        const scores = this.getScores();
        if (scores.length === 0) return 0;
        return Math.max(...scores.map(s => s.diamonds));
    }
    
    // ========== HIGH SCORE SYSTEM ==========
    
    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    calculateDiamondScore(rhodopsins, timeMs) {
        // Calculate diamond score from rhodopsin counts + time bonus
        const monoValue = Math.floor(rhodopsins.monochrome * 0.5);
        const redValue = Math.floor(rhodopsins.red * 10);
        const greenValue = Math.floor(rhodopsins.green * 2);
        const blueValue = Math.floor(rhodopsins.blue * 5);
        
        // Time-based bonus (faster = more diamonds)
        const timeSeconds = Math.floor(timeMs / 1000);
        let timeBonus;
        if (timeSeconds < 180) { // < 3 minutes
            timeBonus = 5000;
        } else if (timeSeconds < 240) { // < 4 minutes
            timeBonus = 4000;
        } else if (timeSeconds < 300) { // < 5 minutes
            timeBonus = 3000;
        } else if (timeSeconds < 360) { // < 6 minutes
            timeBonus = 2500;
        } else if (timeSeconds < 420) { // < 7 minutes
            timeBonus = 2000;
        } else if (timeSeconds < 480) { // < 8 minutes
            timeBonus = 1500;
        } else if (timeSeconds < 540) { // < 9 minutes
            timeBonus = 1000;
        } else if (timeSeconds < 600) { // < 10 minutes
            timeBonus = 800;
        } else {
            // Gradual decrease after 10 minutes
            timeBonus = Math.max(100, Math.floor(4800 / timeSeconds));
        }
        
        return monoValue + redValue + greenValue + blueValue + timeBonus;
    }
    
    loadHighScores() {
        // Load high scores from localStorage
        const saved = localStorage.getItem('ergo_highscores');
        if (saved) {
            this.highScores = JSON.parse(saved);
        } else {
            // Initialize empty high scores for all 5 levels
            this.highScores = {
                levels: {
                    1: null,
                    2: null,
                    3: null,
                    4: null,
                    5: null
                },
                totalBestTime: null,
                completedAllLevels: false
            };
        }
        console.log('📊 High scores loaded:', this.highScores);
    }
    
    saveHighScores() {
        localStorage.setItem('ergo_highscores', JSON.stringify(this.highScores));
        console.log('💾 High scores saved');
    }
    
    updateHighScore(level, time, diamonds, rhodopsins) {
        const currentBest = this.highScores.levels[level];
        const isNewBest = !currentBest || time < currentBest.time;
        
        if (isNewBest) {
            this.highScores.levels[level] = {
                time: time,
                diamonds: diamonds,
                rhodopsins: rhodopsins, // Store full rhodopsin breakdown
                date: new Date().toISOString(),
                dateFormatted: new Date().toLocaleString()
            };
            this.saveHighScores();
            console.log(`🏆 NEW BEST TIME for Level ${level}: ${this.formatTime(time)}, ${diamonds}💎`);
        }
        
        // ALWAYS upload to global leaderboard - every completion counts!
        // v0.04: Firebase now accepts all scores, not just personal bests
        this.uploadScoreToFirebase(level, time, diamonds, rhodopsins)
            .catch(err => console.error('Error uploading to Firebase:', err));
        
        return isNewBest;
    }
    
    async collectPlayerNameThenSaveScore(level, time, diamonds, rhodopsins) {
        // SIMPLIFIED FLOW per user request:
        // 1. ALWAYS ask for name (no localStorage check)
        // 2. Download current leaderboard for this level
        // 3. Insert current run and calculate rank
        // 4. Display leaderboard immediately with current run highlighted
        // 5. Submit to Firebase in background
        
        console.log(`🚀 ============================================`);
        console.log(`🚀 collectPlayerNameThenSaveScore CALLED!`);
        console.log(`🚀 Level: ${level}, Time: ${time}ms, Diamonds: ${diamonds}`);
        console.log(`🚀 ============================================`);
        
        try {
            console.log(`🎯 Level ${level} completed - collecting name for leaderboard`);
            console.log(`📝 About to show name input dialog...`);
            
            // STEP 1: ALWAYS ask for name
            let playerName = await this.showNameInputDialog();
            console.log(`✅ Name dialog returned: ${playerName}`);
            
            if (!playerName || playerName === null) {
                console.log('⚠️ Dialog returned null/empty - trying browser prompt as fallback');
                playerName = prompt('Enter your name for the leaderboard:', '');
            }
            
            if (playerName) {
                playerName = playerName.trim();
                localStorage.setItem('playerName', playerName);
                console.log(`✅ Collected player name: ${playerName}`);
            } else {
                playerName = 'Anonymous';
                localStorage.setItem('playerName', playerName);
                console.log(`ℹ️ Using default name: ${playerName}`);
            }
            
            // STEP 2: Download leaderboard for this specific level
            console.log(`📥 Downloading leaderboard for Level ${level}...`);
            const levelScores = await this.loadGlobalLeaderboard(level);
            console.log(`📊 Found ${levelScores.length} scores for Level ${level}`);
            
            // STEP 3: Create current run and insert into leaderboard
            const playerScore = {
                level: level,
                time: time,
                diamonds: diamonds,
                rhodopsins: rhodopsins,
                playerName: playerName,
                isLocal: true, // Mark as current run
                timestamp: new Date().toISOString()
            };
            
            // Combine and sort all scores by time
            const allScores = [...levelScores, playerScore].sort((a, b) => a.time - b.time);
            
            // Find player's rank (1-based)
            const playerRank = allScores.findIndex(s => s.isLocal === true) + 1;
            console.log(`🏆 Your rank: ${playerRank} out of ${allScores.length} total scores`);
            
            // STEP 4: Display leaderboard immediately
            this.displayLevelCompletionLeaderboard(level, allScores, playerScore, playerRank);
            
            // STEP 5: Submit to Firebase in background (don't wait)
            console.log(`📤 Submitting score to Firebase...`);
            this.updateHighScore(level, time, diamonds, rhodopsins); // This calls uploadScoreToFirebase
            
            console.log(`✅ Leaderboard flow complete`);
            
        } catch (error) {
            console.error('Error in collectPlayerNameThenSaveScore:', error);
            // Fallback: still save the score locally and to Firebase
            this.updateHighScore(level, time, diamonds, rhodopsins);
        }
    }
    
    // ========== FIREBASE GLOBAL LEADERBOARD FUNCTIONS ==========
    
    async uploadScoreToFirebase(level, time, diamonds, rhodopsins) {
        // Check if Firebase is available
        if (!window.firebaseInitialized || !window.firebaseDB) {
            console.warn('⚠️ Firebase not initialized:', {
                firebaseInitialized: window.firebaseInitialized,
                hasDB: !!window.firebaseDB,
                firebase: typeof firebase !== 'undefined'
            });
            return;
        }
        
        try {
            const db = window.firebaseDB;
            
            // Get player name from localStorage
            let playerName = localStorage.getItem('playerName') || 'Anonymous';
            
            console.log(`📤 Uploading score to Firebase - Level ${level}: ${this.formatTime(time)}, ${diamonds}💎`);
            console.log(`   Player: ${playerName}`);
            console.log('Firebase app:', firebase.app().name);
            console.log('Firestore instance:', !!db);
            
            // Upload score to Firestore
            const docRef = await db.collection('leaderboard').add({
                level: level,
                time: time,
                diamonds: diamonds,
                rhodopsins: rhodopsins,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                dateStr: new Date().toLocaleDateString(),
                timeZone: new Date().toString(),
                playerName: playerName,
                version: '0.04'
            });
            
            console.log(`✅ SUCCESS! Score uploaded to global leaderboard!`);
            console.log(`   Level ${level}: ${this.formatTime(time)}, ${diamonds}💎`);
            console.log(`   Document ID: ${docRef.id}`);
            
            return docRef;
        } catch (error) {
            console.error('❌ FAILED to upload score to Firebase!');
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            console.error('Full error:', error);
            
            // Common Firebase errors
            if (error.code === 'permission-denied') {
                console.error('🔒 PERMISSION DENIED - Firestore security rules are blocking writes');
                console.error('   Check Firestore Security Rules in Firebase Console');
            } else if (error.code === 'failed-precondition') {
                console.error('⚙️ FAILED PRECONDITION - Firestore might not be initialized');
            } else if (error.code === 'unauthenticated') {
                console.error('🔑 UNAUTHENTICATED - Need authentication (but test mode should allow this)');
            }
            
            console.error('Score details:', {
                level: level,
                time: time,
                diamonds: diamonds
            });
            
            // Game continues normally, just no global score
            throw error;
        }
    }
    
    async loadGlobalLeaderboard(level) {
        // Check if Firebase is available
        if (!window.firebaseInitialized || !window.firebaseDB) {
            console.log('⚠️ Firebase not available, showing local scores only');
            return [];
        }
        
        try {
            const db = window.firebaseDB;
            
            console.log(`🔍 Querying Firestore for level ${level} scores...`);
            
            // Get top 5 scores for this level, sorted by time (fastest first)
            const snapshot = await db.collection('leaderboard')
                .where('level', '==', level)
                .orderBy('time', 'asc')
                .limit(5)
                .get();
            
            const scores = [];
            snapshot.forEach(doc => {
                scores.push({
                    ...doc.data(),
                    docId: doc.id  // Store document ID for reference
                });
            });
            
            console.log(`📥 Loaded ${scores.length} global scores for level ${level}`);
            if (scores.length > 0) {
                console.log(`   Top score: ${scores[0].diamonds}💎 in ${this.formatTime(scores[0].time)}`);
            }
            return scores;
        } catch (error) {
            console.error('❌ Failed to load global leaderboard!');
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            console.error('Full error:', error);
            
            // Common Firestore query errors
            if (error.code === 'failed-precondition') {
                console.error('⚠️ COMPOSITE INDEX NEEDED');
                console.error('   Firestore requires a composite index for queries combining where() + orderBy()');
                console.error('   Check Firebase Console → Firestore Database → Indexes');
                console.error('   Or click the link in the error message to create the index automatically');
            } else if (error.code === 'invalid-argument') {
                console.error('❌ Invalid query - check field names and types');
            }
            
            return [];
        }
    }
    
    checkAllLevelsCompleted() {
        // Check if all 5 levels have been completed
        for (let i = 1; i <= 5; i++) {
            if (!this.highScores.levels[i]) {
                return false;
            }
        }
        return true;
    }
    
    getTotalTime() {
        // Sum of all level best times
        let total = 0;
        for (let i = 1; i <= 5; i++) {
            if (this.highScores.levels[i]) {
                total += this.highScores.levels[i].time;
            }
        }
        return total;
    }
    
    getTotalDiamonds() {
        // Sum of all level diamond scores
        let total = 0;
        for (let i = 1; i <= 5; i++) {
            if (this.highScores.levels[i] && this.highScores.levels[i].diamonds) {
                total += this.highScores.levels[i].diamonds;
            }
        }
        return total;
    }
    
    showFinalRewardScreen() {
        // Show final reward after completing all 5 levels
        const width = this.scale.width;
        const height = this.scale.height;
        
        // Dark overlay
        const overlay = this.add.rectangle(0, 0, width * 2, height * 2, 0x000000, 0.95)
            .setOrigin(0).setDepth(11000).setScrollFactor(0);
        
        // Title
        const title = this.add.text(width / 2, 50, 
            '🎉 CONGRATULATIONS! 🎉', {
            fontSize: '56px',
            color: '#FFD700',
            fontStyle: 'bold',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(11001).setScrollFactor(0);
        
        // Subtitle
        const subtitle = this.add.text(width / 2, 120, 
            'You completed all 5 levels!', {
            fontSize: '32px',
            color: '#00ff00',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(11001).setScrollFactor(0);
        
        // Show Drosophila drawing
        const rewardImage = this.add.image(width / 2, height / 2 - 20, 'finalReward');
        rewardImage.setDepth(11001).setScrollFactor(0);
        // Scale to fit nicely
        const scale = Math.min(500 / rewardImage.width, 350 / rewardImage.height);
        rewardImage.setScale(scale);
        
        // Total time and diamonds
        const totalTime = this.getTotalTime();
        const totalDiamonds = this.getTotalDiamonds();
        const totalText = this.add.text(width / 2, height / 2 + 200, 
            `🏆 Total: ${this.formatTime(totalTime)} | ${totalDiamonds}💎 🏆`, {
            fontSize: '32px',
            color: '#FFD700',
            fontStyle: 'bold',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(11001).setScrollFactor(0);
        
        // Diamond summary for all 5 levels
        const diamondSpacing = 140;
        const startX = width / 2 - (diamondSpacing * 2);
        const diamondY = height / 2 + 290;
        const diamondSize = 100;
        
        for (let i = 1; i <= 5; i++) {
            const diamondX = startX + (i - 1) * diamondSpacing;
            const levelScore = this.highScores.levels[i];
            
            // Diamond shape
            const diamondBg = this.add.graphics();
            diamondBg.fillStyle(0x1a1a1a, 0.9);
            diamondBg.lineStyle(2, 0xFFD700);
            
            diamondBg.beginPath();
            diamondBg.moveTo(diamondX, diamondY - diamondSize / 2); // Top
            diamondBg.lineTo(diamondX + diamondSize / 2, diamondY); // Right
            diamondBg.lineTo(diamondX, diamondY + diamondSize / 2); // Bottom
            diamondBg.lineTo(diamondX - diamondSize / 2, diamondY); // Left
            diamondBg.closePath();
            diamondBg.fillPath();
            diamondBg.strokePath();
            diamondBg.setDepth(11001).setScrollFactor(0);
            
            // Level number
            const levelNum = this.add.text(diamondX, diamondY - 30,
                `${i}`, {
                fontSize: '24px',
                color: '#FFD700',
                fontFamily: 'Arial',
                fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(11002).setScrollFactor(0);
            
            // Diamond score and time
            if (levelScore) {
                const diamondText = this.add.text(diamondX, diamondY - 5,
                    `${levelScore.diamonds}💎`, {
                    fontSize: '18px',
                    color: '#FFD700',
                    fontFamily: 'Arial',
                    fontStyle: 'bold'
                }).setOrigin(0.5).setDepth(11002).setScrollFactor(0);
                
                const timeText = this.add.text(diamondX, diamondY + 20,
                    this.formatTime(levelScore.time), {
                    fontSize: '14px',
                    color: '#ffffff',
                    fontFamily: 'Arial',
                    fontStyle: 'bold'
                }).setOrigin(0.5).setDepth(11002).setScrollFactor(0);
            }
        }
        
        // Play Again button
        const playAgainButton = this.add.text(width / 2, height - 60,
            '▶ Play All Levels Again', {
            fontSize: '28px',
            color: '#ffffff',
            backgroundColor: '#0066cc',
            padding: { x: 25, y: 12 },
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(11001).setScrollFactor(0);
        
        playAgainButton.setInteractive({ useHandCursor: true });
        playAgainButton.on('pointerover', () => {
            playAgainButton.setStyle({ backgroundColor: '#0088ff' });
        });
        playAgainButton.on('pointerout', () => {
            playAgainButton.setStyle({ backgroundColor: '#0066cc' });
        });
        playAgainButton.on('pointerdown', () => {
            // Reset to level 1 and restart
            this.registry.set('currentLevel', 1);
            this.scene.restart();
        });
        
        // Animate entrance
        this.tweens.add({
            targets: [title, subtitle],
            scale: { from: 0, to: 1 },
            alpha: { from: 0, to: 1 },
            duration: 800,
            ease: 'Back.easeOut'
        });
        
        this.tweens.add({
            targets: rewardImage,
            scale: { from: 0, to: scale },
            alpha: { from: 0, to: 1 },
            duration: 1000,
            delay: 300,
            ease: 'Elastic.easeOut'
        });
        
        this.tweens.add({
            targets: [totalText, breakdownText, levelsText, playAgainButton],
            alpha: { from: 0, to: 1 },
            duration: 600,
            delay: 800,
            ease: 'Power2'
        });
    }
}

