/**
 * I18N Module - Alive Life Simulator
 * Handles string loading, language switching, and text replacement.
 */
(function (global) {
  const Alive = (global.Alive = global.Alive || {});

  // ============================================================================
  // I18N MODULE (Dynamic)
  // ============================================================================

  let texts = {};
  let currentLanguage = "en";
  let loaded = false;

  async function load(lang = null) {
    if (lang) currentLanguage = lang;

    // Auto-detect if not set
    if (!lang) {
      try {
        const saved = localStorage.getItem("alive_lang");
        if (saved) currentLanguage = saved;
        else if (window.ysdk && window.ysdk.environment.i18n.lang) {
          const yLang = window.ysdk.environment.i18n.lang;
          currentLanguage = (yLang === 'ru' || yLang === 'be' || yLang === 'kk' || yLang === 'uk') ? 'ru' : 'en';
        }
      } catch (e) { }
    }

    console.log(`[i18n] Loading language: ${currentLanguage}`);

    // Robustness: Check bundled strings first to avoid fetch/local file issues
    if (global.Alive && global.Alive.strings && global.Alive.strings[currentLanguage]) {
      texts = global.Alive.strings[currentLanguage];
      loaded = true;
      console.log(`[i18n] Loaded ${Object.keys(texts).length} keys from bundled source.`);
      global.dispatchEvent(new CustomEvent("alive:languageChanged", { detail: { lang: currentLanguage } }));
      return;
    }

    try {
      // Add cache buster to avoid stale strings during dev
      const response = await fetch(`js/assets/strings/${currentLanguage}.json?v=${Date.now()}`);
      if (!response.ok) throw new Error("Failed to load strings");
      texts = await response.json();
      loaded = true;
      console.log(`[i18n] Loaded ${Object.keys(texts).length} keys.`);

      // Notify system
      global.dispatchEvent(new CustomEvent("alive:languageChanged", { detail: { lang: currentLanguage } }));

    } catch (e) {
      console.error("[i18n] Error loading strings:", e);
      // Fallback?
    }
  }

  function getLanguage() {
    return currentLanguage;
  }

  async function setLanguage(lang) {
    if (lang !== "en" && lang !== "ru") return;

    // Don't reload if same language, unless forced? No, efficient to just return.
    // But maybe we want to re-render.
    if (currentLanguage === lang && loaded) return;

    currentLanguage = lang;
    try {
      localStorage.setItem("alive_lang", currentLanguage);
    } catch (e) { }

    await load(lang);

    // Request re-render
    if (Alive.ui && Alive.ui.render) {
      Alive.ui.render();
    }
    // Also re-render menu if in menu
    if (Alive.ui && Alive.ui.showMenu && !Alive.game?.player) {
      Alive.ui.showMenu();
    }
  }

  function t(key, replacements = {}) {
    let text = texts[key] || key;

    // Apply replacements
    if (replacements && typeof replacements === 'object') {
      Object.entries(replacements).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, "g"), v);
      });
    }

    return text;
  }

  Alive.i18n = {
    load,
    getLanguage,
    setLanguage,
    t,
    get texts() { return texts; } // Read-only access
  };

})(window);
