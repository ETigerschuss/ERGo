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
        spectrum: [346, 430, 540],  // UV, Blue, Green
        colorSpectrum: ["UV", "B", "G"],
        spectralWeights: { r: 0.0, g: 1.0, b: 0.8 },  // Strong green+blue, NO red
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
        spectralWeights: { r: 0.0, g: 1.0, b: 0.85 },  // Very strong green+blue, NO red
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
        spectralWeights: { r: 0.0, g: 0.85, b: 1.0 },  // Blue-shifted for hunting, NO red
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
        ommatidia: 500,  // Ants have relatively few
        spectrum: [540],  // Limited color vision - mostly chemical navigation
        colorSpectrum: ["G"], // Only green - no UV!
        spectralWeights: { r: 0.0, g: 1.0, b: 0.0 },  // ONLY green - monochromat!
        size: "4-11mm",
        wingspan: "5-12mm",
        weight: "10-20mg",
        speed: 1,
        defogRadius: 45,
        color: 0xaa3300,
        funFact: "15-20% of terrestrial biomass - despite poor eyesight, use chemical trails",
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
        spectralWeights: { r: 0.0, g: 0.85, b: 1.0 },  // Cyan-shifted (strong blue-green), NO red
        size: "8-12mm",
        wingspan: "13-15mm",
        weight: "12mg",
        speed: 4,
        defogRadius: 28,
        color: 0x666666,
        funFact: "Found everywhere - processes visual info 4x faster than humans",
        iNaturalist: 6871
    },
    
    hoverfly: {
        name: "Common Drone Fly",
        scientificName: "Eristalis tenax",
        superfamily: "Diptera",
        ommatidia: 6400,  // Very high for precise hovering
        spectrum: [350, 450, 520],
        colorSpectrum: ["UV", "B", "G"],
        spectralWeights: { r: 0.0, g: 0.85, b: 1.0 },  // Very strong blue+green, NO red
        size: "15mm",
        wingspan: "15mm",
        weight: "50mg",
        speed: 4,
        defogRadius: 25,
        color: 0xff8800,
        funFact: "Can hover in place - needs excellent motion detection with 6400 ommatidia",
        iNaturalist: 13697
    },
    
    vinegar_fly: {
        name: "Vinegar Fly (Drosophila)",
        scientificName: "Drosophila melanogaster",
        superfamily: "Diptera",
        ommatidia: 760,  // Small eye with ~760 ommatidia
        spectrum: [345, 375, 420, 480],  // UV, UV-B, Blue, Cyan
        colorSpectrum: ["UV", "B"],
        spectralWeights: { r: 0.0, g: 0.4, b: 1.0 },  // Excellent blue, some green, NO red
        size: "2-3mm",
        wingspan: "6mm",
        weight: "1mg",
        speed: 3,
        defogRadius: 50,  // Increased from 35 - better vision for its size
        color: 0xccaa66,
        funFact: "Model organism in genetics - tiny but with sophisticated vision",
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
        spectralWeights: { r: 0.0, g: 0.9, b: 1.0 },  // Strong blue+green, NO red
        size: "10-30mm",
        wingspan: "20-40mm",
        weight: "50mg",
        speed: 5,
        defogRadius: 28,
        color: 0x997744,
        funFact: "Aerial predator with amazing vision to catch prey mid-flight",
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
        spectralWeights: { r: 0.0, g: 0.9, b: 0.85 },  // Balanced green+blue, NO red
        size: "50-55mm",
        wingspan: "60-70mm",
        weight: "400mg",
        speed: 3,
        defogRadius: 22,
        color: 0x8800aa,
        funFact: "Caterpillars feed on nettles - adults drink in beer gardens!",
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
        spectralWeights: { r: 0.0, g: 1.0, b: 0.75 },  // Strong green+blue for navigation, NO red
        size: "90-100mm",
        wingspan: "90-100mm",
        weight: "500mg",
        speed: 3,
        defogRadius: 22,
        color: 0xff6600,
        funFact: "Migrates 3000 miles using sun compass navigation - found only in America",
        iNaturalist: 119002
    },
    
    hawk_moth: {
        name: "Hummingbird Hawk-moth",
        scientificName: "Macroglossum stellatarum",
        superfamily: "Lepidoptera",
        ommatidia: 8000,
        spectrum: [349, 440, 521],
        colorSpectrum: ["UV", "B", "G"],
        spectralWeights: { r: 0.0, g: 1.0, b: 0.7 },  // Strong green+blue for flowers, NO red
        size: "40-50mm",
        wingspan: "40-45mm",
        weight: "300mg",
        speed: 4,
        defogRadius: 25,
        color: 0x996633,
        funFact: "Hovers like a hummingbird with excellent color vision even at dusk",
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
        spectralWeights: { r: 0.0, g: 1.0, b: 0.7 },  // Very strong green+blue for aphids, NO red
        size: "5.5-8mm",
        wingspan: "10-12mm",
        weight: "15mg",
        speed: 2,
        defogRadius: 35,
        color: 0xff0000,
        funFact: "Can see green aphids against green leaves using color contrast",
        iNaturalist: 41716
    },
    
    firefly: {
        name: "European Firefly",
        scientificName: "Lampyris noctiluca",
        superfamily: "Coleoptera",
        ommatidia: 2000,
        spectrum: [440, 520],  // Nocturnal - no UV!
        colorSpectrum: ["B", "G"], // Blue-green vision for bioluminescence
        spectralWeights: { r: 0.0, g: 1.0, b: 0.8 },  // Green+blue for bioluminescence, NO red
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
        ommatidia: 2500,
        spectrum: [525],  // Very limited vision - mostly nocturnal
        colorSpectrum: ["G"], // Only green!
        spectralWeights: { r: 0.0, g: 1.0, b: 0.0 },  // ONLY green - monochromat!
        size: "30-75mm",
        wingspan: "50-80mm",
        weight: "3000mg",
        speed: 1,
        defogRadius: 45,
        color: 0x442200,
        funFact: "Europe's largest beetle - males have impressive antler-like mandibles",
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
