/**
 * ERGo! Spectral Sensitivity System
 * 
 * Scientific Foundation:
 * - Insect photoreceptors have Gaussian-like spectral sensitivity curves
 * - Peak sensitivity at specific wavelengths (λmax) with ~50nm FWHM bandwidth
 * - Screen RGB approximates: Blue ~450nm, Green ~550nm, Red ~650nm
 * - UV (~350nm) has no direct screen equivalent - mapped to violet/blue
 * 
 * Mapping Strategy:
 * 1. Calculate Gaussian overlap between each photoreceptor and RGB channels
 * 2. Weight contributions to create spectral "fingerprint"
 * 3. Apply exaggeration factor (2x) to enhance visual diversity
 * 4. Normalize to prevent over-darkening
 */

// Gaussian spectral sensitivity function
// Returns sensitivity (0-1) at wavelength λ given peak λmax and bandwidth
export function gaussianSensitivity(lambda, lambdaMax, bandwidth = 50) {
    const sigma = bandwidth / 2.355; // Convert FWHM to standard deviation
    const exponent = -Math.pow(lambda - lambdaMax, 2) / (2 * sigma * sigma);
    return Math.exp(exponent);
}

// Screen RGB channel approximations (in nanometers)
const RGB_CHANNELS = {
    R: { lambda: 650, bandwidth: 70 },  // Red phosphor
    G: { lambda: 550, bandwidth: 60 },  // Green phosphor
    B: { lambda: 450, bandwidth: 50 },  // Blue phosphor
};

/**
 * Calculate RGB fog contribution weights for a photoreceptor
 * @param {number} peakWavelength - Photoreceptor peak sensitivity (nm)
 * @param {number} bandwidth - FWHM bandwidth (default 50nm)
 * @param {number} exaggeration - Exaggeration factor for gameplay (default 2.0)
 * @returns {Object} Normalized {r, g, b} weights (0-1)
 */
export function calculateRGBWeights(peakWavelength, bandwidth = 50, exaggeration = 2.0) {
    // Calculate overlap with each RGB channel
    let r = 0, g = 0, b = 0;
    
    // Sample at multiple wavelengths for accurate integration
    for (let lambda = 400; lambda <= 700; lambda += 5) {
        const receptorSens = gaussianSensitivity(lambda, peakWavelength, bandwidth);
        
        r += receptorSens * gaussianSensitivity(lambda, RGB_CHANNELS.R.lambda, RGB_CHANNELS.R.bandwidth);
        g += receptorSens * gaussianSensitivity(lambda, RGB_CHANNELS.G.lambda, RGB_CHANNELS.G.bandwidth);
        b += receptorSens * gaussianSensitivity(lambda, RGB_CHANNELS.B.lambda, RGB_CHANNELS.B.bandwidth);
    }
    
    // Apply exaggeration to enhance differences
    r = Math.pow(r, 1 / exaggeration);
    g = Math.pow(g, 1 / exaggeration);
    b = Math.pow(b, 1 / exaggeration);
    
    // Normalize to 0-1 range
    const max = Math.max(r, g, b, 0.001); // Prevent division by zero
    return {
        r: r / max,
        g: g / max,
        b: b / max
    };
}

/**
 * Calculate combined RGB weights for an insect with multiple photoreceptors
 * @param {Array} photoreceptorPeaks - Array of peak wavelengths (nm)
 * @param {Array} weights - Relative importance of each receptor (optional)
 * @returns {Object} Combined {r, g, b} weights
 */
export function combinePhotoreceptors(photoreceptorPeaks, weights = null) {
    if (!weights) {
        weights = Array(photoreceptorPeaks.length).fill(1);
    }
    
    let totalR = 0, totalG = 0, totalB = 0;
    let totalWeight = 0;
    
    photoreceptorPeaks.forEach((peak, i) => {
        const rgb = calculateRGBWeights(peak);
        const w = weights[i];
        
        totalR += rgb.r * w;
        totalG += rgb.g * w;
        totalB += rgb.b * w;
        totalWeight += w;
    });
    
    // Normalize
    return {
        r: totalR / totalWeight,
        g: totalG / totalWeight,
        b: totalB / totalWeight
    };
}

