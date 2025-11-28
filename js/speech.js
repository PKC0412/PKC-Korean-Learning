// Speech Synthesis Manager for Korean Language Learning

const SpeechSynthesisManager = {
  synth: window.speechSynthesis,
  koreanVoice: null,
  isInitialized: false,

  initialize() {
    if (this.isInitialized) return;

    // Load available voices
    this.loadVoices();

    // Some browsers need a slight delay
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }

    this.isInitialized = true;
  },

  loadVoices() {
    const voices = this.synth.getVoices();

    // Try to find Korean voice
    this.koreanVoice = voices.find(voice => voice.lang === 'ko-KR') ||
                       voices.find(voice => voice.lang.startsWith('ko')) ||
                       voices[0]; // Fallback to first available voice

    console.log('Korean voice loaded:', this.koreanVoice ? this.koreanVoice.name : 'None');
  },

  speak(text, options = {}) {
    if (!text) {
      console.warn('No text provided for speech synthesis');
      return;
    }

    // Cancel any ongoing speech
    this.synth.cancel();

    // Ensure voices are loaded
    if (!this.koreanVoice) {
      this.loadVoices();
    }

    const utterance = new SpeechSynthesisUtterance(text);

    // Set Korean voice if available
    if (this.koreanVoice) {
      utterance.voice = this.koreanVoice;
    }

    // Set language to Korean
    utterance.lang = 'ko-KR';

    // Apply custom options
    utterance.rate = options.rate || 0.9;  // Slightly slower for learning
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;

    // Error handling
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
    };

    // Speak
    this.synth.speak(utterance);
  },

  stop() {
    this.synth.cancel();
  },

  pause() {
    this.synth.pause();
  },

  resume() {
    this.synth.resume();
  }
};

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    SpeechSynthesisManager.initialize();
  });
} else {
  SpeechSynthesisManager.initialize();
}

// Make globally available
window.SpeechSynthesisManager = SpeechSynthesisManager;
