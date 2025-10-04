import Phaser from 'phaser';

export default class Insect extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);
        
        // Add this container to the scene
        scene.add.existing(this);
        
        // Create insect sprite (simple circle for now)
        this.sprite = scene.add.circle(0, 0, 10, 0xffaa00);
        this.add(this.sprite);
        
        // Add glow effect
        this.glow = scene.add.circle(0, 0, 15, 0xffaa00, 0.3);
        this.add(this.glow);
        
        // Movement properties
        this.speed = 100;
        this.path = [];
        this.currentPathIndex = 0;
        this.visionRadius = 80;
        
        // Enable physics
        scene.physics.add.existing(this);
        
        console.log('Insect created at', x, y);
    }

    setPath(path) {
        this.path = path;
        this.currentPathIndex = 0;
    }

    update(time, delta) {
        if (this.path.length === 0 || this.currentPathIndex >= this.path.length) {
            return;
        }

        const target = this.path[this.currentPathIndex];
        const distance = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);

        if (distance < 5) {
            this.currentPathIndex++;
            if (this.currentPathIndex >= this.path.length) {
                this.path = [];
                this.currentPathIndex = 0;
            }
        } else {
            const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
            this.x += Math.cos(angle) * this.speed * (delta / 1000);
            this.y += Math.sin(angle) * this.speed * (delta / 1000);
        }

        // Animate glow
        this.glow.setAlpha(0.3 + Math.sin(time / 200) * 0.2);
    }

    getVisionRadius() {
        return this.visionRadius;
    }
}
