/**
 * ERGo! Insect Database - Real Data from Research
 * Data source: ERGo! Funfacts.csv with scientific measurements
 * 
 * Spectral sensitivity data based on scientific literature:
 * - Gaussian photoreceptor curves with ~50nm FWHM
 * - RGB weights calculated from overlap with screen phosphors
 * - Exaggerated 2x for gameplay visibility
 */

import { SPECTRAL_PROFILES, getRevealWeightsForInsect } from './spectralSensitivity.js';

// Superfamily emojis
export const SUPERFAMILY_EMOJI = {
    "Hymenoptera": "🐝",  // Bees, Wasps, Ants
    "Diptera": "🪰",       // Flies, Mosquitoes  
    "Lepidoptera": "🦋",   // Butterflies, Moths
    "Coleoptera": "🪲"     // Beetles
};

export const INSECT_DATABASE = {
    // ========== HYMENOPTERA (Bees, Wasps, Ants) ==========
    
    honeybee: {
        name: "Honeybee",
        scientificName: "Apis mellifera",
        superfamily: "Hymenoptera",
        ommatidia: 5000,  // Average of 4752-5432
        spectrum: [346, 430, 540],  // UV, Blue, Green - no red sensitivity
        colorSpectrum: ["UV", "B", "G"],
        spectralWeights: { r: 0.1, g: 1.0, b: 0.8 },  // Slight red (broadband tails), strong green+blue
        size: "11-18mm",
        wingspan: "18mm",
        weight: "82mg",
        speed: 3,
        defogRadius: 30,
        color: 0xffaa00,
        funFact: "Can pollinate nearly everything - responsible for 64% of pollination",
        iNaturalist: 133761
    },
    
    bumblebee: {
        name: "Buff-tailed Bumblebee",
        scientificName: "Bombus terrestris",
        superfamily: "Hymenoptera",
        ommatidia: 6250,  // Average of 6000-6500
        spectrum: [348, 435, 533],
        colorSpectrum: ["UV", "B", "G"],
        spectralWeights: { r: 0.15, g: 1.0, b: 0.85 },  // Slight red (broadband), very strong green+blue
        size: "11-28mm",
        wingspan: "22-34mm",
        weight: "50-400mg",
        speed: 2,
        defogRadius: 32,
        color: 0xffdd00,
        funFact: "Large compound eyes help navigate and find flowers in dim light",
        iNaturalist: 11306
    },
    
    hornet: {
        name: "European Hornet",
        scientificName: "Vespa crabro",
        superfamily: "Hymenoptera",
        ommatidia: 5500,  // Estimated based on similar species
        spectrum: [346, 445, 529],
        colorSpectrum: ["UV", "B", "G"],
        spectralWeights: { r: 0.2, g: 0.85, b: 1.0 },  // Some red (broadband), blue-shifted for hunting
        size: "18-35mm",
        wingspan: "40-50mm",
        weight: "200-300mg",
        speed: 4,
        defogRadius: 28,
        color: 0xff9900,
        funFact: "Active hunters with excellent vision for tracking prey",
        iNaturalist: 12364
    },
    
    ant: {
        name: "Red Wood Ant",
        scientificName: "Formica rufa",
        superfamily: "Hymenoptera",
        ommatidia: 1200,  // Increased from 500 - ants actually have decent eyes for their size
        spectrum: [540],  // Single receptor - monochromat
        colorSpectrum: ["G"], // Only green - but excellent edge detection!
        spectralWeights: { r: 0.2, g: 1.0, b: 0.3 },  // Mostly green with slight R+B for better edges
        size: "4-11mm",
        wingspan: "5-12mm",
        weight: "10-20mg",
        speed: 1,
        defogRadius: 50,  // Larger radius - they defog more area as edge detectors
        color: 0xaa3300,
        funFact: "15-20% of terrestrial biomass - despite monochromatic vision, excellent edge detectors using chemical trails",
        iNaturalist: 1781
    },

    // ========== DIPTERA (Flies, Mosquitoes) ==========
    
    housefly: {
        name: "Common Housefly",
        scientificName: "Musca domestica",
        superfamily: "Diptera",
        ommatidia: 3450,
        spectrum: [335, 355, 460, 490, 530],  // 5 receptors!
        colorSpectrum: ["UV", "B", "G"],
        spectralWeights: { r: 0.2, g: 0.85, b: 1.0 },  // Slight red (R1-R6 broadband), cyan-shifted
        size: "8-12mm",
        wingspan: "13-15mm",
        weight: "12mg",
        speed: 4,
        defogRadius: 28,
        color: 0x666666,
        funFact: "Found everywhere - processes visual info 4x faster than humans with 5 receptor types",
        iNaturalist: 6871
    },
    
    hoverfly: {
        name: "Common Drone Fly",
        scientificName: "Eristalis tenax",
        superfamily: "Diptera",
        ommatidia: 6400,  // Very high for precise hovering
        spectrum: [350, 450, 520],
        colorSpectrum: ["UV", "B", "G"],
        spectralWeights: { r: 0.25, g: 0.85, b: 1.0 },  // Some red (broadband), very strong blue+green
        size: "15mm",
        wingspan: "15mm",
        weight: "50mg",
        speed: 4,
        defogRadius: 25,
        color: 0xff8800,
        funFact: "Can hover in place - needs excellent motion detection with 6400 ommatidia and broadband receptors",
        iNaturalist: 13697
    },
    
    vinegar_fly: {
        name: "Vinegar Fly (Drosophila)",
        scientificName: "Drosophila melanogaster",
        superfamily: "Diptera",
        ommatidia: 760,  // Small eye with ~760 ommatidia
        spectrum: [330, 350, 370, 437, 480, 508],  // R1-R6 (broad), R7p (UV), R7y (UV+B), R8p (B), R8y (G) - very broad!
        colorSpectrum: ["UV", "B", "G"],
        spectralWeights: { r: 0.3, g: 0.9, b: 1.0 },  // Broad detection including some red (R1-R6 broadband to 600nm)
        size: "2-3mm",
        wingspan: "6mm",
        weight: "1mg",
        speed: 3,
        defogRadius: 50,  // Increased from 35 - better vision for its size
        color: 0xccaa66,
        funFact: "Model organism with 6 photoreceptor types - R1-R6 broadband (330-600nm), R7/R8 specialized UV-G",
        iNaturalist: 47219
    },
    
    mosquito: {
        name: "Asian Tiger Mosquito",
        scientificName: "Aedes albopictus",
        superfamily: "Diptera",
        ommatidia: 780,
        spectrum: [515],  // Very limited - single peak
        colorSpectrum: ["G"], // Only green - no UV, no red, no blue!
        spectralWeights: { r: 0.0, g: 1.0, b: 0.0 },  // ONLY green - monochromat!
        size: "2-10mm",
        wingspan: "3-4mm",
        weight: "2mg",
        speed: 3,
        defogRadius: 40,
        color: 0x444444,
        funFact: "Detects hosts using CO2 and heat more than vision",
        iNaturalist: 3542
    },
    
    horsefly: {
        name: "Black Horsefly",
        scientificName: "Tabanus atratus",
        superfamily: "Diptera",
        ommatidia: 5000,  // Estimated
        spectrum: [360, 530, 620],  // UV, Green, RED - hunts warm animals
        colorSpectrum: ["UV", "G", "R"], // Can see red - rare for insects!
        spectralWeights: { r: 1.0, g: 0.8, b: 0.0 },  // Strong RED+green, NO blue - unique!
        size: "20-25mm",
        wingspan: "40-50mm",
        weight: "100mg",
        speed: 5,
        defogRadius: 30,
        color: 0x222222,
        funFact: "Fast hunter with good vision for tracking movement",
        iNaturalist: 2934
    },
    
    robber_fly: {
        name: "Robber Fly",
        scientificName: "Asilidae sp.",
        superfamily: "Diptera",
        ommatidia: 5500,  // Predatory flies have excellent vision
        spectrum: [350, 470, 520],
        colorSpectrum: ["UV", "B", "G"],
        spectralWeights: { r: 0.25, g: 0.9, b: 1.0 },  // Some red (broadband), strong blue+green
        size: "10-30mm",
        wingspan: "20-40mm",
        weight: "50mg",
        speed: 5,
        defogRadius: 28,
        color: 0x997744,
        funFact: "Aerial predator with amazing vision to catch prey mid-flight - broadband receptors for motion tracking",
        iNaturalist: 47652
    },

    // ========== LEPIDOPTERA (Butterflies & Moths) ==========
    
    peacock: {
        name: "Peacock Butterfly",
        scientificName: "Aglais io",
        superfamily: "Lepidoptera",
        ommatidia: 12000,  // Estimated based on similar species
        spectrum: [360, 460, 530],
        colorSpectrum: ["UV", "B", "G"],
        spectralWeights: { r: 0.3, g: 0.9, b: 0.85 },  // Some red (broadband), balanced green+blue
        size: "50-55mm",
        wingspan: "60-70mm",
        weight: "400mg",
        speed: 3,
        defogRadius: 22,
        color: 0x8800aa,
        funFact: "Caterpillars feed on nettles - adults drink in beer gardens! Broadband receptors detect into red.",
        iNaturalist: 16942
    },
    
    cabbage_white: {
        name: "Cabbage White",
        scientificName: "Pieris rapae",
        superfamily: "Lepidoptera",
        ommatidia: 10000,
        spectrum: [360, 420, 440, 560, 620, 640],  // 6 receptors! Best color vision
        colorSpectrum: ["UV", "B", "G", "R"],
        spectralWeights: { r: 1.0, g: 1.0, b: 0.8 },  // Excellent FULL spectrum - sees ALL colors!
        size: "32-47mm",
        wingspan: "45-60mm",
        weight: "150mg",
        speed: 3,
        defogRadius: 20,
        color: 0xeeeeee,
        funFact: "Has 6 color receptors - sees colors we can't imagine!",
        iNaturalist: 43887
    },
    
    monarch: {
        name: "Monarch Butterfly",
        scientificName: "Danaus plexippus",
        superfamily: "Lepidoptera",
        ommatidia: 12000,
        spectrum: [340, 435, 540],
        colorSpectrum: ["UV", "B", "G"],
        spectralWeights: { r: 0.35, g: 1.0, b: 0.75 },  // Some red (broadband tails), strong green+blue for navigation
        size: "90-100mm",
        wingspan: "90-100mm",
        weight: "500mg",
        speed: 3,
        defogRadius: 22,
        color: 0xff6600,
        funFact: "Migrates 3000 miles using sun compass navigation - found only in America. Long-wavelength detection aids flower finding.",
        iNaturalist: 119002
    },
    
    hawk_moth: {
        name: "Hummingbird Hawk-moth",
        scientificName: "Macroglossum stellatarum",
        superfamily: "Lepidoptera",
        ommatidia: 8000,
        spectrum: [349, 440, 521, 580],  // UV, Blue, Green, Orange - broadband detection into red
        colorSpectrum: ["UV", "B", "G"],
        spectralWeights: { r: 0.4, g: 1.0, b: 0.7 },  // Some red (broadband tail), strong green+blue
        size: "40-50mm",
        wingspan: "40-45mm",
        weight: "300mg",
        speed: 4,
        defogRadius: 25,
        color: 0x996633,
        funFact: "Hovers like a hummingbird - broadband photoreceptors extend into orange/red spectrum",
        iNaturalist: 5379
    },

    // ========== COLEOPTERA (Beetles) ==========
    
    ladybug: {
        name: "Seven-spot Ladybug",
        scientificName: "Coccinella septempunctata",
        superfamily: "Coleoptera",
        ommatidia: 3000,  // Estimated
        spectrum: [360, 420, 520],
        colorSpectrum: ["UV", "B", "G"],
        spectralWeights: { r: 0.2, g: 1.0, b: 0.7 },  // Some red (broadband), very strong green+blue for aphids
        size: "5.5-8mm",
        wingspan: "10-12mm",
        weight: "15mg",
        speed: 2,
        defogRadius: 35,
        color: 0xff0000,
        funFact: "Can see green aphids against green leaves using color contrast - broadband receptors aid detection",
        iNaturalist: 41716
    },
    
    firefly: {
        name: "European Firefly",
        scientificName: "Lampyris noctiluca",
        superfamily: "Coleoptera",
        ommatidia: 2000,
        spectrum: [440, 520],  // Nocturnal - no UV!
        colorSpectrum: ["B", "G"], // Blue-green vision for bioluminescence
        spectralWeights: { r: 0.15, g: 1.0, b: 0.8 },  // Slight red (broadband), green+blue for bioluminescence
        size: "10-20mm",
        wingspan: "15-25mm",
        weight: "100mg",
        speed: 2,
        defogRadius: 40,
        color: 0xaaff00,
        funFact: "Eyes optimized to see bioluminescent signals in the dark",
        iNaturalist: 1558
    },
    
    stag_beetle: {
        name: "Stag Beetle",
        scientificName: "Lucanus cervus",
        superfamily: "Coleoptera",
        ommatidia: 800,  // Reduced - poor vision, mostly nocturnal
        spectrum: [525],  // Single receptor - monochromat
        colorSpectrum: ["G"], // Only green!
        spectralWeights: { r: 0.15, g: 1.0, b: 0.2 },  // Mostly green with slight R+B for edges (like ant)
        size: "30-75mm",
        wingspan: "50-80mm",
        weight: "3000mg",
        speed: 1,
        defogRadius: 50,  // Large area but grayscale only
        color: 0x442200,
        funFact: "Europe's largest beetle - males have impressive antler-like mandibles. Poor vision, relies on pheromones",
        iNaturalist: 5832
    },
    
    rose_chafer: {
        name: "Rose Chafer",
        scientificName: "Cetonia aurata",
        superfamily: "Coleoptera",
        ommatidia: 3500,
        spectrum: [360, 530, 600],  // UV, green, red - for finding flowers
        colorSpectrum: ["UV", "G", "R"], // Good flower vision!
        spectralWeights: { r: 1.0, g: 0.95, b: 0.0 },  // RED+green for flowers, NO blue
        size: "14-20mm",
        wingspan: "25-30mm",
        weight: "800mg",
        speed: 2,
        defogRadius: 35,
        color: 0x00aa44,
        funFact: "Metallic green color and feeds on flower pollen",
        iNaturalist: 6787
    }
};

// Helper functions
export function getInsectsBySuperfamily(superfamily) {
    return Object.entries(INSECT_DATABASE)
        .filter(([key, insect]) => insect.superfamily === superfamily)
        .map(([key, insect]) => ({ id: key, ...insect }));
}

export const SUPERFAMILIES = ["Hymenoptera", "Diptera", "Lepidoptera", "Coleoptera"];

// Color spectrum mapping
export const COLOR_CHANNELS = {
    UV: { name: "Ultraviolet", color: 0x8800ff, fogLayer: "fogUV" },
    B: { name: "Blue", color: 0x0000ff, fogLayer: "fogBlue" },
    G: { name: "Green", color: 0x00ff00, fogLayer: "fogGreen" },
    R: { name: "Red", color: 0xff0000, fogLayer: "fogRed" }
};
