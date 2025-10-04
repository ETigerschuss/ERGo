# ERGo! 🐛

ERGo! (Entomology Research Go!) - An educational game exploring the world through insect perspectives

## Overview

ERGo! is an HTML5 game built with Phaser 3 that allows players to experience the world from an insect's point of view. Guide insects through their environment by drawing flight paths, explore areas obscured by fog of war, and learn about entomology in an interactive way.

## Features

- **Phaser 3.70+** - Modern HTML5 game framework
- **Fog of War System** - Dynamic visibility using render textures
- **Path Drawing Mechanics** - Draw flight paths for insect navigation
- **Modular ES6 Structure** - Clean architecture with scenes, entities, and utilities
- **Vite Build System** - Fast development and optimized production builds

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

The game will open automatically in your browser at `http://localhost:3000`

### Building for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
ERGo/
├── public/
│   └── assets/
│       ├── images/          # Static images
│       └── sprites/         # Sprite sheets
├── src/
│   ├── entities/            # Game entities
│   │   └── Insect.js        # Insect entity class
│   ├── scenes/              # Game scenes
│   │   ├── BootScene.js     # Initial boot scene
│   │   ├── PreloaderScene.js # Asset loading scene
│   │   ├── MainMenuScene.js # Main menu
│   │   └── GameScene.js     # Main game scene
│   ├── utils/               # Utility modules
│   │   ├── FogOfWar.js      # Fog of war system
│   │   └── PathDrawer.js    # Path drawing mechanics
│   └── main.js              # Game configuration
├── index.html               # Entry HTML file
├── vite.config.js           # Vite configuration
└── package.json             # Project dependencies
```

## Game Mechanics

### Fog of War
The game uses Phaser's render textures to create a dynamic fog of war system. Areas are only visible within the vision radius of your insects.

### Path Drawing
Click and drag on the game canvas to draw flight paths. The nearest insect will follow the drawn path automatically.

### Insects
Insects are the main entities you control. Each insect has:
- A vision radius that reveals the fog of war
- The ability to follow drawn paths
- Visual effects (glow animation)

## Development Guide

### Adding New Scenes
1. Create a new scene class in `src/scenes/`
2. Extend `Phaser.Scene`
3. Add it to the scene array in `src/main.js`

### Adding New Entities
1. Create a new entity class in `src/entities/`
2. Extend `Phaser.GameObjects.Container` or appropriate base class
3. Implement update logic and properties

### Adding Assets
1. Place images in `public/assets/images/`
2. Place sprites in `public/assets/sprites/`
3. Load them in `PreloaderScene.js`

## Technologies Used

- **Phaser 3** - Game framework
- **Vite** - Build tool and development server
- **ES6 Modules** - Modern JavaScript module system

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Roadmap

- [ ] Add more insect types
- [ ] Implement level system
- [ ] Add educational content about insects
- [ ] Create sound effects and music
- [ ] Add particle effects
- [ ] Implement save/load system
