import { INSECT_DATABASE, SUPERFAMILY_EMOJI, SUPERFAMILIES } from '../data/insectDatabaseReal.js';

export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    preload() {
        // Load family detail images
        this.load.image('hymenoptera_detail', 'assets/Hymenoptera_Detail_faint.PNG');
        this.load.image('diptera_detail', 'assets/Diptera_Detail_faint.PNG');
        this.load.image('lepidoptera_detail', 'assets/Lepidoptera_Detail_faint.PNG');
        this.load.image('coleoptera_detail', 'assets/Coleoptera_Detail_faint.PNG');
        this.load.image('drosophila_drawing', 'assets/Drosophila melanogaster drawing.JPG');
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        // Dark background
        this.add.rectangle(0, 0, width, height, 0x0a0a14).setOrigin(0);

        // Game title
        this.add.text(width / 2, 60, 'ERGo! v0.02-dev', {
            fontSize: '48px',
            color: '#ffaa00',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(width / 2, 110, 'Explore the world through insect eyes', {
            fontSize: '18px',
            color: '#888888'
        }).setOrigin(0.5);

        // State: 'familySelect' or 'speciesSelect'
        this.currentState = 'familySelect';
        this.selectedFamily = null;
        this.selectedFamilyIndex = null;

        // Create family selection screen
        this.createFamilySelection(width, height);
    }

    createFamilySelection(width, height) {
        // Family selection container
        this.familyContainer = this.add.container(0, 0);

        this.add.text(width / 2, 120, 'Choose Your Family', {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Create 4 family panels in a 2x2 grid - FIT ALL 4 within 720px height
        const panelWidth = 240;  // Reasonable width
        const panelHeight = 250; // Fits 2 panels vertically: 150 + 250 + 15 + 250 = 665px
        const spacing = 15;      // Tight spacing
        const startX = width / 2 - panelWidth - spacing / 2;
        const startY = 150;      // Start position

        const positions = [
            { x: startX, y: startY },                               // Top-left: Hymenoptera
            { x: startX + panelWidth + spacing, y: startY },       // Top-right: Diptera
            { x: startX, y: startY + panelHeight + spacing },      // Bottom-left: Lepidoptera
            { x: startX + panelWidth + spacing, y: startY + panelHeight + spacing } // Bottom-right: Coleoptera
        ];

        // Species by family (matching game order, vision quality)
        const speciesByFamily = [
            ['ant', 'honeybee', 'bumblebee', 'hornet'],           // Hymenoptera
            ['vinegar_fly', 'housefly', 'robber_fly', 'horsefly'],  // Diptera
            ['hawk_moth', 'peacock', 'monarch', 'cabbage_white'], // Lepidoptera
            ['stag_beetle', 'firefly', 'ladybug', 'rose_chafer']  // Coleoptera
        ];

        this.familyPanels = [];

        SUPERFAMILIES.forEach((family, index) => {
            const pos = positions[index];
            const species = speciesByFamily[index];
            const firstSpecies = INSECT_DATABASE[species[0]];

            // Panel background
            const panel = this.add.rectangle(pos.x, pos.y, panelWidth, panelHeight, 0x16213e, 0.9)
                .setOrigin(0)
                .setStrokeStyle(3, 0x444444);

            // Family name and emoji
            const centerX = pos.x + panelWidth / 2;
            
            const familyEmoji = this.getFamilyEmoji(family);
            this.add.text(centerX, pos.y + 25, familyEmoji, {
                fontSize: '48px'
            }).setOrigin(0.5);

            this.add.text(centerX, pos.y + 80, family, {
                fontSize: '16px',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            // Key attributes
            const attrs = this.formatAttributes(firstSpecies);
            this.add.text(centerX, pos.y + 110, attrs, {
                fontSize: '9px',
                color: '#aaaaaa',
                align: 'center',
                lineSpacing: 2
            }).setOrigin(0.5);

            // "Click to Start" button
            const button = this.add.rectangle(centerX, pos.y + 210, 180, 26, 0x00aa44, 0.8)
                .setStrokeStyle(2, 0x00ff66);
            button.setInteractive({ useHandCursor: true });

            const buttonText = this.add.text(centerX, pos.y + 210, 'Click to Start', {
                fontSize: '12px',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            // Hover effects
            button.on('pointerover', () => {
                button.setFillStyle(0x00cc55, 1);
                panel.setStrokeStyle(3, 0x00ff66);
            });

            button.on('pointerout', () => {
                button.setFillStyle(0x00aa44, 0.8);
                panel.setStrokeStyle(3, 0x444444);
            });

            // Click handler
            button.on('pointerdown', () => {
                this.selectFamily(index, family, species);
            });

            // Store panel
            this.familyPanels.push({ 
                panel,
                button, 
                buttonText, 
                family, 
                index, 
                species 
            });
        });

        // Add ALL visual elements to container (not just panel/button/text)
        // This ensures everything is visible and managed together
    }

    formatAttributes(insectData) {
        // Format key attributes for display
        const ommatidia = insectData.ommatidia.toLocaleString();
        const colorVision = insectData.colorSpectrum.join('+');
        const receptorCount = insectData.spectrum.length;
        
        return `👁️ ${ommatidia} ommatidia\n` +
               `🎨 ${colorVision} (${receptorCount} receptors)\n` +
               `📏 Size: ${insectData.size}\n` +
               `⚡ Speed: ${insectData.speed}/5`;
    }

    selectFamily(familyIndex, familyName, speciesList) {
        console.log(`Selected family: ${familyName} (index ${familyIndex})`);
        
        this.selectedFamily = familyName;
        this.selectedFamilyIndex = familyIndex;

        // Transition to species selection screen
        this.createSpeciesSelection(familyIndex, familyName, speciesList);
    }

    createSpeciesSelection(familyIndex, familyName, speciesList) {
        const width = this.scale.width;
        const height = this.scale.height;

        // Clear family selection
        this.familyContainer.setVisible(false);

        // Species selection container
        this.speciesContainer = this.add.container(0, 0);

        // Header
        const emoji = SUPERFAMILY_EMOJI[familyName];
        this.add.text(width / 2, 80, `${emoji} ${familyName}`, {
            fontSize: '36px',
            color: '#ffaa00',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(width / 2, 130, 'You will progress through these species:', {
            fontSize: '16px',
            color: '#888888'
        }).setOrigin(0.5);

        // Show all 4 species in this family
        const cardWidth = 250;
        const cardHeight = 350;
        const spacing = 20;
        const startX = width / 2 - (cardWidth * 2 + spacing * 1.5);
        const startY = 180;

        speciesList.forEach((speciesId, index) => {
            const insectData = INSECT_DATABASE[speciesId];
            const posX = startX + (cardWidth + spacing) * index;

            // Card background
            const isFirst = (index === 0);
            const card = this.add.rectangle(posX, startY, cardWidth, cardHeight, isFirst ? 0x16213e : 0x0f1520, 0.95)
                .setOrigin(0)
                .setStrokeStyle(3, isFirst ? 0x00ff66 : 0x333333);

            const centerX = posX + cardWidth / 2;

            // Species number and emoji/image
            this.add.text(centerX, startY + 25, `${index + 1}/4`, {
                fontSize: '14px',
                color: isFirst ? '#00ff66' : '#666666',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            // Species emoji
            const speciesEmoji = this.getSpeciesEmoji(speciesId);
            this.add.text(centerX, startY + 60, speciesEmoji, {
                fontSize: '48px'
            }).setOrigin(0.5);

            // Species name
            this.add.text(centerX, startY + 115, insectData.name, {
                fontSize: '16px',
                color: '#ffffff',
                fontStyle: 'bold',
                align: 'center'
            }).setOrigin(0.5);

            this.add.text(centerX, startY + 140, insectData.scientificName, {
                fontSize: '11px',
                color: '#888888',
                fontStyle: 'italic',
                align: 'center'
            }).setOrigin(0.5);

            // Detailed attributes
            const detailedAttrs = this.formatDetailedAttributes(insectData);
            this.add.text(centerX, startY + 175, detailedAttrs, {
                fontSize: '11px',
                color: '#aaaaaa',
                align: 'left',
                lineSpacing: 3
            }).setOrigin(0.5, 0);

            // "Starting insect" badge
            if (isFirst) {
                this.add.text(centerX, startY + 310, '▶ STARTING INSECT', {
                    fontSize: '13px',
                    color: '#00ff66',
                    fontStyle: 'bold',
                    backgroundColor: '#003311',
                    padding: { x: 10, y: 5 }
                }).setOrigin(0.5);
            } else {
                this.add.text(centerX, startY + 310, `Unlocks later (${index}/4)`, {
                    fontSize: '11px',
                    color: '#666666'
                }).setOrigin(0.5);
            }
        });

        // Back button
        const backButton = this.add.rectangle(100, height - 60, 150, 40, 0x444444, 0.9)
            .setStrokeStyle(2, 0x666666);
        backButton.setInteractive({ useHandCursor: true });

        const backText = this.add.text(100, height - 60, '← Back', {
            fontSize: '16px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        backButton.on('pointerover', () => {
            backButton.setFillStyle(0x555555, 1);
        });

        backButton.on('pointerout', () => {
            backButton.setFillStyle(0x444444, 0.9);
        });

        backButton.on('pointerdown', () => {
            this.goBack();
        });

        // Start Game button
        const startButton = this.add.rectangle(width - 100, height - 60, 200, 50, 0x00aa44, 0.9)
            .setStrokeStyle(3, 0x00ff66);
        startButton.setInteractive({ useHandCursor: true });

        const startText = this.add.text(width - 100, height - 60, 'START GAME ▶', {
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        startButton.on('pointerover', () => {
            startButton.setFillStyle(0x00cc55, 1);
            startButton.setScale(1.05);
        });

        startButton.on('pointerout', () => {
            startButton.setFillStyle(0x00aa44, 0.9);
            startButton.setScale(1);
        });

        startButton.on('pointerdown', () => {
            this.startGame(familyIndex);
        });

        this.speciesContainer.add([backButton, backText, startButton, startText]);
    }

    formatDetailedAttributes(insectData) {
        // Detailed attributes with icons
        const ommatidia = insectData.ommatidia.toLocaleString();
        const colorVision = insectData.colorSpectrum.join('+');
        const receptorCount = insectData.spectrum.length;
        const lifespan = this.calculateLifespan(insectData);
        
        // Spectral sensitivity display
        const weights = insectData.spectralWeights;
        const weightStr = `R:${(weights.r * 100).toFixed(0)}% G:${(weights.g * 100).toFixed(0)}% B:${(weights.b * 100).toFixed(0)}%`;
        
        return `👁️  Ommatidia: ${ommatidia}\n` +
               `🎨  Color Vision: ${colorVision}\n` +
               `📡  Receptors: ${receptorCount} types\n` +
               `🌈  Sensitivity: ${weightStr}\n` +
               `📏  Size: ${insectData.size}\n` +
               `⚡  Speed: ${insectData.speed}/5\n` +
               `⏱️  Lifespan: ${lifespan}`;
    }

    calculateLifespan(insectData) {
        // Match game logic - but insectData doesn't have 'id' property directly
        const insectId = Object.keys(INSECT_DATABASE).find(
            key => INSECT_DATABASE[key] === insectData
        );
        const lifespanMs = insectId === 'ant' ? 240000 : 120000 / insectData.speed;
        const seconds = Math.round(lifespanMs / 1000);
        return `${seconds}s`;
    }

    getFamilyEmoji(familyName) {
        return SUPERFAMILY_EMOJI[familyName] || '🐛';
    }

    getSpeciesEmoji(speciesId) {
        const emojiMap = {
            ant: '🐜', honeybee: '🐝', bumblebee: '🐝', hornet: '🐝',
            vinegar_fly: '🪰', housefly: '🪰', robber_fly: '🪰', horsefly: '🪰',
            hawk_moth: '🦋', peacock: '🦋', monarch: '🦋', cabbage_white: '🦋',
            stag_beetle: '🪲', firefly: '🪲', ladybug: '🐞', rose_chafer: '🪲'
        };
        return emojiMap[speciesId] || '🐛';
    }

    goBack() {
        console.log('Going back to family selection');
        
        // Hide species container
        if (this.speciesContainer) {
            this.speciesContainer.setVisible(false);
            this.speciesContainer.destroy();
        }

        // Show family container
        this.familyContainer.setVisible(true);
        
        // Reset selection
        this.selectedFamily = null;
        this.selectedFamilyIndex = null;
    }

    startGame(familyIndex) {
        console.log(`Starting game with family index: ${familyIndex}`);
        
        // Pass selected family to game scene
        this.scene.start('DefogGame', {
            selectedFamilyIndex: familyIndex
        });
    }
}
