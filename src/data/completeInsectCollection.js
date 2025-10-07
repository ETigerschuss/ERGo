/**
 * COMPLETE INSECT DATABASE - FULL COLLECTION
 * All insect species data preserved for future game expansion
 * 
 * This file contains ALL insects with complete scientific data.
 * For the current game prototype, see: insectDatabaseReal.js
 * 
 * IMPORTANT: Do not delete species from this file!
 * Future versions will include full collection/encyclopedia features.
 */

export const COMPLETE_INSECT_COLLECTION = {
    
    // ========================================================================
    // HYMENOPTERA (Bees, Wasps, Ants, Hornets)
    // ========================================================================
    
    hymenoptera: {
        // --- CURRENT GAME SPECIES ---
        
        ant: {
            name: "Black Garden Ant",
            scientificName: "Lasius niger",
            superfamily: "Hymenoptera",
            ommatidia: 100,
            spectrum: [525],
            colorSpectrum: ["G"],
            spectralWeights: { r: 0.2, g: 1.0, b: 0.2 },
            size: "3-5mm",
            wingspan: "N/A (wingless worker)",
            weight: "1-2mg",
            speed: 2,
            defogRadius: 60,
            color: 0x000000,
            funFact: "Lives in colonies of 15,000 - sees world in grayscale using edges",
            iNaturalist: 119329,
            visionType: "monochromat",
            gameBalance: { size: "tiny", order: 1, defogType: "B&W" },
            inCurrentGame: true
        },
        
        honeybee: {
            name: "Western Honeybee",
            scientificName: "Apis mellifera",
            superfamily: "Hymenoptera",
            ommatidia: 5500,
            spectrum: [344, 436, 544],
            colorSpectrum: ["UV", "B", "G"],
            spectralWeights: { r: 0.1, g: 1.0, b: 0.8 },
            size: "12-15mm",
            wingspan: "18-20mm",
            weight: "100mg",
            speed: 3,
            defogRadius: 30,
            color: 0xffaa00,
            funFact: "Dances to tell friends where flowers are - sees UV patterns we can't!",
            iNaturalist: 47219,
            visionType: "trichromat",
            gameBalance: { size: "medium", order: 2, defogType: "color" },
            inCurrentGame: true
        },
        
        bumblebee: {
            name: "Buff-tailed Bumblebee",
            scientificName: "Bombus terrestris",
            superfamily: "Hymenoptera",
            ommatidia: 4500,
            spectrum: [344, 430, 540],
            colorSpectrum: ["UV", "B", "G"],
            spectralWeights: { r: 0.15, g: 1.0, b: 0.85 },
            size: "20-22mm",
            wingspan: "30-35mm",
            weight: "850mg",
            speed: 2,
            defogRadius: 32,
            color: 0xffdd00,
            funFact: "Can fly in cold weather - fuzzy coat keeps them warm!",
            iNaturalist: 57792,
            visionType: "trichromat",
            gameBalance: { size: "large", order: 3, defogType: "color" },
            inCurrentGame: true
        },
        
        hornet: {
            name: "European Hornet",
            scientificName: "Vespa crabro",
            superfamily: "Hymenoptera",
            ommatidia: 3500,
            spectrum: [340, 430, 540],
            colorSpectrum: ["UV", "B", "G"],
            spectralWeights: { r: 0.2, g: 0.85, b: 1.0 },
            size: "25-35mm",
            wingspan: "40-50mm",
            weight: "1000mg",
            speed: 4,
            defogRadius: 35,
            color: 0xaa6600,
            funFact: "Only social wasp that hunts at night - exceptional vision!",
            iNaturalist: 52747,
            visionType: "trichromat",
            gameBalance: { size: "large", order: 4, defogType: "color" },
            inCurrentGame: true
        },
        
        // --- FUTURE EXPANSION SPECIES ---
        
        carpenter_bee: {
            name: "European Carpenter Bee",
            scientificName: "Xylocopa violacea",
            superfamily: "Hymenoptera",
            ommatidia: 5000,
            spectrum: [340, 430, 540],
            colorSpectrum: ["UV", "B", "G"],
            spectralWeights: { r: 0.15, g: 1.0, b: 0.9 },
            size: "20-25mm",
            wingspan: "35-40mm",
            weight: "600mg",
            funFact: "Metallic blue-black body - drills into wood to make nests",
            visionType: "trichromat",
            gameBalance: { size: "large", defogType: "color", suggested: true },
            inCurrentGame: false
        },
        
        paper_wasp: {
            name: "European Paper Wasp",
            scientificName: "Polistes dominula",
            superfamily: "Hymenoptera",
            ommatidia: 3000,
            spectrum: [340, 430, 535],
            colorSpectrum: ["UV", "B", "G"],
            spectralWeights: { r: 0.18, g: 0.9, b: 1.0 },
            size: "12-15mm",
            wingspan: "25-30mm",
            weight: "150mg",
            funFact: "Builds distinctive paper nests from chewed wood fibers",
            visionType: "trichromat",
            gameBalance: { size: "medium", defogType: "color" },
            inCurrentGame: false
        },
        
        leafcutter_ant: {
            name: "Leafcutter Ant",
            scientificName: "Atta cephalotes",
            superfamily: "Hymenoptera",
            ommatidia: 250,
            spectrum: [525],
            colorSpectrum: ["G"],
            spectralWeights: { r: 0.2, g: 1.0, b: 0.2 },
            size: "2-15mm",
            weight: "1-20mg",
            funFact: "Farms underground mushrooms by feeding them fresh-cut leaves",
            visionType: "monochromat",
            gameBalance: { size: "tiny-medium", defogType: "B&W" },
            inCurrentGame: false
        }
    },
    
    // ========================================================================
    // DIPTERA (Flies, Mosquitoes)
    // ========================================================================
    
    diptera: {
        // --- CURRENT GAME SPECIES ---
        
        vinegar_fly: {
            name: "Vinegar Fly",
            scientificName: "Drosophila melanogaster",
            superfamily: "Diptera",
            ommatidia: 760,
            spectrum: [330, 350, 370, 437, 480, 508],
            colorSpectrum: ["UV", "B", "G"],
            spectralWeights: { r: 0.3, g: 0.9, b: 1.0 },
            size: "2-3mm",
            wingspan: "6mm",
            weight: "1mg",
            speed: 3,
            defogRadius: 50,
            color: 0xccaa66,
            funFact: "Model organism with 6 photoreceptor types - R1-R6 broadband (330-600nm), R7/R8 specialized UV-G",
            iNaturalist: 47219,
            visionType: "hexachromat",
            gameBalance: { size: "tiny", order: 2, defogType: "color" },
            inCurrentGame: true
        },
        
        mosquito: {
            name: "Asian Tiger Mosquito",
            scientificName: "Aedes albopictus",
            superfamily: "Diptera",
            ommatidia: 780,
            spectrum: [515],
            colorSpectrum: ["G"],
            spectralWeights: { r: 0.0, g: 1.0, b: 0.0 },
            size: "2-10mm",
            wingspan: "3mm",
            weight: "2.5mg",
            speed: 2,
            defogRadius: 55,
            color: 0x333333,
            funFact: "Sees only shades of green - finds you by smell and heat!",
            iNaturalist: 125783,
            visionType: "monochromat",
            gameBalance: { size: "tiny", order: 1, defogType: "B&W" },
            inCurrentGame: true
        },
        
        housefly: {
            name: "House Fly",
            scientificName: "Musca domestica",
            superfamily: "Diptera",
            ommatidia: 3200,
            spectrum: [340, 460, 490, 520],
            colorSpectrum: ["UV", "B", "G"],
            spectralWeights: { r: 0.2, g: 0.85, b: 1.0 },
            size: "8-12mm",
            wingspan: "13-15mm",
            weight: "12mg",
            speed: 4,
            defogRadius: 28,
            color: 0x666666,
            funFact: "Found everywhere - processes visual info 4x faster than humans with 5 receptor types",
            iNaturalist: 6871,
            visionType: "pentachromat",
            gameBalance: { size: "small", order: 3, defogType: "color" },
            inCurrentGame: true
        },
        
        hoverfly: {
            name: "Common Drone Fly",
            scientificName: "Eristalis tenax",
            superfamily: "Diptera",
            ommatidia: 6400,
            spectrum: [350, 450, 520],
            colorSpectrum: ["UV", "B", "G"],
            spectralWeights: { r: 0.25, g: 0.85, b: 1.0 },
            size: "15mm",
            wingspan: "15mm",
            weight: "50mg",
            speed: 4,
            defogRadius: 25,
            color: 0xff8800,
            funFact: "Can hover in place - needs excellent motion detection with 6400 ommatidia and broadband receptors",
            iNaturalist: 53850,
            visionType: "trichromat",
            gameBalance: { size: "medium", order: 4, defogType: "color" },
            inCurrentGame: true
        },
        
        robber_fly: {
            name: "Robber Fly",
            scientificName: "Asilidae sp.",
            superfamily: "Diptera",
            ommatidia: 5500,
            spectrum: [350, 470, 520],
            colorSpectrum: ["UV", "B", "G"],
            spectralWeights: { r: 0.25, g: 0.9, b: 1.0 },
            size: "10-30mm",
            wingspan: "20-40mm",
            weight: "50mg",
            speed: 5,
            defogRadius: 28,
            color: 0x997744,
            funFact: "Aerial predator with amazing vision to catch prey mid-flight - broadband receptors for motion tracking",
            iNaturalist: 47652,
            visionType: "trichromat",
            gameBalance: { size: "medium", order: 5, defogType: "color" },
            inCurrentGame: true
        },
        
        horsefly: {
            name: "Horse Fly",
            scientificName: "Tabanus spp.",
            superfamily: "Diptera",
            ommatidia: 9000,
            spectrum: [360, 530, 620],
            colorSpectrum: ["UV", "G", "R"],
            spectralWeights: { r: 1.0, g: 0.8, b: 0.0 },
            size: "20-25mm",
            wingspan: "40-50mm",
            weight: "100mg",
            speed: 5,
            defogRadius: 30,
            color: 0x222222,
            funFact: "Fast hunter with good vision for tracking movement",
            iNaturalist: 2934,
            visionType: "trichromat-with-red",
            gameBalance: { size: "large", order: 6, defogType: "color" },
            inCurrentGame: true
        },
        
        // --- FUTURE EXPANSION SPECIES ---
        
        crane_fly: {
            name: "European Crane Fly",
            scientificName: "Tipula paludosa",
            superfamily: "Diptera",
            ommatidia: 1200,
            spectrum: [350, 450, 520],
            colorSpectrum: ["UV", "B", "G"],
            spectralWeights: { r: 0.15, g: 0.8, b: 1.0 },
            size: "20-25mm",
            wingspan: "30-40mm",
            weight: "40mg",
            funFact: "Often called 'daddy longlegs' - harmless despite scary appearance",
            visionType: "trichromat",
            gameBalance: { size: "large", defogType: "color" },
            inCurrentGame: false
        },
        
        bee_fly: {
            name: "Large Bee-fly",
            scientificName: "Bombylius major",
            superfamily: "Diptera",
            ommatidia: 5000,
            spectrum: [345, 440, 520],
            colorSpectrum: ["UV", "B", "G"],
            spectralWeights: { r: 0.3, g: 0.9, b: 0.85 },
            size: "10-12mm",
            wingspan: "20mm",
            weight: "30mg",
            funFact: "Hovers like a bee, has a long proboscis for nectar feeding",
            visionType: "trichromat",
            gameBalance: { size: "medium", defogType: "color" },
            inCurrentGame: false
        },
        
        blowfly: {
            name: "Greenbottle Fly",
            scientificName: "Lucilia sericata",
            superfamily: "Diptera",
            ommatidia: 4000,
            spectrum: [340, 455, 515],
            colorSpectrum: ["UV", "B", "G"],
            spectralWeights: { r: 0.2, g: 0.9, b: 1.0 },
            size: "10-14mm",
            wingspan: "16mm",
            weight: "20mg",
            funFact: "Metallic green body - used in forensic science to estimate time of death",
            visionType: "trichromat",
            gameBalance: { size: "medium", defogType: "color" },
            inCurrentGame: false
        }
    },
    
    // ========================================================================
    // LEPIDOPTERA (Butterflies, Moths)
    // ========================================================================
    
    lepidoptera: {
        // --- CURRENT GAME SPECIES ---
        
        hawk_moth: {
            name: "Hummingbird Hawk-moth",
            scientificName: "Macroglossum stellatarum",
            superfamily: "Lepidoptera",
            ommatidia: 8000,
            spectrum: [349, 440, 521, 580],
            colorSpectrum: ["UV", "B", "G"],
            spectralWeights: { r: 0.4, g: 1.0, b: 0.7 },
            size: "40-50mm",
            wingspan: "40-45mm",
            weight: "300mg",
            speed: 4,
            defogRadius: 25,
            color: 0x996633,
            funFact: "Hovers like a hummingbird - broadband photoreceptors extend into orange/red spectrum",
            iNaturalist: 5379,
            visionType: "trichromat",
            gameBalance: { size: "medium", order: 1, defogType: "color" },
            inCurrentGame: true
        },
        
        peacock: {
            name: "Peacock Butterfly",
            scientificName: "Aglais io",
            superfamily: "Lepidoptera",
            ommatidia: 12000,
            spectrum: [360, 460, 530],
            colorSpectrum: ["UV", "B", "G"],
            spectralWeights: { r: 0.3, g: 0.9, b: 0.85 },
            size: "50-55mm",
            wingspan: "60-70mm",
            weight: "400mg",
            speed: 3,
            defogRadius: 22,
            color: 0x8800aa,
            funFact: "Caterpillars feed on nettles - adults drink in beer gardens! Broadband receptors detect into red.",
            iNaturalist: 16942,
            visionType: "trichromat",
            gameBalance: { size: "large", order: 2, defogType: "color" },
            inCurrentGame: true
        },
        
        monarch: {
            name: "Monarch Butterfly",
            scientificName: "Danaus plexippus",
            superfamily: "Lepidoptera",
            ommatidia: 12000,
            spectrum: [340, 435, 540],
            colorSpectrum: ["UV", "B", "G"],
            spectralWeights: { r: 0.35, g: 1.0, b: 0.75 },
            size: "90-100mm",
            wingspan: "90-100mm",
            weight: "500mg",
            speed: 3,
            defogRadius: 22,
            color: 0xff6600,
            funFact: "Migrates 3000 miles using sun compass navigation - found only in America. Long-wavelength detection aids flower finding.",
            iNaturalist: 119002,
            visionType: "trichromat",
            gameBalance: { size: "large", order: 3, defogType: "color" },
            inCurrentGame: true
        },
        
        cabbage_white: {
            name: "Cabbage White",
            scientificName: "Pieris rapae",
            superfamily: "Lepidoptera",
            ommatidia: 10000,
            spectrum: [360, 425, 540, 600],
            colorSpectrum: ["UV", "Vi", "G", "R"],
            spectralWeights: { r: 1.0, g: 0.9, b: 0.85 },
            size: "45-60mm",
            wingspan: "45-60mm",
            weight: "150mg",
            speed: 3,
            defogRadius: 20,
            color: 0xeeeeee,
            funFact: "Has 6 color receptors - sees colors we can't imagine!",
            iNaturalist: 43887,
            visionType: "tetrachromat",
            gameBalance: { size: "medium", order: 4, defogType: "color" },
            inCurrentGame: true
        },
        
        // --- FUTURE EXPANSION SPECIES ---
        
        swallowtail: {
            name: "Old World Swallowtail",
            scientificName: "Papilio machaon",
            superfamily: "Lepidoptera",
            ommatidia: 12000,
            spectrum: [360, 460, 540],
            colorSpectrum: ["UV", "B", "G"],
            spectralWeights: { r: 0.3, g: 1.0, b: 0.85 },
            size: "80-95mm",
            wingspan: "65-86mm",
            weight: "400mg",
            funFact: "Distinctive tail streamers and yellow wings with blue spots",
            visionType: "trichromat",
            gameBalance: { size: "large", defogType: "color" },
            inCurrentGame: false
        },
        
        red_admiral: {
            name: "Red Admiral",
            scientificName: "Vanessa atalanta",
            superfamily: "Lepidoptera",
            ommatidia: 11000,
            spectrum: [360, 450, 530],
            colorSpectrum: ["UV", "B", "G"],
            spectralWeights: { r: 0.3, g: 0.95, b: 0.85 },
            size: "55-60mm",
            wingspan: "64-78mm",
            weight: "350mg",
            funFact: "Migrates from Europe to UK - loves overripe fruit and tree sap",
            visionType: "trichromat",
            gameBalance: { size: "large", defogType: "color" },
            inCurrentGame: false
        },
        
        painted_lady: {
            name: "Painted Lady",
            scientificName: "Vanessa cardui",
            superfamily: "Lepidoptera",
            ommatidia: 11000,
            spectrum: [360, 455, 535],
            colorSpectrum: ["UV", "B", "G"],
            spectralWeights: { r: 0.3, g: 0.95, b: 0.8 },
            size: "50-55mm",
            wingspan: "50-73mm",
            weight: "300mg",
            funFact: "Found on every continent except Antarctica and South America",
            visionType: "trichromat",
            gameBalance: { size: "large", defogType: "color" },
            inCurrentGame: false
        },
        
        luna_moth: {
            name: "Luna Moth",
            scientificName: "Actias luna",
            superfamily: "Lepidoptera",
            ommatidia: 7000,
            spectrum: [350, 440, 520],
            colorSpectrum: ["UV", "B", "G"],
            spectralWeights: { r: 0.25, g: 0.9, b: 0.75 },
            size: "75-105mm",
            wingspan: "75-105mm",
            weight: "600mg",
            funFact: "Stunning lime-green wings - adults don't eat, living only one week",
            visionType: "trichromat",
            gameBalance: { size: "huge", defogType: "color", nocturnal: true },
            inCurrentGame: false
        }
    },
    
    // ========================================================================
    // COLEOPTERA (Beetles)
    // ========================================================================
    
    coleoptera: {
        // --- CURRENT GAME SPECIES ---
        
        ladybug: {
            name: "Seven-spot Ladybug",
            scientificName: "Coccinella septempunctata",
            superfamily: "Coleoptera",
            ommatidia: 3000,
            spectrum: [360, 420, 520],
            colorSpectrum: ["UV", "B", "G"],
            spectralWeights: { r: 0.2, g: 1.0, b: 0.7 },
            size: "5.5-8mm",
            wingspan: "10-12mm",
            weight: "15mg",
            speed: 2,
            defogRadius: 35,
            color: 0xff0000,
            funFact: "Can see green aphids against green leaves using color contrast - broadband receptors aid detection",
            iNaturalist: 41716,
            visionType: "trichromat",
            gameBalance: { size: "tiny", order: 3, defogType: "color" },
            inCurrentGame: true
        },
        
        rose_chafer: {
            name: "Rose Chafer",
            scientificName: "Cetonia aurata",
            superfamily: "Coleoptera",
            ommatidia: 3500,
            spectrum: [360, 530, 600],
            colorSpectrum: ["UV", "G", "R"],
            spectralWeights: { r: 1.0, g: 0.95, b: 0.0 },
            size: "14-20mm",
            wingspan: "25-30mm",
            weight: "800mg",
            speed: 2,
            defogRadius: 35,
            color: 0x00aa44,
            funFact: "Metallic green color and feeds on flower pollen",
            iNaturalist: 6787,
            visionType: "trichromat-with-red",
            gameBalance: { size: "medium", order: 4, defogType: "color" },
            inCurrentGame: true
        },
        
        firefly: {
            name: "European Firefly",
            scientificName: "Lampyris noctiluca",
            superfamily: "Coleoptera",
            ommatidia: 2000,
            spectrum: [440, 520],
            colorSpectrum: ["B", "G"],
            spectralWeights: { r: 0.15, g: 1.0, b: 0.8 },
            size: "10-20mm",
            wingspan: "15-25mm",
            weight: "100mg",
            speed: 1,
            defogRadius: 40,
            color: 0x88ff00,
            funFact: "Glows green to attract mates - no UV vision (nocturnal)",
            iNaturalist: 1558,
            visionType: "dichromat",
            gameBalance: { size: "small", order: 2, defogType: "color" },
            inCurrentGame: true
        },
        
        stag_beetle: {
            name: "Stag Beetle",
            scientificName: "Lucanus cervus",
            superfamily: "Coleoptera",
            ommatidia: 800,
            spectrum: [525],
            colorSpectrum: ["G"],
            spectralWeights: { r: 0.15, g: 1.0, b: 0.2 },
            size: "30-75mm",
            wingspan: "50-80mm",
            weight: "3000mg",
            speed: 1,
            defogRadius: 50,
            color: 0x442200,
            funFact: "Europe's largest beetle - males have impressive antler-like mandibles. Poor vision, relies on pheromones",
            iNaturalist: 5832,
            visionType: "monochromat",
            gameBalance: { size: "huge", order: 1, defogType: "B&W" },
            inCurrentGame: true
        },
        
        // --- FUTURE EXPANSION SPECIES ---
        
        ground_beetle: {
            name: "Violet Ground Beetle",
            scientificName: "Carabus violaceus",
            superfamily: "Coleoptera",
            ommatidia: 2500,
            spectrum: [360, 440, 520],
            colorSpectrum: ["UV", "B", "G"],
            spectralWeights: { r: 0.2, g: 1.0, b: 0.8 },
            size: "20-30mm",
            weight: "400mg",
            funFact: "Nocturnal predator with metallic violet edges on black body",
            visionType: "trichromat",
            gameBalance: { size: "medium", defogType: "color", nocturnal: true },
            inCurrentGame: false
        },
        
        jewel_beetle: {
            name: "Jewel Beetle",
            scientificName: "Buprestidae sp.",
            superfamily: "Coleoptera",
            ommatidia: 3000,
            spectrum: [360, 530, 580],
            colorSpectrum: ["UV", "G", "O"],
            spectralWeights: { r: 0.7, g: 1.0, b: 0.3 },
            size: "15-25mm",
            weight: "200mg",
            funFact: "Iridescent metallic colors - attracted to forest fires (heat detection)",
            visionType: "trichromat",
            gameBalance: { size: "medium", defogType: "color" },
            inCurrentGame: false
        },
        
        tiger_beetle: {
            name: "Green Tiger Beetle",
            scientificName: "Cicindela campestris",
            superfamily: "Coleoptera",
            ommatidia: 4500,
            spectrum: [350, 450, 520],
            colorSpectrum: ["UV", "B", "G"],
            spectralWeights: { r: 0.3, g: 1.0, b: 0.9 },
            size: "12-15mm",
            weight: "80mg",
            funFact: "One of the fastest running insects - hunts prey visually at high speed",
            visionType: "trichromat",
            gameBalance: { size: "small", defogType: "color", speed: "very-fast" },
            inCurrentGame: false
        },
        
        rhinoceros_beetle: {
            name: "European Rhinoceros Beetle",
            scientificName: "Oryctes nasicornis",
            superfamily: "Coleoptera",
            ommatidia: 1500,
            spectrum: [520],
            colorSpectrum: ["G"],
            spectralWeights: { r: 0.15, g: 1.0, b: 0.2 },
            size: "25-40mm",
            weight: "5000mg",
            funFact: "Males have large horn - can lift 850x their own weight!",
            visionType: "monochromat",
            gameBalance: { size: "huge", defogType: "B&W", nocturnal: true },
            inCurrentGame: false
        }
    },
    
    // ========================================================================
    // FUTURE ORDERS (Not yet implemented)
    // ========================================================================
    
    odonata: {
        dragonfly: {
            name: "Emperor Dragonfly",
            scientificName: "Anax imperator",
            superfamily: "Odonata",
            ommatidia: 30000,
            spectrum: [310, 340, 430, 520, 620],
            colorSpectrum: ["UV", "UV2", "B", "G", "R"],
            spectralWeights: { r: 1.0, g: 1.0, b: 1.0 },
            size: "70-85mm",
            wingspan: "90-110mm",
            weight: "900mg",
            funFact: "Best vision in insect world - 30,000 ommatidia and 5 color channels!",
            visionType: "pentachromat-with-red",
            gameBalance: { size: "huge", defogType: "color", speed: "very-fast", best: true },
            inCurrentGame: false
        },
        
        damselfly: {
            name: "Azure Damselfly",
            scientificName: "Coenagrion puella",
            superfamily: "Odonata",
            ommatidia: 8000,
            spectrum: [340, 430, 520, 610],
            colorSpectrum: ["UV", "B", "G", "R"],
            spectralWeights: { r: 0.9, g: 1.0, b: 0.9 },
            size: "30-35mm",
            wingspan: "35-45mm",
            weight: "100mg",
            funFact: "Brilliant blue color - related to dragonflies but smaller and more delicate",
            visionType: "tetrachromat-with-red",
            gameBalance: { size: "medium", defogType: "color", speed: "fast" },
            inCurrentGame: false
        }
    },
    
    orthoptera: {
        grasshopper: {
            name: "Meadow Grasshopper",
            scientificName: "Chorthippus parallelus",
            superfamily: "Orthoptera",
            ommatidia: 1500,
            spectrum: [350, 440, 520],
            colorSpectrum: ["UV", "B", "G"],
            spectralWeights: { r: 0.2, g: 1.0, b: 0.7 },
            size: "15-20mm",
            weight: "300mg",
            funFact: "Can jump 20x its body length - excellent motion detection",
            visionType: "trichromat",
            gameBalance: { size: "medium", defogType: "color" },
            inCurrentGame: false
        },
        
        cricket: {
            name: "Field Cricket",
            scientificName: "Gryllus campestris",
            superfamily: "Orthoptera",
            ommatidia: 800,
            spectrum: [510],
            colorSpectrum: ["G"],
            spectralWeights: { r: 0.1, g: 1.0, b: 0.1 },
            size: "20-26mm",
            weight: "500mg",
            funFact: "Males chirp by rubbing wings - hearing more important than vision",
            visionType: "monochromat",
            gameBalance: { size: "medium", defogType: "B&W", nocturnal: true },
            inCurrentGame: false
        }
    }
};

// ========================================================================
// METADATA & ORGANIZATION
// ========================================================================

export const COLLECTION_METADATA = {
    totalSpecies: 40,
    inCurrentGame: 16,
    futureExpansion: 24,
    
    byOrder: {
        Hymenoptera: { total: 7, current: 4, future: 3 },
        Diptera: { total: 9, current: 6, future: 3 },
        Lepidoptera: { total: 8, current: 4, future: 4 },
        Coleoptera: { total: 8, current: 4, future: 4 },
        Odonata: { total: 2, current: 0, future: 2 },
        Orthoptera: { total: 2, current: 0, future: 2 }
    },
    
    byVisionType: {
        monochromat: 6,
        dichromat: 1,
        trichromat: 21,
        tetrachromat: 2,
        pentachromat: 2,
        hexachromat: 1,
        withRedReceptor: 7
    },
    
    sizeDistribution: {
        tiny: 7,      // <5mm
        small: 6,     // 5-15mm
        medium: 13,   // 15-30mm
        large: 10,    // 30-60mm
        huge: 4       // >60mm
    }
};

export default COMPLETE_INSECT_COLLECTION;
