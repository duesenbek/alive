/**
 * Main Entry Point - Alive Life Simulator
 * Initialize and wire all modules together
 */
(function (global) {
  const Alive = (global.Alive = global.Alive || {});

  // Global Config
  Alive.config = {
    version: "1.0.0",
    yandexMetricaId: 99999999, // User to replace this with real ID
    debug: false
  };

  /**
   * Main Entry Point
   * Handles initialization sequence
   */
  // Wait for DOM
  document.addEventListener("DOMContentLoaded", init);

  function init() {
    console.log("Alive Life Simulator - Initializing...");

    // Initialize I18n
    if (Alive.i18n && Alive.i18n.load) {
      Alive.i18n.load().catch(console.error);
    }

    // Apply saved theme
    const savedTheme = localStorage.getItem("alive_theme");
    if (savedTheme === "light") {
      document.body.classList.add("light-theme");
    }

    // Get root element
    const root = document.getElementById("app");
    if (!root) {
      console.error("Root element #app not found!");
      return;
    }

    // Create game instance
    const game = new Alive.Game();

    // Save pipeline: fast local save + throttled/debounced cloud sync
    const CLOUD_SAVE_THROTTLE_MS = 15000;
    const CLOUD_SAVE_DEBOUNCE_MS = 3000;
    let cloudSaveTimer = null;
    let lastCloudSaveAt = 0;
    let cloudSaveInFlight = false;

    const fastLocalSave = () => {
      if (!game.player || game.ended) return;
      Alive.storage?.save(game.getState());
    };

    const reportCloudSaveFailure = (error, reason) => {
      console.error("Cloud save failed", { reason, error });
      if (Alive.Analytics?.trackEvent) {
        Alive.Analytics.trackEvent("cloud_save_failed", {
          reason,
          message: error?.message || String(error)
        });
      }
    };

    const runCloudSave = async (reason) => {
      if (!game.player || game.ended || !Alive.storage?.saveCloud) return;
      if (cloudSaveInFlight) return;

      cloudSaveInFlight = true;
      try {
        await Alive.storage.saveCloud(game.getState());
        lastCloudSaveAt = Date.now();
      } catch (error) {
        reportCloudSaveFailure(error, reason);
      } finally {
        cloudSaveInFlight = false;
      }
    };

    const scheduleCloudSave = (reason, options) => {
      if (!Alive.storage?.saveCloud) return;

      const force = options?.force === true;
      const now = Date.now();
      if (force || now - lastCloudSaveAt >= CLOUD_SAVE_THROTTLE_MS) {
        if (cloudSaveTimer) {
          clearTimeout(cloudSaveTimer);
          cloudSaveTimer = null;
        }
        runCloudSave(reason);
        return;
      }

      if (cloudSaveTimer) {
        clearTimeout(cloudSaveTimer);
      }
      cloudSaveTimer = setTimeout(() => {
        cloudSaveTimer = null;
        runCloudSave(reason);
      }, CLOUD_SAVE_DEBOUNCE_MS);
    };

    const wrapMethod = (name, onSuccess) => {
      const original = game[name];
      if (typeof original !== "function") return;
      game[name] = function (...args) {
        const result = original.apply(this, args);
        if (result && typeof result.then === "function") {
          return result.then((value) => {
            onSuccess(value);
            return value;
          });
        }
        onSuccess(result);
        return result;
      };
    };

    // Keep syncState quick/synchronous for unload and frequent game updates.
    game.syncState = function () {
      fastLocalSave();
      return Promise.resolve();
    };

    wrapMethod("nextYear", () => {
      fastLocalSave();
      scheduleCloudSave("next_year");
    });

    wrapMethod("endGame", () => {
      fastLocalSave();
      scheduleCloudSave("end_game", { force: true });
    });

    wrapMethod("buyGems", (success) => {
      if (!success) return;
      fastLocalSave();
      scheduleCloudSave("purchase_gems", { force: true });
    });

    wrapMethod("applyReward", () => {
      fastLocalSave();
      scheduleCloudSave("reward_claimed");
    });

    // Create UI instance
    const ui = new Alive.UI(root);
    ui.setGame(game);

    // Load achievements progression
    if (Alive.achievements?.loadProgression) {
      Alive.achievements.loadProgression();
    }


    // Initialize Monetization
    const monetization = new Alive.Monetization();
    game.monetization = monetization; // Link to game

    // Try to initialize Yandex SDK
    if (game.initYandexSDK) {
      game.initYandexSDK().then(async () => {
        // Init Monetization with SDK (game.ysdk set by initYandexSDK)
        await monetization.init(game.ysdk);

        // Language detection as requested
        if (ysdk && ysdk.environment && ysdk.environment.i18n) {
          const lang = ysdk.environment.i18n.lang; // 'ru' or 'en'
          console.log("YSDK Language detected:", lang);
          // Safety Patch: Ensure Player factory exists
          if (Alive.Player && !Alive.Player.createNew) {
            Alive.Player.createNew = function (state) { return new Alive.Player(state); };
          }

          if (Alive.ui && Alive.ui.renderMainMenu) {
            Alive.ui.renderMainMenu();
          }
          if (Alive.i18n && Alive.i18n.setLanguage) {
            Alive.i18n.setLanguage(lang);
          }
        }

        // Try to load from cloud if no local save or as a sync option
        if (Alive.storage?.loadCloud) {
          const cloudState = await Alive.storage.loadCloud();
          if (cloudState && !Alive.storage.hasSave()) {
            console.log("Found cloud save, loading...");
            game.loadState(cloudState);
            ui.render();
          }
        }
      }).catch(() => {
        console.log("Yandex SDK not available, running in standalone mode");
        monetization.init(null); // Init in mock mode
      });
    } else {
      monetization.init(null); // Fallback if initYandexSDK missing
    }

    // Render initial menu
    ui.showMenu();

    // Auto-save on beforeunload
    global.addEventListener("beforeunload", () => {
      fastLocalSave();
    });

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) return;
      fastLocalSave();
      scheduleCloudSave("tab_hidden", { force: true });
    });

    // Expose for player_core crisis callbacks (bankruptcy, health crisis, etc.)
    global.aliveGame = game;
    // global.aliveUI = ui;  // Keep disabled unless debugging

    console.log("Alive Life Simulator - Ready!");
  }

})(window);
