import { HexagonalDefog } from '../utils/HexagonalDefog.js';
import { COLOR_CHANNELS } from '../data/insectDatabase.js';

export class DefogGame extends Phaser.Scene {

    constructor() {
        super('DefogGame');
    }

    init(data) {
        // Receive selected insects from selection screen
        this.selectedInsects = data.selectedInsects || [];
        console.log('Selected insects:', this.selectedInsects.map(i => i.name));
    }

    preload() {
        console.log('DefogGame: Starting preload...');
        
        // Load the image to defog
        this.load.image('hiddenImage', 'assets/IMG_0061.jpg');
        
        this.load.on('complete', () => {
            console.log('DefogGame: All assets loaded!');
        });
        
        this.load.on('loaderror', (file) => {
            console.error('DefogGame: Error loading file:', file.src);
        });
    }

    create() {
        console.log('DefogGame: Creating scene...');
        console.log('Selected insects:', this.selectedInsects);
        
        // Get game dimensions
        const width = this.scale.width;
        const height = this.scale.height;
        
        console.log(`Canvas dimensions: ${width}x${height}`);

        // Initialize hexagonal defogging utility
        this.hexDefog = new HexagonalDefog(this);
        console.log('HexDefog initialized');

        // Add the hidden image
        this.hiddenImage = this.add.image(width / 2, height / 2, 'hiddenImage');
        
        // Scale the image to fit the screen while maintaining aspect ratio
        const scaleX = width / this.hiddenImage.width;
        const scaleY = height / this.hiddenImage.height;
        const scale = Math.min(scaleX, scaleY);
        this.hiddenImage.setScale(scale);

        // Create fog layers for each color channel
        this.createFogLayers(width, height);
        
        // Create reward target (hidden until revealed)
        this.createRewardTarget(width, height);

        // Create insects from selected species
        this.insects = [];
        this.cursorPos = { x: width / 2, y: height / 2 };
        this.lastCursorMove = Date.now();
        this.randomFlightMode = false;

        this.selectedInsects.forEach((insectData, index) => {
            const angle = (index / this.selectedInsects.length) * Math.PI * 2;
            const distance = Math.min(width, height) * 0.3;
            const x = width / 2 + Math.cos(angle) * distance;
            const y = height / 2 + Math.sin(angle) * distance;
            
            this.createInsect(x, y, insectData);
        });

        // Debug text to verify scene loaded
        this.add.text(width / 2, 50, 'GAME LOADED - IF YOU SEE THIS, SCENE WORKS!', {
            fontSize: '24px',
            color: '#00ff00',
            backgroundColor: '#000000'
        }).setOrigin(0.5).setDepth(2000);

        // Instructions
        this.instructionText = this.add.text(10, 10, 
            'Move cursor to guide insects!\nClick to toggle random flight\nFind the hidden target!', 
            {
                fontSize: '16px',
                color: '#ffffff',
                backgroundColor: '#000000aa',
                padding: { x: 10, y: 5 }
            }
        ).setDepth(1000);

        // Input handlers
        this.setupInputHandlers();
        
        console.log('DefogGame: Scene creation complete!');
    }

    createFogLayers(width, height) {
        this.fogLayers = {};
        
        // Determine which fog layers we need based on selected insects
        const neededChannels = new Set();
        this.selectedInsects.forEach(insect => {
            insect.colorSpectrum.forEach(channel => neededChannels.add(channel));
        });

        // Create fog layers for each needed channel
        neededChannels.forEach(channel => {
            const channelInfo = COLOR_CHANNELS[channel];
            const fogLayer = this.add.renderTexture(0, 0, width, height);
            fogLayer.setOrigin(0, 0);
            fogLayer.fill(channelInfo.color, 1);
            fogLayer.setBlendMode(Phaser.BlendModes.MULTIPLY);
            
            this.fogLayers[channel] = fogLayer;
        });

        console.log('Created fog layers for channels:', Array.from(neededChannels));
    }

