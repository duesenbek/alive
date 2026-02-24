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
      if (game.player && !game.ended) {
        if (game.syncState) {
          game.syncState();
        } else {
          Alive.storage?.save(game.getState());
        }
      }
    });

    // Expose for player_core crisis callbacks (bankruptcy, health crisis, etc.)
    global.aliveGame = game;
    // global.aliveUI = ui;  // Keep disabled unless debugging

    console.log("Alive Life Simulator - Ready!");
  }

})(window);
