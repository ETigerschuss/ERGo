import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import PreloaderScene from './scenes/PreloaderScene.js';
import MainMenuScene from './scenes/MainMenuScene.js';
import GameScene from './scenes/GameScene.js';

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#2d2d2d',
    scene: [
        BootScene,
        PreloaderScene,
        MainMenuScene,
        GameScene
    ],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    render: {
        pixelArt: false,
        antialias: true
    }
};

const game = new Phaser.Game(config);

// Export game instance for debugging
if (typeof window !== 'undefined') {
    window.ERGoGame = game;
}

// Load debug tools in development mode
if (import.meta.env.DEV) {
    import('./utils/debug.js').then(debug => {
        console.log('Debug tools loaded');
    });
}

export default game;