    createRewardTarget(width, height) {
        // Random position but not too close to edges
        this.rewardTarget = {
            x: width * (0.3 + Math.random() * 0.4),
            y: height * (0.3 + Math.random() * 0.4),
            radius: 60,
            revealed: false,
            reached: false
        };
        
        // Target graphics (invisible until revealed)
        this.targetGraphics = this.add.graphics();
        this.targetGraphics.setAlpha(0);
        this.targetPulse = 0;

        // Track revealed pixels around target
        this.targetRevealProgress = 0;
    }

    createInsect(x, y, insectData) {
        const container = this.add.container(x, y);
        
        // Draw insect body and wings
        const graphics = this.add.graphics();
        
        // Body (ellipse)
        graphics.fillStyle(insectData.color, 1);
        graphics.fillEllipse(0, 0, 12, 20);
        
        // Head
        graphics.fillCircle(0, -12, 6);
        
        // Wings (semi-transparent)
        graphics.fillStyle(insectData.color, 0.6);
        graphics.fillEllipse(-10, -3, 15, 8);
        graphics.fillEllipse(10, -3, 15, 8);
        
        // Antennae
        graphics.lineStyle(1, insectData.color, 1);
        graphics.beginPath();
        graphics.moveTo(-3, -15);
        graphics.lineTo(-5, -20);
        graphics.moveTo(3, -15);
        graphics.lineTo(5, -20);
        graphics.strokePath();
        
        container.add(graphics);
        
        // Glow effect
        const glow = this.add.circle(0, 0, 15, insectData.color, 0.3);
        container.add(glow);
        container.sendToBack(glow);

        // Random flight velocity for random mode
        const randomVel = {
            x: (Math.random() - 0.5) * insectData.speed,
            y: (Math.random() - 0.5) * insectData.speed
        };

        this.insects.push({
            container: container,
            graphics: graphics,
            glow: glow,
            data: insectData,
            wingFlap: Math.random() * Math.PI * 2,
            randomVelocity: randomVel
        });
    }

    setupInputHandlers() {
        // Track cursor position
        this.input.on('pointermove', (pointer) => {
            this.cursorPos.x = pointer.x;
            this.cursorPos.y = pointer.y;
            this.lastCursorMove = Date.now();
            
            // If cursor moves, exit random flight mode
            if (this.randomFlightMode) {
                this.randomFlightMode = false;
                this.updateInstructions();
            }
        });

        // Click to toggle random flight
        this.input.on('pointerdown', () => {
            this.randomFlightMode = !this.randomFlightMode;
            this.updateInstructions();
            
            // Randomize velocities when entering random mode
            if (this.randomFlightMode) {
                this.insects.forEach(insect => {
                    insect.randomVelocity.x = (Math.random() - 0.5) * insect.data.speed;
                    insect.randomVelocity.y = (Math.random() - 0.5) * insect.data.speed;
                });
            }
        });
    }

    updateInstructions() {
        const mode = this.randomFlightMode ? 'RANDOM FLIGHT' : 'CURSOR FOLLOW';
        this.instructionText.setText(
            `Mode: ${mode}\n` +
            'Click to toggle\n' +
            (this.rewardTarget.revealed ? 'Guide insects to target!' : 'Reveal the hidden target!')
        );
    }

    update() {
        const currentTime = Date.now();
        
        // Auto-switch to random flight if cursor hasn't moved in 2 seconds
        if (!this.randomFlightMode && currentTime - this.lastCursorMove > 2000) {
            this.randomFlightMode = true;
            this.updateInstructions();
        }

        // Update target reveal check
        this.checkTargetReveal();

        // Draw target if revealed
        if (this.rewardTarget.revealed) {
            this.drawRewardTarget();
        }

        // Update all insects
        this.updateInsects();
    }

