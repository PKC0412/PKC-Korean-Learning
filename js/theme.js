// Theme Management Module
const ThemeManager = {
  LIGHT_MODE: 'light',
  DARK_MODE: 'dark',
  STORAGE_KEY: 'app-theme-preference',

  init() {
    this.loadTheme();
    this.setupEventListeners();
  },

  loadTheme() {
    const savedTheme = localStorage.getItem(this.STORAGE_KEY);
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;

    let theme = this.LIGHT_MODE;

    if (savedTheme) {
      theme = savedTheme;
    } else if (prefersDark) {
      theme = this.DARK_MODE;
    }

    this.applyTheme(theme);
  },

  applyTheme(theme) {
    if (theme === this.DARK_MODE) {
      document.documentElement.setAttribute('data-theme', this.DARK_MODE);
      this.updateThemeToggleIcon(theme);
    } else {
      document.documentElement.removeAttribute('data-theme');
      this.updateThemeToggleIcon(theme);
    }

    localStorage.setItem(this.STORAGE_KEY, theme);
  },

  getCurrentTheme() {
    const htmlTheme = document.documentElement.getAttribute('data-theme');
    return htmlTheme === this.DARK_MODE ? this.DARK_MODE : this.LIGHT_MODE;
  },

  toggleTheme() {
    const currentTheme = this.getCurrentTheme();
    const newTheme = currentTheme === this.LIGHT_MODE
      ? this.DARK_MODE
      : this.LIGHT_MODE;

    this.applyTheme(newTheme);
  },

  updateThemeToggleIcon(theme) {
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      const icon = theme === this.DARK_MODE ? '☀️' : '🌙';
      toggleBtn.innerHTML = `<span class="theme-icon">${icon}</span>`;
    }
  },

  setupEventListeners() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        this.toggleTheme();
      });
    }

    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
          this.loadTheme();
        }
      });
  }
};

// Initialize theme manager when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
  });
} else {
  ThemeManager.init();
}
