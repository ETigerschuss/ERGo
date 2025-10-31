/**
 * ERGo! Insekten-Datenbank - Echte Daten aus der Forschung
 * Datenquelle: ERGo! Funfacts.csv mit wissenschaftlichen Messungen
 * iNaturalist-Beobachtungszahlen: Aktualisiert Oktober 2025
 * 
 * Spektrale Empfindlichkeitsdaten basierend auf wissenschaftlicher Literatur:
 * - Gaußsche Photorezeptor-Kurven mit ~50nm FWHM
 * - RGB-Gewichtungen berechnet aus Überlappung mit Bildschirm-Phosphoren
 * - 2x übertrieben für Gameplay-Sichtbarkeit
 */

import { SPECTRAL_PROFILES, getRevealWeightsForInsect } from './spectralSensitivity.js';

// Überfamilien-Emojis
export const SUPERFAMILY_EMOJI = {
    "Hymenoptera": "🐝",  // Bienen, Wespen, Ameisen
    "Diptera": "🪰",       // Fliegen, Mücken  
    "Lepidoptera": "🦋",   // Schmetterlinge, Motten
    "Coleoptera": "🪲"     // Käfer
};

export const INSECT_DATABASE = {
    // ========== HYMENOPTERA (Bienen, Wespen, Ameisen) ==========
    
    honeybee: {
        name: "Westliche Honigbiene",
        scientificName: "Apis mellifera",
        superfamily: "Hymenoptera",
        ommatidia: 5000,  // Durchschnitt von 4752-5432
        spectrum: [346, 430, 540],  // UV, Blau, Grün - keine Rotempfindlichkeit
        colorSpectrum: ["UV", "B", "G"],
        spectralWeights: { r: 0.1, g: 1.0, b: 0.8 },  // Leichtes Rot (Breitband-Ausläufer), starkes Grün+Blau
        size: "11-18mm",
        wingspan: "18mm",
        weight: "82mg",
        speed: 3,
        defogRadius: 30,
        color: 0xffaa00,
        funFact: "Kann fast alles bestäuben - verantwortlich für 64% der Bestäubung. 588.875 Beobachtungen auf iNaturalist!",
        iNaturalist: 588875
    },
    
    bumblebee: {
        name: "Gemeine Erdhummel",
        scientificName: "Bombus terrestris",
        superfamily: "Hymenoptera",
        ommatidia: 6250,  // Durchschnitt von 6000-6500
        spectrum: [348, 435, 533],
        colorSpectrum: ["UV", "B", "G"],
        spectralWeights: { r: 0.15, g: 1.0, b: 0.85 },  // Leichtes Rot (Breitband), sehr starkes Grün+Blau
        size: "11-28mm",
        wingspan: "22-34mm",
        weight: "50-400mg",
        speed: 2,
        defogRadius: 32,
        color: 0xffdd00,
        funFact: "Große Facettenaugen helfen beim Navigieren und Finden von Blumen bei schwachem Licht. Über 69.000 Beobachtungen!",
        iNaturalist: 69329
    },
    
    hornet: {
        name: "Europäische Hornisse",
        scientificName: "Vespa crabro",
        superfamily: "Hymenoptera",
        ommatidia: 5500,  // Geschätzt basierend auf ähnlichen Arten
        spectrum: [346, 445, 529],
        colorSpectrum: ["UV", "B", "G"],
        spectralWeights: { r: 0.2, g: 0.85, b: 1.0 },  // Etwas Rot (Breitband), blauverschoben für Jagd
        size: "18-35mm",
        wingspan: "40-50mm",
        weight: "200-300mg",
        speed: 4,
        defogRadius: 28,
        color: 0xff9900,
        funFact: "Aktive Jäger mit ausgezeichnetem Sehvermögen zur Beuteverfolgung. 65.723 Beobachtungen!",
        iNaturalist: 65723
    },
    
    ant: {
        name: "Schwarze Rossameise",
        scientificName: "Camponotus pennsylvanicus",
        superfamily: "Hymenoptera",
        ommatidia: 1200,  // Erhöht von 500 - Ameisen haben tatsächlich anständige Augen für ihre Größe
        spectrum: [540],  // Einzelner Rezeptor - Monochromat
        colorSpectrum: ["G"], // Nur Grün - aber exzellente Kantenerkennung!
        spectralWeights: { r: 0.2, g: 1.0, b: 0.3 },  // Hauptsächlich Grün mit leichtem R+B für bessere Kanten
        size: "4-11mm",
        wingspan: "5-12mm",
        weight: "10-20mg",
        speed: 1,
        defogRadius: 50,  // Größerer Radius - sie enthüllen mehr Fläche als Kantendetektoren
        color: 0xaa3300,
        funFact: "15-20% der terrestrischen Biomasse - trotz monochromatischem Sehen exzellente Kantendetektoren mit chemischen Spuren. 48.178 Beobachtungen!",
        iNaturalist: 48178
    },

    // ========== DIPTERA (Fliegen, Mücken) ==========
    
    housefly: {
        name: "Gemeine Stubenfliege",
        scientificName: "Musca domestica",
        superfamily: "Diptera",
        ommatidia: 3450,
        spectrum: [335, 355, 460, 490, 530],  // 5 Rezeptoren!
        colorSpectrum: ["UV", "B", "G"],
        spectralWeights: { r: 0.2, g: 0.85, b: 1.0 },  // Leichtes Rot (R1-R6 Breitband), cyanverschoben
        size: "8-12mm",
        wingspan: "13-15mm",
        weight: "12mg",
        speed: 4,
        defogRadius: 28,
        color: 0x666666,
        funFact: "Überall zu finden - verarbeitet visuelle Informationen 4x schneller als Menschen mit 5 Rezeptortypen",
        iNaturalist: 6871
    },
    
    hoverfly: {
        name: "Mistbiene",
        scientificName: "Eristalis tenax",
        superfamily: "Diptera",
        ommatidia: 6400,  // Sehr hoch für präzises Schweben
        spectrum: [350, 450, 520],
        colorSpectrum: ["UV", "B", "G"],
        spectralWeights: { r: 0.25, g: 0.85, b: 1.0 },  // Etwas Rot (Breitband), sehr starkes Blau+Grün
        size: "15mm",
        wingspan: "15mm",
        weight: "50mg",
        speed: 4,
        defogRadius: 25,
        color: 0xff8800,
        funFact: "Kann in der Luft stehen - benötigt exzellente Bewegungserkennung mit 6400 Ommatidien und Breitbandrezeptoren. 88.333 Beobachtungen!",
        iNaturalist: 88333
    },
    
    vinegar_fly: {
        name: "Taufliege (Drosophila)",
        scientificName: "Drosophila melanogaster",
        superfamily: "Diptera",
        ommatidia: 760,  // Kleines Auge mit ~760 Ommatidien
        spectrum: [330, 350, 370, 437, 480, 508],  // R1-R6 (breit), R7p (UV), R7y (UV+B), R8p (B), R8y (G) - sehr breit!
        colorSpectrum: ["UV", "B", "G"],
        spectralWeights: { r: 0.3, g: 0.9, b: 1.0 },  // Breite Erkennung inkl. etwas Rot (R1-R6 Breitband bis 600nm)
        size: "2-3mm",
        wingspan: "6mm",
        weight: "1mg",
        speed: 3,
        defogRadius: 50,  // Erhöht von 35 - besseres Sehen für ihre Größe
        color: 0xccaa66,
        funFact: "Modellorganismus mit 6 Photorezeptortypen - R1-R6 Breitband (330-600nm), R7/R8 spezialisiert UV-G. 47.219 Beobachtungen!",
        iNaturalist: 47219
    },
    
    mosquito: {
        name: "Asiatische Tigermücke",
        scientificName: "Aedes albopictus",
        superfamily: "Diptera",
        ommatidia: 780,
        spectrum: [515],  // Sehr begrenzt - einzelner Peak
        colorSpectrum: ["G"], // Nur Grün - kein UV, kein Rot, kein Blau!
        spectralWeights: { r: 0.0, g: 1.0, b: 0.0 },  // NUR Grün - Monochromat!
        size: "2-10mm",
        wingspan: "3-4mm",
        weight: "2mg",
        speed: 3,
        defogRadius: 40,
        color: 0x444444,
        funFact: "Erkennt Wirte mittels CO2 und Wärme mehr als durch Sehen. 3.542 Beobachtungen!",
        iNaturalist: 3542
    },
    
    horsefly: {
        name: "Schwarze Pferdebremse",
        scientificName: "Tabanus atratus",
        superfamily: "Diptera",
        ommatidia: 5000,  // Geschätzt
        spectrum: [360, 530, 620],  // UV, Grün, ROT - jagt warmblütige Tiere
        colorSpectrum: ["UV", "G", "R"], // Kann Rot sehen - selten bei Insekten!
        spectralWeights: { r: 1.0, g: 0.8, b: 0.0 },  // Starkes ROT+Grün, KEIN Blau - einzigartig!
        size: "20-25mm",
        wingspan: "40-50mm",
        weight: "100mg",
        speed: 5,
        defogRadius: 30,
        color: 0x222222,
        funFact: "Schneller Jäger mit gutem Sehen zur Bewegungsverfolgung",
        iNaturalist: 2934
    },
    
    robber_fly: {
        name: "Raubfliege",
        scientificName: "Asilidae sp.",
        superfamily: "Diptera",
        ommatidia: 5500,  // Raubfliegen haben ausgezeichnetes Sehen
        spectrum: [350, 470, 520],
        colorSpectrum: ["UV", "B", "G"],
        spectralWeights: { r: 0.25, g: 0.9, b: 1.0 },  // Etwas Rot (Breitband), starkes Blau+Grün
        size: "10-30mm",
        wingspan: "20-40mm",
        weight: "50mg",
        speed: 5,
        defogRadius: 28,
        color: 0x997744,
        funFact: "Luftjäger mit erstaunlichem Sehen zum Fangen von Beute im Flug - Breitbandrezeptoren für Bewegungsverfolgung",
        iNaturalist: 47652
    },

    // ========== LEPIDOPTERA (Schmetterlinge & Motten) ==========
    
    peacock: {
        name: "Tagpfauenauge",
        scientificName: "Aglais io",
        superfamily: "Lepidoptera",
        ommatidia: 12000,  // Geschätzt basierend auf ähnlichen Arten
        spectrum: [360, 460, 530],
        colorSpectrum: ["UV", "B", "G"],
        spectralWeights: { r: 0.3, g: 0.9, b: 0.85 },  // Etwas Rot (Breitband), ausgewogenes Grün+Blau
        size: "50-55mm",
        wingspan: "60-70mm",
        weight: "400mg",
        speed: 3,
        defogRadius: 22,
        color: 0x8800aa,
        funFact: "Raupen fressen Brennnesseln - Erwachsene trinken in Biergärten! Breitbandrezeptoren erkennen ins Rote. 103.731 Beobachtungen!",
        iNaturalist: 103731
    },
    
    cabbage_white: {
        name: "Kleiner Kohlweißling",
        scientificName: "Pieris rapae",
        superfamily: "Lepidoptera",
        ommatidia: 10000,
        spectrum: [360, 420, 440, 560, 620, 640],  // 6 Rezeptoren! Bestes Farbsehen
        colorSpectrum: ["UV", "B", "G", "R"],
        spectralWeights: { r: 1.0, g: 1.0, b: 0.8 },  // Exzellentes VOLLSPEKTRUM - sieht ALLE Farben!
        size: "32-47mm",
        wingspan: "45-60mm",
        weight: "150mg",
        speed: 3,
        defogRadius: 20,
        color: 0xeeeeee,
        funFact: "Hat 6 Farbrezeptoren - sieht Farben, die wir uns nicht vorstellen können! 205.128 Beobachtungen!",
        iNaturalist: 205128
    },
    
    monarch: {
        name: "Monarchfalter",
        scientificName: "Danaus plexippus",
        superfamily: "Lepidoptera",
        ommatidia: 12000,
        spectrum: [340, 435, 540],
        colorSpectrum: ["UV", "B", "G"],
        spectralWeights: { r: 0.35, g: 1.0, b: 0.75 },  // Etwas Rot (Breitband-Ausläufer), starkes Grün+Blau für Navigation
        size: "90-100mm",
        wingspan: "90-100mm",
        weight: "500mg",
        speed: 3,
        defogRadius: 22,
        color: 0xff6600,
        funFact: "Wandert 3000 Meilen mit Sonnenkompass-Navigation - nur in Amerika zu finden. Langwellenerkennung hilft beim Blumenfinden. 425.719 Beobachtungen!",
        iNaturalist: 425719
    },
    
    hawk_moth: {
        name: "Taubenschwänzchen",
        scientificName: "Macroglossum stellatarum",
        superfamily: "Lepidoptera",
        ommatidia: 8000,
        spectrum: [349, 440, 521, 580],  // UV, Blau, Grün, Orange - Breitbanderkennung ins Rote
        colorSpectrum: ["UV", "B", "G"],
        spectralWeights: { r: 0.4, g: 1.0, b: 0.7 },  // Etwas Rot (Breitband-Ausläufer), starkes Grün+Blau
        size: "40-50mm",
        wingspan: "40-45mm",
        weight: "300mg",
        speed: 4,
        defogRadius: 25,
        color: 0x996633,
        funFact: "Schwebt wie ein Kolibri - Breitbandphotorezeptoren reichen ins Orange/Rote Spektrum. 62.259 Beobachtungen!",
        iNaturalist: 62259
    },

    // ========== COLEOPTERA (Käfer) ==========
    
    ladybug: {
        name: "Siebenpunkt-Marienkäfer",
        scientificName: "Coccinella septempunctata",
        superfamily: "Coleoptera",
        ommatidia: 3000,  // Geschätzt
        spectrum: [360, 420, 520],
        colorSpectrum: ["UV", "B", "G"],
        spectralWeights: { r: 0.2, g: 1.0, b: 0.7 },  // Etwas Rot (Breitband), sehr starkes Grün+Blau für Blattläuse
        size: "5.5-8mm",
        wingspan: "10-12mm",
        weight: "15mg",
        speed: 2,
        defogRadius: 35,
        color: 0xff0000,
        funFact: "Kann grüne Blattläuse gegen grüne Blätter durch Farbkontrast erkennen - Breitbandrezeptoren helfen bei der Erkennung. 236.177 Beobachtungen!",
        iNaturalist: 236177
    },
    
    firefly: {
        name: "Großer Leuchtkäfer",
        scientificName: "Lampyris noctiluca",
        superfamily: "Coleoptera",
        ommatidia: 2000,
        spectrum: [440, 520],  // Nachtaktiv - kein UV!
        colorSpectrum: ["B", "G"], // Blau-Grün-Sehen für Biolumineszenz
        spectralWeights: { r: 0.15, g: 1.0, b: 0.8 },  // Leichtes Rot (Breitband), Grün+Blau für Biolumineszenz
        size: "10-20mm",
        wingspan: "15-25mm",
        weight: "100mg",
        speed: 2,
        defogRadius: 40,
        color: 0xaaff00,
        funFact: "Augen optimiert, um biolumineszente Signale im Dunkeln zu sehen. 1.558 Beobachtungen!",
        iNaturalist: 1558
    },
    
    stag_beetle: {
        name: "Hirschkäfer",
        scientificName: "Lucanus cervus",
        superfamily: "Coleoptera",
        ommatidia: 800,  // Reduziert - schlechtes Sehen, meist nachtaktiv
        spectrum: [525],  // Einzelner Rezeptor - Monochromat
        colorSpectrum: ["G"], // Nur Grün!
        spectralWeights: { r: 0.15, g: 1.0, b: 0.2 },  // Hauptsächlich Grün mit leichtem R+B für Kanten (wie Ameise)
        size: "30-75mm",
        wingspan: "50-80mm",
        weight: "3000mg",
        speed: 1,
        defogRadius: 50,  // Großer Bereich aber nur Graustufen
        color: 0x442200,
        funFact: "Europas größter Käfer - Männchen haben beeindruckende geweihartige Mandibeln. Schlechtes Sehen, verlässt sich auf Pheromone. 5.832 Beobachtungen!",
        iNaturalist: 5832
    },
    
    rose_chafer: {
        name: "Goldglänzender Rosenkäfer",
        scientificName: "Cetonia aurata",
        superfamily: "Coleoptera",
        ommatidia: 3500,
        spectrum: [360, 530, 600],  // UV, Grün, Rot - zum Blumenfinden
        colorSpectrum: ["UV", "G", "R"], // Gutes Blumensehen!
        spectralWeights: { r: 1.0, g: 0.95, b: 0.0 },  // ROT+Grün für Blumen, KEIN Blau
        size: "14-20mm",
        wingspan: "25-30mm",
        weight: "800mg",
        speed: 2,
        defogRadius: 35,
        color: 0x00aa44,
        funFact: "Metallisch grüne Farbe und ernährt sich von Blütenpollen. 50.722 Beobachtungen!",
        iNaturalist: 50722
    }
};

