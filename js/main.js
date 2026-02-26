/**
 * Main Entry Point - Alive Life Simulator
 * Initialize and wire all modules together
 *
 * v1.1.0 — Fixed ysdk ReferenceError, added fail-safe init logging,
 *           added smoke-test for SDK on/off initialization.
 */
(function (global) {
  const Alive = (global.Alive = global.Alive || {});

  // Global Config
  Alive.config = {
    version: "1.1.0",
    yandexMetricaId: 99999999, // User to replace this with real ID
    debug: false
  };

  // ===========================================================================
  // INIT LOGGER — tracks every stage with status + timing
  // ===========================================================================

  const initLog = [];

  /**
   * Record an init stage result.
   * @param {string} stage  — human-readable stage name
   * @param {"pass"|"fail"|"skip"} status
   * @param {string} [detail] — optional extra detail / error message
   */
  function logStage(stage, status, detail) {
    const entry = {
      stage,
      status,
      detail: detail || "",
      ts: Date.now()
    };
    initLog.push(entry);

    const prefix =
      status === "pass" ? "✅" : status === "fail" ? "❌" : "⏭️";
    const msg = `[init] ${prefix} ${stage}` + (detail ? ` — ${detail}` : "");

    if (status === "fail") {
      console.error(msg);
    } else {
      console.log(msg);
    }
  }

  /** Expose log for devtools / QA inspection */
  Alive.getInitLog = function () {
    return initLog.slice();
  };

  // ===========================================================================
  // MAIN ENTRY
  // ===========================================================================

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    console.log("Alive Life Simulator — Initializing...");

    // ---- Stage: i18n --------------------------------------------------------
    try {
      if (Alive.i18n && Alive.i18n.load) {
        Alive.i18n.load().catch(function (err) {
          logStage("i18n", "fail", String(err));
        });
        logStage("i18n", "pass", "load() called");
      } else {
        logStage("i18n", "skip", "module not found");
      }
    } catch (e) {
      logStage("i18n", "fail", String(e));
    }

    // ---- Stage: theme -------------------------------------------------------
    try {
      const savedTheme = localStorage.getItem("alive_theme");
      if (savedTheme === "light") {
        document.body.classList.add("light-theme");
      }
      logStage("theme", "pass", savedTheme || "default (dark)");
    } catch (e) {
      logStage("theme", "fail", String(e));
    }

    // ---- Stage: root element ------------------------------------------------
    const root = document.getElementById("app");
    if (!root) {
      logStage("root", "fail", "#app element not found");
      console.error("Root element #app not found!");
      return;
    }
    logStage("root", "pass");

    // ---- Stage: game instance -----------------------------------------------
    let game;
    try {
      game = new Alive.Game();
      logStage("game", "pass");
    } catch (e) {
      logStage("game", "fail", String(e));
      return; // Cannot continue without game
    }

    // ---- Stage: UI instance -------------------------------------------------
    let ui;
    try {
      ui = new Alive.UI(root);
      ui.setGame(game);
      logStage("ui", "pass");
    } catch (e) {
      logStage("ui", "fail", String(e));
      return; // Cannot continue without UI
    }

    // ---- Stage: achievements ------------------------------------------------
    try {
      if (Alive.achievements && Alive.achievements.loadProgression) {
        Alive.achievements.loadProgression();
        logStage("achievements", "pass");
      } else {
        logStage("achievements", "skip", "module not found");
      }
    } catch (e) {
      logStage("achievements", "fail", String(e));
    }

    // ---- Stage: monetization ------------------------------------------------
    let monetization;
    try {
      monetization = new Alive.Monetization();
      game.monetization = monetization;
      logStage("monetization", "pass", "instance created");
    } catch (e) {
      logStage("monetization", "fail", String(e));
      // Non-fatal — game can run without monetization
      monetization = null;
    }

    // ---- Stage: Yandex SDK --------------------------------------------------
    if (game.initYandexSDK) {
      game
        .initYandexSDK()
        .then(async function () {
          logStage("sdk", "pass", "YaGames.init() resolved");

          // FIX: use local reference to game.ysdk (was bare `ysdk` → ReferenceError)
          const ysdk = game.ysdk;

          // ---- Sub-stage: payments ------------------------------------------
          try {
            if (monetization) {
              await monetization.init(ysdk);
              logStage("payments", "pass");
            }
          } catch (e) {
            logStage("payments", "fail", String(e));
          }

          // ---- Sub-stage: language detection ---------------------------------
          try {
            if (ysdk && ysdk.environment && ysdk.environment.i18n) {
              const lang = ysdk.environment.i18n.lang; // 'ru' | 'en' | …
              logStage("language", "pass", "detected: " + lang);

              // Safety Patch: Ensure Player factory exists
              if (Alive.Player && !Alive.Player.createNew) {
                Alive.Player.createNew = function (state) {
                  return new Alive.Player(state);
                };
              }

              if (Alive.ui && Alive.ui.renderMainMenu) {
                Alive.ui.renderMainMenu();
                logStage("menu_render", "pass", "SDK-driven render");
              }
              if (Alive.i18n && Alive.i18n.setLanguage) {
                Alive.i18n.setLanguage(lang);
              }
            } else {
              logStage("language", "skip", "ysdk.environment.i18n unavailable");
            }
          } catch (e) {
            logStage("language", "fail", String(e));
          }

          // ---- Sub-stage: cloud save ----------------------------------------
          try {
            if (Alive.storage && Alive.storage.loadCloud) {
              const cloudState = await Alive.storage.loadCloud();
              if (cloudState && !Alive.storage.hasSave()) {
                console.log("Found cloud save, loading...");
                game.loadState(cloudState);
                ui.render();
                logStage("cloud", "pass", "cloud save restored");
              } else {
                logStage("cloud", "pass", "no actionable cloud save");
              }
            } else {
              logStage("cloud", "skip", "storage.loadCloud not available");
            }
          } catch (e) {
            logStage("cloud", "fail", String(e));
          }
        })
        .catch(function (err) {
          logStage("sdk", "fail", "standalone mode — " + String(err));
          if (monetization) {
            monetization.init(null); // Init in mock mode
          }
        });
    } else {
      logStage("sdk", "skip", "initYandexSDK not defined");
      if (monetization) {
        monetization.init(null);
      }
    }

    // ---- Stage: initial menu render -----------------------------------------
    try {
      ui.showMenu();
      logStage("menu_render", "pass", "initial showMenu()");
    } catch (e) {
      logStage("menu_render", "fail", String(e));
    }

    // ---- Auto-save on beforeunload ------------------------------------------
    global.addEventListener("beforeunload", function () {
      if (game.player && !game.ended) {
        if (game.syncState) {
          game.syncState();
        } else if (Alive.storage && Alive.storage.save) {
          Alive.storage.save(game.getState());
        }
      }
    });

    // Expose for player_core crisis callbacks (bankruptcy, health crisis, etc.)
    global.aliveGame = game;
    // global.aliveUI = ui;  // Keep disabled unless debugging

    console.log("Alive Life Simulator — Ready!");
  }

  // ===========================================================================
  // SMOKE-TEST — call from devtools: Alive.smokeTestInit()
  // ===========================================================================

  /**
   * Smoke-test the initialisation pipeline.
   * Verifies that all critical modules are wired correctly in both
   * "SDK available" and "standalone (no SDK)" modes.
   *
   * Usage (browser console):
   *   Alive.smokeTestInit()          // auto-detect mode
   *   Alive.smokeTestInit("sdk")     // force SDK-on assertions
   *   Alive.smokeTestInit("standalone") // force SDK-off assertions
   *
   * @param {"sdk"|"standalone"} [forceMode] — override auto-detection
   * @returns {{ passed: number, failed: number, results: object[] }}
   */
  Alive.smokeTestInit = function (forceMode) {
    const results = [];
    let passed = 0;
    let failed = 0;

    function assert(label, condition, detail) {
      const ok = !!condition;
      results.push({ label, ok, detail: detail || "" });
      if (ok) {
        passed++;
        console.log("  ✅ " + label);
      } else {
        failed++;
        console.error("  ❌ " + label + (detail ? " — " + detail : ""));
      }
    }

    const game = global.aliveGame;
    const sdkMode =
      forceMode ||
      (game && game.ysdk ? "sdk" : "standalone");

    console.log(
      "%c=== Alive Smoke Test (mode: " + sdkMode + ") ===",
      "font-weight:bold;font-size:14px"
    );

    // Core modules
    assert("Alive namespace exists", typeof Alive === "object");
    assert("Alive.Game class exists", typeof Alive.Game === "function");
    assert("Alive.UI class exists", typeof Alive.UI === "function");
    assert("Alive.Player class exists", typeof Alive.Player === "function");
    assert(
      "Alive.Player.createNew factory",
      typeof (Alive.Player && Alive.Player.createNew) === "function"
    );
    assert("Alive.Monetization class exists", typeof Alive.Monetization === "function");
    assert("Alive.storage module exists", !!Alive.storage);
    assert("Alive.i18n module exists", !!Alive.i18n);

    // Runtime instances
    assert("game instance exposed (window.aliveGame)", !!game);

    if (game) {
      assert("game.monetization linked", !!game.monetization);

      if (sdkMode === "sdk") {
        assert("game.ysdk set by initYandexSDK", !!game.ysdk, "Should be truthy after SDK init");
        assert("game.adsReady === true", game.adsReady === true);
      } else {
        // In standalone mode ysdk may be null — that's expected
        assert("game.ysdk is null (standalone)", game.ysdk === null);
        assert("game.adsReady === false (standalone)", game.adsReady === false);
      }
    }

    // Init log
    const log = Alive.getInitLog();
    assert("initLog recorded stages", log.length > 0, log.length + " entries");
    const failures = log.filter(function (e) { return e.status === "fail"; });
    assert(
      "No init stage failures",
      failures.length === 0,
      failures.length
        ? "Failed: " + failures.map(function (f) { return f.stage; }).join(", ")
        : ""
    );

    // DOM
    assert("#app element exists", !!document.getElementById("app"));

    console.log(
      "%c=== Result: " + passed + " passed, " + failed + " failed ===",
      "font-weight:bold;font-size:14px;color:" +
      (failed === 0 ? "green" : "red")
    );

    return { passed: passed, failed: failed, results: results };
  };

})(window);
