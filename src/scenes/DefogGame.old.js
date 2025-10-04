export class DefogGame extends Phaser.Scene {

    constructor() {
        super('DefogGame');
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
        
        // Get game dimensions
        const width = this.scale.width;
        const height = this.scale.height;
        
        console.log(`DefogGame: Canvas size = ${width}x${height}`);

        // Add the hidden image
        this.hiddenImage = this.add.image(width / 2, height / 2, 'hiddenImage');
        console.log('DefogGame: Image added, original size:', this.hiddenImage.width, 'x', this.hiddenImage.height);
        
        // Scale the image to fit the screen while maintaining aspect ratio
        const scaleX = width / this.hiddenImage.width;
        const scaleY = height / this.hiddenImage.height;
        const scale = Math.min(scaleX, scaleY);
        this.hiddenImage.setScale(scale);

        // Create separate fog layers for RGB channels
        this.fogRed = this.add.renderTexture(0, 0, width, height);
        this.fogGreen = this.add.renderTexture(0, 0, width, height);
        this.fogBlue = this.add.renderTexture(0, 0, width, height);
        
        // Set origin to top-left so position matches screen coordinates
        this.fogRed.setOrigin(0, 0);
        this.fogGreen.setOrigin(0, 0);
        this.fogBlue.setOrigin(0, 0);
        
        // Fill each layer with its color (full opacity)
        this.fogRed.fill(0xff0000, 1);    // Red fog
        this.fogGreen.fill(0x00ff00, 1);  // Green fog
        this.fogBlue.fill(0x0000ff, 1);   // Blue fog
        
        // Set blend mode to subtract, so removing fog reveals the color channel
        this.fogRed.setBlendMode(Phaser.BlendModes.MULTIPLY);
        this.fogGreen.setBlendMode(Phaser.BlendModes.MULTIPLY);
        this.fogBlue.setBlendMode(Phaser.BlendModes.MULTIPLY);
        
        // Create a graphics object for drawing circles to erase
        this.eraseGraphics = this.add.graphics();
        this.eraseGraphics.fillStyle(0xffffff, 1);

        // Create reward target (a glowing circle at a random position)
        this.rewardTarget = {
            x: width * (0.4 + Math.random() * 0.2),
            y: height * (0.4 + Math.random() * 0.2),
            radius: 50,
            reached: false
        };
        
        // Draw the reward target indicator
        this.targetGraphics = this.add.graphics();
        this.targetPulse = 0;

        // Create multiple insects with different properties
        this.insects = [];
        
        // Track mouse/pointer position
        this.cursorPos = { x: width / 2, y: height / 2 };
        
        // Red channel insect - Fast, small radius
        this.createInsect(width * 0.3, height * 0.3, {
            color: 'red',
            tint: 0xff6666,
            speed: 3,
            radius: 25,
            fogLayer: this.fogRed,
            velocity: { x: 3, y: 2 }
        });
        
        // Green channel insect - Medium speed, medium radius
        this.createInsect(width * 0.5, height * 0.5, {
            color: 'green',
            tint: 0x66ff66,
            speed: 2,
            radius: 35,
            fogLayer: this.fogGreen,
            velocity: { x: -2, y: 2.5 }
        });
        
        // Blue channel insect - Slow, large radius
        this.createInsect(width * 0.7, height * 0.7, {
            color: 'blue',
            tint: 0x6666ff,
            speed: 1.5,
            radius: 45,
            fogLayer: this.fogBlue,
            velocity: { x: 2.5, y: -1.5 }
        });

        // Add instructions
        this.instructionText = this.add.text(10, 10, 'Move cursor to guide insects!\nRed: Fast, small area\nGreen: Medium\nBlue: Slow, large area\n\nGuide all insects to the glowing target!', {
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#000000aa',
            padding: { x: 10, y: 5 }
        }).setDepth(1000);

        // Track cursor position
        this.input.on('pointermove', (pointer) => {
            this.cursorPos.x = pointer.x;
            this.cursorPos.y = pointer.y;
        });
    }

    createInsect(x, y, config) {
        // Create a container for the insect
        const container = this.add.container(x, y);
        
        // Draw insect body and wings with graphics
        const graphics = this.add.graphics();
        
        // Body (ellipse)
        graphics.fillStyle(config.tint, 1);
        graphics.fillEllipse(0, 0, 12, 20);
        
        // Head (circle)
        graphics.fillCircle(0, -12, 6);
        
        // Wings (semi-transparent)
        graphics.fillStyle(config.tint, 0.6);
        graphics.fillEllipse(-10, -3, 15, 8); // Left wing
        graphics.fillEllipse(10, -3, 15, 8);  // Right wing
        
        // Antennae
        graphics.lineStyle(1, config.tint, 1);
        graphics.beginPath();
        graphics.moveTo(-3, -15);
        graphics.lineTo(-5, -20);
        graphics.moveTo(3, -15);
        graphics.lineTo(5, -20);
        graphics.strokePath();
        
        container.add(graphics);
        
        // Add glow effect
        const glow = this.add.circle(0, 0, 15, config.tint, 0.3);
        container.add(glow);
        container.sendToBack(glow);

        this.insects.push({
            container: container,
            graphics: graphics,
            glow: glow,
            config: config,
            wingFlap: 0
        });
    }

    update() {
        // Draw pulsing reward target
        this.targetPulse += 0.05;
        const pulseSize = this.rewardTarget.radius + Math.sin(this.targetPulse) * 10;
        
        this.targetGraphics.clear();
        this.targetGraphics.lineStyle(3, 0xffff00, 0.8);
        this.targetGraphics.strokeCircle(this.rewardTarget.x, this.rewardTarget.y, pulseSize);
        this.targetGraphics.fillStyle(0xffff00, 0.2);
        this.targetGraphics.fillCircle(this.rewardTarget.x, this.rewardTarget.y, this.rewardTarget.radius);
        
        // Check if all insects reached target
        let allReached = true;
        
        // Update all insects
        this.insects.forEach(insect => {
            // Move towards cursor
            const dx = this.cursorPos.x - insect.container.x;
            const dy = this.cursorPos.y - insect.container.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 3) {
                insect.container.x += (dx / distance) * insect.config.speed;
                insect.container.y += (dy / distance) * insect.config.speed;
            }
            
            // Animate wing flapping
            insect.wingFlap += 0.2;
            const flapScale = 1 + Math.sin(insect.wingFlap) * 0.2;
            insect.graphics.setScale(flapScale, 1);
            
            // Pulsing glow
            insect.glow.setScale(1 + Math.sin(insect.wingFlap * 0.5) * 0.3);
            
            // Reveal fog at insect position for its specific color channel
            this.revealFog(
                insect.container.x, 
                insect.container.y, 
                insect.config.radius,
                insect.config.fogLayer
            );
            
            // Check if this insect reached the target
            const targetDx = this.rewardTarget.x - insect.container.x;
            const targetDy = this.rewardTarget.y - insect.container.y;
            const targetDist = Math.sqrt(targetDx * targetDx + targetDy * targetDy);
            
            if (targetDist > this.rewardTarget.radius) {
                allReached = false;
            }
        });
        
        // Reward when all insects reach target
        if (allReached && !this.rewardTarget.reached) {
            this.rewardTarget.reached = true;
            this.showReward();
        }
    }

    revealFog(x, y, radius, fogLayer) {
        // Clear previous graphics and draw a circle for erasing
        this.eraseGraphics.clear();
        this.eraseGraphics.fillStyle(0xffffff, 1);
        this.eraseGraphics.fillCircle(x, y, radius);
        
        // Erase the circle from the fog layer
        fogLayer.erase(this.eraseGraphics);
        
        // Clear the graphics again so it doesn't stay visible
        this.eraseGraphics.clear();
    }
    
    showReward() {
        // Create celebratory effect
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
        
        // Animate the reward text
        this.tweens.add({
            targets: rewardText,
            scale: { from: 0, to: 1.5 },
            alpha: { from: 1, to: 0 },
            duration: 2000,
            ease: 'Bounce.out',
            onComplete: () => {
                // Reset for new round
                this.rewardTarget.reached = false;
                this.rewardTarget.x = this.scale.width * (0.3 + Math.random() * 0.4);
                this.rewardTarget.y = this.scale.height * (0.3 + Math.random() * 0.4);
                rewardText.destroy();
            }
        });
        
        // Flash the target
        this.tweens.add({
            targets: this.targetGraphics,
            alpha: { from: 1, to: 0.3 },
            duration: 200,
            yoyo: true,
            repeat: 5
        });
    }
}
