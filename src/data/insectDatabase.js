/**
 * ERGo! Insect Database
 * 
 * Each insect has:
 * - colorSpectrum: Which color channels they can see (R, G, B, UV)
 * - speed: Flight speed (1-5, where 5 is fastest)
 * - visualResolution: Compound eye resolution - number of ommatidia affects hexagon size
 *   Higher = more ommatidia = smaller hexagons = better resolution
 * - superfamily: Coleoptera, Diptera, Hymenoptera, Lepidoptera
 */

export const INSECT_DATABASE = {
    // ========== COLEOPTERA (Beetles) ==========
    
    ladybug: {
        name: "Seven-spot Ladybug",
        scientificName: "Coccinella septempunctata",
        superfamily: "Coleoptera",
        colorSpectrum: ["R", "G", "B"], // Typical trichromatic vision
        speed: 2,
        visualResolution: 3000, // Relatively low for beetles
        defogRadius: 35,
        color: 0xff0000, // Red
        funFact: "Can see green aphids against green leaves using color contrast"
    },
    
    firefly: {
        name: "Common Eastern Firefly",
        scientificName: "Photinus pyralis",
        superfamily: "Coleoptera",
        colorSpectrum: ["G", "B"], // Sensitive to bioluminescence
        speed: 2,
        visualResolution: 2500,
        defogRadius: 40,
        color: 0xffff00, // Yellow-green
        funFact: "Eyes optimized to see green-yellow bioluminescent signals"
    },
    
    tiger_beetle: {
        name: "Six-spotted Tiger Beetle",
        scientificName: "Cicindela sexguttata",
        superfamily: "Coleoptera",
        colorSpectrum: ["R", "G", "B", "UV"], // Excellent vision for hunting
        speed: 5, // Fastest running insect!
        visualResolution: 8000,
        defogRadius: 25,
        color: 0x00ff88, // Metallic green
        funFact: "Run so fast they go temporarily blind and must stop to relocate prey"
    },
    
    dung_beetle: {
        name: "African Dung Beetle",
        scientificName: "Scarabaeus satyrus",
        superfamily: "Coleoptera",
        colorSpectrum: ["B", "UV"], // Navigate by polarized light from Milky Way
        speed: 1,
        visualResolution: 4000,
        defogRadius: 30,
        color: 0x4444ff, // Blue-black
        funFact: "Uses celestial navigation - can orient using the Milky Way galaxy"
    },

    // ========== DIPTERA (Flies) ==========
    
    housefly: {
        name: "Common Housefly",
        scientificName: "Musca domestica",
        superfamily: "Diptera",
        colorSpectrum: ["R", "G", "B", "UV"],
        speed: 4,
        visualResolution: 6000, // Compound eyes with ~4000 ommatidia
        defogRadius: 28,
        color: 0x666666, // Gray
        funFact: "Sees in slow motion - processes visual info 4x faster than humans"
    },
    
    dragonfly: {
        name: "Blue Dasher Dragonfly",
        scientificName: "Pachydiplax longipennis",
        superfamily: "Diptera",
        colorSpectrum: ["R", "G", "B", "UV"], // Tetrachromatic + UV
        speed: 5, // Fastest flying insect
        visualResolution: 30000, // Up to 30,000 ommatidia!
        defogRadius: 15,
        color: 0x0088ff, // Blue
        funFact: "Best vision in insect world - 360° view with 30,000 ommatidia per eye"
    },
    
    hoverfly: {
        name: "Marmalade Hoverfly",
        scientificName: "Episyrphus balteatus",
        superfamily: "Diptera",
        colorSpectrum: ["R", "G", "B", "UV"],
        speed: 4,
        visualResolution: 5500,
        defogRadius: 30,
        color: 0xff8800, // Orange-yellow
        funFact: "Can hover in place and fly backwards - needs excellent motion detection"
    },
    
    mosquito: {
        name: "Yellow Fever Mosquito",
        scientificName: "Aedes aegypti",
        superfamily: "Diptera",
        colorSpectrum: ["R", "B"], // Limited color vision, uses CO2 and heat
        speed: 3,
        visualResolution: 3500,
        defogRadius: 35,
        color: 0x886644, // Brown
        funFact: "Detects hosts using CO2, heat, and movement more than color"
    },

    // ========== HYMENOPTERA (Bees, Wasps, Ants) ==========
    
    honeybee: {
        name: "Western Honeybee",
        scientificName: "Apis mellifera",
        superfamily: "Hymenoptera",
        colorSpectrum: ["G", "B", "UV"], // Can't see red, but sees UV
        speed: 3,
        visualResolution: 5500, // ~5000-6000 ommatidia
        defogRadius: 30,
        color: 0xffaa00, // Orange-yellow
        funFact: "Sees UV patterns on flowers invisible to humans - red appears black"
    },
    
    bumblebee: {
        name: "Buff-tailed Bumblebee",
        scientificName: "Bombus terrestris",
        superfamily: "Hymenoptera",
        colorSpectrum: ["G", "B", "UV"],
        speed: 2,
        visualResolution: 5000,
        defogRadius: 32,
        color: 0xffdd00, // Yellow
        funFact: "Can learn and remember which flowers have best nectar using color cues"
    },
    
    paper_wasp: {
        name: "European Paper Wasp",
        scientificName: "Polistes dominula",
        superfamily: "Hymenoptera",
        colorSpectrum: ["R", "G", "B", "UV"],
        speed: 4,
        visualResolution: 6500,
        defogRadius: 28,
        color: 0xffaa00, // Yellow-orange
        funFact: "Can recognize individual wasp faces using visual patterns"
    },
    
    leafcutter_ant: {
        name: "Leafcutter Ant",
        scientificName: "Atta cephalotes",
        superfamily: "Hymenoptera",
        colorSpectrum: ["G", "B", "UV"], // Compound eyes despite being mainly terrestrial
        speed: 1,
        visualResolution: 1000, // Ants have relatively poor vision
        defogRadius: 45,
        color: 0xaa5500, // Brown
        funFact: "Despite poor eyesight, uses vision to navigate along trails and cut leaves"
    },

    // ========== LEPIDOPTERA (Butterflies & Moths) ==========
    
    monarch: {
        name: "Monarch Butterfly",
        scientificName: "Danaus plexippus",
        superfamily: "Lepidoptera",
        colorSpectrum: ["R", "G", "B", "UV"], // Excellent color vision for navigation
        speed: 3,
        visualResolution: 12000, // Superposition eyes with 12,000+ ommatidia
        defogRadius: 22,
        color: 0xff6600, // Orange
        funFact: "Uses sun compass and sees polarized light to navigate 3000 miles to Mexico"
    },
    
    swallowtail: {
        name: "Swallowtail Butterfly",
        scientificName: "Papilio xuthus",
        superfamily: "Lepidoptera",
        colorSpectrum: ["R", "G", "B", "UV"], // Some species have 5-6 color receptors!
        speed: 3,
        visualResolution: 15000,
        defogRadius: 20,
        color: 0xffff00, // Yellow
        funFact: "Some swallowtails have 5-6 color receptors - best color vision in animals!"
    },
    
    hawk_moth: {
        name: "Hummingbird Hawk-moth",
        scientificName: "Macroglossum stellatarum",
        superfamily: "Lepidoptera",
        colorSpectrum: ["R", "G", "B", "UV"],
        speed: 4,
        visualResolution: 10000,
        defogRadius: 25,
        color: 0x996633, // Brown-orange
        funFact: "Hovers like a hummingbird and has color vision even at night"
    },
    
    luna_moth: {
        name: "Luna Moth",
        scientificName: "Actias luna",
        superfamily: "Lepidoptera",
        colorSpectrum: ["B", "UV"], // Nocturnal - sensitive to dim light
        speed: 2,
        visualResolution: 8000, // Superposition eyes for night vision
        defogRadius: 28,
        color: 0x88ff88, // Pale green
        funFact: "Superposition compound eyes gather maximum light for night flying"
    }
};

// Helper function to get insects by superfamily
export function getInsectsBySuperfamily(superfamily) {
    return Object.entries(INSECT_DATABASE)
        .filter(([key, insect]) => insect.superfamily === superfamily)
        .map(([key, insect]) => ({ id: key, ...insect }));
}

// Get all superfamilies
export const SUPERFAMILIES = ["Coleoptera", "Diptera", "Hymenoptera", "Lepidoptera"];

// Color spectrum mapping for fog layers
export const COLOR_CHANNELS = {
    R: { name: "Red", color: 0xff0000, fogLayer: "fogRed" },
    G: { name: "Green", color: 0x00ff00, fogLayer: "fogGreen" },
    B: { name: "Blue", color: 0x0000ff, fogLayer: "fogBlue" },
    UV: { name: "Ultraviolet", color: 0x8800ff, fogLayer: "fogUV" }
};
