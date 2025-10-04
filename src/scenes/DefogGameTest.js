export class DefogGame extends Phaser.Scene {
    constructor() {
        super('DefogGame');
    }

    init(data) {
        console.log('INIT CALLED');
        console.log('Data received:', data);
        this.selectedInsects = data?.selectedInsects || [];
    }

    preload() {
        console.log('PRELOAD CALLED');
        this.load.image('hiddenImage', 'assets/IMG_0061.jpg');
    }

    create() {
        console.log('CREATE CALLED');
        
        const width = 1280;
        const height = 720;

        // Just show a colored rectangle and text
        this.add.rectangle(width/2, height/2, width, height, 0xff0000);
        
        this.add.text(width/2, height/2, 'GAME SCENE LOADED!\nIf you see this, the scene works!', {
            fontSize: '48px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        console.log('CREATE FINISHED');
    }
}
