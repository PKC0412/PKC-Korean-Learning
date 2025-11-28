// i18n initialization and language switching
const supportedLanguages = ['en', 'zh', 'ja', 'ru', 'es', 'fr', 'it', 'de', 'th', 'pt', 'nl'];
const defaultLanguage = 'ko';

function normalizeLanguage(lang) {
  if (!lang || typeof lang !== 'string') return defaultLanguage;
  const lower = lang.toLowerCase();
  // Handle locale forms like en-US, ja-jp, ko-KR 등
  const base = lower.split('-')[0];

  if (supportedLanguages.includes(lower)) return lower;
  if (supportedLanguages.includes(base)) return base;

  // 지원 목록에 없는 경우(ko 포함)는 모두 기본 한국어로 처리
  return defaultLanguage;
}

async function applyLanguage(lang) {
  const normalized = normalizeLanguage(lang);

  if (!window.I18n) return;

  // 기본 한국어 모드에서는 언어팩을 적용하지 않는다
  if (normalized === defaultLanguage) {
    try {
      localStorage.removeItem('preferredLanguage');
    } catch (e) {
      console.warn('Could not clear preferred language from storage', e);
    }
    // 다른 언어가 이미 적용된 상태에서 한국어로 되돌릴 때는
    // 가장 안전하게 원래 한글 UI를 복원하기 위해 새로고침한다.
    window.location.reload();
    return;
  }

  try {
    await I18n.load(normalized);
    if (typeof I18n.apply === 'function') {
      I18n.apply();
    }
  } catch (err) {
    console.error('Failed to apply language:', err);
  }

  // Update selected state on language buttons
  const options = document.querySelectorAll('.language-option');
  options.forEach((btn) => {
    if (btn.dataset.lang === normalized) {
      btn.classList.add('selected');
    } else {
      btn.classList.remove('selected');
    }
  });

  // Persist preference
  try {
    localStorage.setItem('preferredLanguage', normalized);
  } catch (err) {
    console.warn('Could not save preferred language:', err);
  }
}

function setupLanguageOptions() {
  const languageModal = document.getElementById('languageModal');
  const options = document.querySelectorAll('.language-option');

  options.forEach((btn) => {
    btn.addEventListener('click', () => {
      const selectedLang = btn.dataset.lang;
      applyLanguage(selectedLang);
      if (languageModal) {
        languageModal.classList.remove('active');
      }
    });
  });
}

function initI18n() {
  // Determine initial language
  let initialLang = defaultLanguage;
  try {
    const stored = localStorage.getItem('preferredLanguage');
    if (stored) {
      const normalizedStored = normalizeLanguage(stored);
      if (supportedLanguages.includes(normalizedStored)) {
        initialLang = normalizedStored;
      }
    } else if (navigator.language || navigator.userLanguage) {
      const browserLang = normalizeLanguage(navigator.language || navigator.userLanguage);
      if (supportedLanguages.includes(browserLang)) {
        initialLang = browserLang;
      }
    }
  } catch (e) {
    console.warn('Could not read preferred language:', e);
  }

  // 기본 한국어일 때는 언어팩 적용 없이 한글 UI를 그대로 사용하고,
  // 영어/일본어 등 다른 언어인 경우에만 언어팩을 로드해서 덮어쓴다.
  if (initialLang !== defaultLanguage) {
    applyLanguage(initialLang);
  }
  setupLanguageOptions();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initI18n);
} else {
  initI18n();
}

// Expose for debugging / external use if needed
window.applyLanguage = applyLanguage;
