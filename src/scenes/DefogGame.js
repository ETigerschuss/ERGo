export class DefogGame extends Phaser.Scene {

    constructor() {
        super('DefogGame');
    }

    preload() {
        // Load the image to defog
        this.load.image('hiddenImage', 'assets/IMG_0061.jpg');
        
        // Load insect sprite (we'll use the ship for now as a placeholder)
        this.load.spritesheet('ship', 'assets/spaceship.png', { frameWidth: 176, frameHeight: 96 });
    }

    create() {
        // Get game dimensions
        const width = this.scale.width;
        const height = this.scale.height;

        // Add the hidden image
        this.hiddenImage = this.add.image(width / 2, height / 2, 'hiddenImage');
        
        // Scale the image to fit the screen while maintaining aspect ratio
        const scaleX = width / this.hiddenImage.width;
        const scaleY = height / this.hiddenImage.height;
        const scale = Math.min(scaleX, scaleY);
        this.hiddenImage.setScale(scale);

        // Create a render texture for the fog layer (same size as game)
        this.fogTexture = this.add.renderTexture(0, 0, width, height);
        
        // Fill it with black (fog)
        this.fogTexture.fill(0x000000, 1);
        
        // Set blend mode so clearing the fog reveals the image underneath
        this.fogTexture.setBlendMode(Phaser.BlendModes.MULTIPLY);

        // Create an insect that will defog
        this.insect = this.add.sprite(width / 2, height / 2, 'ship');
        this.insect.setScale(0.5);
        
        // Create fly animation
        this.insect.anims.create({
            key: 'fly',
            frames: this.anims.generateFrameNumbers('ship', { start: 0, end: 2 }),
            frameRate: 15,
            repeat: -1
        });
        this.insect.play('fly');

        // Set up insect movement (random wandering)
        this.insectVelocity = { x: 2, y: 1 };
        
        // Graphics object for erasing fog
        this.eraseRadius = 30; // Size of the area to reveal

        // Input to control insect with mouse/touch
        this.input.on('pointermove', (pointer) => {
            this.insect.x = pointer.x;
            this.insect.y = pointer.y;
        });

        // Add instructions
        this.add.text(10, 10, 'Move mouse to reveal the image!', {
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });
    }

    update() {
        // Erase fog at insect position
        this.revealFog(this.insect.x, this.insect.y, this.eraseRadius);
        
        // Optional: Add autonomous movement if you want the insect to move on its own
        // this.moveInsect();
    }

    revealFog(x, y, radius) {
        // Draw a circle on the fog texture to erase it (reveal the image)
        // We draw white with ERASE blend mode to create transparency
        this.fogTexture.erase('', x - radius, y - radius, radius * 2, radius * 2);
    }

    moveInsect() {
        // Autonomous movement (optional - currently controlled by mouse)
        this.insect.x += this.insectVelocity.x;
        this.insect.y += this.insectVelocity.y;

        // Bounce off edges
        if (this.insect.x < 0 || this.insect.x > this.scale.width) {
            this.insectVelocity.x *= -1;
        }
        if (this.insect.y < 0 || this.insect.y > this.scale.height) {
            this.insectVelocity.y *= -1;
        }
    }
}
