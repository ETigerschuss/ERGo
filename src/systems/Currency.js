/**
 * Rhodopsin System - Manages rhodopsin resources (monochrome, red, green, blue)
 * ERGo! v0.04
 * 
 * Rhodopsin is the light-sensitive protein found in photoreceptor cells.
 * Different rhodopsins absorb different wavelengths of light.
 */

export class CurrencySystem {
    constructor(scene) {
        this.scene = scene;
        
        // 4 rhodopsin types (different photoreceptor proteins)
        this.currencies = {
            monochrome: 0,
            red: 0,
            green: 0,
            blue: 0
        };
        
        // Track conversion milestones (each 100 triggers next tier)
        this.monoMilestone = 0;  // Tracks how many times we've hit 100 mono
        this.greenMilestone = 0; // Tracks how many times we've hit 100 green
        this.blueMilestone = 0;  // Tracks how many times we've hit 100 blue
        
        // UI elements
        this.currencyDisplay = null;
        this.currencyTexts = {};
        
        this.createUI();
    }
    
    createUI() {
        const width = this.scene.scale.width;
        const height = this.scene.scale.height;
        
        // Rhodopsin display TOP CENTER between Tabanus (Diptera) and Macroglossum (Lepidoptera)
        const startX = width / 2 - 77; // Center horizontally (panel is 155px wide)
        const startY = 45; // Top of screen, below species boxes
        
        console.log(`💰 Creating rhodopsin UI at (${startX}, ${startY}) with width ${width}`);
        
        // Background panel - lower depth so it's behind other elements
        this.scene.add.rectangle(startX, startY, 155, 120, 0x0a0a14, 0.85)
            .setOrigin(0)
            .setDepth(2000) // Lower depth - behind species boxes
            .setScrollFactor(0);
        
        // Title - centered in box
        this.scene.add.text(startX + 77, startY + 15, 'Rhodopsin', {
            fontSize: '14px',
            color: '#ffffff',
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(2001).setScrollFactor(0);
        
        // Currency texts - centered in the box
        const currencies = [
            { key: 'monochrome', icon: '⚫', color: '#cccccc', y: 37 },
            { key: 'red', icon: '🔴', color: '#ff4444', y: 57 },
            { key: 'green', icon: '🟢', color: '#44ff44', y: 77 },
            { key: 'blue', icon: '🔵', color: '#4444ff', y: 97 }
        ];
        
        currencies.forEach(curr => {
            const text = this.scene.add.text(startX + 77, startY + curr.y, 
                `${curr.icon} ${this.currencies[curr.key]}`, {
                fontSize: '15px',
                color: curr.color,
                fontStyle: 'bold',
                fontFamily: 'Arial'
            }).setOrigin(0.5).setDepth(2001).setScrollFactor(0);
            
            this.currencyTexts[curr.key] = { text, icon: curr.icon, color: curr.color };
        });
    }
    
    add(type, amount) {
        if (!this.currencies.hasOwnProperty(type)) {
            console.error(`Invalid currency type: ${type}`);
            return;
        }
        
        this.currencies[type] += amount;
        this.updateDisplay(type);
        this.showCollectionEffect(type, amount);
        
        // v0.04: Automatic rhodopsin conversion chain (every 100 → 10 next tier)
        // Simulates photoreceptor evolution: more basic receptors → specialized color receptors
        // Check and award conversions for each milestone reached
        
        if (type === 'monochrome') {
            const currentMilestone = Math.floor(this.currencies.monochrome / 100);
            if (currentMilestone > this.monoMilestone) {
                const newConversions = currentMilestone - this.monoMilestone;
                this.currencies.green += newConversions * 10;
                this.currencies.red += newConversions * 2;
                this.monoMilestone = currentMilestone;
                this.updateDisplay('green');
                this.updateDisplay('red');
            }
        }
        
        if (type === 'green') {
            const currentMilestone = Math.floor(this.currencies.green / 100);
            if (currentMilestone > this.greenMilestone) {
                const newConversions = currentMilestone - this.greenMilestone;
                this.currencies.blue += newConversions * 10;
                this.greenMilestone = currentMilestone;
                this.updateDisplay('blue');
            }
        }
        
        if (type === 'blue') {
            const currentMilestone = Math.floor(this.currencies.blue / 100);
            if (currentMilestone > this.blueMilestone) {
                const newConversions = currentMilestone - this.blueMilestone;
                this.currencies.red += newConversions * 10;
                this.blueMilestone = currentMilestone;
                this.updateDisplay('red');
            }
        }
        
        // v0.04: Update species box highlights after currency changes
        if (this.scene.updateSpeciesBoxHighlights) {
            this.scene.updateSpeciesBoxHighlights();
        }
    }
    
    canAfford(costs) {
        // Check if player has enough of each currency
        for (let [type, amount] of Object.entries(costs)) {
            if (this.currencies[type] < amount) {
                return false;
            }
        }
        return true;
    }
    
    spend(costs) {
        if (!this.canAfford(costs)) {
            console.warn('Cannot afford costs:', costs);
            return false;
        }
        
        for (let [type, amount] of Object.entries(costs)) {
            this.currencies[type] -= amount;
            this.updateDisplay(type);
        }
        
        // v0.04: Update species box highlights after spending (immediate + delayed)
        if (this.scene.updateSpeciesBoxHighlights) {
            this.scene.updateSpeciesBoxHighlights(); // Immediate
            this.scene.time.delayedCall(50, () => { // Also after 50ms to ensure Phaser updates
                if (this.scene.updateSpeciesBoxHighlights) {
                    this.scene.updateSpeciesBoxHighlights();
                }
            });
        }
        
        return true;
    }
    
    updateDisplay(type) {
        const display = this.currencyTexts[type];
        if (display) {
            display.text.setText(`${display.icon} ${this.currencies[type]}`);
            
            // Flash effect on update
            this.scene.tweens.add({
                targets: display.text,
                scale: { from: 1, to: 1.3 },
                duration: 200,
                yoyo: true,
                ease: 'Quad.easeOut'
            });
        }
    }
    
    showCollectionEffect(type, amount) {
        // Small floating text showing +amount
        const display = this.currencyTexts[type];
        if (!display) return;
        
        const x = display.text.x + 80;
        const y = display.text.y;
        
        const floatingText = this.scene.add.text(x, y, `+${amount}`, {
            fontSize: '16px',
            color: display.color,
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setDepth(5002).setScrollFactor(0);
        
        this.scene.tweens.add({
            targets: floatingText,
            y: y - 30,
            alpha: 0,
            duration: 1000,
            ease: 'Quad.easeOut',
            onComplete: () => floatingText.destroy()
        });
    }
    
    getCurrencies() {
        return { ...this.currencies };
    }
    
    setCurrency(type, amount) {
        if (this.currencies.hasOwnProperty(type)) {
            this.currencies[type] = amount;
            this.updateDisplay(type);
        }
    }
    
    showConversionEffect(fromType, toType, fromAmount, toAmount) {
        // Show conversion notification (e.g., "⚫100 → 🟢10")
        const icons = {
            monochrome: '⚫',
            red: '🔴',
            green: '🟢',
            blue: '🔵'
        };
        
        const colors = {
            monochrome: '#cccccc',
            red: '#ff4444',
            green: '#44ff44',
            blue: '#4444ff'
        };
        
        const width = this.scene.scale.width;
        const height = this.scene.scale.height;
        const x = width / 2;
        const y = height / 2 - 100;
        
        const message = this.scene.add.text(x, y,
            `Auto-converted: ${icons[fromType]}${fromAmount} → ${icons[toType]}${toAmount}`,
            {
                fontSize: '20px',
                color: '#ffffff',
                backgroundColor: '#000000cc',
                padding: { x: 20, y: 10 },
                fontStyle: 'bold',
                fontFamily: 'Arial'
            }
        ).setOrigin(0.5).setDepth(10000).setScrollFactor(0);
        
        // Fade in, stay, fade out
        message.setAlpha(0);
        this.scene.tweens.add({
            targets: message,
            alpha: 1,
            duration: 300,
            ease: 'Sine.easeOut',
            onComplete: () => {
                this.scene.time.delayedCall(2000, () => {
                    this.scene.tweens.add({
                        targets: message,
                        alpha: 0,
                        duration: 500,
                        ease: 'Sine.easeIn',
                        onComplete: () => message.destroy()
                    });
                });
            }
        });
    }
}
