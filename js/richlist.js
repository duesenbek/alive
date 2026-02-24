/**
 * Rich List Module - Alive Life Simulator
 * Static global billionaire leaderboard (fictional/parody names)
 */
(function (global) {
  const Alive = (global.Alive = global.Alive || {});

  const industries = {
    tech: "tech",
    finance: "finance",
    energy: "energy",
    realestate: "realestate",
    retail: "retail",
    media: "media",
    health: "health",
    manufacturing: "manufacturing",
    transport: "transport",
    gaming: "gaming"
  };

  const billionaires = [
    { id: "rl_001", displayName: "Jess Bezos", countryId: "us", industry: industries.retail, netWorth: 295000000000 },
    { id: "rl_002", displayName: "Elon Ma", countryId: "us", industry: industries.tech, netWorth: 275000000000 },
    { id: "rl_003", displayName: "Mar Zuck", countryId: "us", industry: industries.tech, netWorth: 225000000000 },
    { id: "rl_004", displayName: "Warren Buffen", countryId: "us", industry: industries.finance, netWorth: 185000000000 },
    { id: "rl_005", displayName: "Larri Pagey", countryId: "us", industry: industries.tech, netWorth: 165000000000 },
    { id: "rl_006", displayName: "Ser Gay Brin", countryId: "us", industry: industries.tech, netWorth: 160000000000 },
    { id: "rl_007", displayName: "Bernie Arno", countryId: "fr", industry: industries.retail, netWorth: 155000000000 },
    { id: "rl_008", displayName: "Mukesh Amban-ish", countryId: "in", industry: industries.energy, netWorth: 145000000000 },
    { id: "rl_009", displayName: "Gautam Adon", countryId: "in", industry: industries.energy, netWorth: 135000000000 },
    { id: "rl_010", displayName: "Ma Jack", countryId: "cn", industry: industries.tech, netWorth: 120000000000 },
    { id: "rl_011", displayName: "Pony Ma", countryId: "cn", industry: industries.tech, netWorth: 118000000000 },
    { id: "rl_012", displayName: "Fran Sisco Slim", countryId: "us", industry: industries.transport, netWorth: 112000000000 },
    { id: "rl_013", displayName: "Amansio Ort-ega", countryId: "gb", industry: industries.retail, netWorth: 108000000000 },
    { id: "rl_014", displayName: "Zhong Shan-Shan", countryId: "cn", industry: industries.health, netWorth: 104000000000 },
    { id: "rl_015", displayName: "Savet Nadella", countryId: "us", industry: industries.tech, netWorth: 98000000000 },
    { id: "rl_016", displayName: "Tim Cooked", countryId: "us", industry: industries.tech, netWorth: 92000000000 },
    { id: "rl_017", displayName: "Reed Has-Things", countryId: "us", industry: industries.media, netWorth: 88000000000 },
    { id: "rl_018", displayName: "Oprah Win-Money", countryId: "us", industry: industries.media, netWorth: 84000000000 },
    { id: "rl_019", displayName: "Karlos Ghosn’t", countryId: "jp", industry: industries.manufacturing, netWorth: 80000000000 },
    { id: "rl_020", displayName: "Li Ka-Shing", countryId: "cn", industry: industries.realestate, netWorth: 78000000000 },

    { id: "rl_021", displayName: "Maya Linch", countryId: "us", industry: industries.finance, netWorth: 76000000000 },
    { id: "rl_022", displayName: "George Soros-ish", countryId: "us", industry: industries.finance, netWorth: 74000000000 },
    { id: "rl_023", displayName: "Ray Dalio-ly", countryId: "us", industry: industries.finance, netWorth: 72000000000 },
    { id: "rl_024", displayName: "Jack Maaagnate", countryId: "cn", industry: industries.tech, netWorth: 70000000000 },
    { id: "rl_025", displayName: "Bobby Kotick-ly", countryId: "us", industry: industries.gaming, netWorth: 68000000000 },
    { id: "rl_026", displayName: "Notch Rich", countryId: "se", industry: industries.gaming, netWorth: 66000000000 },
    { id: "rl_027", displayName: "Sheryl Sand-Berg", countryId: "us", industry: industries.tech, netWorth: 64000000000 },
    { id: "rl_028", displayName: "Howard Tuck", countryId: "us", industry: industries.retail, netWorth: 62000000000 },
    { id: "rl_029", displayName: "Masayoshi Son-ny", countryId: "jp", industry: industries.tech, netWorth: 60000000000 },
    { id: "rl_030", displayName: "Roman Abram-Ouch", countryId: "ru", industry: industries.energy, netWorth: 58000000000 },

    { id: "rl_031", displayName: "Alisher Us-man", countryId: "ru", industry: industries.manufacturing, netWorth: 56000000000 },
    { id: "rl_032", displayName: "Dasha Koval-Estate", countryId: "ru", industry: industries.realestate, netWorth: 54000000000 },
    { id: "rl_033", displayName: "Hans Zimmer-wealth", countryId: "de", industry: industries.media, netWorth: 52000000000 },
    { id: "rl_034", displayName: "Chun Li-quid", countryId: "cn", industry: industries.finance, netWorth: 50000000000 },
    { id: "rl_035", displayName: "Amina Al Gold", countryId: "ae", industry: industries.realestate, netWorth: 48000000000 },
    { id: "rl_036", displayName: "Omar Oilman", countryId: "ae", industry: industries.energy, netWorth: 46000000000 },
    { id: "rl_037", displayName: "Noura Sky-Towers", countryId: "ae", industry: industries.realestate, netWorth: 44000000000 },
    { id: "rl_038", displayName: "Carlos Buildo", countryId: "br", industry: industries.realestate, netWorth: 42000000000 },
    { id: "rl_039", displayName: "Ana Venture", countryId: "br", industry: industries.finance, netWorth: 40000000000 },
    { id: "rl_040", displayName: "Pierre Petro", countryId: "fr", industry: industries.energy, netWorth: 38000000000 },

    { id: "rl_041", displayName: "Sven Steel", countryId: "se", industry: industries.manufacturing, netWorth: 34000000000 },
    { id: "rl_042", displayName: "Keiko Chips", countryId: "jp", industry: industries.tech, netWorth: 32000000000 },
    { id: "rl_043", displayName: "Luca Luxe", countryId: "it", industry: industries.retail, netWorth: 30000000000 },
    { id: "rl_044", displayName: "Mina Media", countryId: "gb", industry: industries.media, netWorth: 28000000000 },
    { id: "rl_045", displayName: "Ethan Ether", countryId: "ca", industry: industries.tech, netWorth: 24000000000 },
    { id: "rl_046", displayName: "Grace GreenGrid", countryId: "de", industry: industries.energy, netWorth: 22000000000 },
    { id: "rl_047", displayName: "Noah Real-Estate", countryId: "us", industry: industries.realestate, netWorth: 18000000000 },
    { id: "rl_048", displayName: "Ivy Vault", countryId: "gb", industry: industries.finance, netWorth: 15000000000 },
    { id: "rl_049", displayName: "Zara Zinc", countryId: "au", industry: industries.manufacturing, netWorth: 12000000000 },
    { id: "rl_050", displayName: "Kaito Cargo", countryId: "jp", industry: industries.transport, netWorth: 10500000000 }
  ];

  function getAllBillionaires() {
    return billionaires.slice();
  }

  function getSortedBillionairesDesc() {
    return getAllBillionaires().sort((a, b) => (b.netWorth || 0) - (a.netWorth || 0));
  }

  function getPlayerRankByNetWorth(playerNetWorth) {
    const nw = Math.max(0, Number(playerNetWorth) || 0);
    const sorted = getSortedBillionairesDesc();
    for (let i = 0; i < sorted.length; i++) {
      if (nw >= (sorted[i].netWorth || 0)) return i + 1;
    }
    return sorted.length + 1;
  }

  function buildRankingWithPlayer(player) {
    const sorted = getSortedBillionairesDesc();
    const playerNetWorth = Math.max(0, Number(player?.netWorth) || 0);

    const entries = sorted.map((b) => ({
      ...b,
      type: "npc"
    }));

    if (player) {
      entries.push({
        id: "player",
        displayName: player.name || "Player",
        countryId: player.countryId,
        industry: "player",
        netWorth: playerNetWorth,
        type: "player"
      });
    }

    entries.sort((a, b) => (b.netWorth || 0) - (a.netWorth || 0));
    return entries.map((e, idx) => ({ ...e, rank: idx + 1 }));
  }

  function buildTopWithPlayer(player, topN = 10) {
    const sorted = getSortedBillionairesDesc();
    const playerNetWorth = Math.max(0, Number(player?.netWorth) || 0);

    const entries = sorted.map((b) => ({
      ...b,
      type: "npc"
    }));

    if (player) {
      entries.push({
        id: "player",
        displayName: player.name || "Player",
        countryId: player.countryId,
        industry: "player",
        netWorth: playerNetWorth,
        type: "player"
      });
    }

    entries.sort((a, b) => (b.netWorth || 0) - (a.netWorth || 0));

    const ranked = entries.map((e, idx) => ({ ...e, rank: idx + 1 }));
    const top = ranked.slice(0, topN);

    const threshold = sorted.length ? (sorted[sorted.length - 1].netWorth || 0) : 0;
    const playerRank = player ? getPlayerRankByNetWorth(playerNetWorth) : null;

    return {
      top,
      threshold,
      playerRank,
      isPlayerAboveThreshold: player ? playerNetWorth >= threshold : false
    };
  }

  function getNewlyPassedBillionaires(prevNetWorth, nextNetWorth, passedNpcIds) {
    const prev = Math.max(0, Number(prevNetWorth) || 0);
    const next = Math.max(0, Number(nextNetWorth) || 0);
    if (next <= prev) return { passedIds: [], richestPassed: null };

    const passedSet = new Set(Array.isArray(passedNpcIds) ? passedNpcIds : []);
    const newlyPassed = billionaires.filter((b) => {
      const w = Number(b.netWorth) || 0;
      return prev < w && next >= w && !passedSet.has(b.id);
    });

    if (newlyPassed.length === 0) return { passedIds: [], richestPassed: null };

    const passedIds = newlyPassed.map((b) => b.id);
    const richestPassed = newlyPassed.reduce((best, cur) => {
      if (!best) return cur;
      return (cur.netWorth || 0) > (best.netWorth || 0) ? cur : best;
    }, null);

    return { passedIds, richestPassed };
  }

  Alive.richList = {
    industries,
    getAllBillionaires,
    getSortedBillionairesDesc,
    getPlayerRankByNetWorth,
    buildRankingWithPlayer,
    buildTopWithPlayer,
    getNewlyPassedBillionaires
  };
})(window);
