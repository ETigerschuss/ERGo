/**
 * Collectible System - Spawns and manages spectral resource collectibles
 * ERGo! v0.04
 */

export class CollectibleSystem {
    constructor(scene, currencySystem) {
        this.scene = scene;
        this.currencySystem = currencySystem;
        this.collectibles = [];
        
        // Collection parameters
        this.collectionRadius = 30; // Pixels - how close insect needs to be
    }
    
    spawnCollectiblesOnImage(imageTexture, imageSprite) {
        // Analyze image pixels to place collectibles
        // Red pixels → red collectibles
        // Green pixels → green collectibles
        // Blue pixels → blue collectibles
        // High contrast edges → monochrome collectibles
        
        console.log('🎁 Spawning collectibles on image...');
        
        try {
            const canvas = imageTexture.getSourceImage();
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const ctx = tempCanvas.getContext('2d');
            ctx.drawImage(canvas, 0, 0);
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;
        
        // Calculate image bounds in game world
        const imgX = imageSprite.x - imageSprite.displayWidth / 2;
        const imgY = imageSprite.y - imageSprite.displayHeight / 2;
        const scaleX = imageSprite.displayWidth / canvas.width;
        const scaleY = imageSprite.displayHeight / canvas.height;
        
        // Sample points (every 40 pixels to avoid too many collectibles)
        const sampleRate = 60; // Increased from 40 to reduce collectible count
        const collectibleCount = { monochrome: 0, red: 0, green: 0, blue: 0 };
        const maxPerType = 40; // Reduced from 60 to 40 per type (160 total max)
        
        for (let y = 0; y < canvas.height; y += sampleRate) {
            for (let x = 0; x < canvas.width; x += sampleRate) {
                const i = (y * canvas.width + x) * 4;
                const r = pixels[i];
                const g = pixels[i + 1];
                const b = pixels[i + 2];
                
                // Determine dominant color
                const type = this.analyzePixelColor(r, g, b);
                
                if (collectibleCount[type] < maxPerType) {
                    // Convert pixel coordinates to game world coordinates
                    const worldX = imgX + (x * scaleX);
                    const worldY = imgY + (y * scaleY);
                    
                    // Add some randomization to avoid grid pattern
                    const offsetX = (Math.random() - 0.5) * sampleRate * scaleX * 0.8;
                    const offsetY = (Math.random() - 0.5) * sampleRate * scaleY * 0.8;
                    
                    this.spawnCollectible(worldX + offsetX, worldY + offsetY, type);
                    collectibleCount[type]++;
                }
            }
        }
        
        console.log('✅ Spawned collectibles:', collectibleCount);
        } catch (error) {
            console.error('❌ Error spawning collectibles:', error);
        }
    }
    
    analyzePixelColor(r, g, b) {
        // Determine collectible type based on pixel color
        const brightness = (r + g + b) / 3;
        const maxChannel = Math.max(r, g, b);
        const minChannel = Math.min(r, g, b);
        const contrast = maxChannel - minChannel;
        
        // High contrast or very dark/bright = monochrome (edges, shadows, highlights)
        if (contrast > 100 || brightness < 40 || brightness > 220) {
            return Math.random() < 0.7 ? 'monochrome' : this.randomColorType(); // 70% monochrome
        }
        
        // Dominant color channel (with threshold to avoid muddy colors)
        if (r > g + 25 && r > b + 25 && r > 80) return 'red';
        if (g > r + 15 && g > b + 15 && g > 70) return 'green';
        if (b > r + 25 && b > g + 25 && b > 80) return 'blue';
        
        // Default distribution: favor monochrome and green
        const rand = Math.random();
        if (rand < 0.5) return 'monochrome';
        if (rand < 0.8) return 'green';
        return this.randomColorType();
    }
    
    randomColorType() {
        const types = ['red', 'green', 'blue'];
        return types[Math.floor(Math.random() * types.length)];
    }
    
