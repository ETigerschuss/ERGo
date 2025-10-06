// Test helper script - can be run in browser console
// This script demonstrates how to access and control the game

export function getGameInstance() {
    // Get the game instance from the global window object
    if (window.ERGoGame) {
        return window.ERGoGame;
    }
    console.error('Game instance not found');
    return null;
}

export function switchToGameScene() {
    const game = getGameInstance();
    if (game && game.scene) {
        const mainMenu = game.scene.getScene('MainMenuScene');
        if (mainMenu) {
            mainMenu.scene.start('GameScene');
            console.log('Switched to GameScene');
            return true;
        }
    }
    console.error('Could not switch to GameScene');
    return false;
}

export function addInsect(x = 400, y = 300) {
    const game = getGameInstance();
    if (game && game.scene) {
        const gameScene = game.scene.getScene('GameScene');
        if (gameScene && gameScene.insects) {
            const Insect = gameScene.insects[0].constructor;
            const newInsect = new Insect(gameScene, x, y);
            gameScene.insects.push(newInsect);
            console.log('Added insect at', x, y);
            return newInsect;
        }
    }
    return null;
}

export function getActiveScene() {
    const game = getGameInstance();
    if (game && game.scene) {
        return game.scene.getScenes(true)[0];
    }
    return null;
}

// Make functions available globally for console access
if (typeof window !== 'undefined') {
    window.ERGoDebug = {
        getGameInstance,
        switchToGameScene,
        addInsect,
        getActiveScene
    };
    console.log('ERGo! Debug tools loaded. Use window.ERGoDebug to access functions.');
}
