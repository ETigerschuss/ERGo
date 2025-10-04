import { Start } from './scenes/Start.js';
import { DefogGame } from './scenes/DefogGameAdvanced.js';  // Advanced version: waypoints, multi-select, corner controls
import { InsectSelection } from './scenes/InsectSelectionEnhanced.js';  // Enhanced version with spectral sensitivity

const config = {
    type: Phaser.AUTO,
    title: 'ERGo! - Entomology Research Go!',
    description: 'Explore the world through insect eyes',
    parent: 'game-container',
    width: 1280,
    height: 720,
    backgroundColor: '#000000',
    pixelArt: false,
    scene: [
        InsectSelection,  // Start with insect selection
        DefogGame
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
}

new Phaser.Game(config);
            