import { INSECT_DATABASE, SUPERFAMILY_EMOJI, COLOR_CHANNELS, SUPERFAMILIES, getInsectsBySuperfamily } from '../data/insectDatabaseReal.js';

export class DefogGame extends Phaser.Scene {

    constructor() {
        super('DefogGame');
    }

    init(data) {
        this.selectedInsects = data.selectedInsects || [];
        console.log('=== GAME STARTING ===');
        console.log('Selected insect IDs:', this.selectedInsects);
        
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

        // Create fog layers with better visibility
        this.fogLayers = {};
        this.createColorFogLayers(width, height);

        // Create insects in corners with emojis
        this.insects = [];
        this.createInsects(width, height);

        // Create corner-based family controls
        this.createCornerFamilyControls(width, height);

        // Input handling
        this.setupInputHandlers();

        // Instructions
        this.add.text(width / 2, 20, 'Tap insect to select | Tap elsewhere to set waypoint | Hold SHIFT + tap for multi-select', {
            fontSize: '13px',
            color: '#ffffff',
            backgroundColor: '#000000dd',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setDepth(3000);
        
        // Create spectral coverage indicator
        this.createSpectralCoveragePanel(width, height);

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
        redFog.fill(0xff0000, 1.0);  // Pure red
        redFog.setBlendMode(Phaser.BlendModes.MULTIPLY);
        redFog.setDepth(100);
        this.fogLayers.R = redFog;
        
        // Green fog layer - revealed by insects with high g weight
        const greenFog = this.add.renderTexture(0, 0, width, height);
        greenFog.setOrigin(0, 0);
        greenFog.fill(0x00ff00, 1.0);  // Pure green
        greenFog.setBlendMode(Phaser.BlendModes.MULTIPLY);
        greenFog.setDepth(101);
        this.fogLayers.G = greenFog;
        
        // Blue fog layer - revealed by insects with high b weight
        const blueFog = this.add.renderTexture(0, 0, width, height);
        blueFog.setOrigin(0, 0);
        blueFog.fill(0x0000ff, 1.0);  // Pure blue
        blueFog.setBlendMode(Phaser.BlendModes.MULTIPLY);
        blueFog.setDepth(102);
        this.fogLayers.B = blueFog;
        
        console.log('Spectral fog layers created: R, G, B');
        console.log('Insects will reveal based on their spectralWeights');
    }

    createInsects(width, height) {
        // Position insects in corners matching their family position
        const cornerPositions = [
            { x: 80, y: 80, family: SUPERFAMILIES[0] },           // Top-left
            { x: width - 80, y: 80, family: SUPERFAMILIES[1] },   // Top-right
            { x: 80, y: height - 80, family: SUPERFAMILIES[2] },  // Bottom-left
            { x: width - 80, y: height - 80, family: SUPERFAMILIES[3] } // Bottom-right
        ];

        SUPERFAMILIES.forEach((superfamily, index) => {
            const insectId = this.insectsByFamily[superfamily];
            const insectData = INSECT_DATABASE[insectId];
            const pos = cornerPositions[index];
            
            // Create emoji text for insect
            const emoji = SUPERFAMILY_EMOJI[insectData.superfamily];
            const insectSprite = this.add.text(pos.x, pos.y, emoji, {
                fontSize: '28px'
            }).setOrigin(0.5).setDepth(200);
            
            // Make insect clickable
            insectSprite.setInteractive({ useHandCursor: true });
            insectSprite.on('pointerdown', (pointer) => {
                if (pointer.event.button === 0) { // Left click
                    this.selectInsect(index, pointer.event.shiftKey);
                }
            });
            
            // Create colored circles for spectral sensitivities
            // Create spectrum indicators showing RGB sensitivity
            const spectrumIndicators = this.createSpectrumIndicators(pos.x, pos.y + 30, insectData);
            
            // Selection indicator (ring around insect)
            const selectionRing = this.add.circle(pos.x, pos.y, 25, 0xffffff, 0).setDepth(199);
            selectionRing.setStrokeStyle(3, 0x00ff00);
            
            // Focus indicator (shows temporal resolution - changes with movement)
            const focusRing = this.add.circle(pos.x, pos.y, 28, 0xffffff, 0).setDepth(198);
            focusRing.setStrokeStyle(2, 0xffaa00, 0.5);
            
            // Path visualization
            const pathGraphics = this.add.graphics().setDepth(150);
            
            const insect = {
                sprite: insectSprite,
                selectionRing: selectionRing,
                focusRing: focusRing,
                data: insectData,
                insectId: insectId,
                index: index,
                superfamily: superfamily,
                spectrumIndicators: spectrumIndicators,
                isSelected: false,
                waypoints: [], // Queue of positions to move to
                currentWaypoint: null,
                pathGraphics: pathGraphics,
                timeAtPosition: 0, // Time spent stationary (for temporal resolution)
                lastPosition: { x: pos.x, y: pos.y },
                focusLevel: 0, // 0-1, how well image is resolved
                lastDefogX: pos.x, // Last position where we defogged
                lastDefogY: pos.y,
                lastDefogLevel: 0 // Last focus level when we defogged
            };
            
            this.insects.push(insect);
            
            console.log(`Created ${insectData.name} (${emoji}) in corner ${index}`);
        });
        
        // Give all insects initial waypoint to center so they start moving
        const centerX = width / 2;
        const centerY = height / 2;
        this.insects.forEach(insect => {
            insect.waypoints.push({ x: centerX, y: centerY });
            this.drawPath(insect);
        });
        console.log('All insects given initial waypoint to center');
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
        // Create control panels OUTSIDE the image area
        // Top panels for first two families, bottom panels for last two
        const panelWidth = 160;
        const panelSpacing = 20;
        
        const positions = [
            { x: width / 4, y: 50, vAlign: 'top' },              // Hymenoptera - top left
            { x: width * 3 / 4, y: 50, vAlign: 'top' },          // Diptera - top right
            { x: width / 4, y: height - 50, vAlign: 'bottom' },  // Lepidoptera - bottom left
            { x: width * 3 / 4, y: height - 50, vAlign: 'bottom' } // Coleoptera - bottom right
        ];

        this.familyControls = [];

        SUPERFAMILIES.forEach((superfamily, index) => {
            const pos = positions[index];
            const allInsectsInFamily = getInsectsBySuperfamily(superfamily);
            const currentInsectId = this.insectsByFamily[superfamily];
            
            const control = this.createFamilyControl(pos, superfamily, allInsectsInFamily, currentInsectId, index);
            this.familyControls.push(control);
        });
    }

    createFamilyControl(pos, superfamily, allInsects, currentInsectId, cornerIndex) {
        const panelWidth = 150;
        const panelHeight = 50 + (allInsects.length * 28);
        
        // Position based on vertical alignment
        let panelX = pos.x;
        let panelY = pos.vAlign === 'top' ? pos.y + panelHeight / 2 : pos.y - panelHeight / 2;
        
        // Panel background
        const panel = this.add.rectangle(panelX, panelY, panelWidth, panelHeight, 0x1a1a2e, 0.92);
        panel.setStrokeStyle(2, 0xffcc00);
        panel.setDepth(2000);
        
        // Family title
        const emoji = SUPERFAMILY_EMOJI[superfamily];
        const titleY = panelY - panelHeight / 2 + 15;
        this.add.text(panelX, titleY, `${emoji}`, {
            fontSize: '16px',
            color: '#ffcc00',
            align: 'center'
        }).setOrigin(0.5).setDepth(2001);
        
        // Species buttons
        const buttons = [];
        allInsects.forEach((insect, i) => {
            const buttonY = titleY + 28 + (i * 28);
            
            const isActive = insect.id === currentInsectId;
            const button = this.add.rectangle(panelX, buttonY, panelWidth - 8, 24, 
                isActive ? 0x00aa00 : 0x16213e, 0.9);
            button.setStrokeStyle(1, isActive ? 0x00ff00 : 0x0f3460);
            button.setInteractive({ useHandCursor: true });
            button.setDepth(2001);
            
            // Insect name
            this.add.text(panelX, buttonY, insect.name, {
                fontSize: '9px',
                color: '#ffffff',
                align: 'center'
            }).setOrigin(0.5).setDepth(2002);
            
            // Click to switch
            button.on('pointerdown', () => {
                this.switchInsect(cornerIndex, insect.id);
            });
            
            buttons.push({ button, insectId: insect.id });
        });
        
        return { panel, superfamily, buttons, cornerIndex };
    }

    createSpectralCoveragePanel(width, height) {
        // Panel showing which spectral channels are covered by current insects
        const panelX = width / 2;
        const panelY = height - 50;
        
        // Background
        this.add.rectangle(panelX, panelY, 500, 60, 0x000000, 0.85).setDepth(2500);
        
        // Title
        this.add.text(panelX - 240, panelY - 20, 'Spectral Vision Coverage:', {
            fontSize: '12px',
            color: '#ffcc00',
            fontStyle: 'bold'
        }).setDepth(2501);
        
        // Channel indicators
        const channels = ['UV', 'B', 'G', 'R'];
        const startX = panelX - 180;
        
        this.channelIndicators = {};
        
        channels.forEach((channel, i) => {
            const x = startX + i * 100;
            
            // Channel label
            this.add.text(x, panelY - 15, COLOR_CHANNELS[channel].name, {
                fontSize: '10px',
                color: '#aaaaaa'
            }).setDepth(2501);
            
            // Channel status circle
            const circle = this.add.circle(x + 45, panelY - 10, 8, 0x333333).setDepth(2501);
            circle.setStrokeStyle(2, COLOR_CHANNELS[channel].color);
            
            // Coverage indicator (will show which insects see this)
            const coverageText = this.add.text(x, panelY + 10, '', {
                fontSize: '9px',
                color: '#888888'
            }).setDepth(2501);
            
            this.channelIndicators[channel] = {
                circle: circle,
                text: coverageText
            };
        });
        
        // Update initial coverage
        this.updateSpectralCoverage();
    }

    updateSpectralCoverage() {
        // Check which channels are covered by current insects
        const coverage = {
            'UV': [],
            'B': [],
            'G': [],
            'R': []
        };
        
        this.insects.forEach(insect => {
            insect.data.colorSpectrum.forEach(channel => {
                const emoji = SUPERFAMILY_EMOJI[insect.superfamily];
                coverage[channel].push(emoji);
            });
        });
        
        // Update visual indicators
        Object.keys(coverage).forEach(channel => {
            const indicator = this.channelIndicators[channel];
            const count = coverage[channel].length;
            
            if (count > 0) {
                // Channel is covered - show green
                indicator.circle.setFillStyle(COLOR_CHANNELS[channel].color, 0.6);
                indicator.text.setText(coverage[channel].join(' '));
                indicator.text.setColor('#00ff00');
            } else {
                // Channel not covered - show warning
                indicator.circle.setFillStyle(0x333333);
                indicator.text.setText('MISSING!');
                indicator.text.setColor('#ff0000');
            }
        });
        
        // Check if all channels covered
        const allCovered = Object.values(coverage).every(arr => arr.length > 0);
        if (allCovered) {
            console.log('✅ All spectral channels covered! Flower fully visible!');
        } else {
            const missing = Object.keys(coverage).filter(ch => coverage[ch].length === 0);
            console.log('⚠️ Missing channels:', missing.join(', '));
        }
    }

    switchInsect(cornerIndex, newInsectId) {
        const insect = this.insects[cornerIndex];
        const newData = INSECT_DATABASE[newInsectId];
        
        console.log(`Switching ${insect.superfamily} from ${insect.data.name} to ${newData.name}`);
        
        // Update insect data
        insect.data = newData;
        insect.insectId = newInsectId;
        this.insectsByFamily[insect.superfamily] = newInsectId;
        
        // Update emoji
        const emoji = SUPERFAMILY_EMOJI[newData.superfamily];
        insect.sprite.setText(emoji);
        
        // Update spectrum indicators
        insect.spectrumIndicators.forEach(ind => ind.destroy());
        insect.spectrumIndicators = this.createSpectrumIndicators(
            insect.sprite.x, 
            insect.sprite.y + 30, 
            newData.colorSpectrum
        );
        
        // Update control panel buttons
        const control = this.familyControls[cornerIndex];
        control.buttons.forEach(({ button, insectId }) => {
            if (insectId === newInsectId) {
                button.setFillStyle(0x00aa00, 0.9);
                button.setStrokeStyle(2, 0x00ff00);
            } else {
                button.setFillStyle(0x16213e, 0.9);
                button.setStrokeStyle(2, 0x0f3460);
            }
        });
        
        // Update spectral coverage display
        this.updateSpectralCoverage();
    }

    setupInputHandlers() {
        // Enable keyboard for shift detection
        this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        
        // Left-click for everything (mobile-friendly)
        this.input.on('pointerdown', (pointer) => {
            // Check if clicked on an insect first
            let clickedInsect = false;
            this.insects.forEach((insect, index) => {
                const dx = pointer.x - insect.sprite.x;
                const dy = pointer.y - insect.sprite.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 30) {
                    this.selectInsect(index, this.shiftKey.isDown);
                    clickedInsect = true;
                }
            });
            
            // If didn't click insect and have selection, add waypoint
            if (!clickedInsect && this.selectedInsectIndices.length > 0) {
                this.addWaypoint(pointer.x, pointer.y);
            }
        });
    }

    selectInsect(index, addToSelection = false) {
        if (addToSelection) {
            // Multi-select with Shift
            const idx = this.selectedInsectIndices.indexOf(index);
            if (idx > -1) {
                this.selectedInsectIndices.splice(idx, 1);
                this.insects[index].isSelected = false;
                this.insects[index].selectionRing.setAlpha(0);
                // Clear path when deselecting
                this.insects[index].pathGraphics.clear();
            } else {
                this.selectedInsectIndices.push(index);
                this.insects[index].isSelected = true;
                this.insects[index].selectionRing.setAlpha(1);
                // Redraw path when selecting
                this.drawPath(this.insects[index]);
            }
        } else {
            // Single select - deselect all others
            this.insects.forEach(insect => {
                insect.isSelected = false;
                insect.selectionRing.setAlpha(0);
                // Clear all paths
                insect.pathGraphics.clear();
            });
            
            this.selectedInsectIndices = [index];
            this.insects[index].isSelected = true;
            this.insects[index].selectionRing.setAlpha(1);
            // Redraw path for newly selected
            this.drawPath(this.insects[index]);
        }
        
        console.log('Selected insects:', this.selectedInsectIndices);
    }

    addWaypoint(x, y) {
        if (this.selectedInsectIndices.length === 0) {
            console.log('No insects selected');
            return;
        }
        
        console.log(`Adding waypoint at (${x}, ${y}) for ${this.selectedInsectIndices.length} insect(s)`);
        
        // Add waypoint to all selected insects
        this.selectedInsectIndices.forEach(index => {
            const insect = this.insects[index];
            insect.waypoints.push({ x, y });
            this.drawPath(insect);
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
            
            // Draw waypoint marker
            insect.pathGraphics.fillStyle(0x00ff00, 0.8);
            insect.pathGraphics.fillCircle(waypoint.x, waypoint.y, 8);
            insect.pathGraphics.fillStyle(0xffffff, 1);
            insect.pathGraphics.fillCircle(waypoint.x, waypoint.y, 4);
            
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
        this.insects.forEach(insect => {
            // Track movement for temporal resolution
            const dx = insect.sprite.x - insect.lastPosition.x;
            const dy = insect.sprite.y - insect.lastPosition.y;
            const distanceMoved = Math.sqrt(dx * dx + dy * dy);
            
            if (distanceMoved < 0.5) {
                // Stationary - increase focus (temporal resolution)
                // INVERSE relationship: Fast insects (high speed) have INSTANT blur, slow insects take time to focus
                // Higher ommatidia = faster temporal resolution (compound eyes process faster)
                const temporalResolution = insect.data.ommatidia / 6000; // 0.08 to 2.0
                const focusSpeed = temporalResolution * 0.0008; // Fast eyes focus quickly
                insect.timeAtPosition += delta;
                insect.focusLevel = Math.min(1, insect.focusLevel + focusSpeed * delta);
            } else {
                // Moving - instant partial reveal for fast insects, delay for slow
                // Fast insects see blurry immediately, slow insects need to stop
                insect.timeAtPosition = 0;
                const movementVision = insect.data.speed / 5; // Speed 5 = 1.0, Speed 1 = 0.2
                insect.focusLevel = Math.max(movementVision * 0.4, insect.focusLevel - 0.002 * delta);
            }
            
            insect.lastPosition.x = insect.sprite.x;
            insect.lastPosition.y = insect.sprite.y;
            
            // Move along waypoint path
            if (insect.waypoints.length > 0) {
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
            
            // Update focus ring based on focus level
            insect.focusRing.x = insect.sprite.x;
            insect.focusRing.y = insect.sprite.y;
            insect.focusRing.setAlpha(insect.focusLevel * 0.8);
            
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
        const baseRadius = insect.data.defogRadius;
        
        // Calculate blur based on ommatidia count
        const ommatidiaRatio = Math.min(1, insect.data.ommatidia / 6000);
        const blurRadius = Math.max(3, 30 * (1 - ommatidiaRatio));
        
        // Adjust reveal radius based on focus level (temporal resolution)
        const effectiveRadius = baseRadius * insect.focusLevel;
        
        // Only defog if insect has some focus
        const minFocus = 0.15;
        if (insect.focusLevel < minFocus) return;
        
        // Get spectral weights for this insect
        const weights = insect.data.spectralWeights || { r: 0.33, g: 0.33, b: 0.33 };
        
        // Defog each RGB channel proportional to spectral sensitivity
        ['R', 'G', 'B'].forEach(channel => {
            const fogLayer = this.fogLayers[channel];
            if (!fogLayer) return;
            
            // Get weight for this channel (r/g/b)
            const channelKey = channel.toLowerCase();
            const weight = weights[channelKey] || 0;
            
            if (weight < 0.01) return; // Skip if no sensitivity
            
            // Create blurred reveal - gradient from center outward
            const graphics = this.make.graphics();
            
            // Reduced steps for better performance
            const steps = Math.min(10, Math.ceil(blurRadius));
            for (let i = 0; i < steps; i++) {
                const ratio = i / steps;
                const currentRadius = effectiveRadius * (1 - ratio * 0.3);
                
                // Alpha scales with BOTH focus AND spectral sensitivity
                const baseAlpha = insect.focusLevel * (1 - ratio) * 0.5;
                const weightedAlpha = baseAlpha * weight;
                
                graphics.fillStyle(0xffffff, weightedAlpha);
                graphics.fillCircle(x, y, currentRadius);
            }
            
            // Erase from this specific color channel's fog
            fogLayer.erase(graphics);
            graphics.destroy();
        });
    }
}
