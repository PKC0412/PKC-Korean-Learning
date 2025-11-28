// Vocabulary Learning Module (Folder & Prefix Support)
const VocabularyLearning = {
  words: [],
  currentCategory: 'all',
  categories: [],
  isInitialized: false,

  async initialize() {
    // 언어가 바뀔 때마다 데이터를 다시 로드해야 하므로 초기화 체크 로직을 유연하게 변경하거나 제거
    // 여기서는 항상 새로 로드하도록 함
    await this.loadWords();
    this.extractCategories();
    this.render();
    this.isInitialized = true;
  },

  async loadWords() {
    try {
      const currentLang = (window.I18n && window.I18n.currentLang) ? window.I18n.currentLang : 'ko';
      
      // 경로 설정: 기본 한국어는 data/words.json, 그 외는 locales/{lang}/{lang}_words.json
      // 예: 일본어 -> locales/ja/ja_words.json
      let path = `locales/${currentLang}/${currentLang}_words.json`;
      
      if (currentLang === 'ko') {
        path = 'data/words.json'; 
      }

      console.log(`[Vocabulary] Loading data from: ${path}`);

      let response = await fetch(path);
      
      // 파일이 없을 경우 안전장치 (기본 파일 로드)
      if (!response.ok) {
        console.warn(`[Vocabulary] File not found at ${path}, fallback to data/words.json`);
        path = 'data/words.json';
        response = await fetch(path);
      }

      const rawData = await response.json();
      
      // 데이터 키 정규화 (각 언어별 키 -> meaning으로 통일)
      // 예: { "English": "Hello" } -> { ..., "meaning": "Hello" }
      const langKeyMap = {
        'en': 'English', // 대소문자 주의 (파일 내 키값과 일치해야 함)
        'ja': 'Japanese',
        'zh': 'Chinese',
        'ru': 'Russian',
        'es': 'Spanish',
        'fr': 'French',
        'it': 'Italian',
        'de': 'German',
        'th': 'Thai',
        'pt': 'Portuguese',
        'nl': 'Dutch'
      };

      // 현재 언어에 맞는 키를 찾고, 없으면 'english'나 'English'를 시도
      const targetKey = langKeyMap[currentLang] || 'english'; 
      
      this.words = rawData.map(item => ({
        ...item,
        // 1순위: 타겟 언어 키, 2순위: English(대문자), 3순위: english(소문자), 4순위: Japanese(원본 호환)
        meaning: item[targetKey] || item.English || item.english || item.Japanese || ''
      }));

    } catch (error) {
      console.error('[Vocabulary] Load failed:', error);
      this.words = [];
    }
  },

  extractCategories() {
    const categorySet = new Set(['all']);
    if (Array.isArray(this.words)) {
        this.words.forEach(w => { if (w.category) categorySet.add(w.category); });
    }
    this.categories = Array.from(categorySet);
  },

  render() {
    const container = document.getElementById('vocabulary-container');
    if (!container) return;

    if (!this.words || this.words.length === 0) {
      this.renderError();
      return;
    }

    const filteredWords = this.currentCategory === 'all'
        ? this.words
        : this.words.filter(w => w.category === this.currentCategory);

    // 카테고리명 다국어 처리
    // 한국어 기본 매핑 (번역 키가 없을 때를 대비)
    const CATEGORY_EN_TO_KO = {
        all: '전체', greetings: '인사', basic: '기본', food: '음식', people: '사람',
        places: '장소', transportation: '교통', verbs_daily: '일상 동사', verbs_actions: '행동 동사',
        adjectives: '형용사', numbers: '숫자', time: '시간', colors: '색깔', body: '신체',
        nature: '자연', school: '학교'
    };

    const getLabel = (key, fallback) => (window.I18n && typeof I18n.t === 'function') ? I18n.t(key) : fallback;

    // 카테고리 버튼 생성
    const categoryTabs = this.categories.map(category => {
        const isActive = this.currentCategory === category;
        
        // 1. I18n 키로 시도 (category.greetings 등)
        // ja.json에는 "인사": "あいさつ" 형태로 되어 있으므로, category -> 한글 -> 번역 순으로 접근해야 함
        // 또는 ja.json을 수정해서 "category.greetings": "あいさつ"로 만드는 게 정석이지만,
        // 현재 파일 구조를 유지하려면 한글 키를 활용해야 함.
        
        let displayLabel = category;
        
        // 카테고리 영문명 -> 한글명 변환
        const koLabel = CATEGORY_EN_TO_KO[category] || category;
        
        // 한글 키로 번역 시도 (예: "인사" -> "あいさつ")
        // I18n.t("인사") 호출
        if (window.I18n) {
            const translated = I18n.t(koLabel);
            // 번역된 값이 키와 다르면(번역 성공) 사용
            if (translated !== koLabel) {
                displayLabel = translated;
            } else {
                // 번역 실패 시(영어 등), 영문 키로 다시 시도 (category.greetings)
                 const catKeyTranslated = I18n.t(`category.${category}`);
                 if (catKeyTranslated !== `category.${category}`) {
                     displayLabel = catKeyTranslated;
                 } else {
                     // 그래도 없으면 koLabel(한글) 또는 category(영어) 사용
                     // 한국어 모드라면 koLabel 사용
                     if (window.I18n.currentLang === 'ko') displayLabel = koLabel;
                 }
            }
        }

        return `<button class="vocab-category-btn ${isActive ? 'active' : ''}" onclick="VocabularyLearning.setCategory('${category}')">${displayLabel}</button>`;
    }).join('');

    // 재생 버튼 라벨 ("vocab.play" -> "再生")
    // 키를 못 찾으면 "발음 듣기" 출력
    const playLabelKey = 'vocab.play';
    const playLabel = (window.I18n && I18n.t(playLabelKey) !== playLabelKey) ? I18n.t(playLabelKey) : '발음 듣기';

    const wordCards = filteredWords.map(word => `
        <div class="vocab-card">
          <div class="vocab-korean">${word.korean}</div>
          <div class="vocab-translation">${word.meaning}</div>
          <div class="vocab-romanization">${word.romanization}</div>
          <button class="vocab-play-btn" onclick="VocabularyLearning.speak('${word.korean}')">🔊 ${playLabel}</button>
        </div>
    `).join('');

    container.innerHTML = `<div class="vocab-category-tabs">${categoryTabs}</div><div class="vocab-list">${wordCards}</div>`;
  },

  renderError() {
    const container = document.getElementById('vocabulary-container');
    if(container) container.innerHTML = `<div class="vocab-error"><p>⚠️ 데이터를 불러올 수 없습니다.</p></div>`;
  },

  setCategory(cat) { this.currentCategory = cat; this.render(); },

  speak(text) {
    if (!text) return;
    if (window.SpeechSynthesisManager) SpeechSynthesisManager.speak(text);
    else {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'ko-KR';
        window.speechSynthesis.speak(u);
    }
  }
};

window.VocabularyLearning = VocabularyLearning;