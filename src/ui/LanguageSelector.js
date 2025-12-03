// Language Selector UI Component
import { Lang } from '../data/LanguageManager.js';

export class LanguageSelector {
    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.container = null;
        
        this.createSelector();
    }
    
    createSelector() {
        // Create container for language selector
        this.container = this.scene.add.container(this.x, this.y).setDepth(10000);
        
        const languages = Lang.getAvailableLanguages();
        const currentLang = Lang.getCurrentLanguage();
        
        // Background
        const bg = this.scene.add.rectangle(0, 0, 80, 30, 0x1a1a2e, 0.9);
        bg.setStrokeStyle(2, 0x00ff00);
        this.container.add(bg);
        
        // Current language text
        this.langText = this.scene.add.text(0, 0, currentLang.toUpperCase(), {
            fontSize: '16px',
            color: '#00ff00',
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        this.container.add(this.langText);
        
        // Make interactive
        bg.setInteractive({ useHandCursor: true });
        bg.on('pointerdown', () => this.toggleLanguage());
        
        // Hover effect
        bg.on('pointerover', () => {
            bg.setFillStyle(0x2a2a4e, 1);
        });
        bg.on('pointerout', () => {
            bg.setFillStyle(0x1a1a2e, 0.9);
        });
        
        // Flag emoji based on language
        this.updateFlag();
    }
    
    toggleLanguage() {
        const languages = Lang.getAvailableLanguages();
        const currentIndex = languages.indexOf(Lang.getCurrentLanguage());
        const nextIndex = (currentIndex + 1) % languages.length;
        const nextLang = languages[nextIndex];
        
        Lang.setLanguage(nextLang);
        this.langText.setText(nextLang.toUpperCase());
        this.updateFlag();
        
        // Emit event so scenes can refresh their text
        this.scene.events.emit('languageChanged', nextLang);
    }
    
    updateFlag() {
        const flags = {
            en: '🇬🇧',
            de: '🇩🇪'
        };
        
        const currentLang = Lang.getCurrentLanguage();
        const flag = flags[currentLang] || '🌍';
        
        // Remove old flag if exists
        if (this.flagEmoji) {
            this.flagEmoji.destroy();
        }
        
        // Add flag emoji
        this.flagEmoji = this.scene.add.text(-30, 0, flag, {
            fontSize: '18px'
        }).setOrigin(0.5);
        this.container.add(this.flagEmoji);
    }
    
    destroy() {
        if (this.container) {
            this.container.destroy();
        }
    }
}
