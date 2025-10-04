import { INSECT_DATABASE, SUPERFAMILY_EMOJI, COLOR_CHANNELS } from '../data/insectDatabaseReal.js';

export class DefogGame extends Phaser.Scene {

    constructor() {
        super('DefogGame');
    }

    init(data) {
        this.selectedInsects = data.selectedInsects || [];
        console.log('=== GAME STARTING ===');
        console.log('Selected insect IDs:', this.selectedInsects);
        
        // Get full insect data from database
        this.insectDataList = this.selectedInsects.map(id => INSECT_DATABASE[id]);
        console.log('Insect data loaded:', this.insectDataList.map(i => i.name));
        
        // Control state
        this.activeInsect = null; // null = all insects follow cursor
        this.controlMode = 'all'; // 'all' or 'single'
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
        this.add.rectangle(0, 0, width, height, 0x222222).setOrigin(0);

        // Add the image
        this.hiddenImage = this.add.image(width / 2, height / 2, 'hiddenImage');
        const scale = Math.min(width / this.hiddenImage.width, height / this.hiddenImage.height);
        this.hiddenImage.setScale(scale);

        // Create separate fog layers for each color channel
        this.fogLayers = {};
        this.createColorFogLayers(width, height);

        // Create insects in corners with emojis
        this.insects = [];
        this.cursorPos = { x: width / 2, y: height / 2 };
        this.createInsects(width, height);

        // Create side panel for insect control
        this.createControlPanel(width, height);

        // Mouse tracking
        this.input.on('pointermove', (pointer) => {
            this.cursorPos.x = pointer.x;
            this.cursorPos.y = pointer.y;
        });

        // Instructions
        this.add.text(width / 2, 30, 'Click insects to control individually | All follow cursor by default', {
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#000000aa',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setDepth(2000);

        console.log('=== CREATE COMPLETE ===');
    }

    createColorFogLayers(width, height) {
        // Create fog layers for R, G, B, UV channels
        const channels = ['R', 'G', 'B', 'UV'];
        
        channels.forEach(channel => {
            const fogLayer = this.add.renderTexture(0, 0, width, height);
            fogLayer.setOrigin(0, 0);
            
            // Fill with color based on channel
            const channelColor = COLOR_CHANNELS[channel].color;
            fogLayer.fill(channelColor, 0.8); // Semi-transparent color fog
            fogLayer.setBlendMode(Phaser.BlendModes.MULTIPLY);
            
            this.fogLayers[channel] = fogLayer;
        });
        
        console.log('Color fog layers created:', Object.keys(this.fogLayers));
    }

    createInsects(width, height) {
        // Position insects in corners
        const corners = [
            { x: 100, y: 100 },           // Top-left
            { x: width - 100, y: 100 },   // Top-right
            { x: 100, y: height - 100 },  // Bottom-left
            { x: width - 100, y: height - 100 } // Bottom-right
        ];

        this.insectDataList.forEach((insectData, index) => {
            const pos = corners[index];
            
            // Create emoji text for insect
            const emoji = SUPERFAMILY_EMOJI[insectData.superfamily];
            const insectSprite = this.add.text(pos.x, pos.y, emoji, {
                fontSize: '48px'
            }).setOrigin(0.5);
            
            // Make insect clickable
            insectSprite.setInteractive({ useHandCursor: true });
            insectSprite.on('pointerdown', () => {
                this.selectInsect(index);
            });
            
            // Create colored circles for spectral sensitivities
            const spectrumIndicators = this.createSpectrumIndicators(pos.x, pos.y + 35, insectData.colorSpectrum);
            
            // Selection indicator (ring around insect)
            const selectionRing = this.add.circle(pos.x, pos.y, 30, 0xffffff, 0);
            selectionRing.setStrokeStyle(3, 0x00ff00);
            
            this.insects.push({
                sprite: insectSprite,
                selectionRing: selectionRing,
                data: insectData,
                index: index,
                spectrumIndicators: spectrumIndicators,
                isSelected: false
            });
            
            console.log(`Created ${insectData.name} (${emoji}) at corner ${index} with spectrum: ${insectData.colorSpectrum.join(',')}`);
        });
    }

    createSpectrumIndicators(x, y, colorSpectrum) {
        // Create small colored circles showing which colors this insect can see
        const indicators = [];
        const spacing = 18;
        const startX = x - (colorSpectrum.length * spacing / 2);
        
        colorSpectrum.forEach((channel, i) => {
            const channelColor = COLOR_CHANNELS[channel].color;
            const circle = this.add.circle(startX + i * spacing, y, 6, channelColor);
            circle.setStrokeStyle(1, 0xffffff);
            indicators.push(circle);
        });
        
        return indicators;
    }

    createControlPanel(width, height) {
        // Side panel on the right
        const panelX = width - 150;
        const panelY = height / 2;
        
        // Panel background
        const panel = this.add.rectangle(panelX, panelY, 140, height - 100, 0x1a1a2e, 0.9);
        panel.setStrokeStyle(2, 0xffcc00);
        panel.setDepth(1000);
        
        // Title
        this.add.text(panelX, 60, 'INSECTS', {
            fontSize: '18px',
            color: '#ffcc00',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(1001);
        
        // Create buttons for each insect
        this.insectDataList.forEach((insectData, index) => {
            const buttonY = 120 + index * 80;
            const emoji = SUPERFAMILY_EMOJI[insectData.superfamily];
            
            // Button background
            const button = this.add.rectangle(panelX, buttonY, 120, 70, 0x16213e, 0.9);
            button.setStrokeStyle(2, 0x0f3460);
            button.setInteractive({ useHandCursor: true });
            button.setDepth(1001);
            
            // Emoji
            this.add.text(panelX, buttonY - 15, emoji, {
                fontSize: '32px'
            }).setOrigin(0.5).setDepth(1002);
            
            // Name
            this.add.text(panelX, buttonY + 20, insectData.name, {
                fontSize: '10px',
                color: '#ffffff',
                wordWrap: { width: 110 },
                align: 'center'
            }).setOrigin(0.5).setDepth(1002);
            
            // Click handler
            button.on('pointerdown', () => {
                this.selectInsect(index);
            });
            
            // Store for updating selection state
            if (!this.panelButtons) this.panelButtons = [];
            this.panelButtons.push(button);
        });
        
        // "All insects" button at bottom
        const allButtonY = height - 80;
        const allButton = this.add.rectangle(panelX, allButtonY, 120, 50, 0x00aa00, 0.9);
        allButton.setStrokeStyle(2, 0x00ff00);
        allButton.setInteractive({ useHandCursor: true });
        allButton.setDepth(1001);
        
        this.add.text(panelX, allButtonY, 'ALL\nINSECTS', {
            fontSize: '14px',
            color: '#ffffff',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5).setDepth(1002);
        
        allButton.on('pointerdown', () => {
            this.selectAllInsects();
        });
        
        this.allInsectsButton = allButton;
    }

    selectInsect(index) {
        console.log(`Selected insect ${index}: ${this.insects[index].data.name}`);
        
        // Deselect all
        this.insects.forEach(insect => {
            insect.isSelected = false;
            insect.selectionRing.setAlpha(0);
        });
        
        // Update panel buttons
        if (this.panelButtons) {
            this.panelButtons.forEach(btn => btn.setStrokeStyle(2, 0x0f3460));
        }
        
        // Select this one
        this.insects[index].isSelected = true;
        this.insects[index].selectionRing.setAlpha(1);
        this.activeInsect = index;
        this.controlMode = 'single';
        
        if (this.panelButtons) {
            this.panelButtons[index].setStrokeStyle(3, 0x00ff00);
        }
        
        // Update all button
        this.allInsectsButton.setFillStyle(0x555555, 0.9);
    }

    selectAllInsects() {
        console.log('All insects selected');
        
        // Deselect all individual
        this.insects.forEach(insect => {
            insect.isSelected = false;
            insect.selectionRing.setAlpha(0);
        });
        
        // Update panel buttons
        if (this.panelButtons) {
            this.panelButtons.forEach(btn => btn.setStrokeStyle(2, 0x0f3460));
        }
        
        this.activeInsect = null;
        this.controlMode = 'all';
        
        // Update all button
        this.allInsectsButton.setFillStyle(0x00aa00, 0.9);
    }

    update(time, delta) {
        if (this.controlMode === 'all') {
            // All insects follow cursor
            this.insects.forEach(insect => {
                this.moveInsectToward(insect, this.cursorPos.x, this.cursorPos.y, delta);
                this.defogAtInsect(insect);
            });
        } else if (this.activeInsect !== null) {
            // Only selected insect follows cursor
            const insect = this.insects[this.activeInsect];
            this.moveInsectToward(insect, this.cursorPos.x, this.cursorPos.y, delta);
            this.defogAtInsect(insect);
        }
    }

    moveInsectToward(insect, targetX, targetY, delta) {
        const speed = insect.data.speed * 0.15; // Use real speed from data
        const dx = targetX - insect.sprite.x;
        const dy = targetY - insect.sprite.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
            const moveDistance = Math.min(speed * delta, distance);
            insect.sprite.x += (dx / distance) * moveDistance;
            insect.sprite.y += (dy / distance) * moveDistance;
            
            // Move selection ring and spectrum indicators
            insect.selectionRing.x = insect.sprite.x;
            insect.selectionRing.y = insect.sprite.y;
            
            insect.spectrumIndicators.forEach((indicator, i) => {
                const spacing = 18;
                const startX = insect.sprite.x - (insect.spectrumIndicators.length * spacing / 2);
                indicator.x = startX + i * spacing;
                indicator.y = insect.sprite.y + 35;
            });
        }
    }

    defogAtInsect(insect) {
        const x = insect.sprite.x;
        const y = insect.sprite.y;
        const radius = insect.data.defogRadius;
        
        // Defog only the color channels this insect can see
        insect.data.colorSpectrum.forEach(channel => {
            if (this.fogLayers[channel]) {
                const graphics = this.make.graphics();
                graphics.fillStyle(0xffffff, 1);
                graphics.fillCircle(x, y, radius);
                
                // Erase from this color channel's fog layer
                this.fogLayers[channel].erase(graphics);
                graphics.destroy();
            }
        });
    }
}