// Hilfsfunktionen
export function getInsectsBySuperfamily(superfamily) {
    return Object.entries(INSECT_DATABASE)
        .filter(([key, insect]) => insect.superfamily === superfamily)
        .map(([key, insect]) => ({ id: key, ...insect }));
}

export const SUPERFAMILIES = ["Hymenoptera", "Diptera", "Lepidoptera", "Coleoptera"];

// Farbspektrum-Zuordnung
export const COLOR_CHANNELS = {
    UV: { name: "Ultraviolett", color: 0x8800ff, fogLayer: "fogUV" },
    B: { name: "Blau", color: 0x0000ff, fogLayer: "fogBlue" },
    G: { name: "Grün", color: 0x00ff00, fogLayer: "fogGreen" },
    R: { name: "Rot", color: 0xff0000, fogLayer: "fogRed" }
};

/**
 * Freischaltkosten für jede Art (spektrale Währungen erforderlich)
 * 
 * v0.04 Balancierung:
 * - Monochromaten balanciert nach Lebenszeit-Verdienstpotential:
 *   * Ameise: Radius 50, Geschwindigkeit 1 → Fläche ~7850/Frame → 1 Mono (günstig, viele benötigt)
 *   * Mücke: Radius 40, Geschwindigkeit 3 → Fläche ~5027/Frame → 2 Mono (2x Ameisenkosten für halbe Menge)
 *   * Hirschkäfer: Radius 50, Geschwindigkeit 1 → Fläche ~7850/Frame → 10 Mono (10x Ameisenkosten, Einzeleinheiten-Strategie)
 *   Verhältnis: 10 Ameisen (10 Mono) = 5 Mücken (10 Mono) = 1 Hirschkäfer (10 Mono) ✓
 * 
 * - Trichromaten freischalten nach 100 Monochrom → 10 Grün-Umwandlung
 * - Schmetterlinge benötigen volles Farbspektrum (Rot+Blau freigeschaltet durch Grün/Blau-Umwandlungen)
 */
