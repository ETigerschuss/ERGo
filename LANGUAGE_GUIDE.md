# ERGo! - Multi-Language System

## 🌍 Overview

ERGo! uses a centralized language management system that makes it easy to add new languages and maintain translations across the entire game.

## 📁 File Structure

```
src/
├── data/
│   ├── LanguageManager.js      # Central language system
│   └── languages/
│       ├── en.js               # English translations
│       └── de.js               # German translations
└── ui/
    └── LanguageSelector.js     # UI component for language switching
```

## ✨ Features

- **Automatic Language Detection**: Detects browser language on first launch
- **Persistent Selection**: Saves user's language choice in localStorage
- **Easy Placeholder Support**: Use `{variable}` syntax for dynamic text
- **Fallback System**: Returns key if translation is missing (helps with debugging)
- **Singleton Pattern**: One language manager instance across entire game

## 🚀 How to Add a New Language

### Step 1: Create Translation File

Create a new file in `src/data/languages/` (e.g., `fr.js` for French):

```javascript
// French translations
export const LANG_FR = {
    instructions: {
        line1: 'Cliquez sur la boîte d\'espèce pour débloquer les insectes | Cliquez sur un insecte pour sélectionner, cliquez pour définir le chemin',
        line2: 'Les mini-emojis sélectionnent les insectes | Cliquez sur une zone vide pour commander tous les insectes'
    },
    
    speciesBox: {
        unlock: 'DÉBLOQUER',
        unlocked: 'Débloqué!',
        // ... etc
    },
    
    // Copy all keys from en.js and translate
};
```

**Important**: Keep the exact same structure as `en.js` - all nested keys must match!

### Step 2: Register Language in LanguageManager

Edit `src/data/LanguageManager.js`:

```javascript
import { LANG_EN } from './languages/en.js';
import { LANG_DE } from './languages/de.js';
import { LANG_FR } from './languages/fr.js';  // Add import

const LANGUAGES = {
    en: LANG_EN,
    de: LANG_DE,
    fr: LANG_FR  // Add to registry
};
```

### Step 3: Add Language Name (Optional)

In `LanguageManager.js`, update the `getLanguageName()` method:

```javascript
getLanguageName(langCode) {
    const names = {
        en: 'English',
        de: 'Deutsch',
        fr: 'Français'  // Add language name
    };
    return names[langCode] || langCode;
}
```

### Step 4: Add Flag Emoji (Optional)

In `src/ui/LanguageSelector.js`, update the flags object:

```javascript
const flags = {
    en: '🇬🇧',
    de: '🇩🇪',
    fr: '🇫🇷'  // Add flag
};
```

That's it! The new language will automatically appear in the language selector.

## 💻 Usage in Code

### Basic Usage

```javascript
import { Lang } from '../data/LanguageManager.js';

// Get simple translation
const text = Lang.t('instructions.line1');

// Get translation with placeholders
const levelText = Lang.t('timer.level', { num: 5 });  // "Level 5"
```

### In Phaser Scenes

```javascript
export class MyScene extends Phaser.Scene {
    constructor() {
        super('MyScene');
        this.lang = Lang;  // Store reference
    }
    
    create() {
        // Use in text objects
        this.add.text(100, 100, this.lang.t('intro.title'));
        
        // With placeholders
        this.add.text(100, 150, this.lang.t('timer.yourTime', { 
            time: '02:34' 
        }));
    }
}
```

### Language Switching

```javascript
// Get current language
const currentLang = Lang.getCurrentLanguage();  // "en"

// Switch language
Lang.setLanguage('de');  // Changes to German

// Get available languages
const langs = Lang.getAvailableLanguages();  // ["en", "de"]
```

## 🎮 Language Selector UI

Add the language selector to any scene:

```javascript
import { LanguageSelector } from '../ui/LanguageSelector.js';

export class StartScene extends Phaser.Scene {
    create() {
        // Add in top-right corner
        const width = this.scale.width;
        this.languageSelector = new LanguageSelector(this, width - 50, 30);
        
        // Listen for language changes
        this.events.on('languageChanged', (newLang) => {
            console.log(`Language changed to: ${newLang}`);
            this.refreshAllText();  // Update all text
        });
    }
}
```

## 📝 Translation Keys Reference

All translation keys are organized by category. Here's the complete structure:

- **instructions**: Game instructions displayed at top
- **speciesBox**: Species box UI messages
- **currency**: Rhodopsin/currency system text
- **timer**: Timer and level completion text
- **intro**: Introduction screen content
- **unlock**: Unlock notification messages
- **error**: Error messages
- **collectible**: Collectible pickup messages
- **highScore**: High score display
- **finalReward**: Final reward screen
- **spectral**: Spectral evolution display
- **buttons**: Common button labels

## 🔍 Tips for Translators

1. **Test Placeholder Syntax**: Make sure `{variable}` placeholders work
   ```javascript
   // ✅ Correct
   'Level {num}'  // Lang.t('key', { num: 5 }) -> "Level 5"
   
   // ❌ Wrong
   'Level ${num}'  // Won't work
   ```

2. **Keep Similar Length**: Try to keep translations roughly the same length as English to avoid UI overflow

3. **Test in Game**: Always test translations in-game to ensure they fit properly

4. **Use Translation Keys**: If a translation is missing, the system returns the key (e.g., `"intro.title"`), making it easy to spot missing translations

5. **Check Console**: The language manager logs warnings for missing translation keys

## 🐛 Debugging

Enable debug logging:

```javascript
// In LanguageManager.js, the constructor already logs:
console.log(`🌍 Language initialized: ${this.currentLanguage}`);

// Missing keys are automatically logged:
console.warn(`⚠️ Translation key not found: ${key}`);
```

## 📋 Checklist for Adding a Language

- [ ] Create translation file in `src/data/languages/`
- [ ] Copy exact structure from `en.js`
- [ ] Translate all strings
- [ ] Test placeholder syntax (`{variable}`)
- [ ] Import in `LanguageManager.js`
- [ ] Add to `LANGUAGES` object
- [ ] Add language name to `getLanguageName()`
- [ ] Add flag emoji to `LanguageSelector.js`
- [ ] Test in game
- [ ] Check all scenes and dialogs
- [ ] Verify text fits in UI elements

## 🌐 Contributing Translations

To contribute a new language:

1. Fork the repository
2. Create translation file following the structure above
3. Test thoroughly in the game
4. Submit pull request with:
   - New language file
   - Updated LanguageManager.js
   - Screenshots of UI with new language

## 📄 License

All translations should maintain the same license as the main project.
