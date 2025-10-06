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
            spawnCountForCurrentSpecies: 0
        };
        
        // Species organized by VISION QUALITY (worst to best within each family)
        // Each family progresses from simple vision → advanced vision
        // Round 0: Worst vision from each family (monocromats/simple)
        // Round 1: Basic vision (dichromats/limited trichromats)
        // Round 2: Good vision (standard trichromats)
        // Round 3: Best vision (advanced trichromats/tetrachromats)
        this.speciesByFamily = [
            ['ant', 'honeybee', 'bumblebee', 'hornet'],           // Hymenoptera: monochromat → UV+B+G trichromats (Index 0)
            ['vinegar_fly', 'housefly', 'robber_fly', 'horsefly'],  // Diptera: simple → advanced (red vision) (Index 1)
            ['hawk_moth', 'peacock', 'monarch', 'cabbage_white'], // Lepidoptera: trichromat → TETRACHROMAT! (Index 2)
            ['stag_beetle', 'firefly', 'ladybug', 'rose_chafer']  // Coleoptera: monochromat → red vision (Index 3)
        ];
        
        // Current species is the first from selected family
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
        
        // Start the first spawn timer (5 seconds)
        this.startSpawnTimer(5);

        // Instructions
        this.add.text(width / 2, 20, 'Click insect to select, click elsewhere to set path', {
            fontSize: '13px',
            color: '#ffffff',
            backgroundColor: '#000000dd',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setDepth(3000);
        
        // Spectral evolution display at bottom
        this.createSpectralEvolutionDisplay(width, height);

        console.log('=== CREATE COMPLETE ===');
    }

    createColorFogLayers(width, height) {
        // NEW APPROACH: Create THREE separate RGB fog layers
        // Each layer represents one color component that needs to be revealed
        // Insects reveal proportional to their spectralWeights {r, g, b}
        
        this.fogLayers = {};
        
        // Red fog layer - revealed by insects with high r weight
        const redFog = this.add.renderTexture(0, 0, width, height);
        redFog.setOrigin(0, 0);
        redFog.fill(0xff0044, 1.0);  // Vivid red-pink
        redFog.setBlendMode(Phaser.BlendModes.MULTIPLY);
        redFog.setDepth(100);
        this.fogLayers.R = redFog;
        
        // Green fog layer - revealed by insects with high g weight
        const greenFog = this.add.renderTexture(0, 0, width, height);
        greenFog.setOrigin(0, 0);
        greenFog.fill(0x00ff44, 1.0);  // Vivid cyan-green
        greenFog.setBlendMode(Phaser.BlendModes.MULTIPLY);
        greenFog.setDepth(101);
        this.fogLayers.G = greenFog;
        
        // Blue fog layer - revealed by insects with high b weight
        const blueFog = this.add.renderTexture(0, 0, width, height);
        blueFog.setOrigin(0, 0);
        blueFog.fill(0x0088ff, 1.0);  // Vivid cyan-blue
        blueFog.setBlendMode(Phaser.BlendModes.MULTIPLY);
        blueFog.setDepth(102);
        this.fogLayers.B = blueFog;
        
        console.log('Spectral fog layers created: R, G, B');
        console.log('Insects will reveal based on their spectralWeights');
    }

    createSpectrumIndicators(x, y, insectData) {
        // Show RGB sensitivity as colored bars scaled by spectral weights
        const indicators = [];
        const weights = insectData.spectralWeights || { r: 0.33, g: 0.33, b: 0.33 };
        const spacing = 16;
        const maxHeight = 18;
        
        // Create bars for R, G, B
        const channels = [
            { key: 'r', color: 0xff0000, x: x - spacing },
            { key: 'g', color: 0x00ff00, x: x },
            { key: 'b', color: 0x0000ff, x: x + spacing }
        ];
        
        channels.forEach(ch => {
            const weight = weights[ch.key];
            const barHeight = Math.max(2, weight * maxHeight);
            
            // Create bar scaled by weight
            const bar = this.add.rectangle(
                ch.x, 
                y + (maxHeight - barHeight) / 2,  // Top-align
                8, 
                barHeight, 
                ch.color, 
                0.8
            ).setDepth(201);
            bar.setStrokeStyle(1, 0xffffff, 0.5);
            indicators.push(bar);
        });
        
        return indicators;
    }

    createCornerFamilyControls(width, height) {
        // Create control panels in all 4 corners (one per family)
        // Panel positions match speciesByFamily array order:
        // Index 0 = Hymenoptera (bottom-left) - STARTS HERE!
        // Index 1 = Diptera (top-left)
        // Index 2 = Lepidoptera (top-right)
        // Index 3 = Coleoptera (bottom-right)
        const panelPositions = [
            { x: 125, y: height - 120, corner: 'bottom-left' },   // Hymenoptera (index 0) - STARTING FAMILY
            { x: 125, y: 120, corner: 'top-left' },              // Diptera (index 1)
            { x: width - 125, y: 120, corner: 'top-right' },     // Lepidoptera (index 2)
            { x: width - 125, y: height - 120, corner: 'bottom-right' } // Coleoptera (index 3)
        ];
        
        // Control panel bounds (all corners combined)
        this.controlPanelBounds = {
            corners: [
                { left: 0, right: 250, top: height - 240, bottom: height },
                { left: width - 250, right: width, top: height - 240, bottom: height },
                { left: 0, right: 250, top: 0, bottom: 240 },
                { left: width - 250, right: width, top: 0, bottom: 240 }
            ]
        };
        
        this.familyControls = [];
        
        SUPERFAMILIES.forEach((superfamily, familyIndex) => {
            const pos = panelPositions[familyIndex];
            const isUnlocked = this.unlockedFamilies.includes(familyIndex);
            const isActive = familyIndex === this.familyProgression.currentFamilyInRound;
            
            const control = this.createFamilyPanel(pos, superfamily, familyIndex, isUnlocked, isActive);
            this.familyControls.push(control);
        });
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
            'housefly': '🪰',
            'vinegar_fly': '🪰',
            'horsefly': '🪰',
            'robber_fly': '🪰',
            // Lepidoptera
            'cabbage_white': '🦋',
            'hawk_moth': '🦋',
            'peacock': '🦋',
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

    startSpawnTimer(totalSeconds = 5) {
        if (!this.loadingTimer) {
            console.error('No loading timer found!');
            return;
        }
        
        let countdown = totalSeconds;
        const barMaxWidth = 100; // Reduced from 120 to match new smaller bar
        
        // Update timer and bar every second
        const timerEvent = this.time.addEvent({
            delay: 1000,
            repeat: totalSeconds - 1,
            callback: () => {
                countdown--;
                
                // Update text
                if (countdown > 0) {
                    this.loadingTimer.setText(`${countdown}s`);
                    this.loadingTimer.setColor('#ffaa00');
                } else {
                    this.loadingTimer.setText('Now!');
                    this.loadingTimer.setColor('#00ff00');
                }
                
                // Update loading bar (fill up as time progresses)
                if (this.loadingBarFill) {
                    const progress = (totalSeconds - countdown) / totalSeconds;
                    this.loadingBarFill.width = barMaxWidth * progress;
                }
            }
        });
        
        // After countdown, spawn the insect
        this.time.delayedCall(totalSeconds * 1000, () => {
            this.spawnInsectFromPanel();
        });
    }

    spawnInsectFromPanel() {
        const activeFamilyIndex = this.familyProgression.currentFamilyInRound;
        const activePanel = this.familyControls.find(c => c.familyIndex === activeFamilyIndex && c.isActive);
        
        if (!activePanel || !activePanel.spawnPosition) {
            console.error('No active panel found!');
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
        }).setOrigin(0.5).setDepth(200);
        
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
        
        // Create spectrum indicators
        const spectrumIndicators = this.createSpectrumIndicators(startX, startY + 30, insectData);
        
        // Lifespan indicator bar - above the insect
        const lifespanBarWidth = 30 * sizeScale;
        const lifespanBarHeight = 3;
        const lifespanBarY = startY - 25 * sizeScale;
        
        // Background bar (red)
        const lifespanBarBg = this.add.rectangle(
            startX, lifespanBarY, 
            lifespanBarWidth, lifespanBarHeight, 
            0x440000, 0.6
        ).setOrigin(0.5, 0.5).setDepth(201);
        
        // Foreground bar (green, will shrink over time)
        const lifespanBar = this.add.rectangle(
            startX, lifespanBarY, 
            lifespanBarWidth, lifespanBarHeight, 
            0x00ff00, 0.9
        ).setOrigin(0.5, 0.5).setDepth(202);
        
        // Selection ring - scale with insect size (hidden by default)
        const ringRadius = 25 * sizeScale;
        const selectionRing = this.add.circle(startX, startY, ringRadius, 0xffffff, 0).setDepth(199);
        selectionRing.setStrokeStyle(3, 0x00ff00);
        selectionRing.setAlpha(0); // Hidden by default
        
        // Focus ring - slightly larger (REMOVED - we don't want it visible)
        const focusRing = this.add.circle(startX, startY, ringRadius + 3, 0xffffff, 0).setDepth(198);
        focusRing.setStrokeStyle(2, 0xffaa00, 0.5);
        focusRing.setAlpha(0); // Always hidden
        
        // Path graphics
        const pathGraphics = this.add.graphics().setDepth(150);
        
        const insect = {
            sprite: insectSprite,
            selectionRing: selectionRing,
            focusRing: focusRing,
            lifespanBar: lifespanBar,
            lifespanBarBg: lifespanBarBg,
            lifespanBarMaxWidth: lifespanBarWidth,
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
            focusLevel: 0,
            lastDefogX: startX,
            lastDefogY: startY,
            lastDefogLevel: 0,
            randomWalkMode: true,
            randomWalkTimer: 0,
            age: 0,
            lifespan: insectId === 'ant' ? 240000 : 120000 / insectData.speed // Ants live 240s (4min), others 120s/speed (24-120s)
        };
        
        this.insects.push(insect);
        
        // Add random waypoint to start walking
        this.addRandomWaypoint(insect);
        
        // Progress to next species
        this.progressToNextSpecies();
        
        // Start next spawn timer
        this.startSpawnTimer(5);
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
        // Lepidoptera (index 2) always spawns 2 because they're much bigger
        // Others spawn progressively fewer as they get bigger:
        // Round 0 (smallest): 5 spawns
        // Round 1 (medium-small): 4 spawns  
        // Round 2 (medium-large): 3 spawns
        // Round 3 (largest): 2 spawns
        const isLepidoptera = (this.familyProgression.currentFamilyInRound === 2);
        const spawnsNeeded = isLepidoptera ? 2 : Math.max(2, 5 - this.familyProgression.currentRound);
        
        if (this.familyProgression.spawnCountForCurrentSpecies >= spawnsNeeded) {
            this.familyProgression.spawnCountForCurrentSpecies = 0;
            this.familyProgression.currentFamilyInRound++;
            
            // After cycling through all 4 families, move to next size round
            if (this.familyProgression.currentFamilyInRound >= 4) {
                this.familyProgression.currentFamilyInRound = 0;
                this.familyProgression.currentRound++;
                
                console.log(`Round ${this.familyProgression.currentRound - 1} complete! Moving to Round ${this.familyProgression.currentRound} (next size tier)`);
                
                // After all 4 rounds (all sizes), loop back to start
                if (this.familyProgression.currentRound >= 4) {
                    this.familyProgression.currentRound = 0;
                    console.log('All sizes complete! Looping back to smallest insects.');
                }
            }
            
            // Update current species ID
            const familyIdx = this.familyProgression.currentFamilyInRound;
            const sizeRound = this.familyProgression.currentRound;
            this.currentSpeciesId = this.speciesByFamily[familyIdx][sizeRound];
            
            const familyName = SUPERFAMILIES[familyIdx];
            const isLepidoptera = (familyIdx === 2);
            const nextSpawnsNeeded = isLepidoptera ? 2 : Math.max(2, 5 - sizeRound);
            console.log(`Next species: ${this.currentSpeciesId} (${familyName}, Round ${sizeRound}) - will spawn ${nextSpawnsNeeded}x`);
            
            // Update active panel display
            this.updateActivePanelDisplay();
        }
    }

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

    createSpectralEvolutionDisplay(width, height) {
        // Simple display showing spectral vision progression
        const panelX = width / 2;
        const panelY = height - 30;
        
        this.add.text(panelX, panelY, 'Vision Evolution: 🐜 Simple → 🐝 Better → 🦋 Complex → 🐞 Advanced', {
            fontSize: '12px',
            color: '#ffaa00',
            backgroundColor: '#000000aa',
            padding: { x: 10, y: 3 }
        }).setOrigin(0.5).setDepth(2500);
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
            // Ignore clicks on control panels
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
            
            // STEP 1: Check if we clicked on an insect
            let clickedInsectIndex = null;
            let closestDistance = Infinity;
            
            this.insects.forEach((insect, index) => {
                const dx = pointer.x - insect.sprite.x;
                const dy = pointer.y - insect.sprite.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Large click radius for mobile
                const baseRadius = 80;
                const minRadius = 40;
                const clickRadius = Math.max(minRadius, baseRadius * (insect.sizeScale || 1));
                
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
                // Clicked on empty area
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
            // Deselect this insect - hide path
            insect.isSelected = false;
            insect.selectionRing.setAlpha(0);
            insect.pathGraphics.clear();
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
                // Reset user control flag when deselecting
                otherInsect.userControlled = false;
            }
        });
        
        // Select this insect and show its path (including random walk)
        this.selectedInsectIndices = [index];
        insect.isSelected = true;
        insect.userControlled = false; // Reset - next click will REPLACE path
        insect.selectionRing.setStrokeStyle(3, 0x00ff00);
        insect.selectionRing.setAlpha(1);
        
        // Show current path immediately (even if it's a random walk path)
        this.drawPath(insect);
        
        console.log(`✅ Selected: ${insect.data.name}`);
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
        
        // SMART PATH SYSTEM:
        // First click after selection = REPLACE path (reprogram)
        // Subsequent clicks = ADD to path (multiway)
        if (!insect.userControlled || insect.waypoints.length === 0) {
            // First command - replace path completely
            insect.waypoints = [{ x, y }];
            insect.userControlled = true;
            console.log(`🎯 New path for ${insect.data.name} → (${Math.round(x)}, ${Math.round(y)})`);
        } else {
            // Subsequent commands - add to existing path (multiway)
            insect.waypoints.push({ x, y });
            const waypointNum = insect.waypoints.length;
            console.log(`📍 Waypoint ${waypointNum} added for ${insect.data.name} → (${Math.round(x)}, ${Math.round(y)})`);
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
        // Age insects and remove dead ones
        this.insects = this.insects.filter(insect => {
            insect.age += delta;
            
            if (insect.age >= insect.lifespan) {
                // Insect died - clean up
                insect.sprite.destroy();
                insect.selectionRing.destroy();
                insect.focusRing.destroy();
                insect.lifespanBar.destroy();
                insect.lifespanBarBg.destroy();
                insect.pathGraphics.destroy();
                insect.spectrumIndicators.forEach(ind => ind.destroy());
                console.log(`💀 ${insect.data.name} died after ${(insect.age/1000).toFixed(1)}s`);
                return false; // Remove from array
            }
            
            // Update lifespan bar
            const lifespanRatio = 1 - (insect.age / insect.lifespan);
            insect.lifespanBar.width = insect.lifespanBarMaxWidth * lifespanRatio;
            
            // Color shift: green -> yellow -> red as life decreases
            if (lifespanRatio > 0.5) {
                insect.lifespanBar.setFillStyle(0x00ff00, 0.9); // Green
            } else if (lifespanRatio > 0.25) {
                insect.lifespanBar.setFillStyle(0xffaa00, 0.9); // Yellow
            } else {
                insect.lifespanBar.setFillStyle(0xff0000, 0.9); // Red
            }
            
            return true; // Keep alive
        });
        
        // Update indices after filtering - DON'T recreate event handlers!
        this.insects.forEach((insect, newIdx) => {
            insect.index = newIdx;
            // Update the index stored in sprite data
            insect.sprite.setData('insectIndex', newIdx);
        });
        
        // Clear invalid selections (indices that no longer exist)
        this.selectedInsectIndices = this.selectedInsectIndices.filter(idx => idx < this.insects.length);
        
        // CRITICAL: Create a copy of insects array to prevent iterator issues during modification
        const insectsSnapshot = [...this.insects];
        
        insectsSnapshot.forEach(insect => {
            // Safety check: insect may have been removed
            if (!insect || !insect.sprite || !insect.sprite.active) return;
            
            // Random walk mode - add new waypoint when current one is reached
            if (insect.randomWalkMode && insect.waypoints.length === 0) {
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
            
            // Only defog if insect has moved or focus has changed significantly
            const dxDefog = insect.sprite.x - insect.lastDefogX;
            const dyDefog = insect.sprite.y - insect.lastDefogY;
            const distanceFromLastDefog = Math.sqrt(dxDefog * dxDefog + dyDefog * dyDefog);
            const focusChange = insect.focusLevel - insect.lastDefogLevel;
            
            // Defog if moved more than 3 pixels OR focus increased by 0.1
            if (distanceFromLastDefog > 3 || focusChange > 0.1) {
                this.defogAtInsect(insect);
                insect.lastDefogX = insect.sprite.x;
                insect.lastDefogY = insect.sprite.y;
                insect.lastDefogLevel = insect.focusLevel;
            }
        });
    }

    moveInsectToward(insect, targetX, targetY, delta) {
        const speed = insect.data.speed * 0.01; // VERY slow - was 0.03, now 0.01
        const dx = targetX - insect.sprite.x;
        const dy = targetY - insect.sprite.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 1) {
            const moveDistance = Math.min(speed * delta, distance);
            insect.sprite.x += (dx / distance) * moveDistance;
            insect.sprite.y += (dy / distance) * moveDistance;
            
            // Move selection ring and spectrum indicators
            insect.selectionRing.x = insect.sprite.x;
            insect.selectionRing.y = insect.sprite.y;
            
            // Move lifespan bar
            const lifespanBarY = insect.sprite.y - 25 * (insect.sizeScale || 1);
            insect.lifespanBar.x = insect.sprite.x;
            insect.lifespanBar.y = lifespanBarY;
            insect.lifespanBarBg.x = insect.sprite.x;
            insect.lifespanBarBg.y = lifespanBarY;
            
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
        const scaledRadius = baseRadius * sizeScale; // Smaller insects = smaller defog area
        
        // Calculate blur based on ommatidia count
        const ommatidiaRatio = Math.min(1, insect.data.ommatidia / 6000);
        const blurRadius = Math.max(3, 30 * (1 - ommatidiaRatio));
        
        // Adjust reveal radius based on focus level (temporal resolution)
        const effectiveRadius = scaledRadius * insect.focusLevel;
        
        // Only defog if insect has some focus
        const minFocus = 0.15;
        if (insect.focusLevel < minFocus) return;
        
        // Get spectral weights for this insect
        const weights = insect.data.spectralWeights || { r: 0.33, g: 0.33, b: 0.33 };
        
        // CRITICAL COLOR VISION LOGIC:
        // Standard insects: ERASE fog layers they CANNOT see (low weight)
        //                   KEEP fog layers they CAN see (high weight)
        // Full-spectrum insects (all weights high): ERASE ALL fogs to reveal full color
        // Example: Ant (g:1.0, r:0, b:0) erases RED+BLUE fogs, keeps GREEN fog → GREEN world
        // Example: Cabbage White (r:1.0, g:1.0, b:0.8) erases ALL fogs → FULL COLOR world
        
        // Check if this is a full-spectrum insect (can see all colors)
        const canSeeAll = weights.r >= 0.5 && weights.g >= 0.5 && weights.b >= 0.5;
        
        ['R', 'G', 'B'].forEach(channel => {
            const fogLayer = this.fogLayers[channel];
            if (!fogLayer) return;
            
            // Get weight for this channel (r/g/b)
            const channelKey = channel.toLowerCase();
            const weight = weights[channelKey] || 0;
            
            // SPECIAL CASE: Full-spectrum insects erase ALL fogs
            if (canSeeAll) {
                // Erase all fogs to reveal full color world
                const graphics = this.make.graphics();
                const steps = Math.min(10, Math.ceil(blurRadius));
                
                for (let i = 0; i < steps; i++) {
                    const ratio = i / steps;
                    const currentRadius = effectiveRadius * (1 - ratio * 0.3);
                    
                    // Full erasing power scaled by weight (stronger for r/g than b)
                    const baseAlpha = insect.focusLevel * (1 - ratio) * 0.9;
                    const weightedAlpha = baseAlpha * weight; // Use weight directly for full-spectrum
                    
                    graphics.fillStyle(0xffffff, weightedAlpha);
                    graphics.fillCircle(x, y, currentRadius);
                }
                
                fogLayer.erase(graphics);
                graphics.destroy();
                return; // Skip normal logic
            }
            
            // NORMAL CASE: ERASE fogs they're BLIND to (low weight = can't see = remove fog)
            // KEEP fogs they're SENSITIVE to (high weight = can see = keep fog)
            const threshold = 0.5; // Only erase if weight BELOW this (blind to color)
            if (weight >= threshold) return; // Skip - this insect CAN see this color
            
            // Create blurred reveal - gradient from center outward
            const graphics = this.make.graphics();
            
            // Reduced steps for better performance
            const steps = Math.min(10, Math.ceil(blurRadius));
            for (let i = 0; i < steps; i++) {
                const ratio = i / steps;
                const currentRadius = effectiveRadius * (1 - ratio * 0.3);
                
                // Alpha scales with INVERSE of weight (LOW weight = MORE erasing)
                // Also scales with focus (more focus = more reveal)
                const baseAlpha = insect.focusLevel * (1 - ratio) * 0.9;
                const blindnessStrength = 1 - weight; // 0 weight = 1.0 blindness (full erase)
                const weightedAlpha = baseAlpha * blindnessStrength;
                
                graphics.fillStyle(0xffffff, weightedAlpha);
                graphics.fillCircle(x, y, currentRadius);
            }
            
            // Erase from this specific color channel's fog
            fogLayer.erase(graphics);
            graphics.destroy();
        });
    }
}