    spawnCollectible(x, y, type) {
        const colors = {
            monochrome: 0xcccccc,
            red: 0xff3333,
            green: 0x33ff33,
            blue: 0x3333ff
        };
        
        // Collectible circle
        const collectible = this.scene.add.circle(x, y, 6, colors[type], 1)
            .setDepth(150);
        
        // Glow effect for colored resources
        let glow = null;
        if (type !== 'monochrome') {
            glow = this.scene.add.circle(x, y, 12, colors[type], 0.4)
                .setDepth(149)
                .setBlendMode(Phaser.BlendModes.ADD);
            
            // Pulsing animation
            this.scene.tweens.add({
                targets: glow,
                scale: { from: 1, to: 1.4 },
                alpha: { from: 0.4, to: 0.15 },
                duration: 1200,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            // Start invisible if color vision not unlocked
            if (!this.scene.colorVisionUnlocked) {
                collectible.setVisible(false).setAlpha(0);
                glow.setVisible(false);
            }
        }
        
        collectible.collectibleType = type;
        collectible.glow = glow;
        collectible.collected = false;
        
        this.collectibles.push(collectible);
    }
    
    checkCollection(insects) {
        // Check if any insect is near a collectible
        if (!insects || insects.length === 0) return;
        
        insects.forEach(insect => {
            if (!insect || !insect.sprite) return;
            
            this.collectibles.forEach(collectible => {
                if (collectible.collected || !collectible.visible) return;
                
                const distance = Phaser.Math.Distance.Between(
                    insect.sprite.x, insect.sprite.y,
                    collectible.x, collectible.y
                );
                
                if (distance < this.collectionRadius) {
                    this.collectResource(insect, collectible);
                }
            });
        });
    }
    
    collectResource(insect, collectible) {
        const type = collectible.collectibleType;
        
        // Check if insect can see this resource
        if (!this.canInsectSee(insect, type)) {
            return; // Insect is blind to this resource
        }
        
        // Mark as collected immediately to prevent double-collection
        collectible.collected = true;
        
        // Calculate collection amount based on insect vision quality
        const amount = this.getCollectionAmount(insect, type);
        
        // Add to currency
        this.currencySystem.add(type, amount);
        
        try {
            // Collection animation - particle effect toward insect
            const particles = [];
            for (let i = 0; i < 3; i++) {
                const particle = this.scene.add.circle(collectible.x, collectible.y, 3, 
                    type === 'monochrome' ? 0xcccccc : 
                    type === 'red' ? 0xff3333 :
                    type === 'green' ? 0x33ff33 : 0x3333ff, 1)
                    .setDepth(151);
                
                particles.push(particle);
                
                this.scene.tweens.add({
                    targets: particle,
                    x: insect.sprite.x,
                    y: insect.sprite.y,
                    scale: 0,
                    duration: 300 + (i * 50),
                    ease: 'Quad.easeIn',
                    onComplete: () => {
                        if (particle && particle.scene) particle.destroy();
                    }
                });
            }
            
            // Collectible disappear animation
            this.scene.tweens.add({
                targets: [collectible, collectible.glow].filter(t => t !== null),
                scale: { from: 1, to: 0.5 },
                alpha: 0,
                duration: 300,
                ease: 'Quad.easeOut',
                onComplete: () => {
                    if (collectible && collectible.scene) collectible.destroy();
                    if (collectible.glow && collectible.glow.scene) collectible.glow.destroy();
                    
                    // Remove from array
                    const index = this.collectibles.indexOf(collectible);
                    if (index > -1) this.collectibles.splice(index, 1);
                }
            });
        } catch (error) {
            console.error('Error in collectResource animation:', error);
            // Clean up anyway
            if (collectible && collectible.scene) collectible.destroy();
            if (collectible.glow && collectible.glow.scene) collectible.glow.destroy();
            const index = this.collectibles.indexOf(collectible);
            if (index > -1) this.collectibles.splice(index, 1);
        }
        
        console.log(`🎁 ${insect.commonName || 'Insect'} collected ${amount} ${type}`);
    }
    
    canInsectSee(insect, resourceType) {
        if (resourceType === 'monochrome') return true; // All insects see monochrome
        if (!this.scene.colorVisionUnlocked) return false; // No color vision yet
        
        // Check if insect has the matching color receptor
        const colorMap = {
            red: 'R',
            green: 'G',
            blue: 'B'
        };
        
        const requiredReceptor = colorMap[resourceType];
        return insect.colorSpectrum && insect.colorSpectrum.includes(requiredReceptor);
    }
    
    getCollectionAmount(insect, resourceType) {
        // v0.04: Currency now comes from edge detection, not collectibles
        // Return 0 to disable collectible-based currency
        return 0;
    }
    
    revealColoredCollectibles() {
        // Make colored collectibles visible when color vision unlocks
        console.log('🌈 Revealing colored collectibles...');
        let revealedCount = 0;
        
        this.collectibles.forEach(collectible => {
            if (collectible.collectibleType !== 'monochrome' && !collectible.visible) {
                this.scene.tweens.add({
                    targets: [collectible, collectible.glow],
                    alpha: { from: 0, to: 1 },
                    scale: { from: 0.5, to: 1 },
                    duration: 500,
                    delay: Math.random() * 300,
                    ease: 'Back.easeOut',
                    onStart: () => {
                        collectible.setVisible(true);
                        if (collectible.glow) collectible.glow.setVisible(true);
                    }
                });
                revealedCount++;
            }
        });
        
        console.log(`✅ Revealed ${revealedCount} colored collectibles`);
    }
    
    getCollectibleCount() {
        return {
            total: this.collectibles.length,
            monochrome: this.collectibles.filter(c => c.collectibleType === 'monochrome').length,
            red: this.collectibles.filter(c => c.collectibleType === 'red').length,
            green: this.collectibles.filter(c => c.collectibleType === 'green').length,
            blue: this.collectibles.filter(c => c.collectibleType === 'blue').length
        };
    }
}
