/**
 * AssetResolver — Unified contract for resolving asset images.
 * Provides: buildingImage, transportImage, characterImage
 * Includes fallback + console.warn on broken paths.
 */
(function (global) {
    const Alive = (global.Alive = global.Alive || {});

    const FALLBACK_IMAGE = "assets/misc/placeholder.webp";

    /**
     * Resolve a building image by building ID.
     * @param {string} id - Building ID (e.g. "building_1")
     * @returns {string} Image URL or fallback
     */
    function buildingImage(id) {
        if (!id) return FALLBACK_IMAGE;
        if (!Alive.Assets || !Alive.Assets.getBuildingById) {
            console.warn(`[AssetResolver] Buildings module not loaded, falling back for: ${id}`);
            return FALLBACK_IMAGE;
        }
        const b = Alive.Assets.getBuildingById(id);
        if (!b || !b.image) {
            console.warn(`[AssetResolver] Building image not found for id: ${id}`);
            return FALLBACK_IMAGE;
        }
        return b.image;
    }

    /**
     * Resolve a transport image by transport ID.
     * @param {string} id - Transport ID (e.g. "transport_1")
     * @returns {string} Image URL or fallback
     */
    function transportImage(id) {
        if (!id) return FALLBACK_IMAGE;
        if (!Alive.Assets || !Alive.Assets.getVehicleById) {
            console.warn(`[AssetResolver] Vehicles module not loaded, falling back for: ${id}`);
            return FALLBACK_IMAGE;
        }
        const v = Alive.Assets.getVehicleById(id);
        if (!v || !v.image) {
            console.warn(`[AssetResolver] Transport image not found for id: ${id}`);
            return FALLBACK_IMAGE;
        }
        return v.image;
    }

    /**
     * Resolve a character portrait image for a player.
     * @param {object} player - Player object with gender, age, name
     * @returns {string} Image URL or fallback
     */
    function characterImage(player) {
        if (!Alive.Assets || !Alive.Assets.getCharacterImageForPlayer) {
            console.warn(`[AssetResolver] Characters module not loaded, using fallback`);
            return FALLBACK_IMAGE;
        }
        const img = Alive.Assets.getCharacterImageForPlayer(player);
        if (!img) {
            console.warn(`[AssetResolver] Character image not found for player`);
            return FALLBACK_IMAGE;
        }
        return img;
    }

    // Export
    Alive.AssetResolver = {
        buildingImage,
        transportImage,
        characterImage,
        FALLBACK_IMAGE
    };

})(window);
