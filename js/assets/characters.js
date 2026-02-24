/**
 * Characters Assets Config
 * Defines all character portrait images organized by age/gender.
 */
(function (global) {
    const Alive = (global.Alive = global.Alive || {});
    Alive.Assets = Alive.Assets || {};

    const ASSETS_PATH = "assets/characters/";

    // Character portraits organized by demographics
    // Total: 117 portraits
    // Distribution assumption: 
    //   - Male: char_1 to char_58 (58 portraits)
    //   - Female: char_59 to char_117 (59 portraits)
    // Age ranges within each gender:
    //   - Child (0-12): ~10 portraits
    //   - Teen (13-19): ~10 portraits  
    //   - Young Adult (20-35): ~15 portraits
    //   - Adult (36-55): ~13 portraits
    //   - Senior (56+): ~10 portraits

    const CHARACTERS = [];

    // Generate character entries
    for (let i = 1; i <= 117; i++) {
        const gender = i <= 58 ? "M" : "F";
        const genderOffset = gender === "M" ? 0 : 58;
        const localIndex = i - genderOffset;

        let ageRange;
        if (localIndex <= 10) ageRange = "child";
        else if (localIndex <= 20) ageRange = "teen";
        else if (localIndex <= 35) ageRange = "young_adult";
        else if (localIndex <= 48) ageRange = "adult";
        else ageRange = "senior";

        CHARACTERS.push({
            id: `char_${i}`,
            gender,
            ageRange,
            image: ASSETS_PATH + `char_${i}.webp`
        });
    }

    // Age tier definitions (for mapping player age to ageRange)
    const AGE_TIERS = {
        child: { id: "child", min: 0, max: 12 },
        teen: { id: "teen", min: 13, max: 19 },
        young_adult: { id: "young_adult", min: 20, max: 35 },
        adult: { id: "adult", min: 36, max: 55 },
        senior: { id: "senior", min: 56, max: 120 }
    };

    // Get age range from age
    function getAgeRange(age) {
        if (age <= 12) return "child";
        if (age <= 19) return "teen";
        if (age <= 35) return "young_adult";
        if (age <= 55) return "adult";
        return "senior";
    }

    // Get character portrait by ID
    function getCharacterById(id) {
        if (!id) return null;
        return CHARACTERS.find(c => c.id === id) || null;
    }

    // Get characters by gender and age range
    function getCharactersByFilter(gender, ageRange) {
        return CHARACTERS.filter(c =>
            (!gender || c.gender === gender) &&
            (!ageRange || c.ageRange === ageRange)
        );
    }

    // Get random character portrait for a player
    function getRandomCharacterForPlayer(gender, age) {
        const ageRange = getAgeRange(age);
        const candidates = getCharactersByFilter(gender, ageRange);
        if (candidates.length === 0) {
            // Fallback to any character of same gender
            const fallback = getCharactersByFilter(gender, null);
            return fallback.length > 0
                ? fallback[Math.floor(Math.random() * fallback.length)]
                : CHARACTERS[0];
        }
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    // Get character image URL for a player (deterministic based on player ID seed)
    function getCharacterImageForPlayer(player) {
        if (!player) return CHARACTERS[0].image;

        const gender = player.gender || "M";
        const age = player.age || 0;
        const ageRange = getAgeRange(age);
        const candidates = getCharactersByFilter(gender, ageRange);

        if (candidates.length === 0) return CHARACTERS[0].image;

        // Use a simple hash of player name for consistency
        const nameHash = (player.name || "").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const index = nameHash % candidates.length;

        return candidates[index].image;
    }

    // Export
    Alive.Assets.CHARACTERS = CHARACTERS;
    Alive.Assets.AGE_TIERS = AGE_TIERS;
    Alive.Assets.getAgeRange = getAgeRange;
    Alive.Assets.getCharacterById = getCharacterById;
    Alive.Assets.getCharactersByFilter = getCharactersByFilter;
    Alive.Assets.getRandomCharacterForPlayer = getRandomCharacterForPlayer;
    Alive.Assets.getCharacterImageForPlayer = getCharacterImageForPlayer;

})(window);
