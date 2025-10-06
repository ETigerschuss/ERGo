# ERGo! Game Examples and Usage

This document provides examples of how to use and extend the ERGo! game.

## Running the Game

### Development Mode
```bash
npm install
npm run dev
```

The game will open at `http://localhost:3000/`

### Production Build
```bash
npm run build
npm run preview
```

## Game Controls

### Main Menu
- Click "Start Game" to begin

### Game Scene
- **Draw Flight Paths**: Click and drag to draw a path for insects to follow
- **Return to Menu**: Click the "Menu" button in the top-right corner

## Game Mechanics

### Fog of War
The game world is covered in darkness. Only areas within the vision radius of insects are visible. As insects move, new areas are revealed.

### Path Drawing
1. Click and hold on the game canvas
2. Drag to draw a path
3. Release to finalize the path
4. The nearest insect will follow the drawn path

### Insects
- Each insect has a vision radius of 80 pixels
- Insects glow with an orange color
- They follow drawn paths automatically
- Movement speed: 100 pixels/second

## Code Examples

### Adding a New Scene

```javascript
// src/scenes/MyNewScene.js
import Phaser from 'phaser';

export default class MyNewScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MyNewScene' });
    }

    create() {
        // Your scene code here
        const text = this.add.text(400, 300, 'My New Scene', {
            font: '32px Arial',
            fill: '#ffffff'
        });
        text.setOrigin(0.5);
    }

    update(time, delta) {
        // Update logic here
    }
}
```

Then add it to `src/main.js`:
```javascript
import MyNewScene from './scenes/MyNewScene.js';

const config = {
    // ...
    scene: [
        BootScene,
        PreloaderScene,
        MainMenuScene,
        GameScene,
        MyNewScene  // Add your scene here
    ],
    // ...
};
```

### Creating a New Entity

```javascript
// src/entities/MyEntity.js
import Phaser from 'phaser';

export default class MyEntity extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);
        scene.add.existing(this);
        
        // Add visuals
        this.sprite = scene.add.circle(0, 0, 15, 0x00ff00);
        this.add(this.sprite);
        
        // Add properties
        this.speed = 150;
    }

    update(time, delta) {
        // Update logic
        this.rotation += 0.01;
    }
}
```

### Loading Assets

Add assets to the PreloaderScene:

```javascript
// In src/scenes/PreloaderScene.js preload() method
preload() {
    // Load images
    this.load.image('background', 'assets/images/background.png');
    this.load.image('logo', 'assets/images/logo.png');
    
    // Load sprite sheets
    this.load.spritesheet('bee', 'assets/sprites/bee.png', {
        frameWidth: 32,
        frameHeight: 32
    });
    
    // Load audio
    this.load.audio('bgm', 'assets/audio/background-music.mp3');
}
```

### Using Loaded Assets

```javascript
// In any scene's create() method
create() {
    // Add background
    this.add.image(640, 360, 'background');
    
    // Add sprite
    const bee = this.add.sprite(100, 100, 'bee');
    
    // Create animation
    this.anims.create({
        key: 'fly',
        frames: this.anims.generateFrameNumbers('bee', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });
    
    bee.play('fly');
}
```

### Customizing Fog of War

```javascript
// In GameScene.js create() method
this.fogOfWar = new FogOfWar(this, width, height);

// Change fog opacity (0.0 to 1.0)
// Edit in src/utils/FogOfWar.js:
this.fogTexture.fill(0x000000, 0.5); // Less opaque
```

### Customizing Path Drawing

```javascript
// In src/utils/PathDrawer.js drawPath() method
drawPath() {
    // Change line color and width
    this.pathGraphics.lineStyle(5, 0xff0000, 1.0); // Red, thicker line
    
    // Change dot size
    this.pathGraphics.fillCircle(point.x, point.y, 4); // Larger dots
}
```

### Adding More Insects

```javascript
// In GameScene.js create() method
create() {
    // ...existing code...
    
    // Add multiple insects
    const insect1 = new Insect(this, 200, 200);
    const insect2 = new Insect(this, 800, 400);
    const insect3 = new Insect(this, 400, 600);
    
    this.insects.push(insect1, insect2, insect3);
}
```

## Debug Tools (Development Mode Only)

When running in development mode, debug tools are available in the browser console:

```javascript
// Switch to game scene from console
ERGoDebug.switchToGameScene();

// Add a new insect at coordinates
ERGoDebug.addInsect(500, 300);

// Get the currently active scene
const scene = ERGoDebug.getActiveScene();
console.log(scene);

// Get the game instance
const game = ERGoDebug.getGameInstance();
```

## Project Structure Explained

```
src/
├── entities/           # Game objects and characters
│   └── Insect.js      # Insect entity with movement and vision
├── scenes/            # Game scenes (different screens)
│   ├── BootScene.js   # Initial loading
│   ├── PreloaderScene.js  # Asset loading with progress
│   ├── MainMenuScene.js   # Main menu
│   └── GameScene.js   # Main gameplay
├── utils/             # Utility modules
│   ├── FogOfWar.js    # Fog of war system
│   ├── PathDrawer.js  # Path drawing mechanics
│   └── debug.js       # Debug tools
└── main.js            # Game configuration and entry point
```

## Performance Tips

1. **Asset Optimization**: Compress images and use sprite sheets
2. **Path Simplification**: The PathDrawer already simplifies paths by sampling every 10th point
3. **Object Pooling**: Reuse game objects instead of creating/destroying them
4. **Reduce Vision Radius**: Smaller vision radius = better performance

## Next Steps

- Add more insect types with different behaviors
- Implement collectible items
- Add obstacles and collision detection
- Create multiple levels
- Add sound effects and background music
- Implement a scoring system
- Add save/load functionality
