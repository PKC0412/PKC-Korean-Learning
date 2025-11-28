// UI Modals: Help & Language + ESC to close
const UiModals = {
  init() {
    this.initHelpModal();
    this.initLanguageModal();
    this.initEscClose();
  },

  initHelpModal() {
    const helpBtn = document.getElementById('help-btn');
    const helpModal = document.getElementById('helpModal');
    const closeHelpModal = document.getElementById('closeHelpModal');

    if (!helpBtn || !helpModal || !closeHelpModal) return;

    helpBtn.addEventListener('click', () => {
      helpModal.classList.add('active');
    });

    closeHelpModal.addEventListener('click', () => {
      helpModal.classList.remove('active');
    });

    helpModal.addEventListener('click', (e) => {
      if (e.target === helpModal) {
        helpModal.classList.remove('active');
      }
    });
  },

  initLanguageModal() {
    const languageBtn = document.getElementById('language-btn');
    const languageModal = document.getElementById('languageModal');
    const closeLanguageModal = document.getElementById('closeLanguageModal');

    if (!languageBtn || !languageModal || !closeLanguageModal) return;

    languageBtn.addEventListener('click', () => {
      languageModal.classList.add('active');
    });

    closeLanguageModal.addEventListener('click', () => {
      languageModal.classList.remove('active');
    });

    languageModal.addEventListener('click', (e) => {
      if (e.target === languageModal) {
        languageModal.classList.remove('active');
      }
    });
  },

  initEscClose() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        const allModals = document.querySelectorAll('.modal-overlay.active');
        allModals.forEach((modal) => {
          modal.classList.remove('active');
        });
      }
    });
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => UiModals.init());
} else {
  UiModals.init();
}
