// Language Manager - Central system for handling translations
import { LANG_EN } from './languages/en.js';
import { LANG_DE } from './languages/de.js';

// Available languages
const LANGUAGES = {
    en: LANG_EN,
    de: LANG_DE
};

// Default language
const DEFAULT_LANGUAGE = 'en';

class LanguageManager {
    constructor() {
        // Try to load language from localStorage, fallback to browser language, then default
        const savedLang = localStorage.getItem('ergo_language');
        const browserLang = navigator.language.split('-')[0]; // Get 'en' from 'en-US'
        
        this.currentLanguage = savedLang || 
                              (LANGUAGES[browserLang] ? browserLang : DEFAULT_LANGUAGE);
        
        console.log(`🌍 Language initialized: ${this.currentLanguage}`);
    }
    
    /**
     * Get current language code
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }
    
    /**
     * Set current language
     */
    setLanguage(langCode) {
        if (LANGUAGES[langCode]) {
            this.currentLanguage = langCode;
            localStorage.setItem('ergo_language', langCode);
            console.log(`🌍 Language changed to: ${langCode}`);
            return true;
        }
        console.warn(`⚠️ Language '${langCode}' not found`);
        return false;
    }
    
    /**
     * Get translation string
     * Usage: t('instructions.line1')
     * Or with placeholders: t('timer.level', { num: 5 }) -> "Level 5"
     */
    t(key, params = {}) {
        const keys = key.split('.');
        let value = LANGUAGES[this.currentLanguage];
        
        // Navigate through nested keys
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                console.warn(`⚠️ Translation key not found: ${key}`);
                return key; // Return key if not found
            }
        }
        
        // Replace placeholders like {name}, {num}, etc.
        if (typeof value === 'string' && Object.keys(params).length > 0) {
            return value.replace(/\{(\w+)\}/g, (match, param) => {
                return params[param] !== undefined ? params[param] : match;
            });
        }
        
        return value;
    }
    
    /**
     * Get all available language codes
     */
    getAvailableLanguages() {
        return Object.keys(LANGUAGES);
    }
    
    /**
     * Get language name
     */
    getLanguageName(langCode) {
        const names = {
            en: 'English',
            de: 'Deutsch'
        };
        return names[langCode] || langCode;
    }
}

// Export singleton instance
export const Lang = new LanguageManager();

// Export for easy access
export { LANGUAGES, DEFAULT_LANGUAGE };
