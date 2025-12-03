// German translations
export const LANG_DE = {
    // Game instructions
    instructions: {
        line1: 'Klicke auf Art-Box um Insekten freizuschalten | Klicke auf Insekt zum Auswählen, klicke um Pfad zu setzen',
        line2: 'Mini-Emojis wählen Insekten | Klicke auf leeren Bereich um alle Insekten zu befehligen'
    },
    
    // Species box messages
    speciesBox: {
        unlock: 'FREISCHALTEN',
        unlocked: 'Freigeschaltet!',
        cannotAfford: 'Nicht genug Ressourcen',
        speciesActive: 'Art noch am Leben - warte bis sie sterben',
        familyBlocked: 'Familie besetzt von {species}',
        progress: 'Fortschritt: {current}/{total}'
    },
    
    // Currency/Rhodopsin system
    currency: {
        monochrome: 'Monochrom',
        red: 'Rot',
        green: 'Grün',
        blue: 'Blau',
        unlocked: '{type} Rhodopsin freigeschaltet!'
    },
    
    // Timer and completion
    timer: {
        time: 'Zeit',
        best: 'Beste',
        level: 'Level {num}',
        completed: 'Level Abgeschlossen!',
        newBestTime: 'NEUE BESTZEIT!',
        newRecord: '✨ Neuer persönlicher Rekord! ✨',
        yourTime: 'Deine Zeit: {time}',
        bestTime: 'Beste Zeit: {time}',
        achieved: 'Erreicht: {date}',
        levelsCompleted: 'Level Abgeschlossen: {count}/5',
        continue: 'WEITER',
        retry: 'NOCHMAL',
        nextLevel: '▶ Nächstes Level ({num})',
        viewReward: '🎁 Finale Belohnung ansehen 🎁',
        diamondTitle: '💎 Level {num} Abgeschlossen! 💎',
        total: 'Gesamt: {amount} 💎',
        yourRank: 'DEIN RANG: #{rank}',
        you: '(du)'
    },
    
    // Introduction screen
    intro: {
        title: 'ERGo! - Evolution des Farbsehens',
        subtitle: 'Level {num}',
        objective: 'Über Rhodopsine & Farbempfindlichkeiten:',
        objectiveText: 'Insekten enthüllen das Bild und sammeln Rhodopsine (⚫🔴🟢🔵)\nbasierend auf ihrer Farbempfindlichkeit. Nutze Rhodopsine um neue Arten freizuschalten!',
        rules: 'Regeln:',
        rule1: 'Schalte alle 16 Arten so schnell wie möglich frei',
        rule1sub: 'um Zeitbonus-Diamanten zu verdienen!',
        rule2: 'Enthülle so viel vom Bild wie möglich',
        rule2sub: 'um Rhodopsine in Diamanten zu verwandeln!',
        rule3: 'Nur 1 Art pro Familie erlaubt',
        rule3sub: 'Warte bis die Art verschwindet bevor du eine andere aus derselben Familie erzeugst',
        rule4: 'Nur 1 Art pro Familie erlaubt',
        rule4sub: 'Warte bis sie verschwindet bevor du eine andere aus derselben Familie erzeugst',
        rule5: 'Sammle Diamant-Belohnungen für schnellere Fertigstellung',
        start: 'LEVEL STARTEN',
        controls: 'Steuerung:',
        control1: '• Klicke Insekten zum Auswählen, klicke nochmal um Wegpunkte zu setzen',
        control2: '• Klicke Mini-Emojis in Art-Boxen für schnelle Auswahl',
        control3: '• Klicke auf leeren Bereich um alle Insekten zu befehligen'
    },
    
    // Unlock messages
    unlock: {
        species: '{name} freigeschaltet!',
        allSpecies: 'Alle Arten freigeschaltet! Level abgeschlossen!',
        colorVision: 'Farbsehen freigeschaltet!'
    },
    
    // Error messages
    error: {
        insufficientResources: 'Benötigt: {resources}',
        speciesLimit: 'Maximal 3 Arten gleichzeitig aktiv',
        familyOccupied: 'Warte bis {species} stirbt'
    },
    
    // Collectibles
    collectible: {
        diamond: '+{amount} zu allen Rhodopsinen!'
    },
    
    // High scores
    highScore: {
        title: 'Bestzeiten',
        level: 'Level {num}',
        noScore: 'Noch keine Zeit',
        diamondTitle: '💎 LEVEL {num} 💎',
        timeLabel: 'Zeit: {time}',
        complete: '✓ {count}/5 Abgeschlossen'
    },
    
    // Final reward
    finalReward: {
        title: '🎉 GLÜCKWUNSCH! 🎉',
        message: 'Du hast alle 5 Level abgeschlossen!',
        total: '🏆 Gesamt: {time} | {diamonds}💎 🏆',
        playAgain: '▶ Alle Level nochmal spielen',
        species: 'Drosophila melanogaster',
        description: 'Die Fruchtfliege - ein Modellorganismus für Genetik und Sehforschung',
        close: 'SCHLIEẞEN'
    },
    
    // Spectral evolution display
    spectral: {
        title: 'Spektrale Evolution',
        monochrome: 'Monochrom',
        dichromat: 'Dichromat',
        trichromat: 'Trichromat',
        tetrachromat: 'Tetrachromat'
    },
    
    // Buttons
    buttons: {
        start: 'START',
        continue: 'WEITER',
        retry: 'NOCHMAL',
        close: 'SCHLIEẞEN',
        ok: 'OK',
        cancel: 'ABBRECHEN',
        yes: 'JA',
        no: 'NEIN',
        unlock: 'FREISCHALTEN',
        finalReward: '🎁 Finale Belohnung',
        nextLevel: '▶ Level {num}',
        highscores: '📊 Bestenliste'
    },
    
    // Messages and notifications
    messages: {
        speciesActiveTitle: '{name} noch am Leben!',
        speciesActiveBody: 'Warte bis sie sterben bevor du mehr spawnen kannst.\nKann nur EINMAL spawnen bis alle tot sind.',
        familyBlockedTitle: 'Familie besetzt!',
        familyBlockedBody: '{family} ist besetzt von {species}.\nWarte bis sie zuerst sterben.',
        insufficientTitle: 'Nicht genug Ressourcen!',
        insufficientBody: 'Du benötigst:',
        unlockTitle: '{name} freigeschaltet!',
        unlockBody: 'Klicke die Art-Box nochmal um sie zu spawnen.',
        allUnlockedTitle: 'Alle Arten freigeschaltet!',
        allUnlockedBody: 'Level abgeschlossen! Gut gemacht!',
        colorVisionTitle: 'Farbsehen freigeschaltet!',
        colorVisionBody: 'Du kannst jetzt in Farbe sehen!\nTrichromatische Insekten enthüllen RGB-Kanäle.',
        diamondCollected: '+{amount} zu allen Rhodopsinen!',
        youHave: 'du hast: {amount}'
    },
    
    // Purchase dialog
    purchase: {
        unlockQuestion: '{name} freischalten?',
        cost: '{icon} {amount} {type} (du hast: {have})'
    },
    
    // Start screen
    start: {
        title: 'ERGo! v0.03-dev',
        subtitle: 'Erkunde die Welt durch Insektenaugen',
        availableSpecies: 'Verfügbare Arten',
        availablePurchase: 'Zum Kauf verfügbar (Start mit 10 ⚫ Monochrom):',
        biologicalSpecs: 'BIOLOGISCHE EIGENSCHAFTEN:',
        back: '← Zurück',
        startGame: 'SPIEL STARTEN ▶'
    },
    
    // Species names
    species: {
        honeybee: 'Westliche Honigbiene',
        bumblebee: 'Gemeine Erdhummel',
        hornet: 'Europäische Hornisse',
        ant: 'Schwarze Rossameise',
        housefly: 'Gemeine Stubenfliege',
        hoverfly: 'Mistbiene',
        vinegar_fly: 'Taufliege (Drosophila)',
        mosquito: 'Asiatische Tigermücke',
        horsefly: 'Schwarze Pferdebremse',
        robber_fly: 'Raubfliege',
        peacock: 'Tagpfauenauge',
        cabbage_white: 'Kleiner Kohlweißling',
        monarch: 'Monarchfalter',
        hawk_moth: 'Taubenschwänzchen',
        ladybug: 'Siebenpunkt-Marienkäfer',
        firefly: 'Großer Leuchtkäfer',
        rose_chafer: 'Goldglänzender Rosenkäfer',
        stag_beetle: 'Hirschkäfer'
    }
};
