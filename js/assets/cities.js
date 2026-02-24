/**
 * City Backgrounds Assets Config
 * Defines all city background images for the game.
 */
(function (global) {
    const Alive = (global.Alive = global.Alive || {});
    Alive.Assets = Alive.Assets || {};

    const ASSETS_PATH = "assets/cities/";

    // Generate city assets array (72 cities)
    const CITY_BACKGROUNDS = [];
    for (let i = 1; i <= 72; i++) {
        CITY_BACKGROUNDS.push({
            id: `city_${i}`,
            image: ASSETS_PATH + `city_${i}.webp`
        });
    }

    // Helper function to get city background by ID
    function getCityBackgroundById(id) {
        if (!id) return CITY_BACKGROUNDS[0];
        return CITY_BACKGROUNDS.find(c => c.id === id) || CITY_BACKGROUNDS[0];
    }

    // Get random city background
    function getRandomCityBackground() {
        return CITY_BACKGROUNDS[Math.floor(Math.random() * CITY_BACKGROUNDS.length)];
    }

    // Get city background by index (1-based)
    function getCityBackgroundByIndex(index) {
        const i = Math.max(1, Math.min(72, index)) - 1;
        return CITY_BACKGROUNDS[i];
    }

    // Export
    Alive.Assets.CITY_BACKGROUNDS = CITY_BACKGROUNDS;
    Alive.Assets.getCityBackgroundById = getCityBackgroundById;
    Alive.Assets.getRandomCityBackground = getRandomCityBackground;
    Alive.Assets.getCityBackgroundByIndex = getCityBackgroundByIndex;

})(window);
