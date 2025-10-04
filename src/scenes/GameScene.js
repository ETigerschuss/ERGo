import Phaser from 'phaser';
import Insect from '../entities/Insect.js';
import FogOfWar from '../utils/FogOfWar.js';
import PathDrawer from '../utils/PathDrawer.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.insects = [];
        this.fogOfWar = null;
        this.pathDrawer = null;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Create background
        this.add.rectangle(0, 0, width, height, 0x4a4a4a).setOrigin(0, 0);

        // Initialize fog of war system
        this.fogOfWar = new FogOfWar(this, width, height);

        // Initialize path drawer
        this.pathDrawer = new PathDrawer(this);

        // Create a sample insect
        const insect = new Insect(this, width / 2, height / 2);
        this.insects.push(insect);

        // Add UI text
        const uiText = this.add.text(16, 16, 'Draw paths to guide insects', {
            font: '18px Arial',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });
        uiText.setScrollFactor(0);
        uiText.setDepth(1000);

        // Add return to menu button
        const menuButton = this.add.text(width - 16, 16, 'Menu', {
            font: '18px Arial',
            fill: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 10, y: 5 }
        });
        menuButton.setOrigin(1, 0);
        menuButton.setScrollFactor(0);
        menuButton.setDepth(1000);
        menuButton.setInteractive({ useHandCursor: true });

        menuButton.on('pointerover', () => {
            menuButton.setStyle({ fill: '#ffff00' });
        });

        menuButton.on('pointerout', () => {
            menuButton.setStyle({ fill: '#ffffff' });
        });

        menuButton.on('pointerdown', () => {
            this.scene.start('MainMenuScene');
        });

        console.log('Game Scene: Game started');
    }

    update(time, delta) {
        // Update fog of war
        if (this.fogOfWar) {
            this.fogOfWar.update(this.insects);
        }

        // Update insects
        this.insects.forEach(insect => {
            insect.update(time, delta);
        });

        // Update path drawer
        if (this.pathDrawer) {
            this.pathDrawer.update();
        }
    }
}
