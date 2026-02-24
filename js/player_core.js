/**
 * Player Module - Alive Life Simulator
 * Refactored: Hybrid Architecture
 * - Preserves utility methods (Economy, Assets, Jobs) for Game/UI compatibility
 * - Implements new "SimulateAction", Fail States, and Batch Simulation
 */
(function (global) {
  const Alive = (global.Alive = global.Alive || {});

  class Player {
    constructor(state) {
      this.reset(state);
    }

    // =========================================================================
    // 1. INITIALIZATION & DATA (Model)
    // =========================================================================

    reset(state = {}) {
      const defaults = {
        name: "Unknown",
        gender: "M",
        age: 0,
        alive: true,

        // Core Stats
        health: 80,
        happiness: 80,
        energy: 100,
        stress: 0,
        intelligence: 50,
        attractiveness: 50,

        // Skills (Flat structure for compatibility)
        sportsSkill: 0,
        businessSkill: 0,
        investingSkill: 0,
        careerSkill: 0,
        socialSkill: 0,
        hobbySkills: {},
        mainHobbyId: null,

        // Financial
        money: 0,
        netWorth: 0,
        annualIncome: 0,
        annualExpenses: 0,
        gems: 5,
        familyWealthTier: "medium",
        adsWatched: 0, // NEW: Ad Fatigue Protection

        // Assets / Location
        city: "almaty",
        cityId: "almaty",
        housing: "apartment",
        car: null,
        inventoryOwned: [],
        investments: [],

        // Career / Education
        job: "unemployed",
        jobYearsInRole: 0,
        educationLevel: 0,
        inUniversity: false,
        universityYearsRemaining: 0,

        // Relationships
        partner: null,
        children: [],
        parents: { mother: null, father: null },
        siblings: [],
        friends: [],
        pets: [],

        // Tracking
        history: [],
        citiesVisited: ["almaty"],
        jobsHeld: [],
        richListPassedNpcIds: [],

        // Flags (New)
        flags: {
          isBankrupt: false,
          isBurnout: false
        }
      };

      Object.assign(this, defaults, state);

      // Ensure complex objects
      this.history = Array.isArray(this.history) ? this.history : [];
      this.investments = Array.isArray(this.investments) ? this.investments : [];
      this.children = Array.isArray(this.children) ? this.children : [];
      this.salary = 0; // Temp

      // Initial wealth logic
      if (this.age === 0 && this.money === 0) {
        const map = { low: 100, medium: 2500, high: 15000, very_high: 100000 };
        this.money = map[this.familyWealthTier] || 2500;
        this.netWorth = this.money;
      }

      this.clampAllStats();
    }

    // Persistence
    toJSON() {
      return { ...this }; // Simple clone for now, typically specific fields
    }

    // =========================================================================
    // 2. STAT MANAGEMENT
    // =========================================================================

    clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }

    clampAllStats() {
      this.health = this.clamp(this.health, 0, 100);
      this.happiness = this.clamp(this.happiness, 0, 100);
      this.energy = this.clamp(this.energy, 0, 100);
      this.stress = this.clamp(this.stress, 0, 100);

      this.sportsSkill = this.clamp(this.sportsSkill, 0, 100);
      this.businessSkill = this.clamp(this.businessSkill, 0, 100);
      this.investingSkill = this.clamp(this.investingSkill, 0, 100);
      this.careerSkill = this.clamp(this.careerSkill, 0, 100);
      this.socialSkill = this.clamp(this.socialSkill, 0, 100);
    }

    modifyStat(stat, value) {
      if (typeof this[stat] === 'number') {
        this[stat] = this.clamp(this[stat] + value, 0, 100);
      }
    }

    // Compatibility Wrapper
    gainSkill(skillKey, delta) {
      this.modifyStat(skillKey, delta);
    }

    // =========================================================================
    // 3. ACTION EXECUTION (New Controller Logic)
    // =========================================================================

    simulateAction(actionId) {
      if (!this.alive) return { success: false, reason: "Dead" };

      const actionDef = Alive.actions && Alive.actions.getActionById
        ? Alive.actions.getActionById(actionId)
        : null;

      // If we can't find definition (e.g. dynamic actions), maybe fail or just log
      if (!actionDef) {
        // Fallback logic could go here, or return fail
        // For simulation test, we might mock it
        return { success: false, reason: "Action not found" };
      }

      // 1. Requirements & Cost
      if (actionDef.cost > this.money) return { success: false, reason: "Cost" };

      // 2. Apply
      this.money -= (actionDef.cost || 0);
      if (actionDef.effects) {
        for (let [k, v] of Object.entries(actionDef.effects)) {
          this.modifyStat(k, v);
        }
      }

      // 3. Log
      this.history.push({ year: this.age, action: actionId, result: "success" });

      // 4. Fail States
      this.checkFailStates();

      return { success: true };
    }

    applyEffects(effects) {
      if (!effects) return;

      const mapping = {
        healthDelta: 'health',
        happinessDelta: 'happiness',
        energyDelta: 'energy',
        stressDelta: 'stress',
        moneyDelta: 'money'
      };

      for (let [k, v] of Object.entries(effects)) {
        // Special effects from controlled events
        if (k === 'carChange') {
          this.car = v;
          if (Alive.vehicles || this.recalculateEconomy) this.recalculateEconomy?.();
          continue;
        }
        if (k === 'housingChange') {
          this.housing = v;
          if (this.recalculateEconomy) this.recalculateEconomy();
          continue;
        }
        if (k === 'jobChange') {
          this.job = v || "unemployed";
          this.jobYearsInRole = 0;
          if (this.recalculateEconomy) this.recalculateEconomy();
          continue;
        }
        if (k === 'marriageStart') {
          this.marriageStatus = "married";
          continue;
        }
        if (k === 'relationshipEnd') {
          this.partner = null;
          this.marriageStatus = "single";
          continue;
        }
        if (k === 'triggerChild' && Alive.relationships?.haveChild) {
          Alive.relationships.haveChild(this);
          continue;
        }

        const stat = mapping[k] || k;

        if (stat === 'money') {
          this.money += v;

          // Immediate bankruptcy/game-over when debt reaches negative
          if (this.money < 0 && global.aliveGame && !global.aliveGame.ended) {
            global.aliveGame.failCause = 'bankruptcy';
            global.aliveGame.endGame();
            return;
          }
        } else if (this.modifyStat && typeof this[stat] === 'number') {
          this.modifyStat(stat, v);
        }
      }

      // Ensure stats stay within bounds after applying effects
      this.clampAllStats();
    }

    addHistoryEntry(eventId, choiceId) {
      if (!this.history) this.history = [];
      this.history.push({
        year: this.age,
        eventId: eventId,
        choiceMade: choiceId
      });
    }

    /**
     * CRISIS SYSTEM
     * Replaces old hard-fail states with "Crisis Events" that offer Ad solutions.
     */
    checkCrisisStates() {
      if (!global.aliveGame || !global.aliveGame.triggerEvent) return;

      // 1. CRITICAL HEALTH (The Death Spiral) -> Risk of death
      // Trigger: Health < 10% (closer to death threshold for consistency)
      if (this.health < 10 && this.alive) {
        // Chance to trigger "Medical Emergency" event
        // If we just triggered it recently, maybe skip?
        // For now, always check, event system handles cooldown or unique ID
        global.aliveGame.triggerEvent("crisis_health_critical");
        return; // One crisis at a time
      }

      // 2. BANKRUPTCY (The Debt Trap)
      // Trigger: Money < -4000 (warning before death threshold)
      if (this.money < -4000 && !this.flags.isBankrupt) {
        global.aliveGame.triggerEvent("crisis_bankruptcy_looming");
        return;
      }

      // 2b. POVERTY WARNING (Emergency Cash)
      // Trigger: Money < 200 (but not bankrupt yet)
      if (this.money < 200 && this.money > -5000 && this.age > 18) {
        // COOLDOWN: Don't show if seen in last 3 years
        const lastSeen = this.history.filter(h => h.eventId === 'crisis_poverty_warning').pop();
        if (lastSeen && (this.age - lastSeen.year) < 3) return;

        // Small chance to get a "Payday Loan" offer if not recently triggered
        if (Math.random() < 0.2) { // 20% chance per year when poor
          global.aliveGame.triggerEvent("crisis_poverty_warning");
          return;
        }
      }

      // 3. POVERTY TRAP (Job Loss)
      // Trigger: Unemployed + Savings < 1000 + Age < 65
      if (!this.isEmployed() && this.money < 1000 && this.age < 65 && this.age > 18) {
        // Small chance per year to get a "Lifeline" offer
        if (Math.random() < 0.3) {
          global.aliveGame.triggerEvent("crisis_unemployed_desperate");
          return;
        }
      }

      // 4. OLD AGE (Natural Death)
      // Still kills you, but maybe offer "Extension"?
      if (this.age > 85 && Math.random() < ((this.age - 85) * 0.05)) {
        this.death("Old Age");
      }
    }

    death(cause) {
      console.log(`Player Died: ${cause}`);
      this.alive = false;
      if (global.aliveGame && global.aliveGame.triggerGameOver) {
        global.aliveGame.triggerGameOver(cause);
      }
    }

    // Deprecated direct calls, everything goes through events now
    bankruptcy() { /* Handled by event consequences */ }
    burnout() { /* Handled by event consequences */ }

    // =========================================================================
    // 4. UTILITY METHODS (Restored for Compatibility)
    // =========================================================================

    // Economy
    recalculateEconomy() {
      // 1. Inflation (7% per year since age 18) - TUNED for late-game pressure
      const yearsSince18 = Math.max(0, this.age - 18);
      const inflation = Math.pow(1.07, yearsSince18);

      // 2. Base Income with Volatility
      const baseSalary = this.getJobIncome();
      // Volatility: +/- 20% random swing per year to simulate unstable markets
      const volatility = (Math.random() * 0.4) - 0.2;
      this.annualIncome = Math.floor(baseSalary * (1 + volatility));

      // 3. EXPENSES (The Sinks)

      // A. Housing (Base: $1000/mo * CityTier * Inflation)
      // If no city module, assume x1.0 multiplier
      const cityTierMult = (Alive.cities && Alive.cities.getCostMultiplier)
        ? Alive.cities.getCostMultiplier(this.city)
        : 1.0;
      let housingCost = 0;
      if (this.housing && typeof this.housing === 'object') {
        // Maintenance + Property Tax (1% of value)
        const annualMaint = (this.housing.monthlyMaintenance || 100) * 12;
        const propertyTax = Math.floor((this.housing.currentValue || this.housing.basePrice || 0) * 0.01);
        housingCost = Math.floor((annualMaint * cityTierMult * inflation) + propertyTax);
      } else {
        // Renting
        const housingBase = 12000; // $1k/mo - TUNED for early-game relief
        housingCost = Math.floor(housingBase * cityTierMult * inflation);
      }

      // B. Groceries & Essentials ($420/mo * Inflation) - TUNED
      const foodCost = Math.floor(5000 * inflation);

      // C. Transport Maintenance (Vehicle Cost * 20%)
      // Cheap cars break more often? For now, flat % of value/cost
      const transportCost = this.getTransportMaintenanceCost();

      // D. Healthcare (Exponential with Age) - TUNED for late-game danger
      // Age 20: $800/yr. Age 60: $5k/yr. Age 80: $15k/yr
      const healthBase = 800;
      const healthCost = Math.floor(healthBase * Math.pow(1.06, yearsSince18));

      // E. Family (Kids are expensive)
      const familyCost = (this.children.length * 3000 * inflation);

      // F. Tax (Flat 20%)
      const tax = Math.floor(this.annualIncome * 0.2);

      // Total
      this.annualExpenses = housingCost + foodCost + transportCost + healthCost + familyCost + tax;

      // Debug Economy
      // console.log(`Econ Age ${this.age}: Inc ${this.annualIncome} - Exp ${this.annualExpenses} (Net: ${this.annualIncome - this.annualExpenses})`);

      return { income: this.annualIncome, expenses: this.annualExpenses };
    }

    getTransportMaintenanceCost() {
      if (!this.car) return 0;

      // Handle new object format
      if (typeof this.car === 'object' && this.car.annualMaintenance !== undefined) {
        return this.car.annualMaintenance;
      }

      // Fallback for legacy string format or missing data
      let carId = typeof this.car === 'object' ? this.car.id : this.car;
      if (Alive.vehicles && Alive.vehicles.getVehicle) {
        const v = Alive.vehicles.getVehicle(carId);
        if (v && v.maintenance) return v.maintenance;
      }
      return 2000; // Fallback
    }

    updateNetWorth() {
      const investments = this.getInvestmentsTotal();
      const property = this.getHousingValue(); // simplified
      const car = this.getCarValue();
      this.netWorth = this.money + investments + property + car;
      return this.netWorth;
    }

    // Jobs
    isEmployed() { return this.job && this.job !== "unemployed"; }
    setJob(id) { this.job = id; this.jobYearsInRole = 0; }
    getJobIncome() {
      if (!this.isEmployed()) return 0;
      return Alive.jobs ? Alive.jobs.getJobAnnualIncome(this.job, this.city) : 0;
    }

    // Cities
    moveToCity(id) {
      this.city = id;
      this.cityId = id;
      this.housing = "apartment";
      this.recalculateEconomy();
      return true;
    }

    // Assets
    getHousingValue() {
      if (!this.housing || this.housing === 'apartment') return 0;
      if (typeof this.housing === 'string') return 50000; // Legacy
      return this.housing.currentValue || this.housing.basePrice || 50000;
    }

    getCarValue() {
      if (!this.car) return 0;
      if (typeof this.car === 'string') return 10000; // Legacy

      const yearsOwned = Math.max(0, this.age - (this.car.purchaseYear || this.age));
      // Depreciate 15% per year
      const depreciation = Math.pow(0.85, yearsOwned);
      return Math.floor(this.car.basePrice * depreciation);
    }

    buyHouse(id, price = 50000, maintenanceCost = 100) {
      if (this.money < price) return false;
      this.money -= price;
      // Sell existing house if we own one
      if (this.housing && this.housing !== "apartment") {
        this.sellHouse();
      }
      this.housing = { id: id, purchaseYear: this.age, basePrice: price, currentValue: price, monthlyMaintenance: maintenanceCost };
      this.recalculateEconomy();
      return true;
    }

    sellHouse() {
      if (!this.housing || this.housing === "apartment") return false;
      const value = this.getHousingValue();
      this.money += value;
      this.housing = "apartment";
      this.recalculateEconomy();
      return true;
    }

    buyCar(id, price = 10000, maintenanceCost = 1200) {
      if (this.money < price) return false;
      this.money -= price;
      // Sell existing car if we own one
      if (this.car) {
        this.sellCar();
      }
      this.car = { id: id, purchaseYear: this.age, basePrice: price, currentValue: price, annualMaintenance: maintenanceCost };
      this.recalculateEconomy();
      return true;
    }

    sellCar() {
      if (!this.car) return false;
      const value = this.getCarValue();
      this.money += value;
      this.car = null;
      this.recalculateEconomy();
      return true;
    }

    // Investments
    getInvestmentsTotal() {
      return this.investments.reduce((sum, inv) => sum + (inv.currentValue || inv.amount), 0);
    }

    invest(type, amount) {
      // Validate amount
      if (typeof amount !== 'number' || amount <= 0 || !isFinite(amount)) {
        return false;
      }
      if (amount > this.money) return false;

      // Additional validation to prevent exploits
      const maxInvestment = Math.min(this.money, 10000000); // Cap at $10M per investment
      if (amount > maxInvestment) return false;

      this.money -= amount;
      this.investments.push({ type, amount, currentValue: amount, year: this.age });
      this.updateNetWorth();
      return true;
    }

    applyYearlyUpdate(marketModifiers = {}) {
      // Note: age is incremented by game.nextYear() - do NOT increment here (prevents double increment)
      this.recalculateEconomy();

      // Real estate appreciation based on market modifiers
      if (this.housing && typeof this.housing === 'object') {
        const appreciation = (marketModifiers.realestate || 0) + 0.03; // Base 3% growth + market
        this.housing.currentValue = Math.floor((this.housing.currentValue || this.housing.basePrice) * (1 + appreciation));
      }

      // Update investments based on market modifiers
      if (this.investments && this.investments.length > 0) {
        this.investments.forEach(inv => {
          const modifier = marketModifiers[inv.type] || 0;
          inv.currentValue = Math.floor((inv.currentValue || inv.amount) * (1 + modifier));
        });
      }

      this.processJobRisks(); // NEW: Trigger career risks
      this.checkCrisisStates(); // NEW: Trigger Crisis Events
    }

    processJobRisks() {
      if (!this.isEmployed()) return;

      const job = Alive.jobs ? Alive.jobs.getJobById(this.job) : null;
      if (!job || !job.careerRisks) return;

      for (const risk of job.careerRisks) {
        if (Math.random() < risk.chance) {
          const riskName = risk.name || risk; // Handle string or object risk
          console.log(`Career Risk Triggered: ${riskName}`);

          // Apply Consequence
          if (global.aliveGame && global.aliveGame.triggerEvent) {
            // Map risk name to generic event or specifically handled one
            // For simplify, we just fire/burnout directly here or trigger generic events
            switch (riskName) {
              case 'fired':
              case 'layoff':
                global.aliveGame.triggerEvent('career_fired'); // Needs to exist or handled generic
                this.job = "unemployed";
                this.addHistoryEntry("job_loss", "fired");
                Alive.ui?.showToast("Performance review didn't go well. Job lost.");
                break;
              case 'burnout':
                this.burnout();
                break;
              case 'scandal':
                this.money -= 50000; // Massive Fine
                this.job = "unemployed";
                this.modifyStat('happiness', -50);
                Alive.ui?.showToast("A scandal costs you your job and $50k.");
                break;
              case 'accident':
              case 'injury':
                this.modifyStat('health', -30);
                this.money -= 5000; // Medical bill
                Alive.ui?.showToast("🚑 Work Accident! Health -30, Cost $5k.");
                break;
            }
          }
          break; // One disaster per year max
        }
      }
    }

    // =========================================================================
    // 5. SIMULATION
    // =========================================================================

    static runBatchSimulation(n = 10) {
      console.log(`Running Simulation for ${n} lives...`);
      const stats = { avgAge: 0, avgNetWorth: 0, causes: {} };

      for (let i = 0; i < n; i++) {
        const p = new Player({ familyWealthTier: "medium" });

        // Mock Actions access for simulation
        const mockActions = {
          "work": { cost: 0, effects: { stress: 5, money: 5000 } },
          "relax": { cost: 500, effects: { stress: -10, happiness: 5 } }
        };

        while (p.alive && p.age < 120) {
          p.age++;
          // Simple Logic
          if (p.stress > 80) {
            p.money -= 500;
            p.modifyStat('stress', -10);
          } else {
            p.money += 5000;
            p.modifyStat('stress', 5);
          }
          p.checkFailStates();
        }

        stats.avgAge += p.age;
        stats.avgNetWorth += p.money;
        const cause = p.health <= 0 ? "Health" : "Old Age";
        stats.causes[cause] = (stats.causes[cause] || 0) + 1;
      }

      stats.avgAge /= n;
      stats.avgNetWorth /= n;
      console.table(stats);
      return stats;
    }

    // Factory method for creating new players safely
    static createNew(state) {
      return new Player(state);
    }
  }

  // Utilities
  Alive.utils = Alive.utils || { clamp: (v, min, max) => Math.min(max, Math.max(min, v)) };
  Alive.Player = Player;

  // Factory method (assigned directly to ensure availability)
  Alive.Player.createNew = function (state) {
    return new Player(state);
  };

})(window);
