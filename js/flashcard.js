// Flashcard Module (Folder & Prefix Support)
const Flashcard = {
  getLabel(key, fallback) {
    if (window.I18n && typeof I18n.t === 'function') {
      const value = I18n.t(key);
      if (value && value !== key) return value;
    }
    return fallback;
  },

  allWords: [],
  words: [],
  currentIndex: 0,
  isFlipped: false,
  knownCount: 0,
  unknownCount: 0,
  isInitialized: false,
  sessionSize: 50,
  useShuffled: true,

  async initialize() {
    // 항상 최신 언어 데이터를 로드하기 위해 초기화 체크를 건너뛰거나,
    // 언어가 변경될 때마다 명시적으로 initialize를 호출하도록 설계
    await this.loadData();
    this.setupSession();
    this.resetProgress();
    this.render();
    this.isInitialized = true;
  },

  async loadData() {
    try {
      const currentLang = (window.I18n && window.I18n.currentLang) ? window.I18n.currentLang : 'ko';
      
      // 경로: locales/{lang}/{lang}_words.json
      let path = `locales/${currentLang}/${currentLang}_words.json`;
      
      // 한국어(ko)인 경우 기본 data 폴더 사용
      if (currentLang === 'ko') {
        path = 'data/words.json';
      }

      console.log(`[Flashcard] Loading data from: ${path}`);

      let response = await fetch(path);
      
      // 파일이 없을 경우 안전장치 (기본 파일 로드)
      if (!response.ok) {
        console.warn(`[Flashcard] File not found at ${path}, fallback to data/words.json`);
        path = 'data/words.json';
        response = await fetch(path);
      }

      const rawData = await response.json();

      // 데이터 키 정규화 (각 언어별 키 -> meaning으로 통일)
      const langKeyMap = {
        'en': 'English',
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
      
      const targetKey = langKeyMap[currentLang] || 'english';

      this.allWords = rawData.map(item => ({
        ...item,
        // 우선순위: 타겟 언어 키 > English > english > Japanese > 에러 메시지
        meaning: item[targetKey] || item.English || item.english || item.Japanese || ''
      }));

    } catch (error) {
      console.error('[Flashcard] Load failed:', error);
      this.allWords = [];
    }
  },

  setupSession() {
    if (!this.allWords || this.allWords.length === 0) {
        this.words = [];
        return;
    }
    let sessionWords = [...this.allWords];
    if (this.useShuffled) {
      sessionWords = this.shuffleArray(sessionWords);
    }
    this.words = sessionWords.slice(0, this.sessionSize);
  },

  shuffleArray(arr) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  getCurrentWord() { return this.words[this.currentIndex] || null; },

  flip() {
    this.isFlipped = !this.isFlipped;
    this.updateCard();
  },

  speakWord() {
    const w = this.getCurrentWord();
    if (w && w.korean) {
        if (window.SpeechSynthesisManager) {
            SpeechSynthesisManager.speak(w.korean);
        } else {
            const u = new SpeechSynthesisUtterance(w.korean);
            u.lang = 'ko-KR';
            window.speechSynthesis.speak(u);
        }
    }
  },

  markAsKnown() {
    this.knownCount++;
    this.nextCard();
  },

  markAsUnknown() {
    this.unknownCount++;
    this.nextCard();
  },

  nextCard() {
    if (this.currentIndex < this.words.length - 1) {
      this.currentIndex++;
      this.isFlipped = false;
      this.updateCard();
    } else {
      this.showCompletion();
    }
  },

  updateCard() {
    const card = document.querySelector('.flashcard');
    const w = this.getCurrentWord();
    if (card && w) {
      card.textContent = this.isFlipped ? w.meaning : w.korean;
      card.classList.toggle('flipped', this.isFlipped);
    }
    this.updateProgress();
  },

  updateProgress() {
    const el = document.querySelector('.flashcard-progress');
    if (el) {
      const total = this.words.length;
      const completed = this.knownCount + this.unknownCount;
      
      // I18n 라벨 처리
      // ja.json 등의 "flashcard.progress.label": "진행도: {done} / {total}"
      let labelTemplate = this.getLabel('flashcard.progress.label', '진행도: {done} / {total}');
      
      // 만약 키가 없어서 'flashcard.progress' 같은 구형 키를 쓰는 경우 대비
      if (labelTemplate === 'flashcard.progress.label') {
          const simpleLabel = this.getLabel('flashcard.progress', '진행도');
          labelTemplate = `${simpleLabel}: {done} / {total}`;
      }
      
      el.textContent = labelTemplate.replace('{done}', completed).replace('{total}', total);
    }
  },

  render() {
    const container = document.getElementById('flashcard-container');
    const word = this.getCurrentWord();

    if (!word) {
      container.innerHTML = `<p style="text-align:center;margin-top:2rem;">${this.getLabel('flashcard.empty', '학습할 단어가 없습니다.')}</p>`;
      return;
    }

    // Labels (I18n Keys)
    const lblHear = this.getLabel('flashcard.controls.hear', '발음 듣기');
    const lblKnow = this.getLabel('flashcard.controls.know', '알아요');
    const lblDont = this.getLabel('flashcard.controls.dontKnow', '모르겠어요');
    const lblHint = this.getLabel('flashcard.hint.reveal', '카드를 눌러 뜻을 확인하세요.');
    const lblRoman = this.getLabel('flashcard.hint.romanizationLabel', '로마자 표기:');
    
    // 세션 정보
    let sessTemplate = this.getLabel('flashcard.session.summary', '세션: {current} / {total}');
    const sessionText = sessTemplate.replace('{current}', this.words.length).replace('{total}', this.allWords.length);

    container.innerHTML = `
      <div style="text-align: center; margin-bottom: 1.5rem; color: var(--text-secondary); font-size: 0.9rem;">
        <p>${sessionText}</p>
      </div>

      <div class="flashcard-wrapper">
        <div class="flashcard" onclick="Flashcard.flip()">
          ${word.korean}
        </div>
      </div>

      <div class="flashcard-controls">
        <button class="btn-speak" onclick="Flashcard.speakWord()">
          🔊 ${lblHear}
        </button>
      </div>

      <div class="flashcard-controls">
        <button class="btn-know" onclick="Flashcard.markAsKnown()">
          ✓ ${lblKnow}
        </button>
        <button class="btn-dont-know" onclick="Flashcard.markAsUnknown()">
          ✗ ${lblDont}
        </button>
      </div>

      <div class="flashcard-progress">
        <!-- updateProgress() will fill this -->
      </div>

      <div style="text-align: center; color: var(--text-secondary); font-size: 0.9rem; margin-top: 1rem;">
        <p>${lblHint}</p>
        <p style="font-size: 0.85rem; margin-top: 0.5rem;">
          ${lblRoman} <strong>${word.romanization}</strong>
        </p>
      </div>
    `;
    
    this.updateProgress();
  },

  showCompletion() {
    const container = document.getElementById('flashcard-container');
    const total = this.words.length;
    const acc = total > 0 ? Math.round((this.knownCount / total) * 100) : 0;
    
    const lblTitle = this.getLabel('flashcard.result.title', '수고하셨어요!');
    
    let lblComp = this.getLabel('flashcard.result.completed', '{total}개 완료');
    lblComp = lblComp.replace('{total}', total);
    
    let lblAcc = this.getLabel('flashcard.result.accuracy', '정답률: {accuracy}%');
    lblAcc = lblAcc.replace('{accuracy}', acc);
    
    const lblRestart = this.getLabel('flashcard.result.restart', '다시 시작하기');

    container.innerHTML = `
      <div style="text-align: center; padding: 2rem;">
        <h2 style="color: var(--accent-tertiary); margin-bottom: 1rem;">
          🎉 ${lblTitle}
        </h2>
        <div style="font-size: 1.2rem; color: var(--text-primary); margin-bottom: 1.5rem;">
          <p>${lblComp}</p>
          <p style="margin-top: 1rem;">
            <strong>${lblAcc}</strong>
          </p>
        </div>
        <button class="btn-next" onclick="Flashcard.restart()" style="font-size: 1rem; padding: 0.75rem 2rem;">
          ↻ ${lblRestart}
        </button>
      </div>
    `;
  },

  restart() {
    this.setupSession();
    this.currentIndex = 0;
    this.isFlipped = false;
    this.knownCount = 0;
    this.unknownCount = 0;
    this.render();
  },

  resetProgress() {
    this.currentIndex = 0;
    this.isFlipped = false;
    this.knownCount = 0;
    this.unknownCount = 0;
  },
  
  setSessionSize(size) {
    this.sessionSize = Math.min(size, this.allWords.length);
    this.restart();
  },

  toggleShuffle() {
    this.useShuffled = !this.useShuffled;
    this.restart();
  }
};
