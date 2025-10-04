import { INSECT_DATABASE } from '../data/insectDatabaseReal.js';

export class DefogGame extends Phaser.Scene {

    constructor() {
        super('DefogGame');
    }

    init(data) {
        this.selectedInsects = data.selectedInsects || [];
        console.log('=== GAME STARTING ===');
        console.log('Selected insect IDs:', this.selectedInsects);
        
        // Get full insect data from database
        this.insectDataList = this.selectedInsects.map(id => INSECT_DATABASE[id]);
        console.log('Insect data loaded:', this.insectDataList.map(i => i.name));
    }

    preload() {
        console.log('Loading image...');
        this.load.image('hiddenImage', 'assets/IMG_0061.jpg');
    }

    create() {
        console.log('=== CREATE STARTED ===');
        
        const width = this.scale.width;
        const height = this.scale.height;

        // Add visible background first
        this.add.rectangle(0, 0, width, height, 0x222222).setOrigin(0);
        console.log('Background added');

        // Add the image
        this.hiddenImage = this.add.image(width / 2, height / 2, 'hiddenImage');
        const scale = Math.min(width / this.hiddenImage.width, height / this.hiddenImage.height);
        this.hiddenImage.setScale(scale);
        console.log('Image added and scaled');

        // Simple fog layer (single black layer for now)
        this.fogLayer = this.add.renderTexture(0, 0, width, height);
        this.fogLayer.setOrigin(0, 0);
        this.fogLayer.fill(0x000000, 1);
        console.log('Fog layer created');

        // Create insects
        this.insects = [];
        this.cursorPos = { x: width / 2, y: height / 2 };

        this.insectDataList.forEach((insectData, index) => {
            const angle = (index / this.insectDataList.length) * Math.PI * 2;
            const x = width / 2 + Math.cos(angle) * 200;
            const y = height / 2 + Math.sin(angle) * 200;
            
            // Simple circle insect
            const insect = this.add.circle(x, y, 20, insectData.color);
            
            this.insects.push({
                sprite: insect,
                data: insectData
            });
            
            console.log(`Created ${insectData.name} - ${insectData.ommatidia} ommatidia at ${x}, ${y}`);
        });

        // Big visible text
        this.add.text(width / 2, 50, 'MOVE YOUR MOUSE!', {
            fontSize: '32px',
            color: '#00ff00',
            backgroundColor: '#000000'
        }).setOrigin(0.5).setDepth(1000);

        this.add.text(10, 10, 'Insects created: ' + this.insects.length, {
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#ff0000'
        }).setDepth(1000);

        // Mouse tracking
        this.input.on('pointermove', (pointer) => {
            this.cursorPos.x = pointer.x;
            this.cursorPos.y = pointer.y;
        });

        console.log('=== CREATE COMPLETE ===');
    }

    update() {
        // Move insects to cursor and reveal fog
        this.insects.forEach(insect => {
            const dx = this.cursorPos.x - insect.sprite.x;
            const dy = this.cursorPos.y - insect.sprite.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 5) {
                insect.sprite.x += (dx / distance) * insect.data.speed;
                insect.sprite.y += (dy / distance) * insect.data.speed;
            }

            // Simple circular erase
            const graphics = this.make.graphics();
            graphics.fillStyle(0xffffff);
            graphics.fillCircle(insect.sprite.x, insect.sprite.y, insect.data.defogRadius);
            
            this.fogLayer.erase(graphics);
            graphics.destroy();
        });
    }
}
