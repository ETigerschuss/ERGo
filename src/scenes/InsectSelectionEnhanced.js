import { INSECT_DATABASE, SUPERFAMILIES, SUPERFAMILY_EMOJI, COLOR_CHANNELS } from '../data/insectDatabaseReal.js';

export class InsectSelection extends Phaser.Scene {
    constructor() {
        super({ key: 'InsectSelection' });
        this.selectedFamily = null;
        this.selectedInsect = null;
    }

    create() {
        console.log("=== InsectSelection CREATE (v0.02 - Progression) ===");
        
        const { width, height } = this.cameras.main;

        // Background gradient
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x0f3460, 0x0f3460, 1);
        graphics.fillRect(0, 0, width, height);

        // Title
        this.add.text(width / 2, 50, '🔬 ERGo! - Insect Vision Explorer 🔬', {
            fontSize: '42px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffcc00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Subtitle
        this.add.text(width / 2, 95, 'v0.02 - Progression Mode', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#4ecdc4'
        }).setOrigin(0.5);

        // Show family selection screen
        this.showFamilySelection();
    }

    showFamilySelection() {
        const { width, height } = this.cameras.main;
        
        // Instruction
        this.add.text(width / 2, 140, 'Select a Superfamily:', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Only Hymenoptera is unlocked
        const unlockedFamily = 'Hymenoptera';
        
        // Create 4 family cards in a 2x2 grid
        const spacing = 280;
        const startX = width / 2 - spacing / 2;
        const startY = height / 2;
        
        SUPERFAMILIES.forEach((superfamily, index) => {
            const x = startX + (index % 2) * spacing;
            const y = startY + Math.floor(index / 2) * 200;
            const isUnlocked = superfamily === unlockedFamily;
            
            this.createFamilyCard(x, y, superfamily, isUnlocked);
        });
    }

    createFamilyCard(x, y, superfamily, isUnlocked) {
        const cardWidth = 240;
        const cardHeight = 160;
        
        // Card background
        const card = this.add.rectangle(x, y, cardWidth, cardHeight, 
            isUnlocked ? 0x16213e : 0x0a0a0a, 
            isUnlocked ? 0.95 : 0.5
        );
        card.setStrokeStyle(3, isUnlocked ? 0x00ff00 : 0x333333);
        
        // Emoji
        const emoji = SUPERFAMILY_EMOJI[superfamily];
        this.add.text(x, y - 40, emoji, {
            fontSize: '64px'
        }).setOrigin(0.5).setAlpha(isUnlocked ? 1 : 0.3);
        
        // Family name
        this.add.text(x, y + 30, superfamily, {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: isUnlocked ? '#ffcc00' : '#666666',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Lock icon or click prompt
        if (!isUnlocked) {
            this.add.text(x, y + 55, '🔒 Locked', {
                fontSize: '16px',
                fontFamily: 'Arial, sans-serif',
                color: '#666666'
            }).setOrigin(0.5);
        } else {
            this.add.text(x, y + 55, 'Click to select', {
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                color: '#4ecdc4'
            }).setOrigin(0.5);
            
            // Make it interactive
            card.setInteractive({ useHandCursor: true });
            card.on('pointerover', () => card.setFillStyle(0x1f4068, 1));
            card.on('pointerout', () => card.setFillStyle(0x16213e, 0.95));
            card.on('pointerdown', () => {
                this.selectedFamily = superfamily;
                this.showSpeciesSelection();
            });
        }
    }

    showSpeciesSelection() {
        // Clear the screen
        this.children.removeAll();
        
        const { width, height } = this.cameras.main;

        // Background gradient
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x0f3460, 0x0f3460, 1);
        graphics.fillRect(0, 0, width, height);

        // Title
        const emoji = SUPERFAMILY_EMOJI[this.selectedFamily];
        this.add.text(width / 2, 50, `${emoji} ${this.selectedFamily}`, {
            fontSize: '36px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffcc00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Instruction
        this.add.text(width / 2, 100, 'Select a Species:', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Get all species in this family
        const species = this.getInsectsBySuperfamily(this.selectedFamily);
        
        // Only ant is unlocked
        const unlockedSpecies = 'ant';
        
        // Create species cards in a row
        const spacing = 280;
        const startX = width / 2 - (spacing * (species.length - 1)) / 2;
        const y = height / 2 + 20;
        
        species.forEach((insect, index) => {
            const x = startX + index * spacing;
            const isUnlocked = insect.id === unlockedSpecies;
            this.createSpeciesCard(x, y, insect, isUnlocked);
        });

        // Back button
        const backBtn = this.add.text(40, height - 40, '← Back', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#4ecdc4',
            backgroundColor: '#1a1a2e',
            padding: { x: 15, y: 8 }
        }).setOrigin(0, 1).setInteractive({ useHandCursor: true });
        
        backBtn.on('pointerover', () => backBtn.setColor('#00ffff'));
        backBtn.on('pointerout', () => backBtn.setColor('#4ecdc4'));
        backBtn.on('pointerdown', () => {
            this.children.removeAll();
            this.create();
        });
    }

    createSpeciesCard(x, y, insect, isUnlocked) {
        const cardWidth = 260;
        const cardHeight = 320;
        
        // Card background
        const card = this.add.rectangle(x, y, cardWidth, cardHeight, 
            isUnlocked ? 0x16213e : 0x0a0a0a, 
            isUnlocked ? 0.95 : 0.5
        );
        card.setStrokeStyle(3, isUnlocked ? 0x00ff00 : 0x333333);
        
        // Emoji (larger for species)
        const speciesEmojis = {
            'ant': '🐜',
            'honeybee': '🐝',
            'bumblebee': '🐝',
            'hornet': '🐝'
        };
        const emoji = speciesEmojis[insect.id] || '🐛';
        this.add.text(x, y - 100, emoji, {
            fontSize: '72px'
        }).setOrigin(0.5).setAlpha(isUnlocked ? 1 : 0.3);
        
        // Name
        this.add.text(x, y - 20, insect.name, {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: isUnlocked ? '#ffffff' : '#666666',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Scientific name
        this.add.text(x, y + 5, insect.scientificName, {
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            color: isUnlocked ? '#aaaaaa' : '#444444',
            fontStyle: 'italic'
        }).setOrigin(0.5);
        
        // Stats
        this.add.text(x, y + 35, `👁️ ${insect.ommatidia?.toLocaleString() || '?'} Ommatidien`, {
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            color: isUnlocked ? '#4ecdc4' : '#444444'
        }).setOrigin(0.5);
        
        this.add.text(x, y + 55, `⚡ Geschwindigkeit: ${insect.speed}/5`, {
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            color: isUnlocked ? '#cccccc' : '#444444'
        }).setOrigin(0.5);
        
        this.add.text(x, y + 75, `🌈 ${insect.colorSpectrum?.join('-') || 'Unbekannt'}`, {
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            color: isUnlocked ? '#ff6b6b' : '#444444'
        }).setOrigin(0.5);
        
        // Lock or Start button
        if (!isUnlocked) {
            this.add.text(x, y + 110, '🔒 Gesperrt', {
                fontSize: '18px',
                fontFamily: 'Arial, sans-serif',
                color: '#666666'
            }).setOrigin(0.5);
        } else {
            const startBtn = this.add.text(x, y + 110, '▶ Spiel starten', {
                fontSize: '18px',
                fontFamily: 'Arial, sans-serif',
                color: '#00ff00',
                backgroundColor: '#1a1a2e',
                padding: { x: 15, y: 8 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            
            startBtn.on('pointerover', () => startBtn.setColor('#00ffff'));
            startBtn.on('pointerout', () => startBtn.setColor('#00ff00'));
            startBtn.on('pointerdown', () => {
                this.selectedInsect = insect.id;
                this.startGame();
            });
        }
    }

    getInsectsBySuperfamily(superfamily) {
        return Object.entries(INSECT_DATABASE)
            .filter(([key, insect]) => insect.superfamily === superfamily)
            .map(([key, insect]) => ({ id: key, ...insect }));
    }

    startGame() {
        console.log('Starting game with:', this.selectedInsect);
        this.scene.start('DefogGame', { 
            selectedInsects: [this.selectedInsect]
        });
    }
}
