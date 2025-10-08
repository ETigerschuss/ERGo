import { SplashScreen } from './scenes/SplashScreen.js';  // Initial splash screen
import { Start } from './scenes/StartNew.js';  // Family selection UI
import { DefogGame } from './scenes/DefogGamev0.03.js';  // v0.03: All species visible in corners
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
            