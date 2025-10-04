/**
 * Hexagonal Defogging Utility
 * Simulates compound eye ommatidia structure
 */

export class HexagonalDefog {
    constructor(scene) {
        this.scene = scene;
        this.hexCache = new Map(); // Cache hexagon patterns for performance
    }

    /**
     * Create a hexagonal pattern based on visual resolution
     * Higher resolution = smaller hexagons (more ommatidia)
     */
    createHexagonalMask(radius, visualResolution) {
        const cacheKey = `${radius}_${visualResolution}`;
        
        if (this.hexCache.has(cacheKey)) {
            return this.hexCache.get(cacheKey);
        }

        // Calculate hexagon size based on visual resolution
        // More ommatidia (higher resolution) = smaller hexagons
        const hexSize = Math.max(3, Math.floor(50 / Math.sqrt(visualResolution / 1000)));
        
        const graphics = this.scene.add.graphics();
        graphics.fillStyle(0xffffff, 1);

        // Draw hexagonal pattern within the radius
        const hexHeight = hexSize * Math.sqrt(3);
        const hexWidth = hexSize * 2;
        
        for (let row = -radius; row <= radius; row += hexHeight * 0.75) {
            for (let col = -radius; col <= radius; col += hexWidth * 0.75) {
                // Offset every other row for honeycomb pattern
                const xOffset = (Math.floor(row / (hexHeight * 0.75)) % 2) * hexWidth * 0.375;
                const x = col + xOffset;
                const y = row;
                
                // Only draw if within circular radius
                if (Math.sqrt(x * x + y * y) <= radius) {
                    this.drawHexagon(graphics, x, y, hexSize);
                }
            }
        }

        this.hexCache.set(cacheKey, graphics);
        return graphics;
    }

    /**
     * Draw a single hexagon at given position
     */
    drawHexagon(graphics, x, y, size) {
        const angles = [0, 60, 120, 180, 240, 300];
        
        graphics.beginPath();
        angles.forEach((angle, i) => {
            const radian = (angle * Math.PI) / 180;
            const px = x + size * Math.cos(radian);
            const py = y + size * Math.sin(radian);
            
            if (i === 0) {
                graphics.moveTo(px, py);
            } else {
                graphics.lineTo(px, py);
            }
        });
        graphics.closePath();
        graphics.fillPath();
    }

    /**
     * Apply hexagonal erase to fog layer
     */
    eraseHexagonal(fogLayer, x, y, radius, visualResolution) {
        const hexPattern = this.createHexagonalMask(radius, visualResolution);
        
        // Temporarily position the pattern at the insect location
        const tempContainer = this.scene.add.container(x, y);
        tempContainer.add(hexPattern);
        
        // Erase using the hexagonal pattern
        fogLayer.erase(hexPattern, x - radius, y - radius);
        
        // Clean up
        tempContainer.destroy();
    }

    /**
     * Clear cached hexagon patterns
     */
    clearCache() {
        this.hexCache.forEach(graphics => graphics.destroy());
        this.hexCache.clear();
    }
}
