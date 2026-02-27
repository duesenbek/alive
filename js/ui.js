/**
 * UI Module - Alive Life Simulator
 * Redesigned for emotional engagement and mobile-first UX
 */
(function (global) {
  const Alive = (global.Alive = global.Alive || {});



  function guessDeathCause(summary, game) {
    if (!summary) return "summary.cause.unknown";

    // Use game's failCause if available (set by isAlive())
    if (game && game.failCause) {
      switch (game.failCause) {
        case 'old_age': return "summary.cause.old_age";
        case 'poor_health': return "summary.cause.poor_health";
        case 'bankruptcy': return "summary.cause.bankruptcy";
        case 'burnout': return "summary.cause.burnout";
      }
    }

    // Fallback logic
    if (summary.age >= 110) return "summary.cause.old_age";
    if ((summary.health ?? 1) <= 0) return "summary.cause.poor_health";
    const lastEvent = String(summary.lastEventId || "");
    if (lastEvent.includes("accident") || lastEvent.includes("disaster") || lastEvent.includes("injury")) {
      return "summary.cause.accident";

    }
    if (summary.age >= 85) return "summary.cause.old_age";
    if ((summary.health ?? 100) < 25) return "summary.cause.poor_health";
    return "summary.cause.unknown";
  }

  function buildLifeHeadlines(summary) {
    const items = [];

    const cityName = summary.cityId ? getCityDisplayName(summary.cityId) : "";
    const countryName = summary.countryId ? getCountryDisplayName(summary.countryId) : "";
    const loc = cityName ? `${cityName}${countryName ? ", " + countryName : ""}` : "";

    if (summary.lastJob && summary.lastJob !== "unemployed") {
      items.push(`${icon("job")} ${t("job." + summary.lastJob)}${loc ? " — " + loc : ""}`);

    }

    const kids = Number(summary.totalChildren) || 0;
    if (summary.marriageStatus === "married" && kids > 0) {
      items.push(`${icon("marriage")} ${t("marriage.married")}, ${icon("children")} ${kids}`);

    } else if (summary.marriageStatus === "married") {
      items.push(`${icon("marriage")} ${t("marriage.married")}`);

    } else if (kids > 0) {
      items.push(`${icon("children")} ${kids}`);

    }

    const worth = Number(summary.finalNetWorth) || 0;
    if (Number.isFinite(worth)) {
      items.push(`${icon("money")} ${formatMoney(worth)}`);

    }

    const citiesVisited = Array.isArray(summary.citiesVisited) ? summary.citiesVisited.length : 0;
    if (citiesVisited >= 5) {
      items.push(`${icon("city")} ${citiesVisited} ${t("ui.citiesVisited")}`);

    }

    const followers = Math.max(0, Math.floor(Number(summary.followers) || 0));
    if (followers >= 1000) {
      items.push(`${icon("megaphone")} ${followers.toLocaleString()}`);

    }

    const maxNetWorth = Number(summary.maxNetWorth) || 0;
    if (maxNetWorth > worth * 1.2 && maxNetWorth > 10000) {
      items.push(`${icon("chart")} ${t("ui.maxNetWorth")}: ${formatMoney(maxNetWorth)}`);

    }

    return items.slice(0, 5);
  }

  function buildNearMisses(summary) {
    const misses = [];

    const worth = Number(summary.finalNetWorth) || 0;
    if (worth < 1000000) {
      const need = 1000000 - worth;
      if (need > 0 && need <= 250000) {
        misses.push(`${icon("dollar")} ${formatMoney(need)} ${t("ui.money")} ${t("ui.to")} $1M`);

      }

    }

    const citiesVisited = Array.isArray(summary.citiesVisited) ? summary.citiesVisited.length : 0;
    if (citiesVisited < 10) {
      const need = 10 - citiesVisited;
      if (need > 0 && need <= 3) {
        misses.push(`🌍 ${t("ui.just")} ${need} ${t("ui.citiesVisited")}`);

      }

    }

    if (summary.lastJob !== "ceo") {
      const eligible = summary.lastJob && summary.lastJob !== "unemployed";
      if (eligible && (Number(summary.intelligence) || 0) >= 75) {
        misses.push(`👔 ${t("ui.almost")} CEO`);

      }

    }

    const kids = Number(summary.totalChildren) || 0;
    if (!kids && summary.age >= 30 && summary.marriageStatus === "married") {
      misses.push(`${icon("children")} ${t("ui.children")}`);

    }

    return misses.slice(0, 3);
  }

  function buildCriticalMistakes(summary, game) {
    const mistakes = [];
    const failCause = game?.failCause || '';

    // Job-related mistakes
    if ((summary.totalYearsWorked || 0) < 5 && summary.age > 25) {
      mistakes.push(t("summary.mistake.noJob"));
    }

    // Financial mistakes
    if ((summary.finalNetWorth || 0) < 0 && failCause === 'bankruptcy') {
      if ((summary.maxNetWorth || 0) > 50000) {
        mistakes.push(t("summary.mistake.overspent"));
      } else {
        mistakes.push(t("summary.mistake.noSavings"));
      }
    }

    // Health mistakes  
    if (failCause === 'poor_health' || (summary.health || 100) <= 0) {
      mistakes.push(t("summary.mistake.noHealthcare"));
    }

    // Stress mistakes
    if (failCause === 'burnout') {
      mistakes.push(t("summary.mistake.highStress"));
    }

    return mistakes.slice(0, 2); // Max 2 mistakes
  }

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  function el(tag, className, text) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function canShowActionsPanel(game) {
    return !!game && !game.ended && !!game.player;
  }

  function formatMoney(amount) {
    const n = Number(amount);
    if (!Number.isFinite(n)) return "$0";
    const abs = Math.abs(n);
    const sign = n < 0 ? "-" : "";
    if (abs >= 1000000000000) return sign + "$" + (abs / 1000000000000).toFixed(1) + "T";
    if (abs >= 1000000000) return sign + "$" + (abs / 1000000000).toFixed(1) + "B";
    if (abs >= 1000000) return sign + "$" + (abs / 1000000).toFixed(1) + "M";
    if (abs >= 1000) return sign + "$" + (abs / 1000).toFixed(1) + "K";
    return sign + "$" + abs.toLocaleString();
  }

  function clamp(value, min, max) {
    const n = Number(value) || 0;
    return Math.min(max, Math.max(min, n));
  }

  function t(key, replacements = {}) {
    if (!Alive.i18n) return key;
    return Alive.i18n.t(key, replacements);
  }

  function getLang() {
    return Alive.i18n?.getLanguage ? Alive.i18n.getLanguage() : "en";
  }

  function getCountryDisplayName(countryId) {
    const key = "country." + countryId;
    const translated = t(key);
    if (translated !== key) return translated;

    const lang = getLang();
    const country = Alive.countries?.getCountryById ? Alive.countries.getCountryById(countryId) : null;
    if (!country) return countryId;
    return t(country.nameKey) || countryId;
  }

  function getCityDisplayName(cityId) {
    const key = "city." + cityId;
    const translated = t(key);
    if (translated !== key) return translated;

    const lang = getLang();
    const city = Alive.countries?.getCityById ? Alive.countries.getCityById(cityId) : null;
    if (!city) return cityId;
    return t(city.nameKey) || cityId;
  }

  function getCountryFlag(countryId) {
    const country = Alive.countries?.getCountryById ? Alive.countries.getCountryById(countryId) : null;
    return country?.flag || "";
  }

  function getHouseVisual(housingId, cityId) {
    // If it's a legacy string like "apartment", handle gracefully
    if (housingId === "apartment") return { emoji: "🏬", imageUrl: "" };
    if (!Alive.Assets || !Alive.Assets.getBuildingById) return { emoji: "🏠", imageUrl: "" };

    const b = Alive.Assets.getBuildingById(housingId);
    if (!b) return { emoji: "🏠", imageUrl: "" };

    let emoji = "🏠";
    if (b.class === "poor") emoji = "🏚️";
    else if (b.class === "middle") emoji = "🏠";
    else if (b.class === "rich") emoji = "🏰";
    else if (b.category === "commercial") emoji = "🏢";

    return { emoji, imageUrl: b.image || "" };
  }

  function getCarVisual(carId, cityId) {
    if (!carId) return { emoji: "🚶" };
    if (!Alive.Assets || !Alive.Assets.getVehicleById) return { emoji: "🚗", imageUrl: "" };

    const v = Alive.Assets.getVehicleById(carId);
    if (!v) return { emoji: "🚗", imageUrl: "" };

    let emoji = "🚗";
    if (v.type === "sport") emoji = "🏎️";
    else if (v.type === "suv") emoji = "🚙";
    else if (v.type === "ev") emoji = "🔋";

    return { emoji, imageUrl: v.image || "" };
  }

  function renderMiniProgressRow(label, value, color) {
    const pct = clamp(Number(value) || 0, 0, 100);
    const row = el("div", "qualityMeter");
    row.innerHTML = `
      <div class="qualityLabel">${label}</div>
      <div class="qualityBar">
        <div class="qualityFill" style="width: ${pct}%; background: ${color}"></div>
      </div>
      <div class="qualityValue">${pct}%</div>
    `;
    return row;
  }

  function getCountryAwareRandomName(countryId, gender) {
    if (Alive.names?.getFullName) return Alive.names.getFullName(countryId, gender);
    return gender === "F" ? "Emma" : "Alex";
  }

  // ============================================================================
  // LIFE STAGE & WEALTH HELPERS
  // ============================================================================

  function getLifeStage(age) {
    if (age < 13) return { id: "childhood", label: "ui.stage.childhood", emoji: "🎒", theme: "#a855f7" };
    if (age < 18) return { id: "teen", label: "ui.stage.teen", emoji: "⚡", theme: "#ec4899" };
    if (age < 30) return { id: "youngAdult", label: "ui.stage.youngAdult", emoji: "🌟", theme: "#3b82f6" };
    if (age < 60) return { id: "adult", label: "ui.stage.adult", emoji: "💼", theme: "#10b981" };
    return { id: "senior", label: "ui.stage.senior", emoji: "🏆", theme: "#f59e0b" };
  }

  function getAgeTier(age) {
    if (age < 13) return { id: "child", label: "ui.stage.childhood", emoji: "🧒", theme: "#a855f7" };
    if (age < 18) return { id: "teen", label: "ui.stage.teen", emoji: "🧑", theme: "#ec4899" };
    if (age < 60) return { id: "adult", label: "ui.stage.adult", emoji: "🧑‍💼", theme: "#10b981" };
    return { id: "senior", label: "ui.stage.senior", emoji: "👴", theme: "#f59e0b" };
  }

  function getWealthTier(netWorth) {
    if (netWorth < 0) return { id: "broke", label: "ui.wealth.broke", emoji: "😰", color: "#ff6b6b", gradient: "linear-gradient(135deg, #ff6b6b 0%, #c92a2a 100%)" };
    if (netWorth < 5000) return { id: "poor", label: "ui.wealth.poor", emoji: "💸", color: "#ffa94d", gradient: "linear-gradient(135deg, #ffa94d 0%, #e67700 100%)" };
    if (netWorth < 50000) return { id: "comfortable", label: "ui.wealth.comfortable", emoji: "💵", color: "#51cf66", gradient: "linear-gradient(135deg, #51cf66 0%, #2f9e44 100%)" };
    if (netWorth < 500000) return { id: "wealthy", label: "ui.wealth.wealthy", emoji: "💰", color: "#00d4ff", gradient: "linear-gradient(135deg, #00d4ff 0%, #0077b6 100%)" };
    if (netWorth < 5000000) return { id: "rich", label: "ui.wealth.rich", emoji: "🤑", color: "#ffd700", gradient: "linear-gradient(135deg, #ffd700 0%, #f59e0b 100%)" };
    return { id: "elite", label: "ui.wealth.elite", emoji: "👑", color: "#ff6b9d", gradient: "linear-gradient(135deg, #ff6b9d 0%, #be185d 100%)" };
  }

  function getMood(player) {
    const h = player.happiness || 50;
    const s = player.stress || 0;
    const hp = player.health || 50;

    if (hp < 20) return { id: "sick", emoji: "🤒" };
    if (s > 80) return { id: "stressed", emoji: "😫" };
    if (h >= 80) return { id: "happy", emoji: "😊" };
    if (h >= 60) return { id: "content", emoji: "🙂" };
    if (h >= 40) return { id: "neutral", emoji: "😐" };
    if (h >= 20) return { id: "sad", emoji: "😔" };
    return { id: "depressed", emoji: "😢" };
  }

  /** Phosphor Icons - cartoon-style UI (no emojis) */
  function icon(name) {
    const map = {
      money: "ph-currency-dollar", health: "ph-heart", happiness: "ph-smiley", energy: "ph-lightning",
      children: "ph-baby", marriage: "ph-heart", city: "ph-map-pin", trophy: "ph-trophy", chart: "ph-chart-line-up",
      education: "ph-graduation-cap", job: "ph-briefcase", partner: "ph-heart", warning: "ph-warning",
      game: "ph-game-controller", heart: "ph-heart", smiley: "ph-smiley", lightning: "ph-lightning",
      dollar: "ph-currency-dollar", baby: "ph-baby", user: "ph-user-circle", megaphone: "ph-megaphone",
      pet: "ph-paw-print", house: "ph-house", car: "ph-car", lock: "ph-lock-key", sparkle: "ph-sparkle", shop: "ph-shopping-bag"
    };
    const cls = map[name] || "ph-circle";
    return `<i class="ph ${cls}" aria-hidden="true"></i>`;
  }

  /** Character portrait: cartoon asset image or Phosphor fallback */
  function getCharacterPortrait(player, className) {
    if (Alive.Assets && Alive.Assets.getCharacterImageForPlayer) {
      const url = Alive.Assets.getCharacterImageForPlayer(player);
      if (url) return `<img src="${url}" alt="" class="${className || 'characterPortrait'}" />`;
    }
    const age = player && player.age != null ? player.age : 0;
    const iconClass = age < 3 ? "ph-baby" : "ph-user-circle";
    return `<i class="ph ${iconClass} characterIconFallback" aria-hidden="true"></i>`;
  }

  function getCharacterVisual(player) {
    const age = player.age;
    const gender = player.gender;
    const hp = player.health || 50;

    // Use new character assets if available
    let imageUrl = "";
    if (Alive.Assets && Alive.Assets.getCharacterImageForPlayer) {
      imageUrl = Alive.Assets.getCharacterImageForPlayer(player);
    } else {
      // Fallback to legacy path pattern
      imageUrl = player.portraitUrl || `assets/characters/${gender.toLowerCase()}_${getAgeTier(age).id}.png`;
    }

    return {
      portraitHtml: getCharacterPortrait(player),
      imageUrl
    };
  }

  function getCharacterEmoji(player) {
    const age = player.age;
    const gender = player.gender;
    const hp = player.health || 50;
    const h = player.happiness || 50;
    const s = player.stress || 0;

    // 1. Baby / Child
    if (age < 3) return "👶";
    if (age < 13) {
      if (hp < 30) return "🤒";
      if (h < 30) return gender === "F" ? "👧" : "👦";
      return gender === "F" ? "👧" : "👦";
    }

    // 2. Teen
    if (age < 18) {
      if (hp < 30) return "🤒";
      if (h > 80) return "😎"; // Cool teen
      if (h < 30) return "😒";
      return gender === "F" ? "👱‍♀️" : "👱";
    }

    // 3. Clothing Override
    if (Alive.shop && player.equipped && player.equipped.outfitId) {
      const outfit = Alive.shop.getItemById(player.equipped.outfitId);
      if (outfit && outfit.id !== "outfit_basic" && outfit.icon) {
        if (hp < 20) return "🏥";
        if (hp < 40) return "🤒";
        return outfit.icon;
      }
    }

    // 4. Adult Base
    let baseEmoji = "";
    if (age < 30) baseEmoji = gender === "F" ? "👩" : "👨"; // Young adult
    else if (age < 60) baseEmoji = gender === "F" ? "👩" : "👨"; // Adult
    else baseEmoji = gender === "F" ? "👵" : "👴"; // Senior

    // Wealth/Clothing Overrides
    if (age >= 18) {
      const wealth = getWealthTier(player.netWorth);
      if (wealth.id === "elite") {
        baseEmoji = gender === "F" ? "👸" : "🤴";
      } else if (wealth.id === "rich") {
        baseEmoji = gender === "F" ? "👩‍💼" : "🤵";
      } else if (wealth.id === "broke") {
        baseEmoji = gender === "F" ? "🤦‍♀️" : "🤦‍♂️";
      }
    }

    // 5. Status Modifiers
    if (hp < 20) return "🏥";
    if (hp < 50) return "🤒";
    if (s > 90) return "🤯";
    if (h < 20) return "😭";
    if (h < 40) return "☹️";
    if (h > 90) return "🤩";
    if (h > 75) return "😄";

    return baseEmoji;
  }

  function getHappinessExpression(player) {
    const h = Number(player?.happiness) || 0;
    if (h >= 85) return "🤩";
    if (h >= 60) return "🙂";
    if (h >= 40) return "😐";
    return "😢";
  }

  function getWealthBadgeTier(netWorth) {
    const n = Number(netWorth);
    if (!Number.isFinite(n)) return { id: "poor", label: "ui.wealth.poor", emoji: "💸" };
    if (n < 5000) return { id: "poor", label: "ui.wealth.poor", emoji: "💸" };
    if (n < 200000) return { id: "middle", label: "ui.wealth.comfortable", emoji: "💵" };
    if (n < 1000000) return { id: "rich", label: "ui.wealth.rich", emoji: "💰" };
    return { id: "millionaire", label: "ui.wealth.elite", emoji: "💎", short: "$1M+" };
  }

  function getMoodIndicator(player) {
    const mood = getMood(player);
    return mood.emoji;
  }

  function getLifeQuality(player) {
    const avg = ((player.health || 50) + (player.happiness || 50) + (player.intelligence || 50)) / 3;
    return Math.round(clamp(avg, 0, 100));
  }

  // ============================================================================
  // UI CLASS
  // ============================================================================

  class UI {
    constructor(game) {
      this.game = game;
      this.appEl = document.getElementById("app");
      this.rootEl = document.getElementById("app-content") || this.appEl;
      this.screen = "menu"; // menu, game, summary, achievements
      this.toasts = [];

      // Debounce protection for rapid clicks
      this.lastClickTime = 0;
      this.clickDebounceMs = 300;

      // Global background element (persistent across screens)
      this.bgEl = document.getElementById("app-background");
      if (!this.bgEl) {
        this.bgEl = document.createElement("div");
        this.bgEl.id = "app-background";
        this.bgEl.className = "appBackground";
        document.body.insertBefore(this.bgEl, document.body.firstChild);
      }

      // Game Overlay Container (for Shop, Relationships, etc.)
      this.overlayEl = document.getElementById("game-overlay");
      if (!this.overlayEl) {
        this.overlayEl = document.createElement("div");
        this.overlayEl.id = "game-overlay";
        this.overlayEl.className = "gameOverlay hidden";
        document.body.appendChild(this.overlayEl);
      }
      this.activeOverlay = null;

      this.prevScreen = null;

      this.createState = null;

      this.actionsSubscreen = null;

      this.assetsOpen = false;

      this.shopTab = "clothes";

      // Listen for language changes
      global.addEventListener("alive:languageChanged", () => this.render());

      // Listen for achievement unlocks
      global.addEventListener("alive:achievementUnlocked", (e) => {
        this.showAchievementToast(e.detail.achievement);

      });

      global.addEventListener("alive:richListPassed", (e) => {
        const billionaire = e?.detail?.billionaire;
        if (!billionaire) return;
        this.showToast(t("richlist.passed", { name: billionaire.displayName || billionaire.id }));

      });

      // Listen for game updates (skip re-render during birth cinematic to prevent freeze)
      global.addEventListener("alive:gameUpdate", () => {
        if (this.screen === "birth") return;
        this.render();
      });

      // HUD Elements
      this.hudEl = document.getElementById("hud");

      // Keyboard Controls
      document.addEventListener("keydown", (e) => {
        if (this.screen !== "game" || this.game.ended || this.game.onboardingStep > 0) return;

        // 1, 2, 3 for top actions
        if (["1", "2", "3"].includes(e.key)) {
          const index = parseInt(e.key) - 1;
          const buttons = document.querySelectorAll(".actionBtn");
          if (buttons[index]) buttons[index].click();
        }

        // Space for Next Year (if main action)
        if (e.code === "Space") {
          // Logic to find 'Age Up' button if it exists or generic advance
          // For now, let's look for the main CTA
          const mainBtn = document.querySelector(".btnPrimary");
          if (mainBtn) mainBtn.click();
        }
      });

      // Global Button Haptics & Sound with Debounce Protection
      document.addEventListener("mousedown", (e) => {
        const btn = e.target.closest("button");
        if (btn && !btn.disabled) {
          // Debounce protection for critical actions
          const now = Date.now();
          if (btn.classList.contains("btnPrimary") || btn.classList.contains("menuBtnPrimary") || btn.classList.contains("choiceBtn")) {
            if (now - this.lastClickTime < this.clickDebounceMs) {
              e.preventDefault();
              e.stopPropagation();
              return;
            }
            this.lastClickTime = now;
          }

          // Visual
          btn.classList.add("btn-pressed");
          setTimeout(() => btn.classList.remove("btn-pressed"), 150);

          // Haptic
          if (navigator.vibrate) navigator.vibrate(10);

          // Sound
          if (Alive.sound && Alive.sound.playClick) Alive.sound.playClick();
        }
      }, true);
    }

    setGame(game) {
      this.game = game;
    }

    // ==========================================================================
    // OVERLAY MANAGEMENT (Unified Life Flow)
    // ==========================================================================

    showOverlay(renderFn) {
      if (!this.overlayEl) return;

      // 1. Clear previous content
      this.overlayEl.innerHTML = "";

      // 2. Create content container
      const content = el("div", "overlayContent");
      this.overlayEl.appendChild(content);

      // 3. Render into it
      if (typeof renderFn === "function") {
        renderFn(content);
      }

      // 4. Show
      this.overlayEl.classList.remove("hidden");
      this.overlayEl.classList.add("visible");
      this.activeOverlay = true;

      // 5. Add close handler on backdrop click
      this.overlayEl.onclick = (e) => {
        if (e.target === this.overlayEl) {
          this.hideOverlay();
        }
      };
    }

    hideOverlay() {
      if (!this.overlayEl) return;
      this.overlayEl.classList.remove("visible");
      this.overlayEl.classList.add("hidden");
      this.overlayEl.innerHTML = "";
      this.activeOverlay = false;

      // Update HUD if stats changed while in overlay
      if (this.screen === "game") {
        this.renderHUD();
      }
    }

    // ==========================================================================
    // SCREEN MANAGEMENT
    // ==========================================================================

    async showMenu() {
      // Preload critical assets before showing menu if first time
      const loader = document.getElementById("loader");
      if (loader && !this.assetsLoaded) {
        if (Alive.Assets && Alive.Assets.preloadCriticalAssets) {
          await Alive.Assets.preloadCriticalAssets((pct) => {
            // Optional: Update loader width/text
            // loader.innerText = Math.round(pct * 100) + "%";
          });
        }
        this.assetsLoaded = true;
      }

      if (loader) {
        loader.style.opacity = "0";
        setTimeout(() => {
          if (loader.parentNode) loader.remove();
        }, 500);
      }

      this.screen = "menu";
      if (this.hudEl) this.hudEl.classList.add("hidden");
      this.render();
    }

    showGame() {
      this.screen = "game";
      this.render();

    }

    showSummary() {
      this.screen = "summary";
      this.render();

    }

    showAchievements() {
      this.screen = "achievements";
      this.render();

    }

    showSkills() {
      // Skills is small enough to maybe stay full screen or move to overlay?
      // For now, let's keep it consistent, if it's a sub-screen, use overlay.
      // But user request didn't explicitly list 'skills', but it listed 'selfdev'.
      // 'skills' seems to be separate. Let's stick to the request list first.
      this.prevScreen = this.screen;
      this.screen = "skills";
      this.render();

    }

    showScreen(id) {
      if (this.screen === "game") this.prevScreen = "game";
      switch (id) {
        case "assets":
          this.showOverlay((container) => this.renderAssetsOverlay(container));
          break;
        case "relationships":
          this.showRelationships();
          break;
        case "shop":
          this.showShop();
          break;
        case "selfdev":
          this.showSelfDevelopment();
          break;
        case "achievements":
          this.showAchievements();
          break;
        case "richlist":
          this.showRichList();
          break;
        default:
          this.showOverlay(() => { });
      }
    }

    showRelationships() {
      this.showOverlay((container) => this.renderRelationships(container));
    }

    showShop() {
      this.showOverlay((container) => this.renderShop(container));
    }

    showRichList() {
      this.showOverlay((container) => this.renderRichList(container));
    }

    showSelfDevelopment(tab = "education") {
      this.selfDevTab = tab;
      this.showOverlay((container) => this.renderSelfDevelopment(container));
    }

    showBirthCinematic() {
      this.screen = "birth";
      this.render();

    }

    showCharacterCreation() {
      if (!this.createState) {
        const defaultCountryId = Alive.countries?.getAllCountries?.()[0]?.id || "kz";
        const defaultCities = Alive.countries?.getCitiesByCountryId
          ? Alive.countries.getCitiesByCountryId(defaultCountryId)
          : [];
        const defaultCityId = defaultCities[0]?.id || Alive.cities?.getDefaultCityId?.() || "almaty";

        this.createState = {
          gender: "M",
          name: getCountryAwareRandomName(defaultCountryId, "M"),
          nameWasAuto: true,
          countryId: defaultCountryId,
          cityId: defaultCityId,
          familyWealthTier: "medium"

        };

      }

      this.screen = "create";
      this.render();

    }

    // ==========================================================================
    // MAIN RENDER
    // ==========================================================================

    render() {
      if (!this.rootEl) return;

      this.updateBackground();
      this.rootEl.innerHTML = "";

      switch (this.screen) {
        case "menu":
          this.renderMenu();
          break;
        case "create":
          this.renderCharacterCreation();
          break;
        case "birth":
          this.renderBirthCinematic();
          break;
        case "game":
          if (this.hudEl) this.hudEl.classList.remove("hidden");
          this.renderGame();
          // Onboarding check removed - was causing errors
          break;
        case "goals":
          this.renderLifeGoals();
          break;
        case "skills":
          this.renderSkills();
          break;
        case "relationships":
          this.renderRelationships();
          break;
        case "shop":
          this.renderShop();
          break;
        case "summary":
          this.renderSummary();
          break;
        case "achievements":
          this.renderAchievements();
          break;
        case "richlist":
          this.renderRichList();
          break;
        case "selfdev":
          this.renderSelfDevelopment();
          break;
        default:
          this.renderMenu();

      }

      this.renderToasts();

    }

    updateBackground() {
      if (!this.bgEl) return;

      const p = this.game?.player;
      const cityId = p?.cityId || p?.city;

      // Default dark gradient if no city
      if (!cityId) {
        this.bgEl.style.backgroundImage = `linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)`;
        return;

      }

      const cityData = Alive.cities?.getCityById ? Alive.cities.getCityById(cityId) : null;
      const bgUrl = cityData?.imageUrl || (Alive.cities?.getCityImageUrl ? Alive.cities.getCityImageUrl(cityId) : "");

      if (bgUrl) {
        this.bgEl.style.backgroundImage = `linear-gradient(180deg, rgba(10,10,20,0.65) 0%, rgba(10,10,20,0.85) 50%, rgba(10,10,20,0.95) 100%), url('${bgUrl}')`;

      } else {
        this.bgEl.style.backgroundImage = `linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)`;

      }

    }

    renderCityGuide() {
      const p = this.game?.player;
      if (!p) return;

      const cityId = p.cityId || p.city;
      const city = Alive.cities?.getCityById ? Alive.cities.getCityById(cityId) : null;
      if (!city) return;

      const overlay = el("div", "settingsOverlay");
      overlay.onclick = (e) => {
        if (e.target === overlay) overlay.remove();

      };

      const modal = el("div", "settingsModal cityGuideModal");

      // Hero Image
      const hero = el("div", "cityHero");
      if (city.imageUrl) {
        hero.innerHTML = `
          <img src="${city.imageUrl}" class="cityHeroImage" alt="${city.name?.en || cityId}">
          <div class="cityHeroOverlay">
            <div class="cityHeroTitle">${getCityDisplayName(cityId)}</div>
            <div class="cityHeroSubtitle">${getCountryDisplayName(p.countryId)}</div>
          </div>
        `;

      }
      modal.appendChild(hero);

      const content = el("div", "cityContent");

      // Description
      const desc = el("div", "cityDesc", city.description ? t("city.desc." + cityId) : t("city.node_desc", { city: getCityDisplayName(cityId) }));
      // Fallback if description key is same as output
      if (desc.textContent === "city.desc." + cityId) {
        desc.textContent = city.description?.en || `Welcome to ${getCityDisplayName(cityId)}. A great place to live.`;

      }
      content.appendChild(desc);

      // Stats Grid
      const grid = el("div", "cityStatsGrid");

      const stats = [
        { label: t("city.col"), value: city.costOfLiving ? city.costOfLiving + "%" : "100%", trend: "neutral" },
        { label: t("city.safety"), value: city.safety ? city.safety + "/10" : "?", trend: city.safety > 7 ? "up" : "down" },
        { label: t("city.tax"), value: city.taxRate ? (city.taxRate * 100).toFixed(1) + "%" : "0%", trend: "neutral" },
        { label: t("city.jobs"), value: city.jobMarket ? (city.jobMarket * 100).toFixed(0) + "%" : "100%", trend: city.jobMarket > 1 ? "up" : "neutral" }
      ];

      stats.forEach(s => {
        const card = el("div", "cityStatCard");
        card.innerHTML = `
          <div class="cityStatLabel">${s.label}</div>
          <div class="cityStatValue">${s.value}</div>
        `;
        grid.appendChild(card);

      });
      content.appendChild(grid);

      const closeBtn = el("button", "btn btnSecondary btnFull", t("ui.close"));
      closeBtn.onclick = () => overlay.remove();
      content.appendChild(closeBtn);

      modal.appendChild(content);
      overlay.appendChild(modal);
      this.rootEl.appendChild(overlay);

    }

    showFamilyModal(person, type) {
      if (!person) return;
      const p = this.game.player;

      const overlay = el("div", "settingsOverlay");
      overlay.onclick = (e) => {
        if (e.target === overlay) overlay.remove();

      };

      const modal = el("div", "settingsModal familyModal");

      // Header with Emoji and Name
      const header = el("div", "familyHeader");
      const emoji = type === "partner"
        ? (person.gender === "F" ? "👩" : "👨")
        : (person.age < 3 ? "👶" : (person.age < 13 ? (person.gender === "F" ? "👧" : "👦") : (person.gender === "F" ? "👩" : "👨")));

      header.innerHTML = `
        <div class="familyEmoji">${emoji}</div>
        <div class="familyDetails">
          <div class="familyName">${person.name}</div>
          <div class="familyMeta">${t(type === "partner" ? "relationships.partner" : "relationships.child")} • ${t("ui.age")}: ${person.age}</div>
        </div>
      `;
      modal.appendChild(header);

      const content = el("div", "familyContent");

      // Relationship Score Bar
      const score = person.relationshipScore || 50;
      const scoreBar = el("div", "relationshipBarContainer");
      scoreBar.innerHTML = `
        <div class="relationshipLabel">
          <span>${t("relationships.love")}</span>
          <span>${Math.round(score)}%</span>
        </div>
        <div class="progressBar">
          <div class="progressFill" style="width: ${score}%; background-color: #ff6b9d;"></div>
        </div>
      `;
      content.appendChild(scoreBar);

      // Actions
      const actions = el("div", "familyActions");

      // Spend Time
      const spendTimeBtn = el("button", "btn btnPrimary btnFull");
      spendTimeBtn.innerHTML = `<span>⏳</span> ${t("relationships.spendTime")}`;
      spendTimeBtn.onclick = () => {
        if (Alive.relationships && Alive.relationships.spendFamilyTime) {
          const res = Alive.relationships.spendFamilyTime(p, person);
          if (res.success) {
            this.showToast(t("relationships.spentTime", { name: person.name }), "success");
            overlay.remove();
            this.render(); // Refresh UI to update bars

          }

        }

      };
      actions.appendChild(spendTimeBtn);

      content.appendChild(actions);

      // Close
      const closeBtn = el("button", "btn btnSecondary btnFull", t("ui.close"));
      closeBtn.onclick = () => overlay.remove();
      content.appendChild(closeBtn);

      modal.appendChild(content);
      overlay.appendChild(modal);
      this.rootEl.appendChild(overlay);

    }

    // ==========================================================================
    // ONBOARDING
    // ==========================================================================

    // Onboarding overlay removed - was causing global reference errors

    highlightFirstAction() {
      // Highlight the actions panel
      const actionsPanel = document.querySelector(".actionsPanel");
      if (actionsPanel) {
        actionsPanel.classList.add("tutorial-highlight");
        const hint = el("div", "onboarding-text", "Pick an action!");
        hint.style.position = "absolute";
        hint.style.top = "-40px";
        hint.style.width = "100%";
        hint.style.textAlign = "center";
        hint.style.fontWeight = "bold";
        actionsPanel.appendChild(hint);

        // Remove highlight after click
        const handler = (e) => {
          if (e.target.closest("button")) {
            actionsPanel.classList.remove("tutorial-highlight");
            if (hint.parentNode) hint.remove();
            this.game.completeOnboarding();
            this.renderHUD(); // Force update
            actionsPanel.removeEventListener("click", handler);
          }
        };
        actionsPanel.addEventListener("click", handler);
      }
    }

    renderHUD() {
      if (!this.game || !this.game.player) return;
      const p = this.game.player;

      // Update Stats
      const setSafe = (id, html) => { const e = document.getElementById(id); if (e) e.innerHTML = html; };
      const setWidth = (id, pct) => { const e = document.getElementById(id); if (e) e.style.width = Math.max(0, Math.min(100, pct)) + "%"; };

      setSafe("hud-age", p.age);
      setSafe("hud-emoji", getCharacterPortrait(p, "hudPortrait"));

      // Floating text for money changes
      const moneyEl = document.getElementById("hud-money");
      if (moneyEl) {
        if (typeof this.lastRenderedMoney === "number" && this.lastRenderedMoney !== p.money) {
          const delta = p.money - this.lastRenderedMoney;
          if (delta !== 0) {
            const floatEl = document.createElement("span");
            floatEl.className = "floatingMoney " + (delta > 0 ? "positive" : "negative");
            floatEl.textContent = (delta > 0 ? "+" : "") + formatMoney(delta);
            floatEl.style.position = "absolute";
            floatEl.style.left = "0";
            floatEl.style.bottom = "-20px";
            floatEl.style.whiteSpace = "nowrap";
            floatEl.style.opacity = "1";
            floatEl.style.transition = "all 1s ease-out";
            floatEl.style.zIndex = "100";

            // Only append if it's position relative or absolute to contain it
            if (window.getComputedStyle(moneyEl).position === "static") {
              moneyEl.style.position = "relative";
            }
            moneyEl.appendChild(floatEl);

            // Animate
            requestAnimationFrame(() => {
              floatEl.style.transform = "translateY(-30px)";
              floatEl.style.opacity = "0";
            });

            // Cleanup
            setTimeout(() => floatEl.remove(), 1000);
          }
        }
        this.lastRenderedMoney = p.money;
      }

      setSafe("hud-money", formatMoney(p.money));
      const setLabel = (id, text) => { const e = document.getElementById(id); if (e) e.textContent = text; };
      setLabel("hud-label-age", t("ui.age"));
      setLabel("hud-label-money", t("ui.money"));
      setLabel("hud-label-health", t("ui.health"));
      setLabel("hud-label-happiness", t("ui.happiness"));
      setLabel("hud-label-energy", t("ui.energy"));

      setWidth("hud-bar-health", p.health);
      setWidth("hud-bar-happiness", p.happiness);
      setWidth("hud-bar-energy", p.energy || 50);

      // Also update sidebar if present in DOM (shared IDs usually work if unique, but responsiveness handles layout)
    }

    // ==========================================================================
    // MENU SCREEN (Modern Mobile Game Style)
    // ==========================================================================

    renderMenu() {
      const container = el("div", "screen menuScreen");

      // Game-style header
      const header = el("div", "menuGameHeader");
      header.innerHTML = `
        <div class="menuGameLogo">🎮 ${t("ui.gameTitle")}</div>
        <p class="menuGameTagline">${t("ui.tagline")}</p>
      `;
      container.appendChild(header);

      // Main action cards (game-style grid)
      const actions = el("div", "menuGameActions");

      // Primary: Start New Life - big hero button
      const newLifeBtn = el("button", "gameBtn gameBtnHero");
      newLifeBtn.innerHTML = `
        <span class="gameBtnEmoji">🌟</span>
        <span class="gameBtnLabel">${t("ui.newLife")}</span>
        <span class="gameBtnSub">Begin your story</span>
      `;
      newLifeBtn.onclick = () => this.showCharacterCreation();
      actions.appendChild(newLifeBtn);

      // Secondary actions row
      const secondaryRow = el("div", "menuGameRow");

      const hasSave = Alive.storage?.hasSave();
      const continueBtn = el("button", "gameBtn gameBtnSecondary" + (hasSave ? "" : " gameBtnDisabled"));
      continueBtn.innerHTML = `
        <span class="gameBtnIcon"><i class="ph ph-play-circle"></i></span>
        <span>${t("ui.continue")}</span>
      `;
      if (hasSave) {
        continueBtn.onclick = () => {
          if (this.game && Alive.storage) {
            const state = Alive.storage.load();
            if (state) {
              this.game.loadState(state);
              this.showGame();
            }
          }
        };
      }
      secondaryRow.appendChild(continueBtn);

      const albumBtn = el("button", "gameBtn gameBtnSecondary");
      albumBtn.innerHTML = `
        <span class="gameBtnIcon"><i class="ph ph-book-bookmark"></i></span>
        <span>${t("ui.lifeAlbum")}</span>
      `;
      albumBtn.onclick = () => this.showAchievements();
      secondaryRow.appendChild(albumBtn);

      actions.appendChild(secondaryRow);

      // Tertiary row: Rich List, Support, Settings
      const tertiaryRow = el("div", "menuGameRow menuGameRowSmall");

      const richBtn = el("button", "gameBtn gameBtnTertiary");
      richBtn.innerHTML = `<i class="ph ph-crown"></i> ${t("ui.richList")}`;
      richBtn.onclick = () => this.showRichList();
      tertiaryRow.appendChild(richBtn);

      const monetizationInstance = this.game?.monetization || window.aliveGame?.monetization;
      const hasSupport = monetizationInstance && monetizationInstance.hasSupportPack;
      const supportBtn = el("button", "gameBtn gameBtnTertiary" + (hasSupport ? " gameBtnActive" : ""));
      supportBtn.innerHTML = `<i class="ph ph-heart-straight${hasSupport ? "-fill" : ""}"></i> ${hasSupport ? t("iap.btn.active") : t("iap.supportPack.title")}`;
      supportBtn.onclick = () => {
        if (hasSupport) alert(t("iap.thanks"));
        else if (monetizationInstance) {
          monetizationInstance.buySupportPack().then(() => {
            this.rootEl.innerHTML = "";
            this.renderMenu();
          });
        }
      };
      tertiaryRow.appendChild(supportBtn);

      const settingsBtn = el("button", "gameBtn gameBtnTertiary");
      settingsBtn.innerHTML = `<i class="ph ph-gear"></i> ${t("ui.settings")}`;
      settingsBtn.onclick = () => this.showSettingsModal();
      tertiaryRow.appendChild(settingsBtn);

      actions.appendChild(tertiaryRow);
      container.appendChild(actions);

      // Footer: language
      const footer = el("div", "menuGameFooter");
      footer.appendChild(this.renderLangToggle());
      container.appendChild(footer);

      this.rootEl.appendChild(container);
    }

    showSettingsModal() {
      const overlay = el("div", "settingsOverlay");
      overlay.onclick = (e) => {
        if (e.target === overlay) overlay.remove();

      };

      const modal = el("div", "settingsModal");

      const title = el("h2", "settingsTitle", "");
      title.innerHTML = `<i class="ph ph-gear" style="vertical-align: middle;"></i> ${t("ui.settings")}`;
      modal.appendChild(title);

      // Language setting
      const langRow = el("div", "settingsRow");
      langRow.innerHTML = `<span class="settingsLabel"><i class="ph ph-globe"></i> ${t("settings.language")}</span>`;
      const langBtns = el("div", "settingsLangBtns");

      const enBtn = el("button", "settingsLangBtn" + (getLang() === "en" ? " active" : ""), "EN");
      enBtn.onclick = () => { Alive.i18n.setLanguage("en"); overlay.remove(); };
      langBtns.appendChild(enBtn);

      const ruBtn = el("button", "settingsLangBtn" + (getLang() === "ru" ? " active" : ""), "RU");
      ruBtn.onclick = () => { Alive.i18n.setLanguage("ru"); overlay.remove(); };
      langBtns.appendChild(ruBtn);

      langRow.appendChild(langBtns);
      modal.appendChild(langRow);

      // Sound effects toggle
      const soundRow = el("div", "settingsRow");
      soundRow.innerHTML = `<span class="settingsLabel"><i class="ph ph-speaker-high"></i> ${t("settings.sound")}</span>`;
      const soundToggle = el("button", "settingsToggle" + (Alive.sound?.isSoundEnabled() ? " active" : ""));
      soundToggle.innerHTML = Alive.sound?.isSoundEnabled() ? t("settings.on") : t("settings.off");
      soundToggle.onclick = () => {
        const newState = !Alive.sound?.isSoundEnabled();
        Alive.sound?.setSoundEnabled(newState);
        soundToggle.className = "settingsToggle" + (newState ? " active" : "");
        soundToggle.innerHTML = newState ? t("settings.on") : t("settings.off");

      };
      soundRow.appendChild(soundToggle);
      modal.appendChild(soundRow);

      // Music toggle
      const musicRow = el("div", "settingsRow");
      musicRow.innerHTML = `<span class="settingsLabel"><i class="ph ph-music-notes"></i> ${t("settings.music")}</span>`;
      const musicToggle = el("button", "settingsToggle" + (Alive.sound?.isMusicEnabled() ? " active" : ""));
      musicToggle.innerHTML = Alive.sound?.isMusicEnabled() ? t("settings.on") : t("settings.off");
      musicToggle.onclick = () => {
        const newState = !Alive.sound?.isMusicEnabled();
        Alive.sound?.setMusicEnabled(newState);
        musicToggle.className = "settingsToggle" + (newState ? " active" : "");
        musicToggle.innerHTML = newState ? t("settings.on") : t("settings.off");

      };
      musicRow.appendChild(musicToggle);
      modal.appendChild(musicRow);

      // Theme toggle
      const themeRow = el("div", "settingsRow");
      themeRow.innerHTML = `<span class="settingsLabel"><i class="ph ph-palette"></i> ${t("settings.theme")}</span>`;
      const themeBtns = el("div", "settingsLangBtns");

      const currentTheme = localStorage.getItem("alive_theme") || "dark";

      const darkBtn = el("button", "settingsLangBtn" + (currentTheme === "dark" ? " active" : ""), "");
      darkBtn.innerHTML = `<i class="ph ph-moon"></i>`;
      darkBtn.onclick = () => {
        localStorage.setItem("alive_theme", "dark");
        document.body.classList.remove("light-theme");
        darkBtn.classList.add("active");
        lightBtn.classList.remove("active");

      };
      themeBtns.appendChild(darkBtn);

      const lightBtn = el("button", "settingsLangBtn" + (currentTheme === "light" ? " active" : ""), "");
      lightBtn.innerHTML = `<i class="ph ph-sun"></i>`;
      lightBtn.onclick = () => {
        localStorage.setItem("alive_theme", "light");
        document.body.classList.add("light-theme");
        lightBtn.classList.add("active");
        darkBtn.classList.remove("active");

      };
      themeBtns.appendChild(lightBtn);

      themeRow.appendChild(themeBtns);
      modal.appendChild(themeRow);

      modal.appendChild(themeRow);

      // Support Pack Logic
      const supportRow = el("div", "settingsRow");
      supportRow.style.marginTop = "16px";
      supportRow.style.paddingTop = "16px";
      supportRow.style.borderTop = "1px solid rgba(255,255,255,0.1)";
      supportRow.style.flexDirection = "column";
      supportRow.style.alignItems = "stretch";
      supportRow.style.gap = "12px";

      const hasSupport = (this.game?.monetization || window.aliveGame?.monetization)?.hasSupportPack;

      if (hasSupport) {
        supportRow.innerHTML = `<div style="color: #4ade80; font-weight: bold; width: 100%; text-align: center;"><i class="ph ph-heart-straight-fill"></i> ${t("iap.btn.active")}</div>`;
      } else {
        const info = el("div");
        info.innerHTML = `
               <div style="display:flex; align-items:center; gap: 8px; font-weight:bold; font-size: 14px; margin-bottom: 4px; color: #f472b6;">
                  <img src="assets/banner/icon_support_pack.png" style="width:24px;height:24px;border-radius:4px;">
                  ${t("iap.supportPack.title")}
               </div>
               <div style="font-size: 12px; opacity: 0.8; line-height: 1.4;">${t("iap.supportPack.desc")}</div>
          `;
        supportRow.appendChild(info);

        const buyBtn = el("button", "settingsLangBtn active", t("iap.btn.buy"));
        buyBtn.style.padding = "10px 16px";
        buyBtn.style.height = "auto";
        buyBtn.style.width = "100%";
        buyBtn.style.justifyContent = "center";
        buyBtn.style.background = "linear-gradient(135deg, #ec4899 0%, #db2777 100%)";
        buyBtn.style.border = "none";
        buyBtn.onclick = () => {
          const monet = this.game?.monetization || window.aliveGame?.monetization;
          if (monet) {
            monet.buySupportPack().then(() => {
              modal.remove();
              this.showSettingsModal();
            });
          }
        };
        supportRow.appendChild(buyBtn);
      }
      modal.appendChild(supportRow);

      // Restore button
      const restoreBtn = el("div", "settingsRestore", t("iap.restore"));
      restoreBtn.style.textAlign = "center";
      restoreBtn.style.fontSize = "12px";
      restoreBtn.style.opacity = "0.5";
      restoreBtn.style.marginTop = "12px";
      restoreBtn.style.cursor = "pointer";
      restoreBtn.style.textDecoration = "underline";
      restoreBtn.onclick = () => {
        const monet = this.game?.monetization || window.aliveGame?.monetization;
        if (monet) {
          monet.checkEntitlements().then(() => {
            modal.remove();
            this.showSettingsModal();
          });
        }
      };
      modal.appendChild(restoreBtn);

      // Close button
      const closeBtn = el("button", "settingsCloseBtn", "�?�");
      closeBtn.onclick = () => overlay.remove();
      modal.appendChild(closeBtn);

      overlay.appendChild(modal);
      this.rootEl.appendChild(overlay);

    }

    renderShop(containerEl) {
      const p = this.game?.player;
      if (!p) {
        this.showMenu();
        return;
      }

      if (Alive.shop?.ensureShopState) {
        Alive.shop.ensureShopState(p);
      }

      // Use passed container or fallback to root (though overlay flow implies container is always passed)
      const target = containerEl || this.rootEl;
      if (!containerEl) target.innerHTML = ""; // Only clear root if not in overlay

      const container = el("div", "screen shopScreen");

      // Header with balance
      const header = el("div", "shopHeader");

      // Back button behaves differently in overlay
      const isOverlay = !!containerEl;
      const backSymbol = isOverlay ? "×" : "←";
      const backBtn = el("button", "shopBackBtn", backSymbol);

      backBtn.onclick = () => {
        if (isOverlay) {
          this.hideOverlay();
        } else {
          const prev = this.prevScreen || "game";
          this.prevScreen = null;
          this.screen = prev;
          this.render();
        }
      };

      header.appendChild(backBtn);

      const title = el("h1", "shopTitle");
      title.innerHTML = icon("shop") + " " + t("shop.title");
      header.appendChild(title);

      const balance = el("div", "shopBalance");
      balance.innerHTML = `
        <span class="shopBalanceIcon">${icon("money")}</span>
        <span class="shopBalanceAmount">${formatMoney(p.money || 0)}</span>
      `;
      header.appendChild(balance);
      container.appendChild(header);

      // Style Score Card
      const styleScore = Alive.shop?.getPlayerStyleScore?.(p) || 0;
      const maxStyleScore = 30; // 6 slots * 5 max tier
      const styleCard = el("div", "styleScoreCard");
      styleCard.innerHTML = `
        <div class="styleScoreIcon">�?�</div>
        <div class="styleScoreInfo">
          <div class="styleScoreLabel">${t("shop.style_score")}</div>
          <div class="styleScoreValue">${styleScore}</div>
        </div>
        <div class="styleScoreBar">
          <div class="styleScoreBarFill" style="width: ${Math.min(100, (styleScore / maxStyleScore) * 100)}%"></div>
        </div>
      `;
      container.appendChild(styleCard);

      // Tabs
      const tabRow = el("div", "shopTabs");
      const tabs = [
        { id: "clothes", icon: "👔", label: t("shop.tab.clothes") },
        { id: "accessories", icon: "💎", label: t("shop.tab.accessories") },
        { id: "tech", icon: "📱", label: t("shop.tab.tech") },
        { id: "lifestyle", icon: "🧘", label: t("shop.tab.lifestyle") },
        { id: "decor", icon: "🛋️", label: t("shop.tab.decor") }
      ];

      tabs.forEach(tab => {
        const tabBtn = el("button", "shopTab" + (this.shopTab === tab.id ? " active" : ""));
        tabBtn.innerHTML = `
          <span class="shopTabIcon">${tab.icon}</span>
          <span class="shopTabLabel">${tab.label}</span>
        `;
        tabBtn.onclick = () => {
          this.shopTab = tab.id;
          if (containerEl) {
            this.showOverlay((c) => this.renderShop(c));
          } else {
            this.render();
          }
        };
        tabRow.appendChild(tabBtn);

      });
      container.appendChild(tabRow);

      // Get items for current tab
      const getTabItems = () => {
        if (!Alive.shop?.CATEGORIES || !Alive.shop?.getItemsByCategory) return [];
        switch (this.shopTab) {
          case "tech":
            return Alive.shop.getItemsByCategory(Alive.shop.CATEGORIES.TECH);
          case "lifestyle":
            return Alive.shop.getItemsByCategory(Alive.shop.CATEGORIES.LIFESTYLE);
          case "accessories":
            return Alive.shop.getItemsByCategory(Alive.shop.CATEGORIES.ACCESSORIES);
          case "decor":
            return Alive.shop.getItemsByCategory(Alive.shop.CATEGORIES.DECOR);
          default:
            return Alive.shop.getItemsByCategory(Alive.shop.CATEGORIES.CLOTHES);

        }

      };

      const formatEffectBadges = (effects, isYearly = false) => {
        if (!effects) return [];
        const badges = [];
        const prefix = isYearly ? "/yr " : "";
        if (effects.attractivenessDelta) badges.push({ text: `${prefix}�?�+${effects.attractivenessDelta}`, positive: effects.attractivenessDelta > 0 });
        if (effects.happinessDelta) badges.push({ text: `${prefix}😊+${effects.happinessDelta}`, positive: effects.happinessDelta > 0 });
        if (effects.healthDelta) badges.push({ text: `${prefix}❤️+${effects.healthDelta}`, positive: effects.healthDelta > 0 });
        if (effects.intelligenceDelta) badges.push({ text: `${prefix}🧠+${effects.intelligenceDelta}`, positive: effects.intelligenceDelta > 0 });
        if (effects.socialSkillDelta) badges.push({ text: `${prefix}🤝+${effects.socialSkillDelta}`, positive: effects.socialSkillDelta > 0 });
        if (effects.careerSkillDelta) badges.push({ text: `${prefix}💼+${effects.careerSkillDelta}`, positive: effects.careerSkillDelta > 0 });
        if (effects.businessSkillDelta) badges.push({ text: `${prefix}📊+${effects.businessSkillDelta}`, positive: effects.businessSkillDelta > 0 });
        if (effects.sportsSkillDelta) badges.push({ text: `${prefix}🏃+${effects.sportsSkillDelta}`, positive: effects.sportsSkillDelta > 0 });
        if (effects.stressDelta) badges.push({ text: `${prefix}😰${effects.stressDelta}`, positive: effects.stressDelta < 0 });
        return badges;

      };

      const items = getTabItems();
      let visibleCount = 0;

      // Render based on tab type
      if (this.shopTab === "lifestyle") {
        // Subscription items - list view
        const list = el("div", "shopSubList");
        items.forEach(item => {
          const isActive = !!p.subscriptions?.[item.id];
          const subEl = el("div", "shopSubItem" + (isActive ? " active" : ""));

          const nameKey = "shop.item." + item.id + ".name";
          const descKey = "shop.item." + item.id + ".desc";
          const tierColor = item.tier?.color || "#9ca3af";

          const effectBadges = formatEffectBadges(item.yearlyEffects, true);
          const effectsHtml = effectBadges.map(b =>
            `<span class="shopItemEffect ${b.positive ? 'positive' : ''}">${b.text}</span>`
          ).join("");

          subEl.innerHTML = `
            <div class="shopSubIcon" style="border: 2px solid ${tierColor}">${item.icon}</div>
            <div class="shopSubInfo">
              <div class="shopSubName">${t(nameKey)}</div>
              <div class="shopSubDesc">${t(descKey)}</div>
              <div class="shopSubEffects">${effectsHtml}</div>
            </div>
            <div class="shopSubCost">
              <div class="shopSubPrice">${formatMoney(item.subscription?.annualCost || 0)}</div>
              <div class="shopSubPeriod">${t("shop.perYear")}</div>
            </div>
          `;

          const toggle = el("button", "shopSubToggle" + (isActive ? " active" : ""));
          toggle.onclick = () => {
            Alive.shop?.toggleSubscription?.(p, item.id, !isActive);
            Alive.storage?.save(this.game.getState());
            this.render();

          };
          subEl.appendChild(toggle);

          list.appendChild(subEl);

        });
        container.appendChild(list);

      } else {
        // Regular items - grid view
        const grid = el("div", "shopItemsGrid");

        items.forEach(item => {
          const owned = Alive.shop?.isOwned?.(p, item.id) || false;
          const equipped = Alive.shop?.hasEquipped?.(p, item.id) || false;
          const canBuyItem = Alive.shop?.canBuy?.(p, item.id) || false;
          const price = Math.max(0, Math.round(item.price || 0));

          const nameKey = "shop.item." + item.id + ".name";
          const descKey = "shop.item." + item.id + ".desc";
          const tierId = item.tier?.id || "basic";

          // CHECK 3: Content Pacing
          // Hide items that are way out of league to avoid overload
          // effectivePrice logic: if item has no price, assume 0.
          const effectivePrice = item.price || 0;
          const playerMoney = p.money || 0;

          // Show if:
          // 1. Owned
          // 2. Basic tier (starter items)
          // 3. Affordable or aspirational (within 10x budget)
          // 4. Player is rich (net worth > item price)
          const isVisible = owned ||
            tierId === 'basic' ||
            effectivePrice <= (playerMoney * 10) ||
            (p.netWorth || 0) >= effectivePrice;

          (p.netWorth || 0) >= effectivePrice;

          if (!isVisible) return;
          visibleCount++;

          const itemEl = el("div", "shopItem" + (owned ? " owned" : "") + (equipped ? " equipped" : ""));

          const effectBadges = formatEffectBadges(item.effects);
          const effectsHtml = effectBadges.slice(0, 3).map(b =>
            `<span class="shopItemEffect ${b.positive ? 'positive' : ''}">${b.text}</span>`
          ).join("");

          let statusHtml = "";
          if (equipped) {
            statusHtml = `<span class="shopItemStatus equipped">${t("shop.equipped")}</span>`;

          } else if (owned) {
            statusHtml = `<span class="shopItemStatus owned">${t("shop.owned")}</span>`;

          }

          itemEl.innerHTML = `
            <span class="shopItemTierBadge ${tierId}">${t("shop.tier." + tierId)}</span>
            <div class="shopItemIcon">${item.icon}</div>
            <div class="shopItemName">${t(nameKey)}</div>
            <div class="shopItemDesc">${t(descKey)}</div>
            <div class="shopItemEffects">${effectsHtml}</div>
            <div class="shopItemFooter">
              <span class="shopItemPrice${price === 0 ? ' free' : ''}">${price === 0 ? t("shop.free") : formatMoney(price)}</span>
              ${statusHtml}
            </div>
            <!-- Lazy load helper for images if icon was an image tag (it's usually emoji here) -->
          `;

          itemEl.onclick = () => {
            if (!owned && canBuyItem) {
              Alive.shop?.buyItem?.(p, item.id);
              Alive.storage?.save(this.game.getState());
              this.showToast(icon("shop") + " " + t("shop.purchased") + " " + t(nameKey));
              this.render();

            } else if (owned && item.slot && !equipped) {
              Alive.shop?.equipItem?.(p, item.id);
              Alive.storage?.save(this.game.getState());
              this.showToast(`�?� ${t("shop.equipped")} ${t(nameKey)}`);
              this.render();

            } else if (!owned && !canBuyItem) {
              this.showToast(icon("warning") + " " + t("shop.notEnough"));

            }

          };

          grid.appendChild(itemEl);

        });

        if (visibleCount === 0) {
          const emptyMsg = el("div", "statLabel", t("shop.emptyCategory") || "No items available in this category yet.");
          emptyMsg.style.textAlign = "center";
          emptyMsg.style.padding = "40px";
          emptyMsg.style.opacity = "0.6";
          container.appendChild(emptyMsg);
        } else {
          container.appendChild(grid);
        }

      }

      // Annual subscription cost summary
      const annualCost = Alive.shop?.getAnnualSubscriptionCost?.(p) || 0;
      if (annualCost > 0) {
        const costSummary = el("div", "statusCard");
        costSummary.style.marginTop = "20px";
        costSummary.innerHTML = `
          <div class="statusCardHeader">
            <span class="statusCardTitle">${t("shop.annual_subscriptions")}</span>
            <span class="statusCardValue" style="color: #ff6b6b">-${formatMoney(annualCost)}/yr</span>
          </div>
        `;
        container.appendChild(costSummary);

      }

      target.appendChild(container);
    }

    // ========================================================================
    // RELATIONSHIPS SCREEN
    // ========================================================================

    renderRelationships(containerEl) {
      const p = this.game?.player;
      if (!p) {
        this.showMenu();
        return;
      }

      if (Alive.relationships?.ensureExtendedRelationshipsState) {
        Alive.relationships.ensureExtendedRelationshipsState(p);
      }

      const target = containerEl || this.rootEl;
      if (!containerEl) target.innerHTML = "";

      const container = el("div", "screen goalsScreen");

      // Close Button for Overlay
      const closeBtn = el("button", "btn btnSecondary", "×");
      closeBtn.style.position = "absolute";
      closeBtn.style.top = "10px"; // Adjust based on CSS
      closeBtn.style.right = "10px";
      closeBtn.style.width = "40px";
      closeBtn.style.zIndex = "10";
      closeBtn.onclick = () => this.hideOverlay();

      if (containerEl) {
        container.appendChild(closeBtn);
      } else {
        // If full screen, maybe need a back button setup?
        // Existing code didn't have a clear back button in header for relationships!
        // It looks like it relied on browser back or specialized UI?
        // Let's check the view...
        // The code shows `header.innerHTML = ...` but no back button explicit in header var creation.
        // Wait, line 1563: `header.innerHTML = '<h1>...</h1>'`.
        // So there was NO back button before? That's a bug or I missed it.
        // Ah, no, `goalsScreen` usually has a bottom nav or something?
        // Let's just add one to be safe.
        const backBtn = el("button", "btn btnSecondary", "← Back");
        backBtn.onclick = () => { this.screen = "game"; this.render(); };
        container.appendChild(backBtn);
      }

      const header = el("div", "screenHeader");
      header.innerHTML = `<h1>🤝 ${t("relationships.title")}</h1>`;
      container.appendChild(header);

      const runAction = (actionId) => {
        try {
          if (Alive.actions?.applyAction) {
            Alive.actions.applyAction(actionId, { player: p, game: this.game });
            const title = t("action." + actionId + ".title");
            this.showToast("�?� " + title);

          }
          Alive.storage?.save(this.game.getState());
          this.render();

        } catch (e) {
          console.error("Relationship action error:", e);

        }

      };

      const sectionTitle = (text) => {
        const h = el("div", "statLabel", text);
        h.style.textAlign = "left";
        h.style.marginTop = "12px";
        return h;

      };

      // Partner + Kids
      container.appendChild(sectionTitle("💍 " + t("relationships.section.partnerKids")));
      const partnerCard = el("div", "chartContainer");
      if (p.partner) {
        partnerCard.appendChild(renderMiniProgressRow(
          `${p.partner.gender === "F" ? "👩" : "👨"} ${p.partner.name} · ${t("marriage." + p.marriageStatus)}`,
          p.partner.relationshipScore || 50,
          "#ff6b9d"
        ));

      } else {
        partnerCard.appendChild(el("div", "statLabel", t("relationships.none.partner")));

      }

      const partnerActions = el("div", "eventChoices");
      if (p.partner) {
        if (p.marriageStatus === "dating") {
          const dateBtn = el("button", "choiceBtn", "🌹 " + t("action.romantic_date.title"));
          dateBtn.onclick = () => runAction("romantic_date");
          partnerActions.appendChild(dateBtn);

          const proposeBtn = el("button", "choiceBtn", "💍 " + t("action.propose_marriage.title"));
          proposeBtn.onclick = () => runAction("propose_marriage");
          partnerActions.appendChild(proposeBtn);
        } else if (p.marriageStatus === "married" || p.marriageStatus === "engaged") {
          const dateBtn = el("button", "choiceBtn", "🌹 " + t("action.romantic_date.title"));
          dateBtn.onclick = () => runAction("romantic_date");
          partnerActions.appendChild(dateBtn);

          if (p.partner.relationshipScore < 40) {
            const counselBtn = el("button", "choiceBtn", "🛋️ " + t("action.marriage_counseling.title"));
            counselBtn.onclick = () => runAction("marriage_counseling");
            partnerActions.appendChild(counselBtn);
          }
        }
      } else {
        const findBtn = el("button", "choiceBtn", "🔍 " + t("action.find_partner.title"));
        findBtn.onclick = () => runAction("find_partner");
        partnerActions.appendChild(findBtn);
      }
      partnerCard.appendChild(partnerActions);

      const kids = Array.isArray(p.children) ? p.children : [];
      if (kids.length > 0) {
        kids.slice(0, 4).forEach((c) => {
          const emoji = c.age < 3 ? "👶" : c.gender === "F" ? (c.age < 13 ? "👧" : "👩") : (c.age < 13 ? "👦" : "👨");
          const score = Number(c.relationship) || 50;
          partnerCard.appendChild(renderMiniProgressRow(`${emoji} ${c.name} · ${c.age}y`, score, "#ffd43b"));

        });

      } else {
        partnerCard.appendChild(el("div", "statLabel", t("relationships.none.kids")));

      }
      container.appendChild(partnerCard);

      // Parents + Siblings
      container.appendChild(sectionTitle("🏠 " + t("relationships.section.family")));
      const familyCard = el("div", "chartContainer");

      const mother = p.parents?.mother;
      const father = p.parents?.father;

      if (mother) {
        familyCard.appendChild(renderMiniProgressRow(
          `👩 ${mother.name} · ${mother.alive === false ? t("relationships.status.deceased") : mother.age + "y"}`,
          mother.alive === false ? 0 : (mother.relationshipScore || 50),
          "#74c0fc"
        ));

      }
      if (father) {
        familyCard.appendChild(renderMiniProgressRow(
          `👨 ${father.name} · ${father.alive === false ? t("relationships.status.deceased") : father.age + "y"}`,
          father.alive === false ? 0 : (father.relationshipScore || 50),
          "#74c0fc"
        ));

      }

      const siblings = Array.isArray(p.siblings) ? p.siblings : [];
      if (siblings.length > 0) {
        siblings.slice(0, 3).forEach((s) => {
          const emoji = s.gender === "F" ? "👩" : "👨";
          familyCard.appendChild(renderMiniProgressRow(
            `${emoji} ${s.name} · ${s.alive === false ? t("relationships.status.deceased") : s.age + "y"}`,
            s.alive === false ? 0 : (s.relationshipScore || 50),
            "#51cf66"
          ));

        });

      } else {
        familyCard.appendChild(el("div", "statLabel", t("relationships.none.siblings")));

      }

      const familyActions = el("div", "eventChoices");
      const callBtn = el("button", "choiceBtn", "�? " + t("action.call_family.title"));
      callBtn.onclick = () => runAction("call_family");
      familyActions.appendChild(callBtn);

      const visitBtn = el("button", "choiceBtn", "🏠 " + t("action.visit_family.title"));
      visitBtn.onclick = () => runAction("visit_family");
      familyActions.appendChild(visitBtn);

      familyCard.appendChild(familyActions);
      container.appendChild(familyCard);

      // Friends
      container.appendChild(sectionTitle("🫂 " + t("relationships.section.friends")));
      const friendsCard = el("div", "chartContainer");
      const friends = Array.isArray(p.friends) ? p.friends : [];
      const aliveFriends = friends.filter((f) => f && f.alive !== false);
      if (aliveFriends.length > 0) {
        aliveFriends.slice(0, 5).forEach((f) => {
          const personality = Array.isArray(f.personality) ? f.personality.slice(0, 2).join(", ") : "";
          friendsCard.appendChild(renderMiniProgressRow(
            `${f.gender === "F" ? "👩" : "👨"} ${f.name}${personality ? " · " + personality : ""}`,
            f.closeness || 50,
            "#ff6b9d"
          ));

        });

      } else {
        friendsCard.appendChild(el("div", "statLabel", t("relationships.none.friends")));

      }
      const friendActions = el("div", "eventChoices");
      if (aliveFriends.length > 0) {
        const hangoutBtn = el("button", "choiceBtn", "🎉 " + t("action.hangout_friends.title"));
        hangoutBtn.onclick = () => runAction("hangout_friends");
        friendActions.appendChild(hangoutBtn);

      }
      if (friends.length < 5) {
        const makeFriendBtn = el("button", "choiceBtn", "🤝 " + t("action.make_friends.title"));
        makeFriendBtn.onclick = () => runAction("make_friends");
        friendActions.appendChild(makeFriendBtn);

      }
      friendsCard.appendChild(friendActions);
      container.appendChild(friendsCard);

      // Pets
      container.appendChild(sectionTitle("🐾 " + t("relationships.section.pets")));
      const petsCard = el("div", "chartContainer");
      const pets = Array.isArray(p.pets) ? p.pets : [];
      const alivePets = pets.filter((pt) => pt && pt.alive !== false);
      const hasDog = alivePets.some(pt => pt.type === "dog");

      if (alivePets.length > 0) {
        alivePets.slice(0, 4).forEach((pt) => {
          const emoji = String(pt.type || "other").toLowerCase() === "dog" ? "🐕" : String(pt.type || "other").toLowerCase() === "cat" ? "🐈" : "🐾";
          const annualCost = Alive.relationships?.getPetAnnualCost?.(pt) || 0;
          petsCard.appendChild(renderMiniProgressRow(
            `${emoji} ${pt.name} · ${pt.age}y · $${annualCost}/yr`,
            pt.bond || 50,
            "#ffd43b"
          ));

        });

      } else {
        petsCard.appendChild(el("div", "statLabel", t("relationships.none.pets")));

      }

      const petActions = el("div", "eventChoices");

      // Adopt buttons (only if player can afford)
      if (p.age >= 16) {
        if ((p.money || 0) >= 300) {
          const adoptDogBtn = el("button", "choiceBtn", "🐕 " + t("action.adopt_dog.title"));
          adoptDogBtn.onclick = () => runAction("adopt_dog");
          petActions.appendChild(adoptDogBtn);

        }
        if ((p.money || 0) >= 150) {
          const adoptCatBtn = el("button", "choiceBtn", "🐈 " + t("action.adopt_cat.title"));
          adoptCatBtn.onclick = () => runAction("adopt_cat");
          petActions.appendChild(adoptCatBtn);

        }

      }

      // Interaction buttons (only if has pets)
      if (alivePets.length > 0) {
        const playBtn = el("button", "choiceBtn", "🎾 " + t("action.play_with_pet.title"));
        playBtn.onclick = () => runAction("play_with_pet");
        petActions.appendChild(playBtn);

      }

      if (hasDog) {
        const walkBtn = el("button", "choiceBtn", "🦮 " + t("action.walk_dog.title"));
        walkBtn.onclick = () => runAction("walk_dog");
        petActions.appendChild(walkBtn);

      }

      petsCard.appendChild(petActions);
      container.appendChild(petsCard);

      const backBtn = el("button", "btn btnSecondary", t("ui.back"));
      backBtn.onclick = () => {
        const target = this.prevScreen || "game";
        this.prevScreen = null;
        this.screen = target;
        this.render();

      };
      container.appendChild(backBtn);

      this.rootEl.appendChild(container);

    }

    // ========================================================================
    // SKILLS SCREEN
    // ========================================================================

    renderSkills() {
      const p = this.game?.player;
      if (!p) {
        this.showMenu();
        return;

      }

      const container = el("div", "screen goalsScreen");

      // Header
      const header = el("div", "screenHeader");
      header.innerHTML = `<h1>🎯 ${t("skills.title")}</h1>`;
      container.appendChild(header);

      // Skill level helper
      const getSkillLevel = (value) => {
        if (value >= 90) return { name: t("skills.level.master"), color: "#ffd700" };
        if (value >= 70) return { name: t("skills.level.expert"), color: "#a78bfa" };
        if (value >= 50) return { name: t("skills.level.proficient"), color: "#00d4ff" };
        if (value >= 30) return { name: t("skills.level.intermediate"), color: "#51cf66" };
        if (value >= 10) return { name: t("skills.level.beginner"), color: "#74c0fc" };
        return { name: t("skills.level.novice"), color: "#9ca3af" };

      };

      // Main Skills Section
      const mainSkillsTitle = el("div", "statLabel", "📊 " + t("skills.section.main"));
      mainSkillsTitle.style.textAlign = "left";
      mainSkillsTitle.style.marginBottom = "8px";
      container.appendChild(mainSkillsTitle);

      const skillsData = [
        { id: "sports", icon: "🏋️", key: "skills.sports", value: p.sportsSkill || 0, color: "#51cf66", effect: t("skills.effect.sports") },
        { id: "business", icon: "📊", key: "skills.business", value: p.businessSkill || 0, color: "#00d4ff", effect: t("skills.effect.business") },
        { id: "investing", icon: "📈", key: "skills.investing", value: p.investingSkill || 0, color: "#ffd43b", effect: t("skills.effect.investing") },
        { id: "career", icon: "💼", key: "skills.career", value: p.careerSkill || 0, color: "#74c0fc", effect: t("skills.effect.career") },
        { id: "social", icon: "🤝", key: "skills.social", value: p.socialSkill || 0, color: "#ff6b9d", effect: t("skills.effect.social") }
      ];

      const skillsCard = el("div", "chartContainer");
      skillsData.forEach(skill => {
        const level = getSkillLevel(skill.value);
        const row = el("div", "skillRow");
        row.style.marginBottom = "12px";
        row.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-weight: 600;">${skill.icon} ${t(skill.key)}</span>
            <span style="font-size: 12px; color: ${level.color}; font-weight: 600;">${level.name} (${skill.value})</span>
          </div>
          <div style="height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">
            <div style="height: 100%; width: ${skill.value}%; background: ${skill.color}; border-radius: 4px; transition: width 0.3s;"></div>
          </div>
          <div style="font-size: 10px; color: rgba(255,255,255,0.5); margin-top: 4px;">${skill.effect}</div>
        `;
        skillsCard.appendChild(row);

      });
      container.appendChild(skillsCard);

      // Hobbies Section
      const hobbiesTitle = el("div", "statLabel", "🎨 " + t("skills.section.hobbies"));
      hobbiesTitle.style.textAlign = "left";
      hobbiesTitle.style.marginTop = "16px";
      hobbiesTitle.style.marginBottom = "8px";
      container.appendChild(hobbiesTitle);

      const hobbyIcons = {
        music: "🎸",
        art: "🎨",
        coding: "💻",
        cooking: "👨‍🍳",
        gaming: "🎮",
        photography: "📷",
        writing: "�?�️"

      };

      const hobbySkills = p.hobbySkills && typeof p.hobbySkills === "object" ? p.hobbySkills : {};
      const mainHobbyId = typeof p.mainHobbyId === "string" && p.mainHobbyId.trim() ? p.mainHobbyId.trim() : null;

      const hobbiesCard = el("div", "chartContainer");

      // Show main hobby prominently
      if (mainHobbyId) {
        const mainLevel = hobbySkills[mainHobbyId] || 0;
        const mainLevelInfo = getSkillLevel(mainLevel);
        const mainHobbyRow = el("div", "skillRow");
        mainHobbyRow.style.marginBottom = "16px";
        mainHobbyRow.style.padding = "12px";
        mainHobbyRow.style.background = "rgba(0, 212, 255, 0.1)";
        mainHobbyRow.style.borderRadius = "12px";
        mainHobbyRow.style.border = "1px solid rgba(0, 212, 255, 0.3)";
        mainHobbyRow.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-weight: 700; font-size: 14px;">${hobbyIcons[mainHobbyId] || "🎯"} ${t("skills.hobby." + mainHobbyId)} <span style="font-size: 10px; color: #00d4ff;">(${t("skills.mainHobby")})</span></span>
            <span style="font-size: 12px; color: ${mainLevelInfo.color}; font-weight: 600;">${mainLevelInfo.name}</span>
          </div>
          <div style="height: 10px; background: rgba(255,255,255,0.1); border-radius: 5px; overflow: hidden;">
            <div style="height: 100%; width: ${mainLevel}%; background: linear-gradient(90deg, #00d4ff, #7c3aed); border-radius: 5px;"></div>
          </div>
          <div style="font-size: 11px; color: rgba(255,255,255,0.7); margin-top: 6px;">${t("skills.hobby." + mainHobbyId + ".desc")}</div>
        `;
        hobbiesCard.appendChild(mainHobbyRow);

      }

      // Show other hobbies
      const otherHobbies = Object.entries(hobbySkills).filter(([id]) => id !== mainHobbyId && hobbySkills[id] > 0);
      if (otherHobbies.length > 0) {
        const otherTitle = el("div", "statLabel", t("skills.otherHobbies"));
        otherTitle.style.fontSize = "11px";
        otherTitle.style.marginBottom = "8px";
        hobbiesCard.appendChild(otherTitle);

        otherHobbies.forEach(([hobbyId, level]) => {
          const levelInfo = getSkillLevel(level);
          hobbiesCard.appendChild(renderMiniProgressRow(
            `${hobbyIcons[hobbyId] || "🎯"} ${t("skills.hobby." + hobbyId)}`,
            level,
            levelInfo.color
          ));

        });

      }

      // If no hobbies yet
      if (!mainHobbyId && otherHobbies.length === 0) {
        const noHobby = el("div", "statLabel", t("skills.noHobby"));
        noHobby.style.textAlign = "center";
        noHobby.style.padding = "20px";
        noHobby.style.color = "rgba(255,255,255,0.5)";
        hobbiesCard.appendChild(noHobby);

      }

      container.appendChild(hobbiesCard);

      // Skill Effects Summary
      const effectsTitle = el("div", "statLabel", "⚡ " + t("skills.section.effects"));
      effectsTitle.style.textAlign = "left";
      effectsTitle.style.marginTop = "16px";
      effectsTitle.style.marginBottom = "8px";
      container.appendChild(effectsTitle);

      const effectsCard = el("div", "chartContainer");
      effectsCard.style.fontSize = "12px";

      const effects = [];
      if ((p.sportsSkill || 0) >= 30) effects.push("�?� " + t("skills.bonus.health"));
      if ((p.businessSkill || 0) >= 30) effects.push("�?� " + t("skills.bonus.business"));
      if ((p.investingSkill || 0) >= 30) effects.push("�?� " + t("skills.bonus.investing"));
      if ((p.careerSkill || 0) >= 30) effects.push("�?� " + t("skills.bonus.career"));
      if ((p.socialSkill || 0) >= 30) effects.push("�?� " + t("skills.bonus.social"));

      if (effects.length > 0) {
        effectsCard.innerHTML = effects.map(e => `<div style="margin-bottom: 6px; color: #51cf66;">${e}</div>`).join("");

      } else {
        effectsCard.innerHTML = `<div style="color: rgba(255,255,255,0.5); text-align: center; padding: 10px;">${t("skills.noBonus")}</div>`;

      }
      container.appendChild(effectsCard);

      // Back button
      const backBtn = el("button", "btn btnSecondary", t("ui.back"));
      backBtn.onclick = () => {
        const target = this.prevScreen || "game";
        this.prevScreen = null;
        this.screen = target;
        this.render();

      };
      container.appendChild(backBtn);

      this.rootEl.appendChild(container);

    }

    renderRichList(containerEl) {
      const target = containerEl || this.rootEl;
      if (!containerEl) target.innerHTML = "";

      const container = el("div", "screen richListScreen");

      // Close Button for Overlay
      const closeBtn = el("button", "btn btnSecondary", "×");
      closeBtn.style.position = "absolute";
      closeBtn.style.top = "10px";
      closeBtn.style.right = "10px";
      closeBtn.style.width = "40px";
      closeBtn.style.zIndex = "10";
      closeBtn.onclick = () => this.hideOverlay();

      if (containerEl) {
        container.appendChild(closeBtn);
      }

      const header = el("div", "achieveHeader");

      if (!containerEl) {
        const backBtn = el("button", "btn btnMini", "←");
        backBtn.onclick = () => {
          const prev = this.prevScreen;
          this.prevScreen = null;
          if (prev === "game") this.showGame();
          else if (prev === "summary") this.showSummary();
          else this.showMenu();
        };
        header.appendChild(backBtn);
      }

      const title = el("h1", "achieveTitle");
      title.innerHTML = icon("trophy") + " " + t("richlist.title");
      header.appendChild(title);
      container.appendChild(header);

      const p = this.game?.player || null;
      const ranking = Alive.richList?.buildRankingWithPlayer ? Alive.richList.buildRankingWithPlayer(p) : [];
      const top10 = ranking.slice(0, 10);
      const playerEntry = ranking.find((r) => r.type === "player") || null;

      const npcSorted = Alive.richList?.getSortedBillionairesDesc ? Alive.richList.getSortedBillionairesDesc() : [];
      const threshold = npcSorted.length ? (npcSorted[npcSorted.length - 1].netWorth || 0) : 0;
      const playerRank = Alive.richList?.getPlayerRankByNetWorth && p ? Alive.richList.getPlayerRankByNetWorth(p.netWorth) : null;

      const msg = el("div", "chartContainer");
      const msgTitle = el("div", "statLabel", t("richlist.top10"));
      msgTitle.style.textAlign = "left";
      msg.appendChild(msgTitle);

      const message = el("div", "statLabel");
      message.style.textAlign = "left";
      if (p) {
        const playerNW = Number(p.netWorth) || 0;
        const thresholdText = formatMoney(threshold);
        if (playerNW >= threshold) {
          const rankText = String(playerRank || 1);
          message.textContent = t("richlist.position.onList", { rank: rankText });

        } else {
          message.textContent = t("richlist.position.belowThreshold", { threshold: thresholdText });

        }

      } else {
        message.textContent = t("ui.newLife");

      }
      msg.appendChild(message);
      container.appendChild(msg);

      const table = el("div", "richListTable");
      const headerRow = el("div", "richListRow richListHeader");
      headerRow.innerHTML = `
        <div>${t("richlist.rank")}</div>
        <div>${t("richlist.name")}</div>
        <div>${t("richlist.country")}</div>
        <div>${t("richlist.industry")}</div>
        <div>${t("richlist.netWorth")}</div>
      `;
      table.appendChild(headerRow);

      const renderRow = (row) => {
        const r = el("div", "richListRow" + (row.type === "player" ? " player" : ""));
        const flag = getCountryFlag(row.countryId);
        const industryKey = "richlist.industry." + (row.industry || "tech");
        r.innerHTML = `
          <div>#${row.rank}</div>
          <div>${row.displayName}</div>
          <div>${flag}</div>
          <div>${t(industryKey)}</div>
          <div>${formatMoney(row.netWorth || 0)}</div>
        `;
        table.appendChild(r);

      };

      top10.forEach(renderRow);

      if (playerEntry && !top10.some((r) => r.type === "player")) {
        const divider = el("div", "richListDivider", "...");
        table.appendChild(divider);

        const playerIdx = ranking.findIndex((r) => r.type === "player");
        const start = Math.max(0, playerIdx - 1);
        const end = Math.min(ranking.length, playerIdx + 2);
        ranking.slice(start, end).forEach(renderRow);

      }

      container.appendChild(table);
      this.rootEl.appendChild(container);

    }

    renderActionsOverlay() {
      const overlay = el("div", "eventOverlay");
      const modal = el("div", "eventModal");

      const header = el("div", "eventHeader");
      header.innerHTML = `
        <div class="eventEmoji">🎯</div>
        <h2 class="eventTitle">${t("actions.title")}</h2>
      `;
      modal.appendChild(header);

      const desc = el("p", "eventDesc", t("actions.desc"));
      modal.appendChild(desc);

      const maxCount = Alive.actions?.getActionMaxCount
        ? Alive.actions.getActionMaxCount(this.game.player)
        : 1;

      const chosen = new Set(Array.isArray(this.game.pendingActionIds) ? this.game.pendingActionIds : []);
      const list = el("div", "eventChoices");

      const available = Alive.actions?.getAvailableActions
        ? Alive.actions.getAvailableActions(this.game.player)
        : [];

      const openBrowse = (type) => {
        this.actionsSubscreen = type;
        this.render();

      };

      const closeBrowse = () => {
        this.actionsSubscreen = null;
        this.render();

      };

      const renderBrowseList = (type) => {
        const player = this.game.player;
        const cityId = player.cityId || player.city;
        const isHouses = type === "houses";

        const header2 = el("div", "eventHeader");
        header2.innerHTML = `
          <div class="eventEmoji">${isHouses ? "🏘️" : "🚙"}</div>
          <h2 class="eventTitle">${t(isHouses ? "actions.browse.houses" : "actions.browse.cars")}</h2>
        `;
        modal.appendChild(header2);

        const backBtn = el("button", "choiceBtn", "← " + t("actions.browse.back"));
        backBtn.onclick = closeBrowse;
        modal.appendChild(backBtn);

        let options = [];
        if (isHouses) {
          options = Alive.cities?.getCityAvailableBuildings ? Alive.cities.getCityAvailableBuildings(cityId) : [];
        } else {
          options = Alive.cities?.getCityAvailableVehicles ? Alive.cities.getCityAvailableVehicles(cityId) : [];
        }

        options
          .filter((o) => (player.money || 0) >= (o?.price || 0))
          .forEach((o) => {
            const id = o.id;
            // Use generic buy action but passing the asset ID
            const buyActionId = isHouses ? "buy_house_gen" : "buy_car_gen";
            // Note: Actions module might need update to handle generic 'buy asset' action with ID parameter.
            // For now, mapping to existing logic is tricky without updating Actions.js.
            // But the UI just sets 'chosen'. Game logic processes it.
            // I should probably inject the specific ID into the action paylod?
            // The current system uses string IDs.

            // Temporary Hack: use a dynamic action ID format if game supports it, or we rely on 'player.buyHouse' direct call in renderAssetsOverlay.
            // Browse list in Actions is usually for "Events". If the user wants to buy assets, they usually go to Assets screen.
            // But if this is "Search for House" action...
            // I'll skip complex action logic update and just use the ID as the action choice if the system allows.
            // Only 'buy_house_apartment' etc exist in actions.js likely.
            // This part of UI is for "Year Actions".
            // If I return here, I might break "Search for House" action flow if I don't update actions.js.
            // I will leave this as is for now or use a placeholder, assuming 'Assets' screen is the primary way to buy.

            // Visual only for now
            const icon = isHouses ? "🏠" : "🚗";
            const btn = el("button", "choiceBtn");

            btn.innerHTML = `
              <span class="choiceLabel">${icon} ${o.name || id}</span>
              <span class="choiceEffect">${formatMoney(o.price || 0)}</span>
            `;

            // This browse UI seems to be for selecting *Pending Actions*.
            // If I select 'poor_house_0', the game loop needs to handle it.
            // If I can't update game loop easily, I should perhaps disable this browse flow or point to Assets UI.

            btn.onclick = () => {
              // If I click this, it adds to pending actions.
              // I'll assume I can add "buy_asset:ID" string?
              const actionString = `buy_asset:${id}`;
              chosen.add(actionString);
              this.game.setYearActions(Array.from(chosen));
              this.render();
            };

            list.appendChild(btn);

          });

        modal.appendChild(list);

      };

      if (this.actionsSubscreen === "houses") {
        renderBrowseList("houses");
        overlay.appendChild(modal);
        return overlay;

      }

      if (this.actionsSubscreen === "cars") {
        renderBrowseList("cars");
        overlay.appendChild(modal);
        return overlay;

      }

      available.forEach((a) => {
        const btn = el("button", "choiceBtn" + (chosen.has(a.id) ? " selected" : ""));
        const badges = Alive.actions?.buildEffectBadges ? Alive.actions.buildEffectBadges(a) : [];
        const hint = badges
          .map((b) => `${b.icon}${b.value || ""}`)
          .join(" ");

        const icon = a.icon ? a.icon + " " : "";

        btn.innerHTML = `
          <span class="choiceLabel">${icon}${t(a.titleKey)}</span>
          ${hint ? `<span class="choiceEffect">${hint}</span>` : ""}
        `;

        btn.onclick = () => {
          if (a.uiType === "browse_houses") {
            openBrowse("houses");
            return;

          }
          if (a.uiType === "browse_cars") {
            openBrowse("cars");
            return;

          }
          const has = chosen.has(a.id);
          if (has) {
            chosen.delete(a.id);

          } else {
            if (chosen.size >= maxCount) return;
            chosen.add(a.id);

          }
          this.game.setYearActions(Array.from(chosen));
          this.render();

        };

        list.appendChild(btn);

      });

      modal.appendChild(list);

      const footer = el("div", "eventChoices");

      const confirmBtn = el(
        "button",
        "choiceBtn",
        `${t("actions.confirm")} (${chosen.size}/${maxCount})`
      );
      confirmBtn.onclick = () => {
        try {
          this.actionsSubscreen = null;
          this.game.setYearActions(Array.from(chosen));
          this.game.commitYearActionsAndAdvance();
          Alive.storage?.save(this.game.getState());

        } catch (e) {
          console.error("Actions Commit Error:", e);

        }

      };
      footer.appendChild(confirmBtn);

      const skipBtn = el("button", "choiceBtn", t("actions.skip"));
      skipBtn.onclick = () => {
        try {
          this.actionsSubscreen = null;
          this.game.setYearActions([]);
          this.game.commitYearActionsAndAdvance();
          Alive.storage?.save(this.game.getState());

        } catch (e) {
          console.error("Actions Skip Error:", e);

        }

      };
      footer.appendChild(skipBtn);

      modal.appendChild(footer);

      // Age-based content filtering
      if (p && p.age < 6) {
        // Too young - show educational message
        const youngMsg = el("div", "selfdevEmpty");
        youngMsg.innerHTML = `
          <div style="text-align:center; padding:60px 20px;">
            <div style="font-size:48px; margin-bottom:20px;">🧸</div>
            <div style="font-size:20px; font-weight:600; margin-bottom:12px;">${t("selfdev.tooyoung") || "You're too young for formal education"}</div>
            <div style="font-size:16px; color:var(--text-secondary); line-height:1.5;">
              ${t("selfdev.tooyoung_desc") || "Enjoy your childhood! School starts at age 6."}
            </div>
          </div>
        `;
        content.appendChild(youngMsg);
      } else if (p && p.age < 18) {
        // School age - limited content
        const schoolMsg = el("div", "selfdevSchool");
        schoolMsg.innerHTML = `
          <div style="text-align:center; padding:40px 20px;">
            <div style="font-size:36px; margin-bottom:16px;">🎒</div>
            <div style="font-size:18px; font-weight:600; margin-bottom:12px;">${t("selfdev.school") || "You're in school!"}</div>
            <div style="font-size:15px; color:var(--text-secondary); line-height:1.5;">
              ${t("selfdev.school_desc") || "Focus on your studies. More opportunities will appear after graduation."}
            </div>
          </div>
        `;
        content.appendChild(schoolMsg);
      } else {
        // Adult - full content
        const adultMsg = el("div", "selfdevEmpty");
        adultMsg.innerHTML = `
          <div style="text-align:center; padding:40px 20px;">
            <div style="font-size:36px; margin-bottom:16px;">🎓</div>
            <div style="font-size:18px; font-weight:600; margin-bottom:12px;">${t("selfdev.adult") || "Continue Learning"}</div>
            <div style="font-size:15px; color:var(--text-secondary); line-height:1.5;">
              ${t("selfdev.adult_desc") || "Education opportunities will appear through life events."}
            </div>
          </div>
        `;
        content.appendChild(adultMsg);
      }

      modal.appendChild(content);
      overlay.appendChild(modal);
      return overlay;

    }

    renderAssetsOverlay(containerEl) {
      const target = containerEl || el("div", "eventOverlay");
      if (!containerEl) {
        target.onclick = (e) => {
          if (e.target === target) {
            this.assetsOpen = false;
            this.render();
          }
        };
      }

      const modal = el("div", "eventModal assetsModal");
      modal.classList.add("assetsModal");

      const p = this.game?.player;
      const cityId = p?.cityId || p?.city;
      const city = Alive.cities?.getCityById ? Alive.cities.getCityById(cityId) : null;

      const header = el("div", "eventHeader");
      header.innerHTML = `
        <div class="eventEmoji">🏦</div>
        <h2 class="eventTitle">${t("assets.title")}</h2>
      `;
      modal.appendChild(header);

      const closeBtn = el("button", "choiceBtn", "�?� " + t("assets.close"));
      closeBtn.onclick = () => {
        this.assetsOpen = false;
        if (containerEl) this.hideOverlay();
        else this.render();
      };
      modal.appendChild(closeBtn);

      const content = el("div", "assetsContent");

      const houseSection = el("div", "assetsSection");
      const currentHouse = p?.housing || "apartment";
      const currentHouseValue = typeof p?.getHousingEquity === "function" ? p.getHousingEquity() : 0;
      const houseIcon = getHouseVisual(currentHouse, cityId).emoji;

      houseSection.innerHTML = `
        <div class="assetsSectionTitle">${houseIcon} ${t("assets.house")}</div>
        <div class="assetsRow">
          <div class="assetsLeft">
            <div class="assetsLabel">${t("assets.current")}</div>
            <div class="assetsValue">${currentHouse ? currentHouse : t("assets.none")}</div>
            <div class="assetsMeta">📍 ${getCityDisplayName(cityId)}</div>
          </div>
          <div class="assetsRight">
            <div class="assetsPrice">${formatMoney(currentHouseValue)}</div>
          </div>
        </div>
      `;

      if (currentHouse && currentHouse !== "apartment") {
        const sellBtn = el("button", "choiceBtn");
        const sellAmount = Math.max(0, Math.round(currentHouseValue || 0));
        sellBtn.textContent = t("assets.sellFor", { amount: formatMoney(sellAmount) });
        sellBtn.onclick = () => {
          if (!this.game?.player) return;
          this.game.player.sellHouse?.();
          Alive.storage?.save(this.game.getState());
          this.render();
        };
        houseSection.appendChild(sellBtn);

      } else if (!currentHouse || currentHouse === "apartment") {
        // Note: No ad here - ads only in crisis moments (mercy principle)
      }

      const availableHousesTitle = el("div", "assetsSubTitle", t("assets.available", { city: getCityDisplayName(cityId) }));
      houseSection.appendChild(availableHousesTitle);

      const houseList = el("div", "assetsList");
      const availableBuildings = Alive.cities?.getCityAvailableBuildings ? Alive.cities.getCityAvailableBuildings(cityId) : [];
      if (!availableBuildings || availableBuildings.length === 0) {
        console.warn("No buildings available for city:", cityId);
        // Show empty state message
        const emptyMsg = el("div", "assetsEmpty");
        emptyMsg.innerHTML = `<div style="text-align:center; padding:40px; opacity:0.7;">
          <div style="font-size:24px; margin-bottom:10px;">🏗️</div>
          <div style="font-size:14px; color:var(--text-secondary);">${t("assets.noBuildings") || "No buildings available in this city"}</div>
        </div>`;
        houseSection.appendChild(emptyMsg);
        return overlay;
      }

      availableBuildings.forEach((b) => {
        const id = b.id;
        const row = el("div", "assetsRow");
        const price = Math.round(b.price || 0);
        const canBuy = (p?.money || 0) >= price;

        const hv = getHouseVisual(id, cityId);
        if (hv.imageUrl) {
          row.style.backgroundImage = `linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.75) 100%), url('${hv.imageUrl}')`;
          row.style.backgroundSize = "cover";
          row.style.backgroundPosition = "center";
        }

        row.innerHTML = `
          <div class="assetsLeft">
             <div class="assetsValue">${hv.emoji} ${b.description || id}</div>
             <div class="assetsMeta" style="font-size:10px; opacity:0.7;">Class: ${b.class}</div>
          </div>
          <div class="assetsRight">
            <div class="assetsPrice">${formatMoney(price)}</div>
          </div>
        `;

        const buyBtn = el("button", "choiceBtn" + (!canBuy ? " disabled" : ""), canBuy ? t("assets.buyFor", { amount: formatMoney(price) }) : t("assets.notEnough"));
        buyBtn.onclick = () => {
          if (!canBuy) return;
          this.game.player.buyHouse?.(id, price, b.maintenanceCost || 0);
          Alive.storage?.save(this.game.getState());
          this.render();
        };
        row.appendChild(buyBtn);
        houseList.appendChild(row);
      });
      houseSection.appendChild(houseList);

      const carSection = el("div", "assetsSection");
      const currentCar = p?.car || "";
      const currentCarValue = typeof p?.getCarValue === "function" ? p.getCarValue() : 0;
      const carVisual = getCarVisual(currentCar, cityId);

      carSection.innerHTML = `
        <div class="assetsSectionTitle">${carVisual.emoji} ${t("assets.car")}</div>
        <div class="assetsRow">
          <div class="assetsLeft">
            <div class="assetsLabel">${t("assets.current")}</div>
            <div class="assetsValue">${currentCar ? (Alive.Assets?.getVehicleById(currentCar)?.name || currentCar) : t("assets.none")}</div>
          </div>
          <div class="assetsRight">
            <div class="assetsPrice">${formatMoney(currentCarValue)}</div>
          </div>
        </div>
      `;

      if (currentCar) {
        const sellBtn = el("button", "choiceBtn");
        const sellAmount = Math.max(0, Math.round(currentCarValue || 0));
        sellBtn.textContent = t("assets.sellFor", { amount: formatMoney(sellAmount) });
        sellBtn.onclick = () => {
          if (!this.game?.player) return;
          this.game.player.sellCar?.();
          Alive.storage?.save(this.game.getState());
          this.render();
        };
        carSection.appendChild(sellBtn);
      } else {
        // Note: No ad here - ads only in crisis moments (mercy principle)
      }

      const availableCarsTitle = el("div", "assetsSubTitle", t("assets.available", { city: getCityDisplayName(cityId) }));
      carSection.appendChild(availableCarsTitle);

      const carList = el("div", "assetsList");
      const availableVehicles = Alive.cities?.getCityAvailableVehicles ? Alive.cities.getCityAvailableVehicles(cityId) : [];
      if (!availableVehicles || availableVehicles.length === 0) {
        console.warn("No vehicles available for city:", cityId);
        // Show empty state message
        const emptyMsg = el("div", "assetsEmpty");
        emptyMsg.innerHTML = `<div style="text-align:center; padding:40px; opacity:0.7;">
          <div style="font-size:24px; margin-bottom:10px;">🚗</div>
          <div style="font-size:14px; color:var(--text-secondary);">${t("assets.noVehicles") || "No vehicles available in this city"}</div>
        </div>`;
        carSection.appendChild(emptyMsg);
        return overlay;
      }

      availableVehicles.forEach((v) => {
        const id = v.id;
        const row = el("div", "assetsRow");
        const price = Math.round(v.price || 0);
        const canBuy = (p?.money || 0) >= price;
        const cv = getCarVisual(id, cityId);

        if (cv.imageUrl) {
          row.style.backgroundImage = `linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.75) 100%), url('${cv.imageUrl}')`;
          row.style.backgroundSize = "cover";
          row.style.backgroundPosition = "center";
        }

        row.innerHTML = `
          <div class="assetsLeft">
            <div class="assetsValue">${cv.emoji} ${v.name || id}</div>
            <div class="assetsMeta" style="font-size:10px; opacity:0.7;">${v.type}</div>
          </div>
          <div class="assetsRight">
            <div class="assetsPrice">${formatMoney(price)}</div>
          </div>
        `;

        const buyBtn = el("button", "choiceBtn" + (!canBuy ? " disabled" : ""), canBuy ? t("assets.buyFor", { amount: formatMoney(price) }) : t("assets.notEnough"));
        buyBtn.onclick = () => {
          if (!canBuy) return;
          this.game.player.buyCar?.(id, price, v.maintenance || 0);
          Alive.storage?.save(this.game.getState());
          this.render();
        };
        row.appendChild(buyBtn);
        carList.appendChild(row);
      });
      carSection.appendChild(carList);

      content.appendChild(houseSection);
      content.appendChild(carSection);
      modal.appendChild(content);

      target.appendChild(modal);
      if (!containerEl) return target;
    }

    showGemShop() {
      const overlay = el("div", "modalOverlay");
      overlay.onclick = () => { overlay.remove(); };

      const modal = el("div", "modal gemModal");
      modal.onclick = (e) => e.stopPropagation();

      const header = el("div", "modalHeader");
      header.innerHTML = `<div class="modalTitle">💎 ${t("shop.gems") || "Gem Shop"}</div>`;
      const closeBtn = el("button", "closeBtn", "×");
      closeBtn.onclick = () => overlay.remove();
      header.appendChild(closeBtn);
      modal.appendChild(header);

      const content = el("div", "modalContent");

      const packs = [
        { id: "small", amount: 50, price: "$0.99", color: "#60a5fa" },
        { id: "medium", amount: 150, price: "$2.49", color: "#a78bfa", popular: true },
        { id: "large", amount: 500, price: "$6.99", color: "#fbbf24" }
      ];

      packs.forEach(pack => {
        const row = el("div", "gemPack" + (pack.popular ? " packPopular" : ""));
        row.style.borderColor = pack.color;
        row.innerHTML = `
            <div class="packLeft">
               <div class="packAmount">💎 ${pack.amount}</div>
               ${pack.popular ? '<div class="packBadge">POPULAR</div>' : ''}
            </div>
            <div class="packRight">
               <button class="buyGemBtn" style="background: ${pack.color}">${pack.price}</button>
            </div>
         `;
        row.querySelector(".buyGemBtn").onclick = async () => {
          const success = await this.game.buyGems(pack.id);
          if (success) {
            overlay.remove();
            this.render();
          }
        };
        content.appendChild(row);
      });

      const freeRow = el("div", "gemPack freePack");
      freeRow.innerHTML = `
         <div class="packLeft">
            <div class="packAmount">💎 10</div>
            <div class="packLabel">${t("shop.freeGems") || "Watch Ad"}</div>
         </div>
         <div class="packRight">
            <button class="buyGemBtn adBtn">📺 ${t("ui.free") || "FREE"}</button>
         </div>
      `;
      freeRow.querySelector(".buyGemBtn").onclick = async () => {
        const success = await this.game.showRewardedAd("gems");
        if (success) {
          overlay.remove();
          this.render();
        }
      };
      content.appendChild(freeRow);

      modal.appendChild(content);
      overlay.appendChild(modal);
      this.rootEl.appendChild(overlay);
    }

    renderCharacterCreation() {
      const container = el("div", "screen createScreen");

      const header = el("div", "createHeader");
      const backBtn = el("button", "btn btnMini", "←");
      backBtn.onclick = () => this.showMenu();
      header.appendChild(backBtn);

      const title = el("div", "createTitle", t("create.title"));
      header.appendChild(title);

      container.appendChild(header);

      const state = this.createState || {
        gender: "M",
        name: getCountryAwareRandomName("kz", "M"),
        nameWasAuto: true,
        countryId: "kz",
        cityId: Alive.cities?.getDefaultCityId?.() || "almaty",
        familyWealthTier: "medium"

      };

      const card = el("div", "createCard");

      const genderRow = el("div", "createRow");
      const genderLabel = el("div", "createLabel", t("create.gender"));
      genderRow.appendChild(genderLabel);

      const genderSeg = el("div", "segmented");
      const maleBtn = el("button", "segBtn" + (state.gender === "M" ? " active" : ""), t("create.gender.m"));
      maleBtn.onclick = () => {
        this.createState.gender = "M";
        if (this.createState.nameWasAuto) {
          this.createState.name = getCountryAwareRandomName(this.createState.countryId, "M");

        }
        this.render();

      };
      genderSeg.appendChild(maleBtn);

      const femaleBtn = el("button", "segBtn" + (state.gender === "F" ? " active" : ""), t("create.gender.f"));
      femaleBtn.onclick = () => {
        this.createState.gender = "F";
        if (this.createState.nameWasAuto) {
          this.createState.name = getCountryAwareRandomName(this.createState.countryId, "F");

        }
        this.render();

      };
      genderSeg.appendChild(femaleBtn);
      genderRow.appendChild(genderSeg);

      card.appendChild(genderRow);

      const nameRow = el("div", "createRow");
      nameRow.appendChild(el("div", "createLabel", t("create.name")));
      const nameWrap = el("div", "nameRow");
      const nameInput = el("input", "textInput");
      nameInput.type = "text";
      nameInput.value = state.name || "";
      nameInput.oninput = () => {
        this.createState.name = nameInput.value;
        this.createState.nameWasAuto = false;

      };
      nameWrap.appendChild(nameInput);

      const randBtn = el("button", "btn btnSmall", t("create.randomize"));
      randBtn.onclick = () => {
        const n = getCountryAwareRandomName(this.createState.countryId, this.createState.gender);
        this.createState.name = n;
        this.createState.nameWasAuto = true;
        this.render();

      };
      nameWrap.appendChild(randBtn);
      nameRow.appendChild(nameWrap);
      card.appendChild(nameRow);

      const countryRow = el("div", "createRow");
      countryRow.appendChild(el("div", "createLabel", t("create.country")));
      const countrySelect = el("select", "selectInput");
      const countries = Alive.countries?.getAllCountries ? Alive.countries.getAllCountries() : [];
      const lang = getLang();
      const sortedCountries = [...countries].sort((a, b) => {
        const an = t(a.nameKey) || a.id || "";
        const bn = t(b.nameKey) || b.id || "";
        return an.localeCompare(bn);

      });
      sortedCountries.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = `${c.flag ? c.flag + " " : ""}${t(c.nameKey) || c.id}`;
        if (c.id === state.countryId) opt.selected = true;
        countrySelect.appendChild(opt);

      });
      countrySelect.onchange = () => {
        const prevCountryId = this.createState.countryId;
        this.createState.countryId = countrySelect.value;
        const citiesInCountry = Alive.countries?.getCitiesByCountryId
          ? Alive.countries.getCitiesByCountryId(this.createState.countryId)
          : [];
        this.createState.cityId = citiesInCountry[0]?.id || this.createState.cityId;

        if (this.createState.nameWasAuto) {
          this.createState.name = getCountryAwareRandomName(this.createState.countryId, this.createState.gender);

        } else if (!this.createState.name && prevCountryId !== this.createState.countryId) {
          this.createState.name = getCountryAwareRandomName(this.createState.countryId, this.createState.gender);
          this.createState.nameWasAuto = true;

        }
        this.render();

      };
      countryRow.appendChild(countrySelect);
      card.appendChild(countryRow);

      const cityRow = el("div", "createRow");
      cityRow.appendChild(el("div", "createLabel", t("create.city")));
      const citySelect = el("select", "selectInput");
      const citiesInCountry = Alive.countries?.getCitiesByCountryId
        ? Alive.countries.getCitiesByCountryId(state.countryId)
        : [];
      citiesInCountry.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = t(c.nameKey) || c.id;
        if (c.id === state.cityId) opt.selected = true;
        citySelect.appendChild(opt);

      });
      citySelect.onchange = () => {
        this.createState.cityId = citySelect.value;
        this.render();

      };
      cityRow.appendChild(citySelect);
      card.appendChild(cityRow);

      const wealthRow = el("div", "createRow");
      wealthRow.appendChild(el("div", "createLabel", t("create.wealth")));
      const wealthSelect = el("select", "selectInput");
      ["low", "medium", "high", "very_high"].forEach(id => {
        const opt = document.createElement("option");
        opt.value = id;
        opt.textContent = t("create.wealth." + id);
        if (id === state.familyWealthTier) opt.selected = true;
        wealthSelect.appendChild(opt);

      });
      wealthSelect.onchange = () => {
        this.createState.familyWealthTier = wealthSelect.value;
        this.render();

      };
      wealthRow.appendChild(wealthSelect);
      card.appendChild(wealthRow);

      const preview = Alive.Player.createNew({
        gender: state.gender,
        name: state.name,
        countryId: state.countryId,
        cityId: state.cityId,
        familyWealthTier: state.familyWealthTier

      });

      const previewCard = el("div", "createPreview");
      previewCard.innerHTML = `
        <div class="previewTop">
          <div class="previewPortrait">${getCharacterPortrait(preview, "previewPortraitImg")}</div>
          <div class="previewMeta">
            <div class="previewName">${preview.name}</div>
            <div class="previewLoc">${getCountryFlag(preview.countryId)} ${getCityDisplayName(preview.cityId || preview.city)}, ${getCountryDisplayName(preview.countryId)}</div>
          </div>
        </div>
        <div class="previewStats">
          <div class="previewStat">${icon("health")} ${preview.health}</div>
          <div class="previewStat">${icon("happiness")} ${preview.happiness}</div>
          <div class="previewStat">🧠 ${preview.intelligence}</div>
          <div class="previewStat">${icon("sparkle")} ${preview.attractiveness}</div>
        </div>
      `;
      card.appendChild(previewCard);

      const startBtn = el("button", "gameBtn gameBtnHero gameBtnStart", t("create.start"));
      startBtn.onclick = () => {
        if (!this.game) return;
        try {
          const playerData = preview.toJSON ? preview.toJSON() : { ...preview };
          this.game.startNewLife({ playerState: playerData });
          this.showBirthCinematic();
        } catch (e) {
          console.error("Start life error:", e);
          this.showGame();
        }
      };
      card.appendChild(startBtn);

      container.appendChild(card);
      container.appendChild(this.renderLangToggle());
      this.rootEl.appendChild(container);

    }


    // ==========================================================================
    // BIRTH CINEMATIC - Emotional First Session
    // ==========================================================================

    renderBirthCinematic() {
      if (!this.game?.player) {
        this.showGame();
        return;
      }
      const p = this.game.player;
      const container = el("div", "screen birthScreen");

      this.rootEl.appendChild(container);

      // Sequence state
      let step = 0;

      const nextStep = () => {
        container.innerHTML = "";
        step++;

        // 1. Black screen, heartbeat text
        if (step === 1) {
          container.className = "screen birthScreen fade-in";
          const text = el("div", "birthText", t("birth.intro")); // "A new life begins..."
          container.appendChild(text);
          setTimeout(nextStep, 2500);

        }

        // 2. City reveal
        else if (step === 2) {
          const cityText = el("div", "birthText", t("birth.city", { city: getCityDisplayName(p.cityId || p.city) }));
          container.appendChild(cityText);
          setTimeout(nextStep, 2500);

        }

        // 3. Name Reveal
        else if (step === 3) {
          container.className = "screen birthScreen bg-gradient fade-slow";

          const welcome = el("div", "birthWelcome", t("birth.welcome"));
          container.appendChild(welcome);

          const portraitEl = el("div", "birthEmoji scale-in");
          portraitEl.innerHTML = getCharacterPortrait(p, "birthPortrait");
          container.appendChild(portraitEl);

          const nameObj = el("div", "birthName slide-up", p.name);
          container.appendChild(nameObj);

          setTimeout(nextStep, 3000);

        }

        // 4. Stats Roll
        else if (step === 4) {
          container.className = "screen birthScreen bg-gradient";

          const portraitEl = el("div", "birthEmoji");
          portraitEl.innerHTML = getCharacterPortrait(p, "birthPortrait");
          container.appendChild(portraitEl);

          const nameObj = el("div", "birthName", p.name);
          container.appendChild(nameObj);

          const stats = el("div", "birthStats");

          const statList = [
            { iconName: "health", val: p.health, delay: 0 },
            { iconName: "happiness", val: p.happiness, delay: 200 },
            { iconName: "user", val: p.intelligence, delay: 400 },
            { iconName: "trophy", val: 50, delay: 600 } // Potential/Luck
          ];

          statList.forEach(s => {
            const row = el("div", "birthStatRow pop-in");
            row.style.animationDelay = s.delay + "ms";
            row.innerHTML = `<span class="statIcon">${icon(s.iconName)}</span> <span class="statVal">${s.val}</span>`;
            stats.appendChild(row);

          });

          container.appendChild(stats);

          const btn = el("button", "btn btnPrimary btnLarge fade-in-delayed", t("birth.start"));
          btn.style.marginTop = "40px";
          btn.onclick = () => {
            if (this.game) this.game.activeEvent = null; // Birth cinematic was the birth
            this.showGame();
          };
          container.appendChild(btn);

        }

      };

      // Start sequence
      nextStep();

    }

    // ==========================================================================
    // NEW GAME SCREEN - Character-focused, clean
    // ==========================================================================

    renderGame() {
      if (!this.game || !this.game.player) return;
      const p = this.game.player;

      // Handle Onboarding Overlay
      if (this.game.isOnboarding) {
        this.renderOnboarding();
        return;
      }

      this.rootEl.innerHTML = "";
      this.updateBackground();

      const screen = el("div", "gameScreen");

      // 1. HEADER (Mobile Only) / Desktop Sidebar content
      const header = el("div", "universalHeader");

      const leftGroup = el("div", "headerLeft");
      const hamburger = el("button", "headerHamburger");
      hamburger.innerHTML = `<i class="ph ph-list"></i><span class="headerMenuLabel">${t("ui.menu") || "Menu"}</span>`;
      hamburger.setAttribute("title", t("ui.activities") || "Activities");
      hamburger.onclick = () => {
        // Prevent menu toggle during game transitions
        if (this.game?.isProcessingYear) {
          this.showToast("Please wait...");
          return;
        }
        this.isMenuOpen = !this.isMenuOpen;
        this.render();
      };
      leftGroup.appendChild(hamburger);

      const ageDisplay = el("div", "headerAge");
      ageDisplay.textContent = `${t("ui.age")} ${p.age}`;
      leftGroup.appendChild(ageDisplay);
      header.appendChild(leftGroup);

      const statsGroup = el("div", "headerStats");
      statsGroup.appendChild(this.createMiniStat("money", formatMoney(p.netWorth), "", t("ui.money")));
      statsGroup.appendChild(this.createMiniStat("health", p.health + "%", p.health < 30 ? "negative" : "", t("ui.health")));
      statsGroup.appendChild(this.createMiniStat("happiness", p.happiness + "%", p.happiness < 30 ? "negative" : "", t("ui.happiness")));

      // Note: No ad button here - ads only in crisis moments (mercy principle)
      header.appendChild(statsGroup);

      screen.appendChild(header);

      // Desktop Sidebar (Visible on Desktop)
      const sidebar = el("div", "desktopSidebar");
      sidebar.innerHTML = `
        <h2 class="sidebarGameTitle">${icon("game")} ${t("ui.gameTitle")}</h2>
        <div class="statusCard gameWidget">
          <div class="statusCardHeader">
            <span class="statusCardTitle">${p.name}</span>
            <span class="statusCardValue">${t("ui.age")} ${p.age}</span>
          </div>
          <div class="statusCardMeta">
            <span>${icon("city")} ${getCityDisplayName(p.cityId)}</span>
            <span>${icon("money")} ${formatMoney(p.netWorth)}</span>
          </div>
        </div>
      `;
      // Clone mini stats for desktop sidebar
      const desktopStats = el("div", "sidebarStats");
      desktopStats.style.display = "flex";
      desktopStats.style.flexDirection = "column";
      desktopStats.style.gap = "10px";
      desktopStats.style.marginBottom = "20px";

      const dMoney = this.createMiniStat("money", formatMoney(p.netWorth), "", t("ui.money"));
      const dHealth = this.createMiniStat("health", p.health + "%", p.health < 30 ? "negative" : "", t("ui.health"));
      const dHappy = this.createMiniStat("happiness", p.happiness + "%", p.happiness < 30 ? "negative" : "", t("ui.happiness"));

      desktopStats.appendChild(dMoney);
      desktopStats.appendChild(dHealth);
      desktopStats.appendChild(dHappy);

      // Note: No ad button here - ads only in crisis moments (mercy principle)
      sidebar.appendChild(desktopStats);

      // Navigation Links for Desktop Sidebar
      const navLinks = el("div", "sidebarNav");
      navLinks.style.display = "flex";
      navLinks.style.flexDirection = "column";
      navLinks.style.gap = "8px";

      const links = [
        { id: "assets", icon: "ph-house", label: t("ui.assets") },
        { id: "relationships", icon: "ph-users", label: t("ui.relationships") },
        { id: "selfdev", icon: "ph-book", label: t("ui.self_improvement") },
        { id: "shop", icon: "ph-shopping-cart", label: t("ui.shop") },
        { id: "achievements", icon: "ph-trophy", label: t("ui.achievements") }
      ];

      links.forEach(link => {
        const btn = el("button", "menuItem");

        // Age Logic with proper checks
        let locked = false;
        let unlockAge = 0;

        if (link.id === "selfdev" && p.age < 6) {
          locked = true;
          unlockAge = 6;
          btn.innerHTML = `<i class="ph ${link.icon}"></i> <span>${link.label}</span> <i class="ph ph-lock-key" style="margin-left:auto; opacity:0.5; font-size:14px;"></i>`;
          btn.onclick = () => {
            const yearsLeft = unlockAge - p.age;
            const msg = yearsLeft === 1
              ? `📚 ${link.label} unlocks next year when you turn ${unlockAge}!`
              : `📚 ${link.label} unlocks at age ${unlockAge} (${yearsLeft} years left). You're still too young for school!`;
            this.showToast(msg);
            if (navigator.vibrate) navigator.vibrate(50);
          };
        } else if (link.id === "selfdev" && p.age < 18) {
          // Allow access but limit content for minors
          btn.innerHTML = `<i class="ph ${link.icon}"></i> <span>${link.label}</span> <i class="ph ph-graduation-cap" style="margin-left:auto; opacity:0.5; font-size:14px;"></i>`;
          btn.onclick = this.showScreen.bind(this, link.id);
        } else if (link.id === "shop" && p.age < 12) {
          locked = true;
          unlockAge = 12;
          btn.innerHTML = `<i class="ph ${link.icon}"></i> <span>${link.label}</span> <i class="ph ph-lock-key" style="margin-left:auto; opacity:0.5; font-size:14px;"></i>`;
          btn.onclick = () => {
            const yearsLeft = unlockAge - p.age;
            const msg = yearsLeft === 1
              ? `🛒 ${link.label} unlocks next year when you turn ${unlockAge}!`
              : `🛒 ${link.label} unlocks at age ${unlockAge} (${yearsLeft} years left). Kids can't shop alone yet!`;
            this.showToast(msg);
            if (navigator.vibrate) navigator.vibrate(50);
          };
        } else {
          btn.innerHTML = `<i class="ph ${link.icon}"></i> <span>${link.label}</span>`;
          btn.onclick = this.showScreen.bind(this, link.id);
        }

        navLinks.appendChild(btn);
      });
      sidebar.appendChild(navLinks);

      screen.appendChild(sidebar);

      // 2. MAIN CONTENT AREA - BitLife style
      const content = el("div", "universalContent bitlifeContent");

      // Character Dashboard (BitLife style)
      const dashboard = el("div", "bitlifeDashboard");
      const charVisual = getCharacterVisual(p);
      const lifeStage = getLifeStage(p.age);
      const job = p.job && p.job !== "unemployed" ? Alive.jobs?.getJobById?.(p.job) : null;
      const jobLabel = job ? t("job." + p.job) || job.title : (p.age < 18 ? t("ui.education") : t("ui.unemployed"));
      dashboard.innerHTML = `
        <div class="bitlifeChar">
          <div class="bitlifePortrait bitlifePortraitImg">${charVisual.portraitHtml}</div>
          <div class="bitlifeCharInfo">
            <div class="bitlifeName">${p.name}</div>
            <div class="bitlifeAge">${t("ui.age")} ${p.age}</div>
            <div class="bitlifeJob">${jobLabel}</div>
            ${p.partner ? `<div class="bitlifePartner">${icon("partner")} ${p.partner.name || t("ui.partner")}</div>` : ""}
          </div>
        </div>
        <div class="bitlifeStatsRow">
          <div class="bitlifeStat" title="Health"><span class="bitlifeStatIcon">${icon("health")}</span><div class="bitlifeBar"><div style="width:${p.health}%;background:#ff6b6b"></div></div></div>
          <div class="bitlifeStat" title="Happiness"><span class="bitlifeStatIcon">${icon("happiness")}</span><div class="bitlifeBar"><div style="width:${p.happiness}%;background:#ffd93d"></div></div></div>
          <div class="bitlifeStat" title="Energy"><span class="bitlifeStatIcon">${icon("energy")}</span><div class="bitlifeBar"><div style="width:${p.energy}%;background:#5ba3ff"></div></div></div>
        </div>
      `;
      content.appendChild(dashboard);

      // Event Log / Active Event
      const eventLog = el("div", "eventLog");

      if (this.game.activeEvent) {
        // Render Active Event Card
        const eventCard = el("div", "eventCard");
        const eventTitle = el("h3", "statusCardTitle", t(this.game.activeEvent.titleKey) || this.game.activeEvent.title);
        eventTitle.style.marginBottom = "10px";
        eventTitle.style.fontSize = "20px";

        const replacements = this.game.activeEvent.replacements || {};
        const eventDesc = el("div", "eventDesc", t(this.game.activeEvent.descriptionKey, replacements) || this.game.activeEvent.description);
        eventDesc.style.lineHeight = "1.5";
        eventDesc.style.color = "var(--text-secondary)";
        eventDesc.style.marginBottom = "20px";

        eventCard.appendChild(eventTitle);
        eventCard.appendChild(eventDesc);

        // Choices
        if (this.game.activeEvent.choices) {
          const choicesDiv = el("div", "eventChoices");
          this.game.activeEvent.choices.forEach(choice => {
            const available = !Alive.events?.isChoiceAvailable || Alive.events.isChoiceAvailable(choice, p);
            const btn = el("button", "choiceBtn" + (available ? "" : " disabled"));

            // Effect Hint (effects or statChanges)
            let effectHint = "";
            const eff = choice.effects || choice.statChanges;
            if (eff) {
              const money = eff.moneyDelta ?? eff.money;
              const happy = eff.happinessDelta ?? eff.happiness;
              const health = eff.healthDelta ?? eff.health;
              if (money !== undefined) effectHint = money > 0 ? icon("money") + "+" : icon("money") + "-";
              else if (happy !== undefined) effectHint = (happy > 0 ? icon("happiness") + "+" : icon("happiness") + "-");
              else if (health !== undefined) effectHint = health > 0 ? icon("health") + "+" : icon("health") + "-";
            }

            btn.innerHTML = `${t(choice.labelKey) || choice.label} ${effectHint ? `<span style='opacity:0.7; font-size:0.9em; margin-left:6px'>${effectHint}</span>` : ""}`;

            if (available) {
              btn.onclick = () => {
                this.game.makeChoice(choice.id);
                this.render();
              };
            }
            choicesDiv.appendChild(btn);
          });
          eventCard.appendChild(choicesDiv);
        }
        eventLog.appendChild(eventCard);

      } else {

        // LIVING STATE (Replaces Idle/Empty State)
        const idleCard = el("div", "eventCard livingStateCard");

        // 1. Life Snapshot Generation
        let summary = [];
        if (p.age < 3) summary.push(t("ui.status.baby") || "You are a baby. Dependent on parents.");
        else if (p.age < 13) summary.push(t("ui.status.child") || "You are growing up. School is your main focus.");
        else if (p.age < 18) summary.push(t("ui.status.teen") || "Teenage years. High school and friends.");
        else if (p.housing === "homeless") summary.push("You are homeless.");
        else summary.push("You are living your life.");

        if (p.money < 100 && p.age >= 18) summary.push("Money is tight.");
        else if (p.netWorth > 1000000) summary.push("You are wealthy.");

        // 2. Risk Detection
        let risks = [];
        if (p.health < 40) risks.push(`${icon("warning")} Health Critical`);
        if (p.happiness < 30) risks.push(`${icon("warning")} Depression Risk`);
        if (p.money < 50 && p.age >= 18) risks.push(`${icon("warning")} Financial Crisis`);

        // 3. Render Content - BitLife style
        const yearSummary = p.age >= 18 ? (p.annualIncome || 0) - (p.annualExpenses || 0) : 0;
        const yearSummaryText = p.age >= 18
          ? (yearSummary >= 0 ? `+${formatMoney(yearSummary)} this year` : `${formatMoney(yearSummary)} this year`)
          : "";
        idleCard.innerHTML = `
          <div class="bitlifeYearSummary">
             <div class="bitlifeYearTitle">${t("ui.currentStatus") || "CURRENT STATUS"}</div>
             <p class="bitlifeYearDesc">${summary.join(" ")}</p>
             ${yearSummaryText ? `<div class="bitlifeYearMoney">${yearSummaryText}</div>` : ""}
             ${risks.length > 0 ? `<div class="bitlifeRisks">${risks.join(" • ")}</div>` : ""}
             <div class="bitlifeAgeSection">
               <div class="bitlifeAgePrompt">${t("ui.chooseFocus") || "Choose what to focus on this year"}</div>
               <div id="inlineNextBtnContainer"></div>
               <div class="bitlifeAgeHint">${t("ui.timePasses") || "Time passes, events happen"}</div>
             </div>
          </div>
        `;
        eventLog.appendChild(idleCard);

        // Inject Button Logic
        const container = idleCard.querySelector("#inlineNextBtnContainer") || idleCard;
        const nextBtn = el("button", "secondaryActionBtn"); // Use less dominant style
        nextBtn.type = "button";
        nextBtn.style.width = "100%";
        nextBtn.style.padding = "16px 20px";
        nextBtn.style.justifyContent = "center";

        // Age-appropriate button text
        let buttonText = t("ui.liveNextYear");
        if (p.age <= 3) {
          buttonText = t("ui.growUp") || "Grow Up";
        } else if (p.age <= 12) {
          buttonText = t("ui.nextYear") || "Next Year";
        }

        nextBtn.innerHTML = `
          <span style="font-size:15px; font-weight:600;">${buttonText} (${p.age + 1})</span>
          <i class="ph ph-arrow-right" style="margin-left:8px; font-size:16px;"></i>
        `;
        nextBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (nextBtn.disabled || this.game.isProcessingYear) return;

          nextBtn.disabled = true;
          this.game.isProcessingYear = true;

          try {
            this.game.nextYear();
          } catch (e) {
            console.error("Year progression error:", e);
            this.game.isProcessingYear = false;
          }
          this.render();
        };
        container.appendChild(nextBtn);

        if (this.game.eventHistory && this.game.eventHistory.length > 0) {
          const lastEvent = this.game.eventHistory[this.game.eventHistory.length - 1];
          if (lastEvent) {
            const historyCard = el("div", "eventCard");
            historyCard.style.opacity = "0.7";
            historyCard.innerHTML = `<div style="font-size:12px; text-transform:uppercase; margin-bottom:4px; opacity:0.7">${t("ui.previous_event")}</div>
                <strong>${t(lastEvent.titleKey) || lastEvent.title}</strong>
                <p style="font-size:14px; margin-top:4px">${t(lastEvent.descriptionKey) || lastEvent.description}</p>`;
            eventLog.appendChild(historyCard);
          }
        }
      }

      content.appendChild(eventLog);

      screen.appendChild(content);

      // 4. HAMBURGER OVERLAY
      if (this.isMenuOpen) {
        const overlay = el("div", "hamburgerOverlay open");
        overlay.onclick = (e) => {
          if (e.target === overlay) {
            this.isMenuOpen = false;
            this.render();
          }
        };

        const menu = el("div", "hamburgerMenu");

        const menuHeader = el("h2", "hamburgerMenuTitle");
        menuHeader.innerHTML = icon("game") + " " + t("ui.gameTitle");
        menu.appendChild(menuHeader);

        const activitiesLabel = el("div", "hamburgerSectionLabel");
        activitiesLabel.textContent = t("ui.activities") || "ACTIVITIES";
        menu.appendChild(activitiesLabel);

        const menuLinks = [
          { id: "selfdev", icon: "ph-briefcase", label: job ? t("ui.job") : t("ui.education") },
          { id: "relationships", icon: "ph-users", label: t("ui.relationships") },
          { id: "shop", icon: "ph-shopping-cart", label: t("ui.shop") },
          { id: "assets", icon: "ph-house", label: t("ui.assets") },
          { id: "achievements", icon: "ph-trophy", label: t("ui.achievements") }
        ];

        menuLinks.forEach(link => {
          const item = el("div", "menuItem");
          item.innerHTML = `<i class="ph ${link.icon}"></i> <span>${link.label}</span>`;
          item.onclick = () => {
            this.isMenuOpen = false;
            if (link.id === "selfdev" && p.age < 6) {
              this.showToast(icon("education") + " " + (t("selfdev.tooyoung") || "Education unlocks at age 6."));
              return;
            }
            if (link.id === "shop" && p.age < 12) {
              this.showToast(icon("shop") + " Shop unlocks at age 12.");
              return;
            }
            this.showScreen.call(this, link.id);
          };
          menu.appendChild(item);
        });

        const adsReady = !!this.game?.showRewardedAd;
        const adCooldown = this.game?._lastAdTime ? (Date.now() - this.game._lastAdTime) < 300000 : false;
        if (adsReady && !adCooldown && p.age >= 6) {
          const adItem = el("div", "menuItem menuItemAd");
          adItem.innerHTML = `<i class="ph ph-television"></i> <span>${t("ui.watchAdForMoney") || "Watch ad +$5000"}</span>`;
          adItem.onclick = async () => {
            this.isMenuOpen = false;
            const ok = await this.game.showRewardedAd("money");
            if (this.game) this.game._lastAdTime = Date.now();
            this.render();
            if (!ok) this.showToast(t("ui.adUnavailable") || "Ad unavailable.");
          };
          menu.appendChild(adItem);
        }

        const divider = el("div", "hamburgerDivider");
        menu.appendChild(divider);

        const settingsItem = el("div", "menuItem");
        settingsItem.innerHTML = `<i class="ph ph-gear"></i> <span>${t("ui.settings")}</span>`;
        settingsItem.onclick = () => { this.isMenuOpen = false; this.render(); };
        menu.appendChild(settingsItem);

        const menuItem = el("div", "menuItem");
        menuItem.innerHTML = `<i class="ph ph-house-simple"></i> <span>${t("ui.main_menu")}</span>`;
        menuItem.onclick = () => { this.isMenuOpen = false; this.showMenu(); };
        menu.appendChild(menuItem);

        overlay.appendChild(menu);
        screen.appendChild(overlay);
      }

      this.rootEl.appendChild(screen);
    }

    createMiniStat(iconName, value, className = "", label = "") {
      const elStat = el("div", `miniStat ${className}`);
      const labelPart = label ? `<span class="miniStatLabel">${label}</span>` : "";
      elStat.innerHTML = `<span class="miniStatIcon">${icon(iconName)}</span> ${labelPart}<span>${value}</span>`;
      return elStat;
    }

    renderOnboarding() {
      this.rootEl.innerHTML = "";
      const screen = el("div", "gameScreen");

      const header = el("div", "universalHeader");
      header.innerHTML = `<div class="headerLeft"><div class="headerAge">Age 18</div></div>`;
      screen.appendChild(header);

      const content = el("div", "universalContent");
      const card = el("div", "eventCard");

      const step = this.game.onboardingStep || 0;
      const isLongOnboarding = Alive.Analytics && Alive.Analytics.getFlag('onboarding_length') === '20s';

      if (step === 0) {
        card.innerHTML = `<h3>${t("onboarding.welcome_title") || "Welcome!"}</h3><p>${t("onboarding.step1_desc") || "Your life begins now. Make choices to shape your destiny."}</p>`;
      } else if (step === 1 && isLongOnboarding) {
        // Extra step for 20s variant
        card.innerHTML = `<h3>${t("onboarding.stats_title") || "Check Your Stats"}</h3><p>${t("onboarding.step1_5_desc") || "Keep an eye on Health, Happiness, and Energy. Don't let them hit zero!"}</p>`;
      } else {
        card.innerHTML = `<h3>${t("onboarding.great_job") || "Great Job!"}</h3><p>${t("onboarding.step2_desc") || "You earned money and experience. Time moves forward."}</p>`;
      }
      content.appendChild(card);
      screen.appendChild(content);

      const actionBar = el("div", "universalActionBar");
      const overlay = el("div", "onboardingOverlay");

      if (step === 0) {
        const nextBtn = el("button", "primaryActionBtn", t("ui.intro_action") || "Work Hard ($100)");
        nextBtn.style.zIndex = "1002";
        nextBtn.style.position = "relative";
        nextBtn.style.boxShadow = "0 0 0 4px #ffcc00";
        nextBtn.onclick = () => {
          this.game.money += 100;
          this.game.onboardingStep = 1; // Always go to 1 next
          this.render();
        };
        actionBar.appendChild(nextBtn);

        const tip = el("div", "onboardingTip", t("onboarding.tap_here") || "Tap here to take your first action!");
        tip.style.bottom = "80px";
        tip.style.left = "50%";
        tip.style.transform = "translateX(-50%)";
        overlay.appendChild(tip);

      } else if (step === 1 && isLongOnboarding) {
        // Intermediate Step Button
        const nextBtn = el("button", "primaryActionBtn", "Got it!");
        nextBtn.style.zIndex = "1002";
        nextBtn.style.position = "relative";
        nextBtn.style.boxShadow = "0 0 0 4px #00e0ff";
        nextBtn.onclick = () => {
          // Go to final step (which is effectively step 2 now, but our logic handles 'else' as final)
          this.game.onboardingStep = 2;
          this.render();
        };
        actionBar.appendChild(nextBtn);

        // Highlight stats in header? (Simplified: just point up)
        const tip = el("div", "onboardingTip", "Stats are up here!");
        tip.style.top = "60px";
        tip.style.right = "20px";
        overlay.appendChild(tip);

      } else {
        // Final Step (Step 1 for Short, Step 2 for Long)
        const nextBtn = el("button", "primaryActionBtn", t("ui.liveNextYear"));
        nextBtn.style.zIndex = "1002";
        nextBtn.style.position = "relative";
        nextBtn.style.boxShadow = "0 0 0 4px #00e0ff";
        nextBtn.onclick = () => {
          this.game.completeOnboarding();
          this.game.nextYear();
          this.render();
        };
        actionBar.appendChild(nextBtn);

        const tip = el("div", "onboardingTip", t("onboarding.next_year_tip") || "Now proceed to the next year!");
        tip.style.bottom = "80px";
        tip.style.left = "50%";
        tip.style.transform = "translateX(-50%)";
        overlay.appendChild(tip);
      }

      screen.appendChild(actionBar);
      screen.appendChild(overlay);
      this.rootEl.appendChild(screen);
    }
    // ==========================================================================
    // LIFE GOALS SCREEN
    // ==========================================================================

    renderLifeGoals() {
      const p = this.game.player;
      const container = el("div", "screen goalsScreen");

      const header = el("div", "screenHeader");
      header.innerHTML = `<h1>📋 ${t("goals.title")}</h1>`;
      container.appendChild(header);

      const list = el("div", "goalsList");

      // Define goals logic
      const goals = [
        { id: "graduate", label: "goals.graduate", done: p.education >= 3 },
        { id: "job", label: "goals.job", done: p.jobLevel >= 3 },
        { id: "love", label: "goals.love", done: p.partner && p.relationshipScore >= 90 },
        { id: "home", label: "goals.home", done: p.assets && p.assets.some(a => a.type === "property") },
        { id: "family", label: "goals.family", done: p.children && p.children.length > 0 },
        { id: "millionaire", label: "goals.millionaire", done: p.netWorth >= 1000000 },
        { id: "travel", label: "goals.travel", done: p.visitedCities && p.visitedCities.length >= 10 },
        { id: "age100", label: "goals.age100", done: p.age >= 100 }
      ];

      goals.forEach(g => {
        const item = el("div", "goalItem " + (g.done ? "done" : ""));
        item.innerHTML = `
          <div class="goalCheck">${g.done ? "�?�" : "�?"}</div>
          <div class="goalLabel">${t(g.label)}</div>
        `;
        list.appendChild(item);

      });

      container.appendChild(list);

      const backBtn = el("button", "btn btnSecondary", t("ui.back"));
      backBtn.onclick = () => this.showMenu();
      container.appendChild(backBtn);

      this.rootEl.appendChild(container);

    }

    // ==========================================================================
    // EVENT OVERLAY - Cleaner, more dramatic
    // ==========================================================================

    renderEventOverlay(event) {
      const overlay = el("div", "eventOverlay");
      const modal = el("div", "eventModal");

      const replacements = event && typeof event === "object" ? (event.replacements || {}) : {};

      // Event header with emoji
      const header = el("div", "eventHeader");
      header.innerHTML = `
        <div class="eventEmoji">�?</div>
        <h2 class="eventTitle">${t(event.titleKey, replacements)}</h2>
      `;
      modal.appendChild(header);

      // Event description
      const desc = el("p", "eventDesc", t(event.descriptionKey, replacements));
      modal.appendChild(desc);

      // Choices
      const choices = el("div", "eventChoices");

      (event.choices || []).forEach(choice => {
        const available = !Alive.events?.isChoiceAvailable ||
          Alive.events.isChoiceAvailable(choice, this.game.player);

        const btn = el("button", "choiceBtn" + (available ? "" : " disabled"));

        // Show only the most important effect
        let effectHint = "";
        if (choice.effects) {
          if (choice.effects.moneyDelta) {
            const sign = choice.effects.moneyDelta > 0 ? "+" : "";
            effectHint = `${icon("money")} ${sign}${formatMoney(choice.effects.moneyDelta)}`;

          } else if (choice.effects.happinessDelta) {
            const sign = choice.effects.happinessDelta > 0 ? "+" : "";
            effectHint = `${icon("happiness")} ${sign}${choice.effects.happinessDelta}`;

          } else if (choice.effects.healthDelta) {
            const sign = choice.effects.healthDelta > 0 ? "+" : "";
            effectHint = `${icon("health")} ${sign}${choice.effects.healthDelta}`;

          }

        }

        btn.innerHTML = `
          <span class="choiceLabel">${t(choice.labelKey)}</span>
          ${effectHint ? `<span class="choiceEffect">${effectHint}</span>` : ""}
        `;

        if (available) {
          btn.onclick = () => this.game.handleChoice(choice.id);

        }

        choices.appendChild(btn);

      });

      modal.appendChild(choices);
      overlay.appendChild(modal);

      return overlay;

    }

    // ==========================================================================
    // DEATH SUMMARY - Emotional Story
    // ==========================================================================

    renderSummary() {
      if (!this.game) return;

      const summary = this.game.buildDeathSummary();
      if (!summary) {
        this.showMenu();
        return;

      }

      const container = el("div", "screen summaryScreen");

      const causeKey = guessDeathCause(summary, this.game);
      const causeText = t(causeKey);
      const isBadEnd = causeKey.includes('bankruptcy') || causeKey.includes('burnout');

      const memorial = el("div", "memorial");
      memorial.innerHTML = `
        <div class="memorialPortrait">${getCharacterPortrait({ age: summary.age, gender: summary.gender }, "memorialPortraitImg")}</div>
        <div class="memorialName">${summary.name}</div>
        <div class="memorialYears${isBadEnd ? ' badEnd' : ''}">${t("ui.livedYears", { years: summary.age })} · ${causeText}</div>
      `;
      container.appendChild(memorial);

      // Best Results Card
      const bestResults = this.game.bestResults || {};
      if (bestResults.livesPlayed > 0) {
        const bestCard = el("div", "chartContainer bestResultsCard");
        const bestTitle = el("div", "statLabel");
        bestTitle.innerHTML = icon("chart") + " " + t("summary.bestResults");
        bestTitle.style.textAlign = "left";
        bestCard.appendChild(bestTitle);

        const bestGrid = el("div", "summaryStats");
        bestGrid.style.gridTemplateColumns = "repeat(2, 1fr)";
        const currentAge = summary.age || 0;
        const currentWealth = summary.finalNetWorth || 0;
        const currentScore = currentAge * 100 + Math.floor(currentWealth / 1000);

        const bestItems = [
          { iconName: "baby", label: t("summary.bestAge"), value: `${bestResults.bestAge || 0}`, compare: currentAge >= (bestResults.bestAge || 0) ? icon("trophy") : "" },
          { iconName: "money", label: t("summary.maxWealth"), value: formatMoney(bestResults.maxNetWorth || 0), compare: currentWealth >= (bestResults.maxNetWorth || 0) ? icon("trophy") : "" },
          { iconName: "sparkle", label: t("summary.highScore"), value: (bestResults.highScore || 0).toLocaleString(), compare: currentScore >= (bestResults.highScore || 0) ? icon("trophy") : "" },
          { iconName: "chart", label: t("summary.livesPlayed"), value: String(bestResults.livesPlayed || 0), compare: "" }
        ];

        bestItems.forEach((item) => {
          const stat = el("div", "summaryStat");
          const iconHtml = item.iconName ? icon(item.iconName) : (item.icon || "");
          stat.innerHTML = `
            <div class="statIcon">${iconHtml}</div>
            <div class="statLabel">${item.label}</div>
            <div class="statValue">${item.value} ${item.compare || ""}</div>
          `;
          bestGrid.appendChild(stat);
        });
        bestCard.appendChild(bestGrid);
        container.appendChild(bestCard);
      }

      const headlines = buildLifeHeadlines(summary);
      const headlinesCard = el("div", "chartContainer");
      const headlinesTitle = el("div", "statLabel", t("summary.headlines"));
      headlinesTitle.style.textAlign = "left";
      headlinesCard.appendChild(headlinesTitle);
      const list = el("div", "eventChoices");
      (headlines.length ? headlines : ["🕯️"]).forEach((h) => {
        const item = el("div", "statusBadge");
        item.style.justifyContent = "flex-start";
        item.textContent = h;
        list.appendChild(item);

      });
      headlinesCard.appendChild(list);
      container.appendChild(headlinesCard);

      const stats = el("div", "summaryStats");
      const statItems = [
        { iconName: "money", label: t("ui.finalNetWorth"), value: formatMoney(summary.finalNetWorth) },
        { iconName: "city", label: t("ui.cityGuide"), value: summary.cityId ? getCityDisplayName(summary.cityId) : "-" },
        { iconName: "job", label: t("ui.yearsWorked"), value: summary.totalYearsWorked },
        { iconName: "children", label: t("ui.children"), value: summary.totalChildren },
        { iconName: "city", label: t("ui.citiesVisited"), value: Array.isArray(summary.citiesVisited) ? summary.citiesVisited.length : 0 },
        { iconName: "education", label: t("ui.eventsExperienced"), value: summary.eventsExperienced }
      ];
      statItems.forEach((item) => {
        const stat = el("div", "summaryStat");
        stat.innerHTML = `
          <div class="statIcon">${icon(item.iconName)}</div>
          <div class="statLabel">${item.label}</div>
          <div class="statValue">${item.value}</div>
        `;
        stats.appendChild(stat);

      });
      container.appendChild(stats);

      if (Alive.richList) {
        const pseudoPlayer = {
          name: summary.name,
          countryId: summary.countryId,
          netWorth: summary.finalNetWorth

        };

        const rich = Alive.richList.buildTopWithPlayer(pseudoPlayer, 10);
        const card = el("div", "chartContainer");
        const title = el("div", "statLabel", t("richlist.top10"));
        title.style.textAlign = "left";
        card.appendChild(title);

        const msg = el("div", "statLabel");
        msg.style.textAlign = "left";
        const rank = rich.playerRank || 0;
        const threshold = formatMoney(rich.threshold || 0);
        msg.textContent = rich.isPlayerAboveThreshold
          ? t("richlist.position.onList", { rank: String(rank) })
          : t("richlist.position.belowThreshold", { rank: String(rank), threshold });
        card.appendChild(msg);

        const list = el("div", "richListMini");
        (rich.top || []).forEach((row) => {
          const item = el("div", "statusBadge" + (row.type === "player" ? " player" : ""));
          item.style.justifyContent = "space-between";
          item.innerHTML = `
            <span>#${row.rank} ${row.displayName}</span>
            <span>${formatMoney(row.netWorth || 0)}</span>
          `;
          list.appendChild(item);

        });
        card.appendChild(list);
        container.appendChild(card);

      }

      if (Alive.achievements?.getProgression && Alive.achievements?.getAllAchievements) {
        const prog = Alive.achievements.getProgression();
        const unlocked = Array.isArray(prog?.unlockedAchievementIds) ? prog.unlockedAchievementIds : [];
        const all = Alive.achievements.getAllAchievements();
        const badgeCard = el("div", "chartContainer");
        const badgeTitle = el("div", "statLabel", t("summary.achievements"));
        badgeTitle.style.textAlign = "left";
        badgeCard.appendChild(badgeTitle);
        const badges = el("div", "statusStrip");
        unlocked.slice(0, 8).forEach((id) => {
          const a = all.find((x) => x.id === id);
          if (!a) return;
          const lang = getLang();
          const name = a.name?.[lang] || a.name?.en || id;
          const b = el("div", "statusBadge");
          b.title = name;
          b.innerHTML = `<span class="badgeEmoji">${icon("trophy")}</span><span class="badgeText">${name}</span>`;
          badges.appendChild(b);

        });
        badgeCard.appendChild(badges);
        container.appendChild(badgeCard);

      }

      // CRITICAL MISTAKES (What went wrong) - Show prominently for bad endings
      const criticalMistakes = buildCriticalMistakes(summary, this.game);
      if (criticalMistakes.length > 0) {
        const mistakeCard = el("div", "chartContainer mistakeCard");
        mistakeCard.style.borderLeft = "3px solid #ff6b6b";
        const mistakeTitle = el("div", "statLabel");
        mistakeTitle.innerHTML = icon("warning") + " " + t("summary.criticalMistakes");
        mistakeTitle.style.textAlign = "left";
        mistakeTitle.style.color = "#ff6b6b";
        mistakeCard.appendChild(mistakeTitle);
        const mistakeList = el("div", "eventChoices");
        criticalMistakes.forEach((m) => {
          const item = el("div", "statusBadge");
          item.style.justifyContent = "flex-start";
          item.style.color = "#ffaaaa";
          item.textContent = m;
          mistakeList.appendChild(item);
        });
        mistakeCard.appendChild(mistakeList);
        container.appendChild(mistakeCard);
      }

      // NEAR-MISSES (So close...) - Emphasize how little was missing
      const nearMisses = buildNearMisses(summary);
      if (nearMisses.length > 0) {
        const nearCard = el("div", "chartContainer");
        nearCard.style.borderLeft = "3px solid #ffd43b";
        const nearTitle = el("div", "statLabel", "😤 " + t("summary.nearMisses"));
        nearTitle.style.textAlign = "left";
        nearTitle.style.color = "#ffd43b";
        nearCard.appendChild(nearTitle);
        const nearList = el("div", "eventChoices");
        nearMisses.forEach((m) => {
          const item = el("div", "statusBadge");
          item.style.justifyContent = "flex-start";
          item.textContent = m;
          nearList.appendChild(item);
        });
        nearCard.appendChild(nearList);
        container.appendChild(nearCard);
      }

      // ACTIONS - Single clear CTA: "New Life"
      const actions = el("div", "summaryActions");

      // PRIMARY CTA: New Life (the one button to rule them all)
      const newLifeBtn = el("button", "btn btnPrimary btnLarge", "🔄 " + t("summary.newLife"));
      newLifeBtn.onclick = () => {
        this.createState = null;
        this.showCharacterCreation();
      };
      actions.appendChild(newLifeBtn);

      // SECONDARY: Continue as child (if available)
      const hasChildren = (Number(summary.totalChildren) || 0) > 0;
      if (hasChildren) {
        const childBtn = el("button", "btn btnLarge btnSecondary");
        childBtn.innerHTML = icon("children") + " " + t("summary.continueAsChild");
        childBtn.onclick = () => {
          const child = Array.isArray(summary.children) && summary.children.length > 0 ? summary.children[0] : null;
          const bonusMoney = Math.max(100, Math.min(5000, Math.round((Number(summary.finalMoney) || 0) * 0.05)));
          const cfg = {
            gender: child?.gender || (Math.random() < 0.5 ? "M" : "F"),
            name: child?.name || "",
            countryId: summary.countryId,
            cityId: summary.cityId,
            familyWealthTier: "medium"
          };
          this.game.startNewLife(cfg);
          this.game.player.money += bonusMoney;
          this.game.player.happiness = Math.min(100, (this.game.player.happiness || 50) + 2);
          this.game.player.intelligence = Math.min(100, (this.game.player.intelligence || 50) + 1);
          Alive.storage?.save(this.game.getState());
          this.showGame();
        };
        actions.appendChild(childBtn);
      }

      // TERTIARY: Quick restart (subtle, for power users)
      const tryAgainBtn = el("button", "btn btnSmall", t("summary.tryAgain"));
      tryAgainBtn.style.opacity = "0.7";
      tryAgainBtn.onclick = () => {
        this.game.startQuickRestart();
        this.showGame();
      };
      actions.appendChild(tryAgainBtn);

      container.appendChild(actions);

      this.rootEl.appendChild(container);

    }

    drawNetWorthChart(canvas, history) {
      const ctx = canvas.getContext("2d");
      if (!ctx || !history.length) return;

      const w = canvas.width;
      const h = canvas.height;
      const padding = 10;

      const values = history.map(h => h.netWorth || 0);
      const maxVal = Math.max(...values, 1);
      const minVal = Math.min(...values, 0);
      const range = maxVal - minVal || 1;

      ctx.clearRect(0, 0, w, h);

      // Draw gradient fill
      const gradient = ctx.createLinearGradient(0, 0, 0, h);
      gradient.addColorStop(0, "rgba(0, 212, 255, 0.4)");
      gradient.addColorStop(1, "rgba(0, 212, 255, 0)");

      ctx.beginPath();
      ctx.moveTo(padding, h - padding);

      values.forEach((val, i) => {
        const x = padding + (i / (values.length - 1)) * (w - 2 * padding);
        const y = h - padding - ((val - minVal) / range) * (h - 2 * padding);
        ctx.lineTo(x, y);

      });

      ctx.lineTo(w - padding, h - padding);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw line
      ctx.strokeStyle = "#00d4ff";
      ctx.lineWidth = 2;
      ctx.beginPath();

      values.forEach((val, i) => {
        const x = padding + (i / (values.length - 1)) * (w - 2 * padding);
        const y = h - padding - ((val - minVal) / range) * (h - 2 * padding);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);

      });

      ctx.stroke();

    }

    // ==========================================================================
    // ACHIEVEMENTS SCREEN
    // ==========================================================================

    renderAchievements() {
      const container = el("div", "screen achieveScreen");

      // Header
      const header = el("div", "achieveHeader");

      const backBtn = el("button", "btn btnMini", "← " + t("ui.back"));
      backBtn.onclick = () => {
        if (this.prevScreen === "game") {
          this.screen = "game";
          this.prevScreen = null;
          this.render();
        } else {
          this.showMenu();
        }
      };
      header.appendChild(backBtn);

      const title = el("h1", "achieveTitle");
      title.innerHTML = icon("trophy") + " " + t("ui.achievements");
      header.appendChild(title);

      container.appendChild(header);

      // Progress
      if (Alive.achievements) {
        const progress = Alive.achievements.getProgress();
        const progressEl = el("div", "achieveProgress");
        progressEl.innerHTML = `
          <div class="progressText">${progress.unlocked} / ${progress.total}</div>
          <div class="progressBar"><div class="progressFill" style="width: ${progress.percentage}%"></div></div>
        `;
        container.appendChild(progressEl);

        // Achievement list
        const list = el("div", "achieveList");

        const achievements = Alive.achievements.getAllAchievements();
        achievements.forEach(ach => {
          const unlocked = Alive.achievements.isAchievementUnlocked(ach.id);
          const card = el("div", "achieveCard" + (unlocked ? " unlocked" : " locked"));

          const lang = Alive.i18n?.getLanguage() || "en";
          const name = ach.name[lang] || ach.name.en || ach.id;
          const desc = ach.description[lang] || ach.description.en || "";

          card.innerHTML = `
            <div class="achieveIcon">${unlocked ? ach.icon : "🔒"}</div>
            <div class="achieveInfo">
              <div class="achieveName">${name}</div>
              <div class="achieveDesc">${desc}</div>
            </div>
          `;
          list.appendChild(card);

        });

        container.appendChild(list);

      }

      this.rootEl.appendChild(container);

    }

    // ==========================================================================
    // LANGUAGE TOGGLE
    // ==========================================================================

    renderLangToggle() {
      const toggle = el("div", "langToggle");
      const currentLang = Alive.i18n?.getLanguage() || "en";

      const enBtn = el("button", "langBtn" + (currentLang === "en" ? " active" : ""), "EN");
      enBtn.onclick = () => {
        Alive.i18n?.setLanguage("en");

      };
      toggle.appendChild(enBtn);

      const ruBtn = el("button", "langBtn" + (currentLang === "ru" ? " active" : ""), "RU");
      ruBtn.onclick = () => {
        Alive.i18n?.setLanguage("ru");

      };
      toggle.appendChild(ruBtn);

      return toggle;

    }

    // ==========================================================================
    // TOASTS
    // ==========================================================================

    showAchievementToast(achievement) {
      const lang = Alive.i18n?.getLanguage() || "en";
      const name = achievement.name[lang] || achievement.name.en || achievement.id;

      if (Alive.sound && typeof Alive.sound.playSuccess === 'function') {
        Alive.sound.playSuccess();
      }
      this.showToast(icon("trophy") + " " + name);
    }

    showToast(message, type = 'normal') {
      const toast = el("div", "toast");
      if (type === 'blunt') {
        toast.classList.add('toastBlunt');
        if (Alive.sound && typeof Alive.sound.playError === 'function') {
          Alive.sound.playError();
        }
      } else {
        if (Alive.sound && typeof Alive.sound.playNotification === 'function') {
          Alive.sound.playNotification();
        }
      }

      toast.innerHTML = message;
      document.body.appendChild(toast);

      setTimeout(() => {
        toast.classList.add("fadeOut");
        setTimeout(() => toast.remove(), 300);
      }, 2500);
    }

    // V2 renderSummary removed — duplicate with hardcoded English and mojibake.
    // The localized V1 renderSummary (above) is the sole definition.

    renderToasts() {
      // Toasts are rendered independently

    }

    // ==========================================================================
    // SELF-DEVELOPMENT SCREEN
    // ==========================================================================

    renderSelfDevelopment(containerEl) {
      const player = this.game?.player;
      if (!player) {
        if (containerEl) {
          this.hideOverlay();
        } else {
          this.showGame();
        }
        return;
      }

      const target = containerEl || this.rootEl;
      if (!containerEl) target.innerHTML = "";

      const container = el("div", "screen selfDevScreen");

      // Close Button for Overlay
      const closeBtn = el("button", "btn btnSecondary", "×");
      closeBtn.style.position = "absolute";
      closeBtn.style.top = "10px";
      closeBtn.style.right = "10px";
      closeBtn.style.width = "40px";
      closeBtn.style.zIndex = "10";
      closeBtn.onclick = () => this.hideOverlay();

      if (containerEl) {
        container.appendChild(closeBtn);
      }

      // Header
      const header = el("div", "selfDevHeader");

      if (!containerEl) {
        const backBtn = el("button", "selfDevBackBtn", "←");
        backBtn.onclick = () => {
          this.screen = this.prevScreen || "game";
          this.render();
        };
        header.appendChild(backBtn);
      }

      const title = el("h1", "selfDevTitle", t("selfdev.title"));
      header.appendChild(title);
      container.appendChild(header);

      // Tabs
      const tabs = el("div", "selfDevTabs");
      const tabData = [
        { id: "education", icon: "ph-graduation-cap", label: t("selfdev.education") },
        { id: "career", icon: "ph-briefcase", label: t("selfdev.career") },
        { id: "business", icon: "ph-rocket", label: t("selfdev.business") },
        { id: "investing", icon: "ph-trend-up", label: t("selfdev.investing") },
        { id: "lifestyle", icon: "ph-heartbeat", label: t("selfdev.lifestyle") || "Lifestyle" }
      ];

      tabData.forEach(tab => {
        const tabBtn = el("button", "selfDevTab" + (this.selfDevTab === tab.id ? " active" : ""));
        tabBtn.innerHTML = `
          <span class="selfDevTabIcon"><i class="ph ${tab.icon}"></i></span>
          <span class="selfDevTabLabel">${tab.label}</span>
        `;
        tabBtn.onclick = () => {
          this.selfDevTab = tab.id;
          if (containerEl) {
            this.showOverlay((c) => this.renderSelfDevelopment(c));
          } else {
            this.render();
          }
        };
        tabs.appendChild(tabBtn);

      });
      container.appendChild(tabs);

      // Content based on active tab
      const content = el("div", "selfDevContent");

      switch (this.selfDevTab) {
        case "education":
          this.renderEducationTab(content, player);
          break;
        case "career":
          this.renderCareerTab(content, player);
          break;
        case "business":
          this.renderBusinessTab(content, player);
          break;
        case "investing":
          this.renderInvestingTab(content, player);
          break;
        case "lifestyle":
          this.renderLifestyleTab(content, player);
          break;
      }

      container.appendChild(content);
      target.appendChild(container);
    }

    renderLifestyleTab(container, player) {
      if (!Alive.actions) return;

      const title = el("h3", "statusCardTitle", t("selfdev.lifestyle") || "Diet & Lifestyle Choices");
      title.style.marginBottom = "16px";
      container.appendChild(title);

      const actionsList = el("div", "actionList");

      // We explicitly look for lifestyle actions
      const lifestyleActions = Object.values(Alive.actions).filter(a => typeof a === "object" && a.type === "lifestyle");

      // Since Alive.actions might not be exposed as a dictionary and uses an internal array:
      // We will loop through known ID's if we can't find them, but we exported getAction
      const knownIds = ["change_diet_organic", "change_diet_balanced", "change_diet_junk"];

      knownIds.forEach(id => {
        let action = null;
        if (Alive.actions.getActionById) {
          action = Alive.actions.getActionById(id);
        } else if (typeof Alive.actions[id] === "object") {
          action = Alive.actions[id];
        }

        if (action && (typeof action.availableWhen !== "function" || action.availableWhen(player))) {
          const btn = el("button", "btn btnSecondary actionBtn");
          btn.style.width = "100%";
          btn.style.marginBottom = "10px";
          btn.style.textAlign = "left";

          btn.innerHTML = `
            <div><strong>${t(action.title)}</strong></div>
            <div style="font-size:0.85em; opacity:0.8;">${t(action.description)}</div>
          `;

          btn.onclick = () => {
            // In Actions we usually run: runAction(id)
            // ui.js doesn't natively import runAction if it isn't global
            if (window.runAction) {
              window.runAction(id);
            } else if (Alive.game) {
              Alive.game.processAction(id);
            }
            this.render(); // Re-render to show new choice
          };
          actionsList.appendChild(btn);
        }
      });

      if (actionsList.children.length === 0) {
        actionsList.appendChild(el("div", "emptyState", "No lifestyle options available right now."));
      }

      container.appendChild(actionsList);
    }

    renderEducationTab(container, player) {
      const selfDev = Alive.selfDevelopment;
      if (!selfDev) return;

      const progress = selfDev.getEducationProgress(player);

      // Current Status Card
      const statusCard = el("div", "statusCard");
      const statusHeader = el("div", "statusCardHeader");
      statusHeader.innerHTML = `
        <span class="statusCardTitle">${t("selfdev.current_stage")}</span>
        <span class="statusCardValue">${progress.isEnrolled ? t(progress.currentStage.nameKey) : t(progress.highestStage.nameKey)}</span>
      `;
      statusCard.appendChild(statusHeader);

      if (progress.isEnrolled) {
        const progressBar = el("div", "statusCardProgress");
        progressBar.innerHTML = `<div class="statusCardProgressFill" style="width: ${progress.progress}%"></div>`;
        statusCard.appendChild(progressBar);

        const meta = el("div", "statusCardMeta");
        meta.innerHTML = `
          <span>${t("edu.years_remaining", { years: progress.yearsRemaining })}</span>
          <span>${t("edu.gpa")}: ${progress.gpa.toFixed(1)}</span>
        `;
        statusCard.appendChild(meta);

      }
      container.appendChild(statusCard);

      // Education Path
      const pathTitle = el("h3", "statusCardTitle", t("selfdev.progress"));
      pathTitle.style.marginBottom = "16px";
      container.appendChild(pathTitle);

      const path = el("div", "progressPath");
      const stages = Object.values(selfDev.EDUCATION_STAGES).filter(s => s.id !== "none" && s.id !== "certification");

      stages.forEach((stage, index) => {
        const isCompleted = stage.level <= progress.highestStage.level;
        const isCurrent = progress.isEnrolled && progress.currentStage.id === stage.id;
        const isLocked = stage.level > progress.highestStage.level + 1;

        const step = el("div", "progressStep");

        const indicator = el("div", "progressStepIndicator");
        const dot = el("div", "progressStepDot" + (isCompleted ? " completed" : isCurrent ? " current" : " locked"));
        dot.textContent = isCompleted ? "�?�" : (index + 1);
        indicator.appendChild(dot);

        if (index < stages.length - 1) {
          const line = el("div", "progressStepLine" + (isCompleted ? " completed" : isCurrent ? " active" : ""));
          indicator.appendChild(line);

        }
        step.appendChild(indicator);

        const content = el("div", "progressStepContent");
        const titleEl = el("div", "progressStepTitle" + (isLocked ? " locked" : ""), t(stage.nameKey));
        content.appendChild(titleEl);

        const meta = el("div", "progressStepMeta");
        if (stage.yearsRequired) {
          const timeBadge = el("span", "progressStepBadge time", `${stage.yearsRequired} ${t("ui.years")}`);
          meta.appendChild(timeBadge);

        }
        if (stage.cost) {
          const costBadge = el("span", "progressStepBadge cost", formatMoney(stage.cost));
          meta.appendChild(costBadge);

        }
        const boostBadge = el("span", "progressStepBadge boost", `+${2 + Math.floor(stage.level / 2)} 🧠`);
        meta.appendChild(boostBadge);
        content.appendChild(meta);

        step.appendChild(content);
        path.appendChild(step);

      });
      container.appendChild(path);

      // Actions
      const actions = el("div", "selfDevActions");

      if (progress.isEnrolled) {
        const dropoutBtn = el("button", "selfDevActionBtn danger", `${t("edu.dropout")}`);
        dropoutBtn.onclick = () => {
          selfDev.dropOutOfEducation(player);
          this.game.emitUpdate();
          this.render();

        };
        actions.appendChild(dropoutBtn);

      } else if (progress.nextStages.length > 0) {
        progress.nextStages.forEach(stage => {
          const canEnroll = selfDev.canEnrollInEducation(player, stage.id);
          const btn = el("button", "selfDevActionBtn primary");
          btn.innerHTML = `
            <span>${t("edu.enroll")}: ${t(stage.nameKey)}</span>
            ${stage.cost ? `<span class="selfDevActionBtnCost">${formatMoney(stage.cost)}</span>` : ""}
          `;
          btn.disabled = !canEnroll.canEnroll;
          btn.onclick = () => {
            selfDev.enrollInEducation(player, stage.id);
            this.game.emitUpdate();
            this.showToast(icon("education") + " " + t("edu.enroll") + ": " + t(stage.nameKey));
            this.render();

          };
          actions.appendChild(btn);

        });

      }

      container.appendChild(actions);

    }

    renderCareerTab(container, player) {
      const selfDev = Alive.selfDevelopment;
      if (!selfDev) return;

      selfDev.initializeCareerState(player);
      const progress = selfDev.getCareerProgress(player);

      // Current Job Info
      const jobInfo = el("div", "statusCard");
      const currentJob = player.getCurrentJob?.() || { name: { en: "Unemployed" } };
      const jobName = currentJob.name?.[getLang()] || currentJob.name?.en || t("job.unemployed");

      jobInfo.innerHTML = `
        <div class="statusCardHeader">
          <span class="statusCardTitle">${t("ui.job")}</span>
          <span class="statusCardValue">${currentJob.visualIndicator?.startsWith("ph-") ? `<i class="ph ${currentJob.visualIndicator}"></i>` : (currentJob.visualIndicator || '<i class="ph ph-briefcase"></i>')} ${jobName}</span>
        </div>
        <div class="statusCardMeta">
          <span>${t("career.level." + progress.currentLevel.id)}</span>
          <span>${formatMoney(player.annualIncome || 0)}/yr</span>
        </div>
      `;
      container.appendChild(jobInfo);

      // Career Path Title
      const pathTitle = el("h3", "statusCardTitle", t("career.path_to_top"));
      pathTitle.style.margin = "24px 0 16px";
      container.appendChild(pathTitle);

      // Career Path Visualization
      const careerPath = el("div", "careerPath");

      progress.path.forEach((level, index) => {
        const isCompleted = index < progress.currentLevelIndex;
        const isCurrent = index === progress.currentLevelIndex;
        const isLocked = index > progress.currentLevelIndex;

        const levelEl = el("div", "careerLevel");

        if (index > 0) {
          const connector = el("div", "careerLevelConnector" + (isCompleted ? " completed" : isCurrent ? " active" : ""));
          levelEl.appendChild(connector);

        }

        const dot = el("div", "careerLevelDot" + (isCompleted ? " completed" : isCurrent ? " current" : " locked"));
        dot.textContent = isCompleted ? "�?�" : (index + 1);
        levelEl.appendChild(dot);

        const label = el("div", "careerLevelLabel" + (isCurrent ? " current" : ""), t(level.nameKey));
        levelEl.appendChild(label);

        const salary = el("div", "careerLevelSalary", `${level.salaryMult}x`);
        levelEl.appendChild(salary);

        careerPath.appendChild(levelEl);

      });
      container.appendChild(careerPath);

      // Progress Info
      if (!progress.isAtTop && player.isEmployed?.()) {
        const progressCard = el("div", "statusCard");
        progressCard.innerHTML = `
          <div class="statusCardHeader">
            <span class="statusCardTitle">${t("selfdev.progress")}</span>
            <span class="statusCardValue">${Math.round(progress.progressPercent)}%</span>
          </div>
          <div class="statusCardProgress">
            <div class="statusCardProgressFill" style="width: ${progress.progressPercent}%"></div>
          </div>
          <div class="statusCardMeta">
            <span>${t("career.years_at_level", { years: progress.yearsAtLevel })}</span>
            <span>${progress.canBePromoted ? t("career.promotion_chance", { chance: Math.round(progress.promotionChance * 100) }) : ""}</span>
          </div>
        `;
        container.appendChild(progressCard);

      }

      // Performance Rating
      const perfCard = el("div", "statusCard");
      perfCard.innerHTML = `
        <div class="statusCardHeader">
          <span class="statusCardTitle">Performance Rating</span>
          <span class="statusCardValue">${Math.round(progress.performanceRating)}%</span>
        </div>
        <div class="statusCardProgress">
          <div class="statusCardProgressFill" style="width: ${progress.performanceRating}%; background: ${progress.performanceRating >= 70 ? '#51cf66' : progress.performanceRating >= 40 ? '#ffd700' : '#ff6b6b'}"></div>
        </div>
      `;
      container.appendChild(perfCard);

      // Available Jobs Section
      if (Alive.jobs && Alive.jobs.getEligibleJobsForPlayer) {
        const jobsTitle = el("h3", "statusCardTitle", t("career.available_jobs") || "Available Jobs");
        jobsTitle.style.margin = "24px 0 16px";
        container.appendChild(jobsTitle);

        const jobsList = el("div", "jobsList");
        const eligibleJobs = Alive.jobs.getEligibleJobsForPlayer(player, player.city);

        // Filter out current job and sort by salary
        const availableJobs = eligibleJobs
          .filter(j => j.id !== player.job)
          .sort((a, b) => Alive.jobs.getJobAnnualIncome(b.id, player.city) - Alive.jobs.getJobAnnualIncome(a.id, player.city));

        if (availableJobs.length === 0) {
          const noJobs = el("div", "statusLabel", "No suitable jobs found matching your qualifications in this city.");
          jobsList.appendChild(noJobs);
        } else {
          availableJobs.forEach(job => {
            const jobCard = el("div", "statusCard jobCard");
            const income = Alive.jobs.getJobAnnualIncome(job.id, player.city);

            jobCard.innerHTML = `
              <div class="statusCardHeader">
                <span class="statusCardTitle">${job.visualIndicator?.startsWith("ph-") ? `<i class="ph ${job.visualIndicator}"></i>` : (job.visualIndicator || '<i class="ph ph-briefcase"></i>')} ${t(job.nameKey)}</span>
                <span class="statusCardValue">${formatMoney(income)}/yr</span>
              </div>
              <div class="statusCardMeta" style="margin-top: 8px;">
                <span>${t("job.req")}: IQ ${job.minIntelligence}+</span>
                <span>${job.minEducationLevel > 0 ? "🎓 Req" : ""}</span>
              </div>
            `;

            const applyBtn = el("button", "btn btnPrimary btnSmall", t("job.apply") || "Apply");
            applyBtn.style.marginTop = "12px";
            applyBtn.style.width = "100%";
            applyBtn.onclick = () => {
              const oldJob = player.setJob(job.id);
              this.game.emitUpdate();
              this.showToast(icon("trophy") + " " + (t("job.hired") || "You are now a") + " " + t(job.nameKey) + "!");
              this.render();
            };
            jobCard.appendChild(applyBtn);
            jobsList.appendChild(jobCard);
          });
        }
        container.appendChild(jobsList);
      }

    }

    renderBusinessTab(container, player) {
      const selfDev = Alive.selfDevelopment;
      if (!selfDev) return;

      const progress = selfDev.getBusinessProgress(player);

      if (!progress.hasBusiness || !progress.active) {
        // No active business - show options to start
        const empty = el("div", "selfDevEmpty");
        empty.innerHTML = `
          <div class="selfDevEmptyIcon"><i class="ph ph-rocket"></i></div>
          <div class="selfDevEmptyTitle">${t("business.start")}</div>
          <div class="selfDevEmptyDesc">Build your empire from the ground up</div>
        `;
        container.appendChild(empty);

        // Business Types
        const typesTitle = el("h3", "statusCardTitle", "Choose Your Path");
        typesTitle.style.margin = "24px 0 16px";
        container.appendChild(typesTitle);

        const types = el("div", "businessTypes");
        const icons = {
          freelance: "💻", ecommerce: "🛒", consulting: "📋", restaurant: "�?️",
          tech_startup: "🚀", real_estate: "🏠", franchise: "🏪", saas: "☁️"

        };

        selfDev.BUSINESS_TYPES.forEach(type => {
          const canStart = selfDev.canStartBusiness(player, type.id);
          const typeEl = el("div", "businessType" + (!canStart.canStart ? " disabled" : ""));

          typeEl.innerHTML = `
            <div class="businessTypeIcon"><i class="ph ${icons[type.id] || "ph-briefcase"}"></i></div>
            <div class="businessTypeInfo">
              <div class="businessTypeName">${t(type.nameKey)}</div>
              <div class="businessTypeReq">Skill: ${type.skillReq}+ | Min: ${formatMoney(type.startupCost)}</div>
            </div>
            <div class="businessTypeCost">${formatMoney(type.startupCost)}</div>
          `;

          if (canStart.canStart) {
            typeEl.onclick = () => {
              const result = selfDev.startBusiness(player, type.id);
              if (result.success) {
                this.game.emitUpdate();
                this.showToast(icon("chart") + " Started " + t(type.nameKey) + "!");
                this.render();

              }

            };

          }

          types.appendChild(typeEl);

        });
        container.appendChild(types);


      } else {
        // Active business - show status
        const statusCard = el("div", "statusCard");
        statusCard.innerHTML = `
          <div class="statusCardHeader">
            <span class="statusCardTitle">${t(progress.type.nameKey)}</span>
            <span class="statusCardValue">${t(progress.state.nameKey)}</span>
          </div>
          <div class="statusCardProgress">
            <div class="statusCardProgressFill" style="width: ${progress.progressPercent}%"></div>
          </div>
          <div class="statusCardMeta">
            <span>${progress.yearsActive} years active</span>
            <span>${t("business.valuation")}: ${formatMoney(progress.valuation)}</span>
          </div>
        `;
        container.appendChild(statusCard);

        // Business State Flow
        const stateTitle = el("h3", "statusCardTitle", "Business Journey");
        stateTitle.style.margin = "24px 0 16px";
        container.appendChild(stateTitle);

        const stateFlow = el("div", "businessStateFlow");
        const stateIcons = {
          launch: "🚀", struggling: "😰", breakeven: "⚖️", growth: "📈",
          profitable: "💰", scaling: "🏆"

        };

        progress.stateOrder.forEach(stateId => {
          const isCurrent = stateId === progress.stateId;
          const isPast = progress.stateOrder.indexOf(stateId) < progress.stateOrder.indexOf(progress.stateId);

          const stateEl = el("div", "businessState" + (isCurrent ? " current" : isPast ? " completed" : ""));
          stateEl.innerHTML = `
            <div class="businessStateIcon"><i class="ph ${stateIcons[stateId] || "ph-chart-bar"}"></i></div>
            <div class="businessStateName">${t("business.state." + stateId)}</div>
          `;
          stateFlow.appendChild(stateEl);

        });
        container.appendChild(stateFlow);

        // Financials
        const financials = el("div", "portfolioSummary");
        financials.innerHTML = `
          <div class="portfolioStat">
            <div class="portfolioStatValue">${formatMoney(progress.monthlyRevenue)}</div>
            <div class="portfolioStatLabel">${t("business.monthly_revenue")}</div>
          </div>
          <div class="portfolioStat">
            <div class="portfolioStatValue ${progress.profit >= 0 ? 'positive' : 'negative'}">${formatMoney(progress.profit)}</div>
            <div class="portfolioStatLabel">Total Profit</div>
          </div>
        `;
        container.appendChild(financials);

      }

    }

    renderInvestingTab(container, player) {
      const selfDev = Alive.selfDevelopment;
      if (!selfDev) return;

      const portfolio = selfDev.getPortfolioSummary(player);

      // Portfolio Summary
      const summary = el("div", "portfolioSummary");
      summary.innerHTML = `
        <div class="portfolioStat">
          <div class="portfolioStatValue">${formatMoney(portfolio.totalValue)}</div>
          <div class="portfolioStatLabel">${t("invest.total_value")}</div>
        </div>
        <div class="portfolioStat">
          <div class="portfolioStatValue ${portfolio.overallReturn >= 0 ? 'positive' : 'negative'}">${portfolio.overallReturn >= 0 ? '+' : ''}${portfolio.overallReturn.toFixed(1)}%</div>
          <div class="portfolioStatLabel">${t("invest.total_return")}</div>
        </div>
      `;
      container.appendChild(summary);

      // Risk Meter
      const riskMeter = el("div", "riskMeter");
      const riskPercent = (portfolio.riskLevel / 5) * 100;
      riskMeter.innerHTML = `
        <div class="riskMeterLabel">
          <span>${t("invest.risk_level")}</span>
          <span>${t("invest.risk." + portfolio.riskLabel)}</span>
        </div>
        <div class="riskMeterBar">
          <div class="riskMeterIndicator" style="left: ${riskPercent}%"></div>
        </div>
      `;
      container.appendChild(riskMeter);

      // Diversification Score
      const divScore = el("div", "diversificationScore");
      divScore.innerHTML = `
        <div class="diversificationCircle" style="--score: ${portfolio.diversificationScore}%">
          <span class="diversificationValue">${Math.round(portfolio.diversificationScore)}%</span>
        </div>
        <div class="diversificationInfo">
          <div class="diversificationTitle">${t("invest.diversification")}</div>
          <div class="diversificationDesc">Spread your investments to reduce risk</div>
        </div>
      `;
      container.appendChild(divScore);

      // Holdings
      if (portfolio.holdings.length > 0) {
        const holdingsTitle = el("h3", "statusCardTitle", t("invest.portfolio"));
        holdingsTitle.style.margin = "24px 0 16px";
        container.appendChild(holdingsTitle);

        const holdings = el("div", "portfolioHoldings");
        const holdingIcons = {
          savings: "🏦", bonds: "�?", index_funds: "📊", stocks: "📈",
          real_estate: "🏠", crypto: "🪙", startups: "🚀"

        };

        portfolio.holdings.forEach(holding => {
          const holdingEl = el("div", "portfolioHolding");
          holdingEl.innerHTML = `
            <div class="holdingIcon"><i class="ph ${holdingIcons[holding.typeId] || "ph-currency-dollar"}"></i></div>
            <div class="holdingInfo">
              <div class="holdingName">${t(holding.name)}</div>
              <div class="holdingAllocation">${holding.allocation.toFixed(1)}% of portfolio</div>
            </div>
            <div class="holdingValue">
              <div class="holdingAmount">${formatMoney(holding.currentValue)}</div>
              <div class="holdingReturn ${holding.returnPercent >= 0 ? 'positive' : 'negative'}">${holding.returnPercent >= 0 ? '+' : ''}${holding.returnPercent.toFixed(1)}%</div>
            </div>
          `;
          holdings.appendChild(holdingEl);

        });
        container.appendChild(holdings);

      }

      // Investment Options
      const optionsTitle = el("h3", "statusCardTitle", "Investment Options");
      optionsTitle.style.margin = "24px 0 16px";
      container.appendChild(optionsTitle);

      const options = el("div", "investOptions");
      const optionIcons = {
        SAVINGS: "🏦", BONDS: "📜", INDEX_FUNDS: "📊", STOCKS: "📈",
        REAL_ESTATE: "🏠", CRYPTO: "🪙", STARTUPS: "🚀"

      };

      Object.entries(selfDev.INVESTMENT_TYPES).forEach(([key, type]) => {
        const optionEl = el("div", "investOption");
        optionEl.innerHTML = `
          <div class="investOptionIcon"><i class="ph ${optionIcons[key] || "ph-money"}"></i></div>
          <div class="investOptionName">${t(type.nameKey)}</div>
          <div class="investOptionReturn">~${(type.baseReturn * 100).toFixed(0)}% return</div>
          <div class="investOptionRisk">Risk: ${type.riskLevel}/5</div>
        `;
        optionEl.onclick = () => {
          const amount = Math.min(5000, Math.floor((player.money || 0) * 0.1));
          if (amount >= 100) {
            const result = selfDev.makeInvestment(player, type.id, amount);
            if (result.success) {
              this.game.emitUpdate();
              this.showToast(icon("chart") + " Invested " + formatMoney(amount) + " in " + t(type.nameKey));
              this.render();

            }

          } else {
            this.showToast("Not enough money to invest");

          }

        };
        options.appendChild(optionEl);

      });
      container.appendChild(options);

      // Skill indicator
      const skillCard = el("div", "statusCard");
      skillCard.innerHTML = `
        <div class="statusCardHeader">
          <span class="statusCardTitle">Investing Skill</span>
          <span class="statusCardValue">${portfolio.investingSkill}%</span>
        </div>
        <div class="statusCardProgress">
          <div class="statusCardProgressFill" style="width: ${portfolio.investingSkill}%; background: linear-gradient(90deg, #ffd700 0%, #51cf66 100%)"></div>
        </div>
        <div class="statusCardMeta">
          <span>Higher skill = less volatility</span>
          <span>+${(portfolio.investingSkill / 100 * 2).toFixed(1)}% bonus returns</span>
        </div>
      `;
      container.appendChild(skillCard);

    }

    // ==========================================================================
    // EMOTIONAL POLISH HELPERS
    // ==========================================================================

    triggerConfetti() {
      const container = getConfettiContainer(); // Helper below or inline
      // Create 20 confetti particles
      for (let i = 0; i < 20; i++) {
        const conf = el("div", "confetti confetti-anim");
        conf.style.left = Math.random() * 100 + "%";
        conf.style.backgroundColor = ["#00e0ff", "#ff5c95", "#ffcc00", "#4ade80"][Math.floor(Math.random() * 4)];
        conf.style.animationDelay = Math.random() * 0.5 + "s";
        conf.style.animationDuration = (2 + Math.random()) + "s";
        this.rootEl.appendChild(conf); // Use root or body

        // Remove after anim
        setTimeout(() => conf.remove(), 3000);
      }

      if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    }

    triggerFlashFail() {
      // Create overlay or flash body
      const flash = el("div", "effect-flash-fail");
      flash.style.position = "fixed";
      flash.style.top = "0";
      flash.style.left = "0";
      flash.style.width = "100%";
      flash.style.height = "100%";
      flash.style.pointerEvents = "none";
      flash.style.zIndex = "9999";
      flash.style.background = "white"; // Override for flash

      document.body.appendChild(flash);
      setTimeout(() => flash.remove(), 500);

      if (navigator.vibrate) navigator.vibrate(200);
    }
  }

  function getConfettiContainer() {
    let c = document.getElementById("confetti-container");
    if (!c) {
      c = document.createElement("div");
      c.id = "confetti-container";
      document.body.appendChild(c);
    }
    return c;
  }

  // ============================================================================
  // EXPORT
  // ============================================================================

  Alive.UI = UI;

})(window);
