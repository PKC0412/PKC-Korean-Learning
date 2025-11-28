// Main App Module
const App = {
  currentSection: null,

  init() {
    this.setupEventListeners();
    this.loadProgress();
  },

  setupEventListeners() {
    // Menu button listeners
    document.getElementById('btn-hangul')?.addEventListener(
      'click',
      () => this.showSection('hangul-section')
    );
    document.getElementById('btn-vocabulary')?.addEventListener(
      'click',
      () => this.showSection('vocabulary-section')
    );
    document.getElementById('btn-flashcard')?.addEventListener(
      'click',
      () => this.showSection('flashcard-section')
    );
    document.getElementById('btn-grammar')?.addEventListener(
      'click',
      () => this.showSection('grammar-section')
    );
  },

  showSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach((section) => {
      section.style.display = 'none';
    });

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.style.display = 'block';
      this.currentSection = sectionId;

      // Initialize section-specific content
      if (sectionId === 'hangul-section') {
        HangulLearning.initialize();
      } else if (sectionId === 'vocabulary-section') {
        VocabularyLearning.initialize();
      } else if (sectionId === 'flashcard-section') {
        Flashcard.initialize();
      } else if (sectionId === 'grammar-section') {
        if (window.GrammarUI && typeof window.GrammarUI.initialize === 'function') {
          window.GrammarUI.initialize();
        } else if (window.GrammarLearning && typeof window.GrammarLearning.initialize === 'function') {
          // Fallback: legacy grammar engine
          window.GrammarLearning.initialize();
        }
      }
    }
  },

  showWelcome() {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach((section) => {
      section.style.display = 'none';
    });

    const welcomeSection = document.querySelector('.welcome-section');
    if (welcomeSection) {
      welcomeSection.style.display = 'block';
    }
    this.currentSection = null;
  },

  loadProgress() {
    const savedProgress = localStorage.getItem('app-progress');
    if (savedProgress) {
      console.log('Loaded progress:', JSON.parse(savedProgress));
    }
  },

  saveProgress(data) {
    const currentProgress = JSON.parse(
      localStorage.getItem('app-progress') || '{}'
    );
    const updatedProgress = { ...currentProgress, ...data };
    localStorage.setItem('app-progress', JSON.stringify(updatedProgress));
  }
};

// Global helper function for close button
function showWelcome() {
  App.showWelcome();
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    App.init();
  });
} else {
  App.init();
}