/**
 * Spectral profiles for all 16 insects
 * Based on scientific literature with exaggeration for gameplay
 */
export const SPECTRAL_PROFILES = {
    // ========== HYMENOPTERA ==========
    
    honeybee: {
        // 3 receptors: UV (346nm), Blue (430nm), Green (540nm)
        photoreceptors: [
            { peak: 346, weight: 1.0, name: "UV" },
            { peak: 430, weight: 0.8, name: "Blue" },  
            { peak: 540, weight: 1.2, name: "Green" }  // Strongest
        ],
        rgbWeights: null, // Will be calculated
        dominantChannels: ["B", "G"],
        description: "Strong green sensitivity for flowers"
    },
    
    bumblebee: {
        photoreceptors: [
            { peak: 348, weight: 1.0, name: "UV" },
            { peak: 435, weight: 0.9, name: "Blue" },
            { peak: 533, weight: 1.3, name: "Green" }  // Enhanced for dim light
        ],
        rgbWeights: null,
        dominantChannels: ["B", "G"],
        description: "Optimized for low light foraging"
    },
    
    hornet: {
        photoreceptors: [
            { peak: 346, weight: 0.8, name: "UV" },
            { peak: 445, weight: 1.2, name: "Blue" },  // Shifted toward blue
            { peak: 529, weight: 1.0, name: "Green" }
        ],
        rgbWeights: null,
        dominantChannels: ["B", "G"],
        description: "Blue-shifted for prey detection"
    },
    
    ant: {
        photoreceptors: [
            { peak: 540, weight: 1.0, name: "Green" }  // Single receptor - monochromat
        ],
        rgbWeights: null,
        dominantChannels: ["G"],
        description: "Simple green-only vision"
    },
    
    // ========== DIPTERA ==========
    
    housefly: {
        // 5 receptors including dual UV peaks
        photoreceptors: [
            { peak: 335, weight: 0.7, name: "UV1" },
            { peak: 355, weight: 0.8, name: "UV2" },
            { peak: 460, weight: 1.0, name: "Blue" },
            { peak: 490, weight: 1.2, name: "Cyan" },   // Between blue-green
            { peak: 530, weight: 0.9, name: "Green" }
        ],
        rgbWeights: null,
        dominantChannels: ["B", "G"],
        description: "Complex vision with cyan sensitivity"
    },
    
    hoverfly: {
        photoreceptors: [
            { peak: 350, weight: 1.0, name: "UV" },
            { peak: 450, weight: 1.3, name: "Blue" },  // Enhanced blue
            { peak: 520, weight: 1.1, name: "Green" }
        ],
        rgbWeights: null,
        dominantChannels: ["B", "G"],
        description: "Strong blue for precise hovering"
    },
    
    mosquito: {
        photoreceptors: [
            { peak: 515, weight: 1.0, name: "Green" }  // Single peak monochromat
        ],
        rgbWeights: null,
        dominantChannels: ["G"],
        description: "Minimal vision - relies on other senses"
    },
    
    horsefly: {
        photoreceptors: [
            { peak: 360, weight: 0.6, name: "UV" },    // Weak UV
            { peak: 530, weight: 1.1, name: "Green" },
            { peak: 620, weight: 1.5, name: "Red" }    // Strong red - rare!
        ],
        rgbWeights: null,
        dominantChannels: ["G", "R"],
        description: "Red vision for warm-blooded prey"
    },
    
    // ========== LEPIDOPTERA ==========
    
    peacock: {
        photoreceptors: [
            { peak: 360, weight: 1.2, name: "UV" },    
            { peak: 460, weight: 1.0, name: "Blue" },
            { peak: 530, weight: 1.1, name: "Green" }
        ],
        rgbWeights: null,
        dominantChannels: ["B", "G"],
        description: "Balanced trichromat vision"
    },
    
    cabbage_white: {
        // 6 receptors - best color vision!
        photoreceptors: [
            { peak: 360, weight: 1.1, name: "UV" },
            { peak: 420, weight: 0.9, name: "Violet" },
            { peak: 440, weight: 1.0, name: "Blue" },
            { peak: 560, weight: 1.3, name: "Green" },  // Strong green
            { peak: 620, weight: 1.2, name: "Orange" },
            { peak: 640, weight: 1.4, name: "Red" }     // Strong red
        ],
        rgbWeights: null,
        dominantChannels: ["B", "G", "R"],
        description: "Exceptional 6-receptor color vision"
    },
    
    monarch: {
        photoreceptors: [
            { peak: 340, weight: 1.3, name: "UV" },    // Strong UV for navigation
            { peak: 435, weight: 1.0, name: "Blue" },
            { peak: 540, weight: 1.1, name: "Green" }
        ],
        rgbWeights: null,
        dominantChannels: ["B", "G"],
        description: "UV-enhanced for sun compass"
    },
    
    hawk_moth: {
        photoreceptors: [
            { peak: 349, weight: 1.0, name: "UV" },
            { peak: 440, weight: 1.2, name: "Blue" },  
            { peak: 521, weight: 1.4, name: "Green" }  // Strong green for flowers
        ],
        rgbWeights: null,
        dominantChannels: ["B", "G"],
        description: "Low-light adapted color vision"
    },
    
    // ========== COLEOPTERA ==========
    
    ladybug: {
        photoreceptors: [
            { peak: 360, weight: 0.8, name: "UV" },
            { peak: 420, weight: 1.1, name: "Blue" },  
            { peak: 520, weight: 1.5, name: "Green" }  // Very strong green for aphids
        ],
        rgbWeights: null,
        dominantChannels: ["B", "G"],
        description: "Green-enhanced for prey detection"
    },
    
    firefly: {
        // Nocturnal - shifted toward longer wavelengths
        photoreceptors: [
            { peak: 440, weight: 1.0, name: "Blue" },
            { peak: 520, weight: 1.3, name: "Green" },  // Strong for bioluminescence
            { peak: 570, weight: 0.8, name: "Yellow" }  // Long-wave sensitivity
        ],
        rgbWeights: null,
        dominantChannels: ["B", "G"],
        description: "Optimized for bioluminescent signals"
    },
    
    stag_beetle: {
        photoreceptors: [
            { peak: 525, weight: 1.0, name: "Green" },
            { peak: 580, weight: 0.6, name: "Yellow" }  // Weak second receptor
        ],
        rgbWeights: null,
        dominantChannels: ["G"],
        description: "Poor nocturnal vision"
    },
    
    rose_chafer: {
        photoreceptors: [
            { peak: 360, weight: 0.9, name: "UV" },
            { peak: 530, weight: 1.2, name: "Green" },
            { peak: 600, weight: 1.3, name: "Orange-Red" }  // Good red
        ],
        rgbWeights: null,
        dominantChannels: ["G", "R"],
        description: "Broad spectrum for flower finding"
    }
};

