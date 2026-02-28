/**
 * Assets Module - Alive Life Simulator
 * Core asset utilities: cache, hashing, preloading.
 *
 * NOTE: getBuildingById and getVehicleById are provided by
 *       buildings.js and vehicles.js respectively.
 *       getCharacterImageForPlayer is provided by assets/characters.js.
 *       This module only provides shared utilities used by those modules.
 */
(function (global) {
    const Alive = (global.Alive = global.Alive || {});

    const Assets = Alive.Assets || {
        // Deterministic asset cache
        cache: {},

        /**
         * Return a deterministic index for a (type, id) pair.
         * Used by sub-modules (characters, etc.) to assign stable images.
         */
        getRandomAsset(type, id, count) {
            const key = `${type}_${id}`;
            if (this.cache[key]) return this.cache[key];

            let hash = 0;
            const str = String(id);
            for (let i = 0; i < str.length; i++) {
                hash = ((hash << 5) - hash) + str.charCodeAt(i);
                hash |= 0;
            }
            const index = (Math.abs(hash) % count) + 1;

            this.cache[key] = index;
            return index;
        },

        /**
         * Preload critical assets (banner, first character) for fast first paint.
         */
        async preloadCriticalAssets(onProgress) {
            const critical = [
                'assets/banner/banner.png',
                'assets/characters/char_1.webp'
            ];

            let loaded = 0;
            const promises = critical.map(src => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.src = src;
                    img.onload = () => {
                        loaded++;
                        if (onProgress) onProgress(loaded / critical.length);
                        resolve();
                    };
                    img.onerror = () => {
                        loaded++;
                        if (onProgress) onProgress(loaded / critical.length);
                        console.warn(`[Assets] Failed to preload: ${src}`);
                        resolve();
                    };
                });
            });

            await Promise.all(promises);
        }
    };

    // Ensure cache exists even if Assets was already partially initialised
    if (!Assets.cache) Assets.cache = {};
    if (!Assets.getRandomAsset) {
        Assets.getRandomAsset = function (type, id, count) {
            const key = `${type}_${id}`;
            if (this.cache[key]) return this.cache[key];
            let hash = 0;
            const str = String(id);
            for (let i = 0; i < str.length; i++) {
                hash = ((hash << 5) - hash) + str.charCodeAt(i);
                hash |= 0;
            }
            const index = (Math.abs(hash) % count) + 1;
            this.cache[key] = index;
            return index;
        };
    }

    Alive.Assets = Assets;

})(window);
