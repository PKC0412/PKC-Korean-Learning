// Hangul Learning Module (Folder & Prefix Support)
const HangulLearning = {
  consonants: [],
  vowels: [],
  finals: [],
  currentIndex: 0,
  mode: 'consonants',
  isInitialized: false,

  async initialize() {
    try {
      await this.loadData();
      this.renderCurrentCharacter();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Hangul Learning:', error);
    }
  },

  async loadData() {
    try {
      const currentLang = (window.I18n && window.I18n.currentLang) ? window.I18n.currentLang : 'ko';
      
      // 경로 생성 함수: 
      // 한국어(ko) -> data/consonants.json
      // 그 외(en) -> locales/en/en_consonants.json
      const getPath = (type) => {
        if (currentLang === 'ko') return `data/${type}.json`;
        return `locales/${currentLang}/${currentLang}_${type}.json`;
      };

      const loadFile = async (type) => {
        const path = getPath(type);
        console.log(`[Hangul] Loading ${type} from: ${path}`);
        
        let res = await fetch(path);
        if (!res.ok) {
            // 해당 언어 파일이 없으면 한국어(data/) 폴더로 폴백
            console.warn(`[Hangul] File not found at ${path}, fallback to default.`);
            res = await fetch(`data/${type}.json`);
        }
        return await res.json();
      };

      this.consonants = await loadFile('consonants');
      this.vowels = await loadFile('vowels');
      this.finals = await loadFile('finals');

    } catch (error) {
      console.error('Failed to load Hangul data:', error);
      // 최소한의 데이터 폴백 (에러 방지용)
      this.consonants = [{ char: 'ㄱ', name: 'Giyeok', romanization: 'g' }];
      this.vowels = [{ char: 'ㅏ', name: 'A', romanization: 'a' }];
      this.finals = [{ char: 'ㄱ', name: 'giyeok', romanization: 'g' }];
    }
  },

  getCurrentCharacters() {
    switch (this.mode) {
      case 'vowels': return this.vowels;
      case 'finals': return this.finals;
      default: return this.consonants;
    }
  },

  getCurrentCharacter() {
    return this.getCurrentCharacters()[this.currentIndex] || null;
  },

  renderCurrentCharacter() {
    const container = document.getElementById('hangul-container');
    const character = this.getCurrentCharacter();

    if (!character) {
      container.innerHTML = '<p>표시할 글자가 없습니다.</p>';
      return;
    }

    const getLabel = (key, fallback) => (window.I18n && typeof I18n.t === 'function') ? I18n.t(key) : fallback;

    // 모드 라벨 번역 ("자음", "모음", "받침")
    // 번역 파일에 해당 키("자음" 등)가 있어야 함
    const modeLabel = this.mode === 'vowels' ? getLabel('모음', '모음') :
                      this.mode === 'finals' ? getLabel('받침', '받침') :
                      getLabel('자음', '자음');

    // UI 라벨 번역
    const lblRoman = getLabel('로마자 표기:', '로마자 표기:');
    // grammar.hear 등을 재활용하거나, '발음 듣기' 키 사용
    const lblHear = getLabel('발음 듣기', '발음 듣기'); 
    const lblPrev = getLabel('이전', '이전');
    const lblNext = getLabel('다음', '다음');
    const lblDesc = getLabel('설명:', '설명:');
    const lblEx = getLabel('예시:', '예시:');

    container.innerHTML = `
      <div class="hangul-tabs">
        <button class="hangul-tab ${this.mode === 'consonants' ? 'active' : ''}" onclick="HangulLearning.setMode('consonants')">${getLabel('자음', '자음')}</button>
        <button class="hangul-tab ${this.mode === 'vowels' ? 'active' : ''}" onclick="HangulLearning.setMode('vowels')">${getLabel('모음', '모음')}</button>
        <button class="hangul-tab ${this.mode === 'finals' ? 'active' : ''}" onclick="HangulLearning.setMode('finals')">${getLabel('받침', '받침')}</button>
      </div>

      <div class="hangul-card">
        <div class="hangul-char">${character.char}</div>
        <div class="hangul-info">
          <div class="hangul-label">${modeLabel} <span class="info-icon" onclick="HangulLearning.showInfo()">ⓘ</span></div>
          <div class="hangul-label-text">${character.name}</div>
          <div class="hangul-label">${lblRoman} ${character.romanization}</div>
          <div class="hangul-label">IPA: ${character.ipa || '-'}</div>
        </div>
      </div>

      <div class="hangul-controls">
        <button class="btn-speak" onclick="HangulLearning.speak()">🔊 ${lblHear}</button>
      </div>

      <div class="hangul-navigation">
        <button class="btn-prev" onclick="HangulLearning.prev()" ${this.currentIndex === 0 ? 'disabled' : ''}>← ${lblPrev}</button>
        <span class="progress-info">${this.currentIndex + 1} / ${this.getCurrentCharacters().length}</span>
        <button class="btn-next" onclick="HangulLearning.next()" ${this.currentIndex >= this.getCurrentCharacters().length - 1 ? 'disabled' : ''}>${lblNext} →</button>
      </div>

      <div id="hangulModal" class="modal-overlay">
        <div class="modal-content">
          <span class="modal-close" onclick="HangulLearning.closeInfo()">×</span>
          <div class="modal-header">${character.name}</div>
          <p><strong>${lblDesc}</strong> ${character.description || '-'}</p>
          <p><strong>${lblEx}</strong> ${character.examples || '-'}</p>
        </div>
      </div>
    `;
  },

  setMode(mode) {
    this.mode = mode;
    this.currentIndex = 0;
    this.renderCurrentCharacter();
  },

  next() {
    const characters = this.getCurrentCharacters();
    if (this.currentIndex < characters.length - 1) {
      this.currentIndex++;
      this.renderCurrentCharacter();
    }
  },

  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.renderCurrentCharacter();
    }
  },

  speak() {
    const character = this.getCurrentCharacter();
    if (character && window.SpeechSynthesisManager) {
      SpeechSynthesisManager.speak(character.char);
    }
  },

  showInfo() { document.getElementById('hangulModal')?.classList.add('active'); },
  closeInfo() { document.getElementById('hangulModal')?.classList.remove('active'); }
};