// Calculate RGB weights for all profiles
Object.keys(SPECTRAL_PROFILES).forEach(insectId => {
    const profile = SPECTRAL_PROFILES[insectId];
    const peaks = profile.photoreceptors.map(p => p.peak);
    const weights = profile.photoreceptors.map(p => p.weight);
    profile.rgbWeights = combinePhotoreceptors(peaks, weights);
});

/**
 * Get fog color for an insect based on what they DON'T reveal
 * Insects reveal what they CAN see, so fog represents what they CAN'T see
 */
export function getFogColorForInsect(insectId) {
    const profile = SPECTRAL_PROFILES[insectId];
    if (!profile) return { r: 0.5, g: 0.5, b: 0.5 };
    
    // Invert the sensitivity - strong vision means less fog
    const rgb = profile.rgbWeights;
    
    return {
        r: 1.0 - rgb.r,  // If they see red well, they remove red fog
        g: 1.0 - rgb.g,
        b: 1.0 - rgb.b
    };
}

/**
 * Get reveal weights (what insect erases from fog)
 */
export function getRevealWeightsForInsect(insectId) {
    const profile = SPECTRAL_PROFILES[insectId];
    if (!profile) return { r: 0.33, g: 0.33, b: 0.33 };
    
    return profile.rgbWeights;
}
