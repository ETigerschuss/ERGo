import Phaser from 'phaser';

export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Title
        const title = this.add.text(width / 2, height / 3, 'ERGo!', {
            font: 'bold 64px Arial',
            fill: '#ffffff'
        });
        title.setOrigin(0.5);

        // Subtitle
        const subtitle = this.add.text(width / 2, height / 3 + 70, 'Entomology Research Go!', {
            font: '24px Arial',
            fill: '#cccccc'
        });
        subtitle.setOrigin(0.5);

        // Start button
        const startButton = this.add.text(width / 2, height / 2 + 50, 'Start Game', {
            font: '32px Arial',
            fill: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 }
        });
        startButton.setOrigin(0.5);
        startButton.setInteractive({ useHandCursor: true });

        startButton.on('pointerover', () => {
            startButton.setStyle({ fill: '#ffff00' });
        });

        startButton.on('pointerout', () => {
            startButton.setStyle({ fill: '#ffffff' });
        });

        startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        // Instructions
        const instructions = this.add.text(width / 2, height - 100, 'Click and drag to draw flight paths for insects', {
            font: '16px Arial',
            fill: '#888888'
        });
        instructions.setOrigin(0.5);

        console.log('Main Menu Scene: Ready');
    }
}
