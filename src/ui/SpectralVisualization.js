/**
 * Spectral Visualization Component
 * Displays insect photoreceptor sensitivity as wavelength curves
 */

import { gaussianSensitivity } from '../data/spectralSensitivity.js';
import { SPECTRAL_PROFILES } from '../data/spectralSensitivity.js';

export class SpectralVisualization {
    constructor(scene, x, y, width, height) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        this.container = scene.add.container(x, y);
        this.graphics = scene.add.graphics();
        this.container.add(this.graphics);
        
        // Wavelength range
        this.minWavelength = 300;  // UV start
        this.maxWavelength = 700;  // Red end
        
        // Color bands for wavelength spectrum
        this.spectrumColors = [
            { wavelength: 380, color: 0x8b00ff }, // UV (violet representation)
            { wavelength: 450, color: 0x0000ff }, // Blue
            { wavelength: 495, color: 0x00ffff }, // Cyan
            { wavelength: 570, color: 0x00ff00 }, // Green
            { wavelength: 590, color: 0xffff00 }, // Yellow
            { wavelength: 620, color: 0xff8800 }, // Orange
            { wavelength: 750, color: 0xff0000 }  // Red
        ];
        
        this.createBackground();
        this.createAxis();
    }
    
    createBackground() {
        // Draw gradient spectrum background
        const graphics = this.graphics;
        const steps = 100;
        const stepWidth = this.width / steps;
        
        for (let i = 0; i < steps; i++) {
            const ratio = i / steps;
            const wavelength = this.minWavelength + ratio * (this.maxWavelength - this.minWavelength);
            const color = this.wavelengthToColor(wavelength);
            
            graphics.fillStyle(color, 0.15);
            graphics.fillRect(i * stepWidth, 0, stepWidth, this.height);
        }
        
        // Frame
        graphics.lineStyle(2, 0x444444, 0.8);
        graphics.strokeRect(0, 0, this.width, this.height);
    }
    
    createAxis() {
        const graphics = this.graphics;
        
        // X-axis labels (wavelengths)
        const labelPositions = [300, 350, 400, 450, 500, 550, 600, 650, 700];
        
        labelPositions.forEach(wavelength => {
            const x = this.wavelengthToX(wavelength);
            
            // Tick mark
            graphics.lineStyle(1, 0xffffff, 0.5);
            graphics.beginPath();
            graphics.moveTo(x, this.height);
            graphics.lineTo(x, this.height - 5);
            graphics.strokePath();
            
            // Label
            const label = this.scene.add.text(x, this.height + 8, `${wavelength}`, {
                fontSize: '9px',
                color: '#aaaaaa',
                align: 'center'
            }).setOrigin(0.5, 0);
            this.container.add(label);
        });
        
        // X-axis title
        const xTitle = this.scene.add.text(this.width / 2, this.height + 25, 'Wavelength (nm)', {
            fontSize: '11px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0);
        this.container.add(xTitle);
        
        // Y-axis title
        const yTitle = this.scene.add.text(-10, this.height / 2, 'Sensitivity', {
            fontSize: '11px',
            color: '#ffffff',
            fontStyle: 'bold',
            rotation: -Math.PI / 2
        }).setOrigin(0.5, 0.5);
        this.container.add(yTitle);
        
        // Color region labels
        const regions = [
            { wavelength: 340, label: 'UV', color: 0x8b00ff },
            { wavelength: 470, label: 'Blue', color: 0x0000ff },
            { wavelength: 540, label: 'Green', color: 0x00ff00 },
            { wavelength: 650, label: 'Red', color: 0xff0000 }
        ];
        
        regions.forEach(region => {
            const x = this.wavelengthToX(region.wavelength);
            const regionLabel = this.scene.add.text(x, -15, region.label, {
                fontSize: '10px',
                color: `#${region.color.toString(16).padStart(6, '0')}`,
                fontStyle: 'bold'
            }).setOrigin(0.5, 0.5);
            this.container.add(regionLabel);
        });
    }
    
    wavelengthToX(wavelength) {
        const ratio = (wavelength - this.minWavelength) / (this.maxWavelength - this.minWavelength);
        return ratio * this.width;
    }
    
    wavelengthToColor(wavelength) {
        // Simplified wavelength to RGB conversion
        if (wavelength < 380) return 0x8b00ff; // UV (show as violet)
        if (wavelength < 450) return 0x0000ff; // Blue
        if (wavelength < 495) {
            // Blue to cyan
            const t = (wavelength - 450) / (495 - 450);
            return this.interpolateColor(0x0000ff, 0x00ffff, t);
        }
        if (wavelength < 570) {
            // Cyan to green
            const t = (wavelength - 495) / (570 - 495);
            return this.interpolateColor(0x00ffff, 0x00ff00, t);
        }
        if (wavelength < 590) {
            // Green to yellow
            const t = (wavelength - 570) / (590 - 570);
            return this.interpolateColor(0x00ff00, 0xffff00, t);
        }
        if (wavelength < 620) {
            // Yellow to orange
            const t = (wavelength - 590) / (620 - 590);
            return this.interpolateColor(0xffff00, 0xff8800, t);
        }
        if (wavelength < 750) {
            // Orange to red
            const t = (wavelength - 620) / (750 - 620);
            return this.interpolateColor(0xff8800, 0xff0000, t);
        }
        return 0xff0000; // Deep red
    }
    
    interpolateColor(color1, color2, t) {
        const r1 = (color1 >> 16) & 0xff;
        const g1 = (color1 >> 8) & 0xff;
        const b1 = color1 & 0xff;
        
        const r2 = (color2 >> 16) & 0xff;
        const g2 = (color2 >> 8) & 0xff;
        const b2 = color2 & 0xff;
        
        const r = Math.round(r1 + (r2 - r1) * t);
        const g = Math.round(g1 + (g2 - g1) * t);
        const b = Math.round(b1 + (b2 - b1) * t);
        
        return (r << 16) | (g << 8) | b;
    }
    
    /**
     * Update visualization with selected insects
     */
    updateInsects(insectIds) {
        // Clear previous curves
        this.graphics.clear();
        this.createBackground();
        
        if (insectIds.length === 0) {
            return;
        }
        
        const graphics = this.graphics;
        
        // Draw each insect's spectral curve
        insectIds.forEach((insectId, index) => {
            const profile = SPECTRAL_PROFILES[insectId];
            if (!profile) return;
            
            // Choose a distinct color for each insect's curve
            const curveColors = [0xff00ff, 0x00ffff, 0xffff00, 0xff8800];
            const curveColor = curveColors[index % curveColors.length];
            
            // Draw photoreceptor peaks as Gaussian curves
            profile.photoreceptors.forEach(photoreceptor => {
                this.drawGaussianCurve(
                    graphics,
                    photoreceptor.peak,
                    50, // bandwidth
                    curveColor,
                    0.8,
                    2
                );
                
                // Mark peak with a dot
                const peakX = this.wavelengthToX(photoreceptor.peak);
                graphics.fillStyle(curveColor, 1);
                graphics.fillCircle(peakX, 10, 4);
            });
        });
        
        // Draw combined sensitivity (sum of all insects)
        if (insectIds.length > 1) {
            this.drawCombinedSensitivity(graphics, insectIds);
        }
    }
    
    drawGaussianCurve(graphics, peakWavelength, bandwidth, color, alpha, lineWidth) {
        graphics.lineStyle(lineWidth, color, alpha);
        graphics.beginPath();
        
        const steps = 100;
        let firstPoint = true;
        
        for (let i = 0; i <= steps; i++) {
            const wavelength = this.minWavelength + (i / steps) * (this.maxWavelength - this.minWavelength);
            const sensitivity = gaussianSensitivity(wavelength, peakWavelength, bandwidth);
            
            const x = this.wavelengthToX(wavelength);
            const y = this.height - (sensitivity * (this.height - 20));
            
            if (firstPoint) {
                graphics.moveTo(x, y);
                firstPoint = false;
            } else {
                graphics.lineTo(x, y);
            }
        }
        
        graphics.strokePath();
    }
    
    drawCombinedSensitivity(graphics, insectIds) {
        graphics.lineStyle(3, 0xffffff, 0.9);
        graphics.beginPath();
        
        const steps = 200;
        let firstPoint = true;
        
        for (let i = 0; i <= steps; i++) {
            const wavelength = this.minWavelength + (i / steps) * (this.maxWavelength - this.minWavelength);
            
            // Sum all photoreceptor sensitivities
            let totalSensitivity = 0;
            let maxPossible = insectIds.length; // Normalize by number of insects
            
            insectIds.forEach(insectId => {
                const profile = SPECTRAL_PROFILES[insectId];
                if (!profile) return;
                
                let insectSensitivity = 0;
                profile.photoreceptors.forEach(photoreceptor => {
                    insectSensitivity = Math.max(
                        insectSensitivity,
                        gaussianSensitivity(wavelength, photoreceptor.peak, 50)
                    );
                });
                
                totalSensitivity += insectSensitivity;
            });
            
            const normalizedSensitivity = Math.min(1, totalSensitivity / maxPossible);
            
            const x = this.wavelengthToX(wavelength);
            const y = this.height - (normalizedSensitivity * (this.height - 20));
            
            if (firstPoint) {
                graphics.moveTo(x, y);
                firstPoint = false;
            } else {
                graphics.lineTo(x, y);
            }
        }
        
        graphics.strokePath();
        
        // Fill area under curve
        graphics.fillStyle(0xffffff, 0.1);
        graphics.beginPath();
        
        for (let i = 0; i <= steps; i++) {
            const wavelength = this.minWavelength + (i / steps) * (this.maxWavelength - this.minWavelength);
            
            let totalSensitivity = 0;
            let maxPossible = insectIds.length;
            
            insectIds.forEach(insectId => {
                const profile = SPECTRAL_PROFILES[insectId];
                if (!profile) return;
                
                let insectSensitivity = 0;
                profile.photoreceptors.forEach(photoreceptor => {
                    insectSensitivity = Math.max(
                        insectSensitivity,
                        gaussianSensitivity(wavelength, photoreceptor.peak, 50)
                    );
                });
                
                totalSensitivity += insectSensitivity;
            });
            
            const normalizedSensitivity = Math.min(1, totalSensitivity / maxPossible);
            
            const x = this.wavelengthToX(wavelength);
            const y = this.height - (normalizedSensitivity * (this.height - 20));
            
            if (i === 0) {
                graphics.moveTo(x, this.height);
                graphics.lineTo(x, y);
            } else {
                graphics.lineTo(x, y);
            }
        }
        
        graphics.lineTo(this.width, this.height);
        graphics.closePath();
        graphics.fillPath();
    }
    
    destroy() {
        this.container.destroy();
    }
}