    updateInsects() {
        let allAtTarget = true;

        this.insects.forEach(insect => {
            // Movement
            if (this.randomFlightMode) {
                // Random flight with bouncing
                insect.container.x += insect.randomVelocity.x;
                insect.container.y += insect.randomVelocity.y;

                // Bounce off edges
                if (insect.container.x < 0 || insect.container.x > this.scale.width) {
                    insect.randomVelocity.x *= -1;
                }
                if (insect.container.y < 0 || insect.container.y > this.scale.height) {
                    insect.randomVelocity.y *= -1;
                }
            } else {
                // Follow cursor
                const dx = this.cursorPos.x - insect.container.x;
                const dy = this.cursorPos.y - insect.container.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 3) {
                    insect.container.x += (dx / distance) * insect.data.speed;
                    insect.container.y += (dy / distance) * insect.data.speed;
                }
            }

            // Wing animation
            insect.wingFlap += 0.2;
            const flapScale = 1 + Math.sin(insect.wingFlap) * 0.2;
            insect.graphics.setScale(flapScale, 1);
            
            // Pulsing glow
            insect.glow.setScale(1 + Math.sin(insect.wingFlap * 0.5) * 0.3);

            // Hexagonal defogging for each color channel the insect can see
            insect.data.colorSpectrum.forEach(channel => {
                if (this.fogLayers[channel]) {
                    this.revealFogHexagonal(
                        insect.container.x,
                        insect.container.y,
                        insect.data.defogRadius,
                        insect.data.visualResolution,
                        this.fogLayers[channel]
                    );
                }
            });

            // Check if at target
            if (this.rewardTarget.revealed) {
                const targetDx = this.rewardTarget.x - insect.container.x;
                const targetDy = this.rewardTarget.y - insect.container.y;
                const targetDist = Math.sqrt(targetDx * targetDx + targetDy * targetDy);
                
                if (targetDist > this.rewardTarget.radius) {
                    allAtTarget = false;
                }
            } else {
                allAtTarget = false;
            }
        });

        // Check for victory
        if (allAtTarget && this.rewardTarget.revealed && !this.rewardTarget.reached) {
            this.rewardTarget.reached = true;
            this.showReward();
        }
    }

    revealFogHexagonal(x, y, radius, visualResolution, fogLayer) {
        this.hexDefog.eraseHexagonal(fogLayer, x, y, radius, visualResolution);
    }

    checkTargetReveal() {
        if (this.rewardTarget.revealed) return;

        // Check if any insect has revealed the target area
        const revealThreshold = 0.3; // 30% of target must be revealed
        
        this.insects.forEach(insect => {
            const dx = this.rewardTarget.x - insect.container.x;
            const dy = this.rewardTarget.y - insect.container.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // If insect is near target, increase reveal progress
            if (distance < this.rewardTarget.radius + insect.data.defogRadius) {
                this.targetRevealProgress += 0.01;
            }
        });

        // Reveal target when threshold reached
        if (this.targetRevealProgress >= revealThreshold) {
            this.rewardTarget.revealed = true;
            this.targetGraphics.setAlpha(1);
            this.updateInstructions();
            
            // Play reveal sound/effect here
            console.log('Target revealed!');
        }
    }

    drawRewardTarget() {
        this.targetPulse += 0.05;
        const pulseSize = this.rewardTarget.radius + Math.sin(this.targetPulse) * 10;
        
        this.targetGraphics.clear();
        this.targetGraphics.lineStyle(3, 0xffff00, 0.8);
        this.targetGraphics.strokeCircle(this.rewardTarget.x, this.rewardTarget.y, pulseSize);
        this.targetGraphics.fillStyle(0xffff00, 0.2);
        this.targetGraphics.fillCircle(this.rewardTarget.x, this.rewardTarget.y, this.rewardTarget.radius);
    }

    showReward() {
        const rewardText = this.add.text(
            this.rewardTarget.x,
            this.rewardTarget.y,
            '🎉 SUCCESS! 🎉',
            {
                fontSize: '32px',
                color: '#ffff00',
                backgroundColor: '#000000cc',
                padding: { x: 20, y: 10 }
            }
        ).setOrigin(0.5).setDepth(2000);

        this.tweens.add({
            targets: rewardText,
            scale: { from: 0, to: 1.5 },
            alpha: { from: 1, to: 0 },
            duration: 2000,
            ease: 'Bounce.out',
            onComplete: () => {
                // Return to selection screen
                this.scene.start('InsectSelection');
            }
        });

        this.tweens.add({
            targets: this.targetGraphics,
            alpha: { from: 1, to: 0.3 },
            duration: 200,
            yoyo: true,
            repeat: 5
        });
    }
}
