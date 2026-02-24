/**
 * Sound System Module - Alive Life Simulator
 * Powered by SND (snd.dev) for UI sounds
 */
(function (global) {
  const Alive = (global.Alive = global.Alive || {});

  // Initialize SND
  let snd = null; // Will be initialized on load
  let soundEnabled = true;
  let musicEnabled = true;

  // Load settings
  try {
    const saved = localStorage.getItem("alive_sound_settings");
    if (saved) {
      const settings = JSON.parse(saved);
      soundEnabled = settings.soundEnabled !== false;
      musicEnabled = settings.musicEnabled !== false;
    }
  } catch (e) {
    console.warn("Failed to load sound settings:", e);
  }

  function saveSettings() {
    localStorage.setItem("alive_sound_settings", JSON.stringify({ soundEnabled, musicEnabled }));
  }

  // Pre-define common sounds using SND kits
  // SND automatically attaches to .snd-click classes, but we can also play manually
  function init() {
    if (window.Snd) {
      snd = new Snd();
      snd.load(Snd.KITS.SND01); // Load default kit
    }
  }

  function playClick() {
    if (!soundEnabled || !snd) return;
    try {
      snd.play(Snd.SOUNDS.TAP);
    } catch (e) { }
  }

  function playSuccess() {
    if (!soundEnabled || !snd) return;
    try {
      snd.play(Snd.SOUNDS.SUCCESS);
    } catch (e) { }
  }

  function playNotification() {
    if (!soundEnabled || !snd) return;
    try {
      snd.play(Snd.SOUNDS.NOTIFICATION);
    } catch (e) { }
  }

  function playError() {
    if (!soundEnabled || !snd) return;
    try {
      snd.play(Snd.SOUNDS.Warning);
    } catch (e) { }
  }

  // Background music stub (SND is for UI sounds, we'll leave BG music empty or use a loop if available later)
  // For now, removing the oscillator music as it's annoying/not requested.
  function startBackgroundMusic() {
    // Placeholder
  }

  function stopBackgroundMusic() {
    // Placeholder
  }

  function setSoundEnabled(enabled) {
    soundEnabled = enabled;
    saveSettings();
  }

  function setMusicEnabled(enabled) {
    musicEnabled = enabled;
    saveSettings();
  }

  function isSoundEnabled() { return soundEnabled; }
  function isMusicEnabled() { return musicEnabled; }

  // Global click listener for generic button sounds
  document.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON" || e.target.closest("button")) {
      playClick();
    }
  }, true);

  // Initialize on load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  function setMuted(muted) {
    setSoundEnabled(!muted);
    setMusicEnabled(!muted);
  }

  // Oscillator fallbacks for when SND is missing or for custom sounds
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioContext();

  function playTone(freq, type, duration) {
    if (!soundEnabled) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) { }
  }

  function playMajorPositive() {
    // Excited major arpeggio
    setTimeout(() => playTone(440, 'sine', 0.2), 0);
    setTimeout(() => playTone(554, 'sine', 0.2), 100);
    setTimeout(() => playTone(659, 'sine', 0.4), 200);
  }

  function playMajorNegative() {
    // Dissonant descending
    setTimeout(() => playTone(300, 'sawtooth', 0.3), 0);
    setTimeout(() => playTone(280, 'sawtooth', 0.4), 150);
  }

  function playFail() {
    // Low failing sound
    setTimeout(() => playTone(150, 'sawtooth', 0.5), 0);
    setTimeout(() => playTone(100, 'sawtooth', 0.8), 200);
  }

  // Export
  Alive.sound = {
    playClick,
    playSuccess,
    playNotification,
    playError,
    playMajorPositive,
    playMajorNegative,
    playFail,
    setSoundEnabled,
    setMusicEnabled,
    setMuted, // Added for YSDK support
    isSoundEnabled,
    isMusicEnabled,
    startBackgroundMusic, // Keep interface for UI toggles
    stopBackgroundMusic
  };

})(window);
