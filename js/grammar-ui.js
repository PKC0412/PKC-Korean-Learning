// GrammarUI: JSON-driven Grammar Learning Interface
// Uses data/grammar/grammar_categories.json and grammar_content_*.json (via index)

const GrammarUI = {
  initialized: false,
  categories: [],
  contents: {}, // unitId -> unit
  examplesByGroup: {}, // groupId -> [examples]
  exampleTranslations: {}, // exampleId -> translated example text for current language
  grammarTranslations: {}, // unitId -> translated title/description
  currentLang: 'ko',
  state: {
    selectedCategoryId: null,
    selectedGroupId: null,
    selectedUnitId: null,
  },

  async initialize() {
    if (this.initialized) {
      this.render();
      return;
    }

    const container = document.getElementById('grammar-container');
    if (!container) {
      console.warn('GrammarUI: #grammar-container not found');
      return;
    }
    this.container = container;

    try {
      await this.loadData();

      const lang = (window.I18n && window.I18n.currentLang) || 'ko';
      await this.updateLanguage(lang);

      this.ensureInitialSelection();
      this.render();
      this.initialized = true;

      window.addEventListener('languageChanged', (event) => {
        const nextLang = (event && event.detail && event.detail.lang) || 'ko';
        this.updateLanguage(nextLang);
      });
    } catch (e) {
      console.error('GrammarUI initialization error:', e);
      this.renderError('문법 데이터를 불러오는 중 오류가 발생했어요. 나중에 다시 시도해 주세요.');
    }
  },


  async loadData() {
    // 1) 카테고리 로딩
    const categoriesRes = await fetch('data/grammar/grammar_categories.json');
    const categoriesJson = await categoriesRes.json();
    this.categories = categoriesJson.categories || [];

    // 2) 인덱스 파일 로딩
    const indexRes = await fetch('data/grammar/grammar_content_index.json');
    const indexJson = await indexRes.json();
    const files = indexJson.files || [];

    // 3) 각 content 파일 병렬 로딩
    const allBlocks = await Promise.all(
      files.map((url) =>
        fetch(url)
          .then((r) => {
            if (!r.ok) {
              throw new Error('Failed to load ' + url + ' (' + r.status + ')');
            }
            return r.json();
          })
          .catch((err) => {
            console.error('Error loading grammar content file:', url, err);
            return { units: [] };
          })
      )
    );

    // 4) unitId 기준으로 merge
    this.contents = {};
    allBlocks.forEach((block) => {
      (block.units || []).forEach((unit) => {
        if (!unit || !unit.id) return;
        this.contents[unit.id] = unit;
      });
    });

    // 5) 예문 데이터 로딩 (카테고리/소분류 기준)
    this.examplesByGroup = {};
    await this.loadExamples();
  },


  async loadExamples() {
    const basePath = 'data/grammar/examples';
    if (!Array.isArray(this.categories) || !this.categories.length) return;

    const tasks = this.categories.map(async (cat) => {
      const url = basePath + '/grammar_examples_' + cat.id + '.json';
      try {
        const res = await fetch(url);
        if (!res.ok) {
          return;
        }
        const json = await res.json();
        (json.examples || []).forEach((ex) => {
          if (!ex || !ex.groupId) return;
          const gid = ex.groupId;
          if (!this.examplesByGroup[gid]) {
            this.examplesByGroup[gid] = [];
          }
          this.examplesByGroup[gid].push(ex);
        });
      } catch (e) {
        console.warn('GrammarUI: failed to load examples for', cat.id, e);
      }
    });

    await Promise.all(tasks);
  },

  async loadGrammarTranslations(lang) {
    if (!lang || lang === 'ko') {
      this.grammarTranslations = {};
      return;
    }

    const path = 'locales/' + lang + '/' + lang + '_grammar.json';
    try {
      const res = await fetch(path);
      if (!res.ok) {
        console.warn('GrammarUI: no grammar translations for', lang);
        this.grammarTranslations = {};
        return;
      }
      const json = await res.json();
      const map = {};
      (json || []).forEach((item) => {
        if (!item || !item.id) return;
        map[item.id] = {
          title: item.title || '',
          explanation: item.explanation || '',
        };
      });
      this.grammarTranslations = map;
    } catch (e) {
      console.error('GrammarUI: failed to load grammar translations for', lang, e);
      this.grammarTranslations = {};
    }
  },

  async loadExampleTranslations(lang) {
    if (!lang || lang === 'ko') {
      this.exampleTranslations = {};
      return;
    }

    if (!Array.isArray(this.categories) || !this.categories.length) {
      this.exampleTranslations = {};
      return;
    }

    const baseDir = 'locales/' + lang;
    const map = {};

    const tasks = this.categories.map(async (cat) => {
      const url = baseDir + '/' + lang + '_grammar_examples_' + cat.id + '.json';
      try {
        const res = await fetch(url);
        if (!res.ok) {
          return;
        }
        const json = await res.json();
        const translations = json.translations || {};
        Object.keys(translations).forEach((id) => {
          const t = translations[id];
          if (!t) return;
          const text = t.translation || t.text || '';
          if (text) {
            map[id] = text;
          }
        });
      } catch (e) {
        console.warn('GrammarUI: failed to load example translations for', lang, cat.id, e);
      }
    });

    await Promise.all(tasks);
    this.exampleTranslations = map;
  },

  async updateLanguage(lang) {
    this.currentLang = lang || 'ko';
    await this.loadGrammarTranslations(this.currentLang);
    await this.loadExampleTranslations(this.currentLang);
    if (this.initialized) {
      this.render();
    }
  },

  ensureInitialSelection() {
    if (!this.categories.length) return;

    const firstCategory = this.categories[0];
    this.state.selectedCategoryId = firstCategory.id;

    const firstGroup = (firstCategory.groups || [])[0];
    if (firstGroup) {
      this.state.selectedGroupId = firstGroup.id;
      const firstUnitId = (firstGroup.unitIds || [])[0];
      if (firstUnitId) {
        this.state.selectedUnitId = firstUnitId;
      }
    }

    if (!this.state.selectedUnitId) {
      const anyUnitId = Object.keys(this.contents)[0];
      this.state.selectedUnitId = anyUnitId || null;
    }
  },

  render() {
    if (!this.container) return;

    this.container.innerHTML = '';

    const layout = document.createElement('div');
    layout.className = 'grammar-layout';

    const levelsWrapper = document.createElement('div');
    levelsWrapper.className = 'grammar-levels-wrapper';

    const categoryLevel = document.createElement('div');
    categoryLevel.className = 'grammar-level grammar-level-category';

    const groupLevel = document.createElement('div');
    groupLevel.className = 'grammar-level grammar-level-group';

    const unitLevel = document.createElement('div');
    unitLevel.className = 'grammar-level grammar-level-unit';

    const detailWrapper = document.createElement('div');
    detailWrapper.className = 'grammar-detail-wrapper';

    const detailCard = document.createElement('div');
    detailCard.className = 'grammar-detail-card';

    this.renderCategories(categoryLevel);
    this.renderGroups(groupLevel);
    this.renderUnits(unitLevel);
    this.renderDetail(detailCard);

    levelsWrapper.appendChild(categoryLevel);

    const divider1 = document.createElement('hr');
    divider1.className = 'grammar-divider';
    levelsWrapper.appendChild(divider1);

    levelsWrapper.appendChild(groupLevel);

    const divider2 = document.createElement('hr');
    divider2.className = 'grammar-divider';
    levelsWrapper.appendChild(divider2);

    levelsWrapper.appendChild(unitLevel);

    detailWrapper.appendChild(detailCard);

    layout.appendChild(levelsWrapper);
    layout.appendChild(detailWrapper);

    this.container.appendChild(layout);
  },

  renderCategories(container) {
    const list = document.createElement('div');
    list.className = 'grammar-level-list';

    this.categories.forEach((cat) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'grammar-level-btn grammar-level-btn-top';
      if (cat.id === this.state.selectedCategoryId) {
        btn.classList.add('active');
      }
      const lang = (window.I18n && window.I18n.currentLang) || 'ko';
      let label = cat.label || cat.id;
      if (lang !== 'ko' && window.I18n && typeof window.I18n.t === 'function') {
        const key = 'grammar_category_' + cat.id;
        const tr = window.I18n.t(key);
        if (tr && typeof tr === 'string' && tr !== key) {
          label = tr;
        }
      }
      btn.textContent = label;
      btn.addEventListener('click', () => {
        this.onCategorySelect(cat.id);
      });
      list.appendChild(btn);
    });

    if (!this.categories.length) {
      const empty = document.createElement('div');
      empty.className = 'grammar-empty';
      empty.textContent = '등록된 문법 카테고리가 없어요.';
      container.appendChild(empty);
    } else {
      container.appendChild(list);
    }
  },

  renderGroups(container) {
    const currentCategory = this.getSelectedCategory();
    const groups = (currentCategory && currentCategory.groups) || [];

    const list = document.createElement('div');
    list.className = 'grammar-level-list';

    groups.forEach((group) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'grammar-level-btn grammar-level-btn-mid';
      if (group.id === this.state.selectedGroupId) {
        btn.classList.add('active');
      }
      const lang = (window.I18n && window.I18n.currentLang) || 'ko';
      let label = group.label || group.id;
      if (lang !== 'ko' && window.I18n && typeof window.I18n.t === 'function') {
        const key = 'grammar_group_' + group.id;
        const tr = window.I18n.t(key);
        if (tr && typeof tr === 'string' && tr !== key) {
          label = tr;
        }
      }
      btn.textContent = label;
      btn.addEventListener('click', () => {
        this.onGroupSelect(group.id);
      });
      list.appendChild(btn);
    });

    if (!groups.length) {
      const empty = document.createElement('div');
      empty.className = 'grammar-empty';
      empty.textContent = '이 카테고리에는 아직 중분류가 없어요.';
      container.appendChild(empty);
    } else {
      container.appendChild(list);
    }
  },


  renderUnits(container) {
    const currentGroup = this.getSelectedGroup();
    const unitIds = (currentGroup && currentGroup.unitIds) || [];

    const list = document.createElement('div');
    list.className = 'grammar-level-list';

    const lang =
      (window.I18n && window.I18n.currentLang) || this.currentLang || 'ko';

    unitIds.forEach((unitId) => {
      const unit = this.contents[unitId];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'grammar-level-btn grammar-level-btn-low';
      if (unitId === this.state.selectedUnitId) {
        btn.classList.add('active');
      }

      let label = (unit && unit.title) || unitId;
      if (lang !== 'ko' && this.grammarTranslations) {
        const tr =
          this.grammarTranslations[unitId] ||
          (unit && this.grammarTranslations[unit.id]);
        if (tr && tr.title) {
          label = tr.title;
        }
      }

      btn.textContent = label;

      btn.addEventListener('click', () => {
        this.onUnitSelect(unitId);
      });
      list.appendChild(btn);
    });

    if (!unitIds.length) {
      const empty = document.createElement('div');
      empty.className = 'grammar-empty';
      empty.textContent = '이 중분류에는 아직 유닛이 없어요.';
      container.appendChild(empty);
    } else {
      container.appendChild(list);
    }
  },


  renderDetail(container) {
    container.innerHTML = '';

    const unit = this.contents[this.state.selectedUnitId];

    if (!unit) {
      const empty = document.createElement('div');
      empty.className = 'grammar-empty';
      empty.textContent = '선택된 학습 유닛의 내용을 찾을 수 없어요.';
      container.appendChild(empty);
      return;
    }

    const header = document.createElement('div');
    header.className = 'grammar-lesson-header';

    const title = document.createElement('h3');
    title.className = 'grammar-detail-title';

    const lang = (window.I18n && window.I18n.currentLang) || this.currentLang || 'ko';
    const tr = this.grammarTranslations[unit.id];

    const titleText =
      lang === 'ko' || !tr || !tr.title ? (unit.title || unit.id) : tr.title;
    title.textContent = titleText;

    header.appendChild(title);

    const desc = document.createElement('p');
    desc.className = 'grammar-detail-description';

    const descText =
      lang === 'ko' || !tr || !tr.explanation ? (unit.description || '') : tr.explanation;
    desc.textContent = descText;

    const examplesWrapper = document.createElement('div');
    examplesWrapper.className = 'grammar-examples';

    const currentGroup = this.getSelectedGroup();
    const groupId = currentGroup && currentGroup.id;
    const examples =
      (groupId && this.examplesByGroup && this.examplesByGroup[groupId]) || [];

    examples.forEach((ex) => {
      const exBox = document.createElement('div');
      exBox.className = 'grammar-example';

      const exText = document.createElement('div');
      exText.className = 'grammar-example-text';

      const lineKo = document.createElement('div');
      lineKo.className = 'grammar-example-korean';
      lineKo.textContent = ex.korean || '';

      const lineRo = document.createElement('div');
      lineRo.className = 'grammar-example-romanization';
      lineRo.textContent = ex.romanization || '';

      exText.appendChild(lineKo);
      if (ex.romanization) {
        exText.appendChild(lineRo);
      }

      if (ex.ipa) {
        const lineIpa = document.createElement('div');
        lineIpa.className = 'grammar-example-ipa';
        lineIpa.textContent = ex.ipa;
        exText.appendChild(lineIpa);
      }

      const translation =
        lang === 'ko' || !this.exampleTranslations
          ? ''
          : this.exampleTranslations[ex.id];

      if (translation) {
        const lineTr = document.createElement('div');
        lineTr.className = 'grammar-example-translation';
        lineTr.textContent = translation;
        exText.appendChild(lineTr);
      }

      const exBtn = document.createElement('button');
      exBtn.type = 'button';
      exBtn.className = 'grammar-example-speak';
      exBtn.textContent = '🔊';
      exBtn.title = '이 예문 발음 듣기';
      exBtn.addEventListener('click', () => {
        const text = ex.korean || '';
        if (text) {
          this.speakText(text);
        }
      });

      exBox.appendChild(exText);
      exBox.appendChild(exBtn);

      examplesWrapper.appendChild(exBox);
    });

    if (!examples.length) {
      const empty = document.createElement('div');
      empty.className = 'grammar-empty';
      empty.textContent = '예문이 아직 준비되지 않았어요.';
      examplesWrapper.appendChild(empty);
    }

    container.appendChild(header);
    container.appendChild(desc);
    container.appendChild(examplesWrapper);
  },

  renderError(message) {
    if (!this.container) return;
    this.container.innerHTML = '';
    const div = document.createElement('div');
    div.className = 'grammar-error';
    div.textContent = message;
    this.container.appendChild(div);
  },

  getSelectedCategory() {
    return this.categories.find((c) => c.id === this.state.selectedCategoryId) || null;
  },

  getSelectedGroup() {
    const category = this.getSelectedCategory();
    if (!category) return null;
    return (category.groups || []).find((g) => g.id === this.state.selectedGroupId) || null;
  },

  onCategorySelect(categoryId) {
    if (this.state.selectedCategoryId === categoryId) return;
    this.state.selectedCategoryId = categoryId;

    const category = this.getSelectedCategory();
    const firstGroup = category && (category.groups || [])[0];
    this.state.selectedGroupId = firstGroup ? firstGroup.id : null;
    const firstUnitId =
      firstGroup && (firstGroup.unitIds || [])[0]
        ? firstGroup.unitIds[0]
        : null;
    this.state.selectedUnitId = firstUnitId;

    this.render();
  },

  onGroupSelect(groupId) {
    if (this.state.selectedGroupId === groupId) return;
    this.state.selectedGroupId = groupId;

    const group = this.getSelectedGroup();
    const firstUnitId =
      group && (group.unitIds || [])[0]
        ? group.unitIds[0]
        : null;
    this.state.selectedUnitId = firstUnitId;

    this.render();
  },

  onUnitSelect(unitId) {
    if (this.state.selectedUnitId === unitId) return;
    this.state.selectedUnitId = unitId;
    this.render();
  },

  speakExamples(unit) {
    const currentGroup = this.getSelectedGroup();
    const groupId = currentGroup && currentGroup.id;
    const examples =
      (groupId && this.examplesByGroup && this.examplesByGroup[groupId]) || [];
    if (!examples.length) return;

    const target = examples[0];
    const text = target.korean || '';
    if (!text) return;
    this.speakText(text);
  },

  speakText(text) {
    if (!text) return;

    if (window.SpeechSynthesisManager && typeof window.SpeechSynthesisManager.speak === 'function') {
      window.SpeechSynthesisManager.speak(text, { rate: 0.9 });
    } else if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('Speech synthesis is not supported in this browser.');
    }
  },
};

window.GrammarUI = GrammarUI;
