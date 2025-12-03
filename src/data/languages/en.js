// English translations
export const LANG_EN = {
    // Game instructions
    instructions: {
        line1: 'Click on species box to unlock insects | Click on insect to select, click to set path',
        line2: 'Mini-emojis select insects | Click on empty area to command all insects'
    },
    
    // Species box messages
    speciesBox: {
        unlock: 'UNLOCK',
        unlocked: 'Unlocked!',
        cannotAfford: 'Not enough resources',
        speciesActive: 'Species still alive - wait for them to die',
        familyBlocked: 'Family occupied by {species}',
        progress: 'Progress: {current}/{total}'
    },
    
    // Currency/Rhodopsin system
    currency: {
        monochrome: 'Monochrome',
        red: 'Red',
        green: 'Green',
        blue: 'Blue',
        unlocked: '{type} rhodopsin unlocked!'
    },
    
    // Timer and completion
    timer: {
        time: 'Time',
        best: 'Best',
        level: 'Level {num}',
        completed: 'Level Complete!',
        newBestTime: 'NEW BEST TIME!',
        newRecord: '✨ New personal record! ✨',
        yourTime: 'Your Time: {time}',
        bestTime: 'Best Time: {time}',
        achieved: 'Achieved: {date}',
        levelsCompleted: 'Levels Completed: {count}/5',
        continue: 'CONTINUE',
        retry: 'RETRY',
        nextLevel: '▶ Next Level ({num})',
        viewReward: '🎁 View Final Reward 🎁',
        diamondTitle: '💎 Level {num} Complete! 💎',
        total: 'Total: {amount} 💎',
        yourRank: 'YOUR RANK: #{rank}',
        you: '(you)'
    },
    
    // Introduction screen
    intro: {
        title: 'ERGo! - Evolution of Color Vision',
        subtitle: 'Level {num}',
        objective: 'About Rhodopsins & Color Sensitivities:',
        objectiveText: 'Insects reveal the image and collect rhodopsins (⚫🔴🟢🔵)\nbased on their color sensitivity. Use rhodopsins to unlock new species!',
        rules: 'Rules:',
        rule1: 'Unlock all 16 species as fast as possible',
        rule1sub: 'to earn time bonus diamonds!',
        rule2: 'Reveal as much of the image as possible',
        rule2sub: 'to convert rhodopsins into diamonds!',
        rule3: 'Only 1 species per family allowed',
        rule3sub: 'Wait until the species disappears before spawning another from the same family',
        rule4: 'Only 1 species per family allowed',
        rule4sub: 'Wait until it disappears before spawning another from the same family',
        rule5: 'Collect diamond rewards for faster completion',
        start: 'START',
        controls: 'Controls:',
        control1: '• Click insects to select, click again to set waypoints',
        control2: '• Click mini-emojis in species boxes for quick selection',
        control3: '• Click empty space to command all insects'
    },
    
    // Unlock messages
    unlock: {
        species: '{name} unlocked!',
        allSpecies: 'All species unlocked! Level complete!',
        colorVision: 'Color vision unlocked!'
    },
    
    // Error messages
    error: {
        insufficientResources: 'Need: {resources}',
        speciesLimit: 'Maximum 3 species active at once',
        familyOccupied: 'Wait for {species} to die first'
    },
    
    // Collectibles
    collectible: {
        diamond: '+{amount} to all rhodopsins!'
    },
    
    // High scores
    highScore: {
        title: 'High Scores',
        level: 'Level {num}',
        noScore: 'No score yet',
        diamondTitle: '💎 LEVEL {num} 💎',
        timeLabel: 'Time: {time}',
        complete: '✓ {count}/5 Complete'
    },
    
    // Final reward
    finalReward: {
        title: '🎉 CONGRATULATIONS! 🎉',
        message: 'You completed all 5 levels!',
        total: '🏆 Total: {time} | {diamonds}💎 🏆',
        playAgain: '▶ Play All Levels Again',
        species: 'Drosophila melanogaster',
        description: 'The fruit fly - a model organism for studying genetics and vision',
        close: 'CLOSE'
    },
    
    // Spectral evolution display
    spectral: {
        title: 'Spectral Evolution',
        monochrome: 'Monochrome',
        dichromat: 'Dichromat',
        trichromat: 'Trichromat',
        tetrachromat: 'Tetrachromat'
    },
    
    // Buttons
    buttons: {
        start: 'START',
        continue: 'CONTINUE',
        retry: 'RETRY',
        close: 'CLOSE',
        ok: 'OK',
        cancel: 'CANCEL',
        yes: 'YES',
        no: 'NO',
        unlock: 'UNLOCK',
        finalReward: '🎁 Final Reward',
        nextLevel: '▶ Level {num}',
        highscores: '📊 Leaderboard'
    },
    
    // Messages and notifications
    messages: {
        speciesActiveTitle: '{name} still alive!',
        speciesActiveBody: 'Wait for them to die before spawning more.\nCan only spawn ONCE until all die.',
        familyBlockedTitle: 'Family occupied!',
        familyBlockedBody: '{family} is occupied by {species}.\nWait for them to die first.',
        insufficientTitle: 'Not enough resources!',
        insufficientBody: 'You need:',
        unlockTitle: '{name} unlocked!',
        unlockBody: 'Click the species box again to spawn them.',
        allUnlockedTitle: 'All species unlocked!',
        allUnlockedBody: 'Level complete! Great job!',
        colorVisionTitle: 'Color Vision Unlocked!',
        colorVisionBody: 'You can now see in color!\nTrichromatic insects reveal RGB channels.',
        diamondCollected: '+{amount} to all rhodopsins!',
        youHave: 'you have: {amount}'
    },
    
    // Purchase dialog
    purchase: {
        unlockQuestion: 'Unlock {name}?',
        cost: '{icon} {amount} {type} (you have: {have})'
    },
    
    // Start screen
    start: {
        title: 'ERGo! v0.03-dev',
        subtitle: 'Explore the world through insect eyes',
        availableSpecies: 'Available species',
        availablePurchase: 'Available to purchase (starting with 10 ⚫ monochrome):',
        biologicalSpecs: 'BIOLOGICAL SPECS:',
        back: '← Back',
        startGame: 'START GAME ▶'
    },
    
    // Species names
    species: {
        honeybee: 'Western Honey Bee',
        bumblebee: 'Buff-tailed Bumblebee',
        hornet: 'European Hornet',
        ant: 'Black Carpenter Ant',
        housefly: 'Common House Fly',
        hoverfly: 'Drone Fly',
        vinegar_fly: 'Fruit Fly (Drosophila)',
        mosquito: 'Asian Tiger Mosquito',
        horsefly: 'Black Horse Fly',
        robber_fly: 'Robber Fly',
        peacock: 'Peacock Butterfly',
        cabbage_white: 'Small Cabbage White',
        monarch: 'Monarch Butterfly',
        hawk_moth: 'Hummingbird Hawk-moth',
        ladybug: 'Seven-spot Ladybird',
        firefly: 'Common Glow-worm',
        rose_chafer: 'Rose Chafer',
        stag_beetle: 'Stag Beetle'
    }
};
