// Application Configuration (browser-safe)
const AppConfig = {
  // App Metadata
  appName: 'Korean Learning App',
  version: '1.0.0',
  author: 'Korean Learning Team',

  // Supported Languages (UI purposes only)
  supportedLanguages: [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'zh', name: 'Chinese', nativeName: '简体中文' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'th', name: 'Thai', nativeName: 'ไทย' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' }
  ],

  // Feature Toggles
  features: {
    enableSpeech: true,
    enableFlashcards: true,
    enableGrammar: true,
    enableDarkMode: true
  },

  // UI Settings
  ui: {
    defaultTheme: 'light',
    animationsEnabled: true
  },

  // Logging (browser console only)
  logging: {
    enabled: true,
    level: 'info' // 'debug', 'info', 'warn', 'error'
  }
};

// Export for Node-like environments (optional, safe guard)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AppConfig;
}
