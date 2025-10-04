import { INSECT_DATABASE, SUPERFAMILIES, SUPERFAMILY_EMOJI, COLOR_CHANNELS } from '../data/insectDatabaseReal.js';

export class InsectSelection extends Phaser.Scene {
    constructor() {
        super({ key: 'InsectSelection' });
        this.selectedInsects = [];
        this.selectedByFamily = {}; // Track which insect is selected per family
    }

    create() {
        console.log("=== InsectSelection CREATE (Enhanced) ===");
        
        const { width, height } = this.cameras.main;

        // Background gradient
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x0f3460, 0x0f3460, 1);
        graphics.fillRect(0, 0, width, height);

        // Title with shadow
        this.add.text(width / 2, 50, '🔬 ERGo! - Insect Vision Explorer 🔬', {
            fontSize: '42px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffcc00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Subtitle
        this.add.text(width / 2, 95, 'Select ONE insect from EACH family (4 total)', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffcc00',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Spectral coverage hint
        this.add.text(width / 2, 120, '🌈 Goal: Cover all color channels (UV-Blue-Green-Red) to see the flower!', {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            color: '#4ecdc4'
        }).setOrigin(0.5);

        // Create grid for superfamilies
        const columnWidth = width / 4;
        const headerY = 150;
        const cardsStartY = 200;

        SUPERFAMILIES.forEach((superfamily, colIndex) => {
            const columnX = columnWidth * (colIndex + 0.5);
            
            // Superfamily header with emoji - positioned above cards
            const emoji = SUPERFAMILY_EMOJI[superfamily];
            const headerText = this.add.text(columnX, headerY, `${emoji} ${superfamily}`, {
                fontSize: '20px',
                fontFamily: 'Arial, sans-serif',
                color: '#ffcc00',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5).setDepth(1000);
            
            // Store header reference for updating selection status
            if (!this.familyHeaders) this.familyHeaders = {};
            this.familyHeaders[superfamily] = headerText;

            // Get insects in this superfamily
            const insects = this.getInsectsBySuperfamily(superfamily);
            
            insects.forEach((insect, rowIndex) => {
                const cardY = cardsStartY + (rowIndex * 135);
                this.createInsectCard(columnX, cardY, insect.id, insect);
            });
        });

        // Start button with glow
        const buttonY = height - 70;
        const buttonWidth = 300;
        const buttonHeight = 50;
        
        this.startButton = this.add.rectangle(width / 2, buttonY, buttonWidth, buttonHeight, 0x555555, 0.8);
        this.startButton.setStrokeStyle(3, 0x333333);
        
        this.startButtonText = this.add.text(width / 2, buttonY, 'Select one from each family', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#888888',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        this.startButton.on('pointerdown', () => this.startGame());
        
        // Create spectral coverage preview above button
        this.createSpectralPreview(width, buttonY - 50);
    }

    getInsectsBySuperfamily(superfamily) {
        return Object.entries(INSECT_DATABASE)
            .filter(([key, insect]) => insect.superfamily === superfamily)
            .map(([key, insect]) => ({ id: key, ...insect }));
    }

    createInsectCard(x, y, insectId, insectData) {
        const cardWidth = 250;
        const cardHeight = 115;
        
        // Card background - THIS is the interactive element
        const card = this.add.rectangle(x, y, cardWidth, cardHeight, 0x16213e, 0.95);
        card.setStrokeStyle(2, 0x0f3460);
        card.setInteractive({ useHandCursor: true });
        
        // Store data on the card itself
        card.insectId = insectId;
        card.superfamily = insectData.superfamily;
        
        // Insect name
        this.add.text(x, y - 38, insectData.name, {
            fontSize: '15px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Scientific name
        this.add.text(x, y - 22, insectData.scientificName, {
            fontSize: '11px',
            fontFamily: 'Arial, sans-serif',
            color: '#aaaaaa',
            fontStyle: 'italic'
        }).setOrigin(0.5);
        
        // Ommatidia count
        this.add.text(x, y - 3, `👁️ ${insectData.ommatidia.toLocaleString()} ommatidia`, {
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            color: '#4ecdc4',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Size and speed
        this.add.text(x, y + 13, `📏 ${insectData.size} | ⚡ Speed: ${insectData.speed}/5`, {
            fontSize: '10px',
            fontFamily: 'Arial, sans-serif',
            color: '#cccccc'
        }).setOrigin(0.5);
        
        // Color vision spectrum
        this.add.text(x, y + 27, `🌈 Vision: ${insectData.colorSpectrum.join('-')}`, {
            fontSize: '10px',
            fontFamily: 'Arial, sans-serif',
            color: '#ff6b6b'
        }).setOrigin(0.5);
        
        // iNaturalist observations
        if (insectData.iNaturalist) {
            this.add.text(x, y + 41, `🔍 ${insectData.iNaturalist.toLocaleString()} obs`, {
                fontSize: '9px',
                fontFamily: 'Arial, sans-serif',
                color: '#95e1d3'
            }).setOrigin(0.5);
        }

        // Interaction handlers
        card.on('pointerover', () => {
            if (!this.selectedInsects.includes(insectId)) {
                card.setFillStyle(0x1f4068, 1);
            }
        });
        
        card.on('pointerout', () => {
            if (!this.selectedInsects.includes(insectId)) {
                card.setFillStyle(0x16213e, 0.95);
            }
        });
        
        card.on('pointerdown', () => {
            this.toggleInsectSelection(insectId, card);
        });
    }

    toggleInsectSelection(insectId, card) {
        const superfamily = card.superfamily;
        const index = this.selectedInsects.indexOf(insectId);
        
        if (index > -1) {
            // Deselect
            this.selectedInsects.splice(index, 1);
            delete this.selectedByFamily[superfamily];
            card.setStrokeStyle(2, 0x0f3460);
            card.setFillStyle(0x16213e, 0.95);
        } else {
            // Check if this family already has a selection
            if (this.selectedByFamily[superfamily]) {
                // Deselect the previous one from this family first
                const prevIndex = this.selectedInsects.indexOf(this.selectedByFamily[superfamily]);
                if (prevIndex > -1) {
                    this.selectedInsects.splice(prevIndex, 1);
                }
            }
            
            // Select this one
            this.selectedInsects.push(insectId);
            this.selectedByFamily[superfamily] = insectId;
            card.setStrokeStyle(5, 0x00ff00);
            card.setFillStyle(0x1f4068, 1);
        }
        
        // Update family headers to show selection status
        this.updateFamilyHeaders();
        
        console.log('Selected insects:', this.selectedInsects);
        console.log('By family:', this.selectedByFamily);
        this.updateStartButton();
    }

    updateFamilyHeaders() {
        SUPERFAMILIES.forEach(superfamily => {
            const header = this.familyHeaders[superfamily];
            const emoji = SUPERFAMILY_EMOJI[superfamily];
            if (this.selectedByFamily[superfamily]) {
                header.setText(`✅ ${emoji} ${superfamily}`);
                header.setColor('#00ff00');
            } else {
                header.setText(`${emoji} ${superfamily}`);
                header.setColor('#ffcc00');
            }
        });
        
        // Update spectral coverage preview
        if (this.spectralPreview) {
            this.updateSpectralPreview();
        }
    }

    createSpectralPreview(width, y) {
        // Show which color channels will be covered by selected insects
        this.add.text(width / 2, y - 20, 'Spectral Coverage:', {
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            color: '#aaaaaa'
        }).setOrigin(0.5);
        
        const channels = ['UV', 'B', 'G', 'R'];
        const startX = width / 2 - 150;
        
        this.spectralPreview = {};
        
        channels.forEach((channel, i) => {
            const x = startX + i * 80;
            
            // Channel circle
            const circle = this.add.circle(x, y, 10, 0x333333);
            circle.setStrokeStyle(2, COLOR_CHANNELS[channel].color);
            
            // Channel label
            this.add.text(x, y + 20, channel, {
                fontSize: '10px',
                fontFamily: 'Arial, sans-serif',
                color: '#888888'
            }).setOrigin(0.5);
            
            this.spectralPreview[channel] = circle;
        });
        
        this.updateSpectralPreview();
    }

    updateSpectralPreview() {
        // Check which channels are covered by currently selected insects
        const coverage = {
            'UV': false,
            'B': false,
            'G': false,
            'R': false
        };
        
        this.selectedInsects.forEach(insectId => {
            const insectData = INSECT_DATABASE[insectId];
            insectData.colorSpectrum.forEach(channel => {
                coverage[channel] = true;
            });
        });
        
        // Update visual indicators
        Object.keys(coverage).forEach(channel => {
            const circle = this.spectralPreview[channel];
            if (coverage[channel]) {
                circle.setFillStyle(COLOR_CHANNELS[channel].color, 0.7);
            } else {
                circle.setFillStyle(0x333333);
            }
        });
    }

    updateStartButton() {
        if (this.selectedInsects.length === 4) {
            this.startButton.setFillStyle(0x00ff00, 1);
            this.startButton.setStrokeStyle(4, 0x00aa00);
            this.startButtonText.setColor('#000000');
            this.startButtonText.setText('START GAME');
            this.startButton.setInteractive({ useHandCursor: true });
        } else {
            const count = this.selectedInsects.length;
            this.startButton.setFillStyle(0x555555, 0.8);
            this.startButton.setStrokeStyle(3, 0x333333);
            this.startButtonText.setColor('#888888');
            this.startButtonText.setText(`Selected ${count}/4 - Pick one from each family`);
            this.startButton.removeInteractive();
        }
    }

    startGame() {
        if (this.selectedInsects.length === 4) {
            console.log("Starting game with insects:", this.selectedInsects);
            this.scene.start('DefogGame', { selectedInsects: this.selectedInsects });
        }
    }
}
