/**
 * Storage Module - Alive Life Simulator
 * Robust Save/Load with Versioning, Integrity Checks, and Backups
 */
(function (global) {
  const Alive = (global.Alive = global.Alive || {});

  const STORAGE_KEY = "alive_save_v1";
  const BACKUP_KEY = "alive_last_good_save";
  const CURRENT_VERSION = 1;

  // In-memory fallback for Private Mode / Incognito
  let memoryStorage = {};
  let useMemory = false;

  // Test storage availability
  try {
    localStorage.setItem("alive_test", "1");
    localStorage.removeItem("alive_test");
  } catch (e) {
    console.warn("LocalStorage unavailable (Private Mode?), using memory fallback.");
    useMemory = true;
  }

  // ============================================================================
  // INTERNAL HELPERS
  // ============================================================================

  function _get(key) {
    if (useMemory) return memoryStorage[key];
    return localStorage.getItem(key);
  }

  function _set(key, value) {
    if (useMemory) {
      memoryStorage[key] = value;
      return true;
    }
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.error("Storage quota exceeded or write failed:", e);
      return false;
    }
  }

  function _remove(key) {
    if (useMemory) delete memoryStorage[key];
    else localStorage.removeItem(key);
  }

  /**
   * Validate that the save data has the expected structure.
   */
  function validateSaveData(data) {
    if (!data || typeof data !== 'object') return false;
    // Check envelope
    if (typeof data.version !== 'number') return false;
    if (!data.state || typeof data.state !== 'object') return false;

    // Check deep integrity (basic)
    if (!data.state.player) {
      console.warn("Validation Failed: Missing player object");
      return false;
    }

    return true;
  }

  /**
   * Migrate older save formats to current.
   */
  function migrateSaveData(data) {
    let version = data.version;

    // Example migration: v0 -> v1 (if we had v0)
    // if (version < 1) { ... version = 1; }

    // Future migrations go here
    if (version < CURRENT_VERSION) {
      console.log(`Migrating save from v${version} to v${CURRENT_VERSION}`);
      // Migration logic would go here
      data.version = CURRENT_VERSION;
    }

    return data;
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  function hasSave() {
    return !!_get(STORAGE_KEY);
  }

  function save(state) {
    if (!state) return false;

    const data = {
      version: CURRENT_VERSION,
      timestamp: Date.now(),
      state: state,
      flags: {
        // Read from the monetization INSTANCE, not the class constructor.
        // window.aliveGame.monetization is the live instance created in main.js.
        hasSupportPack: (global.aliveGame && global.aliveGame.monetization)
          ? global.aliveGame.monetization.hasSupportPack
          : false
      }
    };

    // 1. Serialize
    let json;
    try {
      json = JSON.stringify(data);
    } catch (e) {
      console.error("Failed to serialize save state:", e);
      return false;
    }

    // 2. Write to Primary Slot
    const success = _set(STORAGE_KEY, json);

    // 3. If successful, update Backup Slot (Last Good Save)
    // We only update backup if the write was successful to avoid overwriting good backup with bad data
    if (success) {
      _set(BACKUP_KEY, json);
    }

    return success;
  }

  function load() {
    let raw = _get(STORAGE_KEY);
    let data = null;

    // 1. Try Primary Load
    if (raw) {
      try {
        data = JSON.parse(raw);
        if (!validateSaveData(data)) {
          throw new Error("Invalid save data structure");
        }
      } catch (e) {
        console.warn("Primary save corrupted:", e);
        data = null;
      }
    }

    // 2. Validation / Corruption Fallback
    if (!data) {
      console.warn("Attempting to load from Backup...");
      const backupRaw = _get(BACKUP_KEY);
      if (backupRaw) {
        try {
          const backupData = JSON.parse(backupRaw);
          if (validateSaveData(backupData)) {
            console.log("Restored from Backup!");
            data = backupData;
            // Restore primary from backup
            _set(STORAGE_KEY, backupRaw);
          }
        } catch (e) {
          console.error("Backup also corrupted:", e);
        }
      }
    }

    if (!data) {
      console.warn("No valid save found. Starting fresh.");
      return null; // Triggers new game
    }

    // 3. Migration
    try {
      data = migrateSaveData(data);
    } catch (e) {
      console.error("Migration failed:", e);
      return null;
    }

    if (data.flags && data.flags.hasSupportPack) {
      // Restore to the monetization INSTANCE (the single source of truth).
      // At load-time the instance may not exist yet, so also set a deferred flag
      // that main.js / Monetization.init() can pick up.
      if (global.aliveGame && global.aliveGame.monetization) {
        global.aliveGame.monetization.hasSupportPack = true;
      }
      // Fallback: store on namespace so init() can pick it up if instance is created later
      Alive._pendingSupportPack = true;
    }

    return data.state;
  }

  function clear() {
    _remove(STORAGE_KEY);
    // Optional: Keep backup? Or clear all? 
    // Usually 'Clear Save' implies wipe.
    _remove(BACKUP_KEY);
    return true;
  }

  function getSaveInfo() {
    // Try primary
    let raw = _get(STORAGE_KEY);
    if (!raw) raw = _get(BACKUP_KEY); // Fallback to backup info

    if (!raw) return null;

    try {
      const data = JSON.parse(raw);
      return {
        version: data.version,
        timestamp: data.timestamp,
        age: data.state?.player?.age,
        name: data.state?.player?.name
      };
    } catch (e) {
      return null;
    }
  }

  // ============================================================================
  // DEBUG / TESTING
  // ============================================================================

  function simulateCorruption() {
    console.warn("TEST: Simulating corruption of primary save...");
    _set(STORAGE_KEY, "{ invalid_json: ");
  }

  // ============================================================================
  // CLOUD STORAGE (Yandex SDK)
  // ============================================================================

  let ysdkPlayer = null;

  async function initCloudStorage(ysdk) {
    if (!ysdk) return;
    try {
      ysdkPlayer = await ysdk.getPlayer();
      console.log("TS: Cloud storage initialized");
    } catch (e) {
      console.warn("Cloud storage error:", e);
    }
  }

  async function saveCloud(state) {
    if (!ysdkPlayer || !state) return false;
    try {
      const dataToSave = {
        city: state.player?.cityId || "almaty",
        character: state.player?.name || "Unknown",
        progress: state
      };
      await ysdkPlayer.setData(dataToSave);
      return true;
    } catch (e) {
      console.error("Cloud save failed:", e);
      return false;
    }
  }

  async function loadCloud() {
    if (!ysdkPlayer) return null;
    try {
      const data = await ysdkPlayer.getData();
      return data?.progress || null;
    } catch (e) {
      console.error("Cloud load failed:", e);
      return null;
    }
  }

  Alive.storage = {
    hasSave,
    save,
    load,
    clear,
    getSaveInfo,
    initCloudStorage,
    saveCloud,
    loadCloud
  };

})(window);
