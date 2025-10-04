import { INSECT_DATABASE, SUPERFAMILIES, getInsectsBySuperfamily } from '../data/insectDatabase.js';

export class InsectSelection extends Phaser.Scene {
    constructor() {
        super('InsectSelection');
        this.selectedInsects = [];
        this.maxSelection = 3;
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        // Background
        this.add.rectangle(0, 0, width, height, 0x0a0a1a).setOrigin(0);

        // Title
        this.add.text(width / 2, 50, 'ERGo! - Entomology Research Go!', {
            fontSize: '48px',
            color: '#ffaa00',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(width / 2, 110, 'Select 3 Insects to Explore the Hidden Image', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Selection counter
        this.selectionText = this.add.text(width / 2, 150, `Selected: 0/${this.maxSelection}`, {
            fontSize: '20px',
            color: '#88ff88'
        }).setOrigin(0.5);

        // Create insect selection grid by superfamily
        const startY = 200;
        const columnWidth = width / 4;
        
        SUPERFAMILIES.forEach((superfamily, colIndex) => {
            const x = columnWidth * colIndex + columnWidth / 2;
            
            // Superfamily header
            this.add.text(x, startY, superfamily, {
                fontSize: '20px',
                color: '#ffaa00',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            // Get insects in this superfamily
            const insects = getInsectsBySuperfamily(superfamily);
            
            // Display each insect
            insects.forEach((insect, rowIndex) => {
                const y = startY + 40 + (rowIndex * 110);
                this.createInsectCard(insect, x, y);
            });
        });

        // Start button (initially disabled)
        this.startButton = this.add.rectangle(width / 2, height - 50, 200, 50, 0x44aa44)
            .setInteractive({ useHandCursor: true })
            .setAlpha(0.3);
        
        this.startButtonText = this.add.text(width / 2, height - 50, 'START GAME', {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.startButton.on('pointerdown', () => {
            if (this.selectedInsects.length === this.maxSelection) {
                this.startGame();
            }
        });
    }

    createInsectCard(insect, x, y) {
        const cardWidth = 240;
        const cardHeight = 100;
        
        // Card background
        const card = this.add.rectangle(x, y, cardWidth, cardHeight, 0x1a1a2a, 0.8)
            .setStrokeStyle(2, 0x444466)
            .setInteractive({ useHandCursor: true });

        // Insect icon (colored circle representing the insect)
        const icon = this.add.circle(x - cardWidth / 2 + 30, y, 20, insect.color);

        // Insect name
        const nameText = this.add.text(x - cardWidth / 2 + 60, y - 30, insect.name, {
            fontSize: '14px',
            color: '#ffffff',
            fontStyle: 'bold',
            wordWrap: { width: cardWidth - 70 }
        });

        // Scientific name
        const sciName = this.add.text(x - cardWidth / 2 + 60, y - 10, insect.scientificName, {
            fontSize: '11px',
            color: '#aaaaaa',
            fontStyle: 'italic',
            wordWrap: { width: cardWidth - 70 }
        });

        // Attributes
        const attrs = this.add.text(x - cardWidth / 2 + 60, y + 10, 
            `Speed: ${insect.speed}/5\nVision: ${this.getVisionQuality(insect.visualResolution)}\nColors: ${insect.colorSpectrum.join(', ')}`, {
            fontSize: '10px',
            color: '#88aaff'
        });

        // Selection indicator
        const selectionBorder = this.add.rectangle(x, y, cardWidth, cardHeight)
            .setStrokeStyle(4, 0x00ff00)
            .setVisible(false);

        // Store reference to selection state
        card.insectData = insect;
        card.selectionBorder = selectionBorder;
        card.isSelected = false;

        // Click handler
        card.on('pointerdown', () => {
            this.toggleInsectSelection(card);
        });

        // Hover effect
        card.on('pointerover', () => {
            card.setFillStyle(0x2a2a3a);
            this.showInsectInfo(insect);
        });

        card.on('pointerout', () => {
            if (!card.isSelected) {
                card.setFillStyle(0x1a1a2a);
            }
        });
    }

    toggleInsectSelection(card) {
        if (card.isSelected) {
            // Deselect
            card.isSelected = false;
            card.selectionBorder.setVisible(false);
            card.setFillStyle(0x1a1a2a);
            
            const index = this.selectedInsects.findIndex(i => i.id === card.insectData.id);
            if (index > -1) {
                this.selectedInsects.splice(index, 1);
            }
        } else {
            // Select (if not at max)
            if (this.selectedInsects.length < this.maxSelection) {
                card.isSelected = true;
                card.selectionBorder.setVisible(true);
                card.setFillStyle(0x2a3a2a);
                this.selectedInsects.push(card.insectData);
            }
        }

        // Update UI
        this.updateSelectionUI();
    }

    updateSelectionUI() {
        this.selectionText.setText(`Selected: ${this.selectedInsects.length}/${this.maxSelection}`);
        
        // Enable/disable start button
        if (this.selectedInsects.length === this.maxSelection) {
            this.startButton.setAlpha(1).setFillStyle(0x44aa44);
        } else {
            this.startButton.setAlpha(0.3).setFillStyle(0x444444);
        }
    }

    showInsectInfo(insect) {
        // Could show detailed info panel here
        // For now, just log to console
        console.log('Insect:', insect.name, insect.funFact);
    }

    getVisionQuality(resolution) {
        if (resolution < 3000) return 'Low';
        if (resolution < 7000) return 'Medium';
        if (resolution < 15000) return 'High';
        return 'Excellent';
    }

    startGame() {
        // Pass selected insects to game scene
        this.scene.start('DefogGame', { 
            selectedInsects: this.selectedInsects 
        });
    }
}
