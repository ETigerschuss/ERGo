export class SplashScreen extends Phaser.Scene {

    constructor() {
        super('SplashScreen');
    }

    preload() {
        // Load the ERGo splash image
        // Note: Save the provided image as 'assets/ergo_splash.png'
        this.load.image('ergo_splash', 'assets/ergo_splash.png');
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        // Add the splash screen image
        const splash = this.add.image(width / 2, height / 2, 'ergo_splash');
        
        // Scale to fit screen
        const scaleX = width / splash.width;
        const scaleY = height / splash.height;
        const scale = Math.min(scaleX, scaleY);
        splash.setScale(scale);

        // Make entire screen clickable
        this.add.rectangle(0, 0, width, height, 0x000000, 0.01)
            .setOrigin(0)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                console.log('🎮 Starting family selection...');
                this.scene.start('Start');
            });

        // Add subtle hint text at bottom
        this.add.text(width / 2, height - 30, 'Click anywhere to start', {
            fontSize: '18px',
            color: '#ffffff',
            backgroundColor: '#00000088',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setAlpha(0.8);

        // Fade in effect
        this.cameras.main.fadeIn(1000, 0, 0, 0);
    }
}
