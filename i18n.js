const I18n = {
  currentLang: 'ko', // 기본 언어
  dictionary: {},

  async load(lang) {
    try {
      // 1. 한국어(ko)는 번역 파일을 로드하지 않음 (HTML 기본 텍스트 사용)
      if (lang === 'ko') {
        this.dictionary = {};
        this.currentLang = lang;
        return;
      }

      // 2. 동적 경로 생성: locales/{lang}/{lang}.json
      // 예: locales/en/en.json
      const path = `locales/${lang}/${lang}.json`;
      console.log(`[I18n] Loading UI translation from: ${path}`);
      
      const res = await fetch(path);
      if (!res.ok) {
        console.warn(`[I18n] Failed to load ${path}, status: ${res.status}`);
        this.dictionary = {};
        this.currentLang = lang;
        return;
      }
      
      this.dictionary = await res.json();
      this.currentLang = lang;
      console.log(`[I18n] Loaded successfully: ${lang}`);

    } catch (e) {
      console.error('[I18n] Error:', e);
      this.dictionary = {};
      this.currentLang = lang;
    }
  },

  t(key) {
    // 키 탐색 로직 (점 표기법 지원, 예: menu.help)
    const parts = key.split('.');
    let cur = this.dictionary;
    for (const p of parts) {
      if (cur && typeof cur === 'object' && p in cur) {
        cur = cur[p];
      } else {
        return key; // 찾지 못하면 키 자체 반환
      }
    }
    return typeof cur === 'string' ? cur : key;
  },

  apply() {
    // DOM 업데이트
    document.querySelectorAll('[data-i18n]').forEach((elem) => {
      const key = elem.getAttribute('data-i18n');
      const value = this.t(key);
      
      if (value && value !== key) {
        if (elem.tagName === 'INPUT' || elem.tagName === 'TEXTAREA') {
            if (elem.hasAttribute('placeholder')) elem.placeholder = value;
        } else {
            elem.textContent = value;
        }
      }
    });
    
    // 언어 변경 이벤트 전파 (다른 모듈들이 감지하도록)
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: this.currentLang } }));
  }
};

window.I18n = I18n;