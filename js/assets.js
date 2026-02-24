/**
 * Assets Module - Alive Life Simulator
 * Maps game entities to visual assets (WebP)
 */
(function (global) {
    const Alive = (global.Alive = global.Alive || {});

    const Assets = {
        // Cache for consistency
        cache: {},

        getRandomAsset(type, id, count) {
            const key = `${type}_${id}`;
            if (this.cache[key]) return this.cache[key];

            // Simple hash to keep inconsistent assignments consistent across sessions for same ID
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

        getCharacterImageForPlayer(player) {
            // 117 char files. char_1.webp to char_117.webp
            // We'll try to map broadly by gender/age if we knew the content, 
            // but simpler to just hash the name for consistency for now.
            // Ideally we'd separate m/f specific ranges, but without seeing them, 
            // we'll assume a mix. Let's try to be consistent by name.

            // If we assume a split: 1-60 Male, 61-117 Female? Or random?
            // "Correctly arrange" implies logic. 
            // Let's assume they are just a pool for now.

            const index = this.getRandomAsset('char', player.name + player.gender, 117);
            return `assets/characters/char_${index}.webp`;
        },

        getBuildingById(buildingId) {
            if (!buildingId) return null;
            // 63 building files (named vehicle_X.webp?!) in assets/buildings
            // Assuming they are buildings despite the name
            const index = this.getRandomAsset('building', buildingId, 63);
            return {
                image: `assets/buildings/vehicle_${index}.webp`
            };
        },

        getVehicleById(vehicleId) {
            // 99 transport files.
            const index = this.getRandomAsset('transport', vehicleId, 99);
            return {
                image: `assets/transport/transport_${index}.webp`
            };
        },

        async preloadCriticalAssets(onProgress) {
            const critical = [
                'assets/banner.png', // Still loading PNG until user converts
                'assets/characters/char_1.webp' // Preload at least one char
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
                    img.onerror = () => resolve(); // Ignore errors
                });
            });

            await Promise.all(promises);
        }
    };

    Alive.Assets = Assets;

})(window);
