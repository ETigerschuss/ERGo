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
        this.add.text(width / 2, 60, 'ERGo! v0.03-dev', {
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

        // Create 4 family panels in a 2x2 grid
        // Positions match game layout: Diptera TL, Lepidoptera TR, Hymenoptera BL, Coleoptera BR
        const panelWidth = 220;  // Smaller boxes
        const panelHeight = 240; // Increased to prevent emoji cropping
        const spacing = 20;
        const startX = width / 2 - panelWidth - spacing / 2;
        const startY = 150;

        // Rearranged positions to match game corners
        // Family indices: [0: Hymenoptera, 1: Diptera, 2: Lepidoptera, 3: Coleoptera]
        const positions = [
            { x: startX, y: startY + panelHeight + spacing },      // [0] Hymenoptera: Bottom-left
            { x: startX, y: startY },                               // [1] Diptera: Top-left  
            { x: startX + panelWidth + spacing, y: startY },       // [2] Lepidoptera: Top-right
            { x: startX + panelWidth + spacing, y: startY + panelHeight + spacing } // [3] Coleoptera: Bottom-right
        ];

        // Species by family (matching game order, vision quality)
        // Note: Each family starts with simplest vision (monochromat if available)
        const speciesByFamily = [
            ['ant', 'honeybee', 'bumblebee', 'hornet'],              // Hymenoptera: mono→tri→tri+→tri++
            ['mosquito', 'vinegar_fly', 'housefly', 'horsefly'],     // Diptera: mono→hexa→penta→tri+red
            ['hawk_moth', 'peacock', 'monarch', 'cabbage_white'],    // Lepidoptera: tri→tri+→tri++→tetra (NO monochromats exist in butterflies/moths!)
            ['stag_beetle', 'firefly', 'ladybug', 'rose_chafer']     // Coleoptera: mono→di→tri→tri+red
        ];

        this.familyPanels = [];

        SUPERFAMILIES.forEach((family, index) => {
            const pos = positions[index];
            const species = speciesByFamily[index];
            const firstSpecies = INSECT_DATABASE[species[0]];

            // Panel background (clickable)
            const panel = this.add.rectangle(pos.x, pos.y, panelWidth, panelHeight, 0x16213e, 0.9)
                .setOrigin(0)
                .setStrokeStyle(3, 0x444444)
                .setInteractive({ useHandCursor: true });

            // Family emoji (MUCH BIGGER - 130px, positioned way up)
            const centerX = pos.x + panelWidth / 2;
            const centerY = pos.y + panelHeight / 2 - 25; // Way up!
            
            const familyEmoji = this.getFamilyEmoji(family);
            const emojiText = this.add.text(centerX, centerY, familyEmoji, {
                fontSize: '130px',  // Much bigger!
                padding: { top: 20, bottom: 0 } // Add top padding to prevent cropping
            }).setOrigin(0.5, 0.25); // Lower Y origin to account for emoji ascent
            
            // Make emoji clickable too
            emojiText.setInteractive({ useHandCursor: true });
            
            // Pulsing animation for emoji
            this.tweens.add({
                targets: emojiText,
                scale: { from: 1, to: 1.1 },
                duration: 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Hover effects on panel
            panel.on('pointerover', () => {
                panel.setStrokeStyle(3, 0x00ff66);
                emojiText.setScale(1.15);
            });

            panel.on('pointerout', () => {
                panel.setStrokeStyle(3, 0x444444);
                emojiText.setScale(1);
            });

            // Click handler on both panel and emoji
            const clickHandler = () => {
                this.selectFamily(index, family, species);
            };
            
            panel.on('pointerdown', clickHandler);
            emojiText.on('pointerdown', clickHandler);

            // Store panel
            this.familyPanels.push({ 
                panel,
                emojiText,
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
        
        // Store all created elements so we can destroy them later
        this.speciesElements = [];

        // Header
        const emoji = SUPERFAMILY_EMOJI[familyName];
        const header = this.add.text(width / 2, 80, `${emoji} ${familyName}`, {
            fontSize: '36px',
            color: '#ffaa00',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.speciesElements.push(header);

        const subheader = this.add.text(width / 2, 130, 'You will progress through these species:', {
            fontSize: '16px',
            color: '#888888'
        }).setOrigin(0.5);
        this.speciesElements.push(subheader);

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
            this.speciesElements.push(card);

            const centerX = posX + cardWidth / 2;

            // Species number removed to prevent emoji cropping
            // const numberText = this.add.text(centerX, startY + 25, `${index + 1}/4`, {
            //     fontSize: '14px',
            //     color: isFirst ? '#00ff66' : '#666666',
            //     fontStyle: 'bold'
            // }).setOrigin(0.5);
            // this.speciesElements.push(numberText);

            // Species emoji
            const speciesEmoji = this.getSpeciesEmoji(speciesId);
            const emojiText = this.add.text(centerX, startY + 60, speciesEmoji, {
                fontSize: '48px',
                padding: { top: 8, bottom: 0 } // Prevent emoji top cropping
            }).setOrigin(0.5, 0.25); // Adjusted Y origin for emoji ascent
            this.speciesElements.push(emojiText);

            // Species name
            const nameText = this.add.text(centerX, startY + 115, insectData.name, {
                fontSize: '16px',
                color: '#ffffff',
                fontStyle: 'bold',
                align: 'center'
            }).setOrigin(0.5);
            this.speciesElements.push(nameText);

            const sciText = this.add.text(centerX, startY + 140, insectData.scientificName, {
                fontSize: '11px',
                color: '#888888',
                fontStyle: 'italic',
                align: 'center'
            }).setOrigin(0.5);
            this.speciesElements.push(sciText);

            // Detailed attributes
            const detailedAttrs = this.formatDetailedAttributes(insectData);
            const attrsText = this.add.text(centerX, startY + 175, detailedAttrs, {
                fontSize: '11px',
                color: '#aaaaaa',
                align: 'left',
                lineSpacing: 3
            }).setOrigin(0.5, 0);
            this.speciesElements.push(attrsText);

            // "Starting insect" badge
            if (isFirst) {
                const badge = this.add.text(centerX, startY + 310, '▶ STARTING INSECT', {
                    fontSize: '13px',
                    color: '#00ff66',
                    fontStyle: 'bold',
                    backgroundColor: '#003311',
                    padding: { x: 10, y: 5 }
                }).setOrigin(0.5);
                this.speciesElements.push(badge);
            } else {
                const unlockText = this.add.text(centerX, startY + 310, `Unlocks later (${index}/4)`, {
                    fontSize: '11px',
                    color: '#666666'
                }).setOrigin(0.5);
                this.speciesElements.push(unlockText);
            }
        });

        // Back button
        const backButton = this.add.rectangle(100, height - 60, 150, 40, 0x444444, 0.9)
            .setStrokeStyle(2, 0x666666);
        backButton.setInteractive({ useHandCursor: true });
        this.speciesElements.push(backButton);

        const backText = this.add.text(100, height - 60, '← Back', {
            fontSize: '16px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.speciesElements.push(backText);

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
        this.speciesElements.push(startButton);

        const startText = this.add.text(width - 100, height - 60, 'START GAME ▶', {
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.speciesElements.push(startText);

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
            mosquito: '🦟', vinegar_fly: '🪰', housefly: '🪰', robber_fly: '🪰', horsefly: '🪰', hoverfly: '🪰',
            hawk_moth: '🦋', peacock: '🦋', monarch: '🦋', cabbage_white: '🦋',
            stag_beetle: '🪲', firefly: '🪲', ladybug: '🐞', rose_chafer: '🪲'
        };
        return emojiMap[speciesId] || '🐛';
    }

    goBack() {
        console.log('Going back to family selection');
        
        // Destroy all species elements
        if (this.speciesElements) {
            this.speciesElements.forEach(element => {
                if (element) {
                    element.destroy();
                }
            });
            this.speciesElements = [];
        }
        
        // Hide and destroy species container
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
