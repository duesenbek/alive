/**
 * Events Module - Alive Life Simulator
 * JSON-Driven Engine
 */
(function (global) {
  const Alive = (global.Alive = global.Alive || {});

  class EventManager {
    constructor() {
      this.events = [];
      this.loaded = false;
      // Preload default events in case fetch fails or for immediate use
      this.loadEvents();
    }

    async loadEvents() {
      try {
        const response = await fetch('js/data/events.json');
        if (response.ok) {
          this.events = await response.json();
          this.loaded = true;
          console.log("Events loaded:", this.events.length);
        } else {
          console.error("Failed to load events.json");
        }
      } catch (e) {
        console.error("Error loading events:", e);
      }
    }

    /**
     * Get a random event based on tags and player state
     * @param {Object} player - Player state
     * @param {string[]} tags - Optional tags to filter by (e.g. ['minor', 'negative'])
     */
    getRandomEvent(player, tags = [], seenIds = []) {
      if (!this.loaded) return null;

      let candidates = this.events.filter(e => {
        // 1. Age Check
        if (player.age < (e.minAge || 0)) return false;
        if (player.age > (e.maxAge || 120)) return false;

        // 2. Tag Check
        if (tags.length > 0 && !tags.includes(e.tag)) return false;

        // 3. Unique events - skip if already seen
        if (e.unique && seenIds.includes(e.id)) return false;

        return true;
      });

      if (candidates.length === 0) return null;

      const ev = candidates[Math.floor(Math.random() * candidates.length)];
      return this.normalizeEvent(ev);
    }

    getEventById(id) {
      const ev = this.events.find(e => e.id === id);
      return ev ? this.normalizeEvent(ev) : null;
    }

    /**
     * Normalize event so choices have id and labelKey for UI compatibility
     */
    normalizeEvent(event) {
      if (!event) return null;
      const clone = JSON.parse(JSON.stringify(event));
      if (Array.isArray(clone.choices)) {
        clone.choices = clone.choices.map((c, i) => ({
          ...c,
          id: c.id || `choice_${i}`,
          labelKey: c.labelKey || c.text,
          label: c.label
        }));
      }
      return clone;
    }

    /**
     * Main Event Roll Logic
     * @param {Object} player - Player object
     * @returns {Object|null} Triggered event or null
     */
    rollForEvent(player) {
      if (!this.loaded || this.events.length === 0) return null;

      // 1. Global Cooldown Check (e.g. max 1 event per year, or 2 years gap)
      // Assuming player has 'lastEventYear'
      if (player.lastEventYear && (player.age - player.lastEventYear) < 2) {
        return null; // Too soon
      }

      // 2. Max Events Per Life Check
      const eventsSeen = player.history.filter(h => h.eventId).length;
      if (eventsSeen >= 8) return null; // Cap at 8 important events

      // 3. Roll for Trigger Chance (30% chance per year)
      // Modify chance based on drama? For now flat 30%.
      if (Math.random() > 0.3) return null;

      // 4. Get Candidates
      // Filter by Age, Cooldowns (specific event recurrence), and Tags
      const candidates = this.events.filter(e => {
        // Age
        if (player.age < (e.minAge || 0)) return false;
        if (player.age > (e.maxAge || 120)) return false;

        // Unique
        if (e.unique && player.history.some(h => h.eventId === e.id)) return false;

        return true;
      });

      if (candidates.length === 0) return null;

      // 5. Weighted Selection
      // TODO: Implement sophisticated weights. For now, random.
      const event = candidates[Math.floor(Math.random() * candidates.length)];

      // Update Player State
      player.lastEventYear = player.age;

      return event;
    }

    /**
     * Prepares an event for the player, filtering choices based on state.
     * Implements Ad Fatigue Protection (Max 3 ads per life).
     */
    prepareEvent(eventIdOrObj, player) {
      let event = (typeof eventIdOrObj === 'string') ? this.getEventById(eventIdOrObj) : eventIdOrObj;
      if (!event) return null;

      // Clone to avoid mutating static data
      let processedEvent = JSON.parse(JSON.stringify(event));

      // AD FATIGUE CHECK - Max 2 ads per life (mercy principle)
      // If player has watched >= 2 ads, remove choices with 'adReward'
      if (player.adsWatched !== undefined && player.adsWatched >= 2) {
        processedEvent.choices = processedEvent.choices.filter(c => !c.adReward);
      }

      // If filtering leaves no choices (unlikely for well-designed events, but strictly possible),
      // we might revert or just show it (it will look broken). 
      // Our Crisis events always have a non-ad option ("Accept Fate"), so this is safe.

      return processedEvent;
    }

    triggerEvent(event, player) {
      return this.prepareEvent(event, player);
    }

    isChoiceAvailable(choice, player) {
      if (!choice?.conditions) return true;
      const c = choice.conditions;
      if (c.minMoney !== undefined && (player.money || 0) < c.minMoney) return false;
      if (c.requiresJob && !player.job) return false;
      if (c.requiresPartner && !player.partner) return false;
      if (c.minAge !== undefined && player.age < c.minAge) return false;
      return true;
    }

    applyChoice(choice, player) {
      let outcome = { text: choice.text, changes: choice.statChanges || choice.effects, adReward: choice.adReward };

      // 1. Stat Changes (events.json format: money, health, happiness)
      if (choice.statChanges) {
        for (let [key, val] of Object.entries(choice.statChanges)) {
          if (key === 'money' && player.money !== undefined) {
            player.money += val;
          } else if (player[key] !== undefined && typeof player[key] === 'number') {
            player[key] += val;
          }
          if (player.modifyStat && ['health', 'happiness', 'stress', 'energy', 'intelligence'].includes(key)) {
            player.modifyStat(key, val);
          }
        }
      }

      // 2. Effects (controlled events format: moneyDelta, healthDelta, etc.)
      if (choice.effects && player.applyEffects) {
        player.applyEffects(choice.effects);
      }

      // 3. Ad Reward - Game handles via choice.adReward
      if (choice.adReward) {
        console.log("Choice triggers Ad Reward:", choice.adReward);
      }

      // 4. Special Logic Hooks
      if (choice.specialEffect) {
        outcome.specialEffect = choice.specialEffect;
      }

      return outcome;
    }
  }

  Alive.events = new EventManager();

})(window);