export const UNLOCK_COSTS = {
    // HYMENOPTERA (Bienen, Wespen, Ameisen)
    ant: { monochrome: 1, green: 0, red: 0, blue: 0 },           // 1. - nur Monochrom
    honeybee: { monochrome: 0, green: 45, red: 0, blue: 0 },     // 2. - REDUZIERT Grün (50→45)
    bumblebee: { monochrome: 0, green: 60, red: 6, blue: 8 },    // 3. - GROSSER SCHNITT (80→60)
    hornet: { monochrome: 0, green: 110, red: 14, blue: 16 },    // 4. - REDUZIERT (140→110)
    
    // DIPTERA (Fliegen)
    mosquito: { monochrome: 2, green: 0, red: 0, blue: 0 },      // 1. - nur Monochrom
    vinegar_fly: { monochrome: 0, green: 35, red: 0, blue: 0 },  // 2. - REDUZIERT (40→35)
    housefly: { monochrome: 0, green: 50, red: 4, blue: 8 },     // 3. - GROSSER SCHNITT (65→50)
    hoverfly: { monochrome: 0, green: 85, red: 10, blue: 12 },   // 4. - REDUZIERT (110→85)
    horsefly: { monochrome: 0, green: 75, red: 10, blue: 22 },   // 5. (Tabanus) - REDUZIERT (95→75)
    robber_fly: { monochrome: 0, green: 100, red: 18, blue: 20 }, // 6. - REDUZIERT (130→100)
    
    // LEPIDOPTERA (Schmetterlinge & Motten)
    hawk_moth: { monochrome: 0, green: 70, red: 38, blue: 35 },  // 1. - REDUZIERT (90→70)
    peacock: { monochrome: 0, green: 100, red: 55, blue: 60 },   // 2. - GROSSER SCHNITT (140→100)
    monarch: { monochrome: 0, green: 125, red: 80, blue: 85 },   // 3. (Danaus) - GROSSER SCHNITT (165→125)
    cabbage_white: { monochrome: 0, green: 180, red: 75, blue: 130 }, // 4. (Pieris) - REDUZIERT (230→180)
    
    // COLEOPTERA (Käfer)
    stag_beetle: { monochrome: 10, green: 0, red: 0, blue: 0 },  // 1. - nur Monochrom
    firefly: { monochrome: 0, green: 45, red: 10, blue: 10 },    // 2. - REDUZIERT (55→45)
    ladybug: { monochrome: 0, green: 75, red: 32, blue: 28 },    // 3. (Coccinella) - GROSSER SCHNITT (100→75)
    rose_chafer: { monochrome: 0, green: 130, red: 35, blue: 55 } // 4. (Cetonia) - REDUZIERT (165→130)
};
