import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Load any critical assets needed for the preloader
        console.log('Boot Scene: Initializing game...');
    }

    create() {
        console.log('Boot Scene: Starting preloader...');
        this.scene.start('PreloaderScene');
    }
}
