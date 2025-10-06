import Phaser from 'phaser';

export default class FogOfWar {
    constructor(scene, width, height) {
        this.scene = scene;
        this.width = width;
        this.height = height;

        // Create render textures for fog of war
        this.fogTexture = scene.add.renderTexture(0, 0, width, height);
        this.fogTexture.setDepth(100);

        // Create vision mask texture
        this.visionMask = scene.make.renderTexture({ width, height }, false);

        // Fill fog with black
        this.fogTexture.fill(0x000000, 0.85);

        // Create a circle graphic for revealing areas
        this.revealCircle = scene.add.graphics();
        
        console.log('Fog of War system initialized');
    }

    update(insects) {
        // Clear the vision mask
        this.visionMask.clear();

        // Draw circles where insects can see
        this.revealCircle.clear();
        
        insects.forEach(insect => {
            const visionRadius = insect.getVisionRadius();
            
            // Draw a white circle on the vision mask
            this.revealCircle.fillStyle(0xffffff, 1);
            this.revealCircle.fillCircle(insect.x, insect.y, visionRadius);
        });

        // Draw the reveal circles to the vision mask
        this.visionMask.draw(this.revealCircle);

        // Reset fog and apply vision mask
        this.fogTexture.clear();
        this.fogTexture.fill(0x000000, 0.85);
        
        // Erase the fog where insects can see
        this.fogTexture.erase(this.visionMask);
    }

    destroy() {
        if (this.fogTexture) {
            this.fogTexture.destroy();
        }
        if (this.visionMask) {
            this.visionMask.destroy();
        }
        if (this.revealCircle) {
            this.revealCircle.destroy();
        }
    }
}
