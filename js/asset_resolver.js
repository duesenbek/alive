/**
 * AssetResolver — Unified facade for resolving asset images.
 *
 * Public API (primary):
 *   resolveBuildingImage(id)       → image path | FALLBACK_IMAGE
 *   resolveTransportImage(id)      → image path | FALLBACK_IMAGE
 *   resolveCharacterImage(player)  → image path | FALLBACK_IMAGE
 *
 * Backward-compatible aliases:
 *   buildingImage  = resolveBuildingImage
 *   transportImage = resolveTransportImage
 *   characterImage = resolveCharacterImage
 *
 * Legacy ID mapping:
 *   If a consumer passes an old-style ID (e.g. "vehicle_5"), the resolver
 *   transparently maps it to the canonical form ("transport_5") and logs
 *   a console.warn so callers can migrate at their own pace.
 *
 * All fallback cases emit console.warn (never console.error).
 */
(function (global) {
    const Alive = (global.Alive = global.Alive || {});

    const FALLBACK_IMAGE = "assets/misc/placeholder.webp";

    // ── Legacy ID mapping tables ──────────────────────────────────────────
    // Keys = legacy prefix, Values = canonical prefix
    const LEGACY_ID_PREFIXES = {
        "vehicle_": "transport_",
        "car_": "transport_",
        "house_": "building_",
        "home_": "building_"
    };

    /**
     * Normalise an ID by replacing legacy prefixes.
     * Returns { id, wasLegacy }.
     */
    function normalizeId(rawId, expectedPrefix) {
        if (!rawId || typeof rawId !== "string") return { id: rawId, wasLegacy: false };

        for (const [legacy, canonical] of Object.entries(LEGACY_ID_PREFIXES)) {
            if (rawId.startsWith(legacy)) {
                const normalized = canonical + rawId.slice(legacy.length);
                console.warn(
                    `[AssetResolver] Legacy ID "${rawId}" mapped to "${normalized}". ` +
                    `Please update callers to use the canonical ID.`
                );
                return { id: normalized, wasLegacy: true };
            }
        }
        return { id: rawId, wasLegacy: false };
    }

    // ── Resolvers ─────────────────────────────────────────────────────────

    /**
     * Resolve a building image by building ID.
     * @param {string} id - Building ID (e.g. "building_1")
     * @returns {string} Image URL or FALLBACK_IMAGE
     */
    function resolveBuildingImage(id) {
        if (!id) {
            console.warn("[AssetResolver] resolveBuildingImage called with empty id, using fallback.");
            return FALLBACK_IMAGE;
        }

        const { id: normalizedId } = normalizeId(id, "building_");

        if (!Alive.Assets || !Alive.Assets.getBuildingById) {
            console.warn(`[AssetResolver] Buildings module not loaded, falling back for: ${normalizedId}`);
            return FALLBACK_IMAGE;
        }

        const b = Alive.Assets.getBuildingById(normalizedId);
        if (!b || !b.image) {
            console.warn(`[AssetResolver] Building image not found for id: ${normalizedId}`);
            return FALLBACK_IMAGE;
        }
        return b.image;
    }

    /**
     * Resolve a transport image by transport ID.
     * @param {string} id - Transport ID (e.g. "transport_1") or legacy "vehicle_1"
     * @returns {string} Image URL or FALLBACK_IMAGE
     */
    function resolveTransportImage(id) {
        if (!id) {
            console.warn("[AssetResolver] resolveTransportImage called with empty id, using fallback.");
            return FALLBACK_IMAGE;
        }

        const { id: normalizedId } = normalizeId(id, "transport_");

        if (!Alive.Assets || !Alive.Assets.getVehicleById) {
            console.warn(`[AssetResolver] Vehicles module not loaded, falling back for: ${normalizedId}`);
            return FALLBACK_IMAGE;
        }

        const v = Alive.Assets.getVehicleById(normalizedId);
        if (!v || !v.image) {
            console.warn(`[AssetResolver] Transport image not found for id: ${normalizedId}`);
            return FALLBACK_IMAGE;
        }
        return v.image;
    }

    /**
     * Resolve a character portrait image for a player.
     * @param {object} player - Player object with gender, age, name
     * @returns {string} Image URL or FALLBACK_IMAGE
     */
    function resolveCharacterImage(player) {
        if (!player) {
            console.warn("[AssetResolver] resolveCharacterImage called without player, using fallback.");
            return FALLBACK_IMAGE;
        }

        if (!Alive.Assets || !Alive.Assets.getCharacterImageForPlayer) {
            console.warn("[AssetResolver] Characters module not loaded, using fallback.");
            return FALLBACK_IMAGE;
        }

        const img = Alive.Assets.getCharacterImageForPlayer(player);
        if (!img) {
            console.warn("[AssetResolver] Character image not found for player.");
            return FALLBACK_IMAGE;
        }
        return img;
    }

    // ── Unified Object Resolvers ───────────────────────────────────────────

    /**
     * Resolve a building object natively by its ID.
     * @param {string} id - Building ID (e.g. "building_1" or "house_1")
     * @returns {object|null} Building object
     */
    function resolveBuilding(id) {
        if (!id) return null;
        const { id: normalizedId } = normalizeId(id, "building_");
        return Alive.Assets && Alive.Assets.getBuildingById ? Alive.Assets.getBuildingById(normalizedId) : null;
    }

    /**
     * Resolve a transport object natively by its ID.
     * @param {string} id - Transport ID (e.g. "transport_1" or "vehicle_1")
     * @returns {object|null} Vehicle object
     */
    function resolveTransport(id) {
        if (!id) return null;
        const { id: normalizedId } = normalizeId(id, "transport_");
        return Alive.Assets && Alive.Assets.getVehicleById ? Alive.Assets.getVehicleById(normalizedId) : null;
    }

    // ── Export ─────────────────────────────────────────────────────────────

    Alive.AssetResolver = {
        // Primary API (new contract)
        resolveBuildingImage,
        resolveTransportImage,
        resolveCharacterImage,

        resolveBuilding,
        resolveTransport,

        // Backward-compatible aliases
        buildingImage: resolveBuildingImage,
        transportImage: resolveTransportImage,
        characterImage: resolveCharacterImage,

        // Constants
        FALLBACK_IMAGE,

        // Utility (exposed for testing / advanced use)
        normalizeId
    };

})(window);
