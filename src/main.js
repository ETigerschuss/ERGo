import { SplashScreen } from './scenes/SplashScreen.js';
import { Start } from './scenes/StartNew.js';
import { DefogGame } from './scenes/DefogGamev0.04.js?v=090';
import { InsectSelection } from './scenes/InsectSelectionEnhanced.js';

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
        SplashScreen,  // Start with ERGo splash screen
        Start,         // Then family selection
        DefogGame
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
}

new Phaser.Game(config);
            