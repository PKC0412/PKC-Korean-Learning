const CACHE_NAME = 'pkc-korean-learning-v1';

const ASSETS_TO_CACHE = [
  './',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './config.js',
  './css/components.base.css',
  './css/components.modals.css',
  './css/components.sections.css',
  './css/grammar.css',
  './css/main.css',
  './data/consonants.json',
  './data/finals.json',
  './data/grammar/examples/grammar_examples_aux_verbs.json',
  './data/grammar/examples/grammar_examples_comparison.json',
  './data/grammar/examples/grammar_examples_conditionals.json',
  './data/grammar/examples/grammar_examples_connectives.json',
  './data/grammar/examples/grammar_examples_ending.json',
  './data/grammar/examples/grammar_examples_negation.json',
  './data/grammar/examples/grammar_examples_particles.json',
  './data/grammar/examples/grammar_examples_quotations.json',
  './data/grammar/examples/grammar_examples_sentence_structure.json',
  './data/grammar/examples/grammar_examples_tenses.json',
  './data/grammar/examples/grammar_examples_voice.json',
  './data/grammar/grammar_categories.json',
  './data/grammar/grammar_content_aux_verbs.json',
  './data/grammar/grammar_content_comparison.json',
  './data/grammar/grammar_content_conditionals.json',
  './data/grammar/grammar_content_connectives.json',
  './data/grammar/grammar_content_ending.json',
  './data/grammar/grammar_content_index.json',
  './data/grammar/grammar_content_negation.json',
  './data/grammar/grammar_content_particles.json',
  './data/grammar/grammar_content_quotations.json',
  './data/grammar/grammar_content_sentence.json',
  './data/grammar/grammar_content_tenses.json',
  './data/grammar/grammar_content_voice.json',
  './data/vowels.json',
  './data/words.json',
  './i18n.js',
  './index.html',
  './js/app.js',
  './js/flashcard.js',
  './js/grammar-ui.js',
  './js/hangul-learning.js',
  './js/i18n-init.js',
  './js/speech.js',
  './js/theme.js',
  './js/vocabulary-learning.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).catch(() => cached);
    })
  );
});
