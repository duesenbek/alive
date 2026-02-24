/**
 * Pets Assets Config
 * Defines all pet types and their images.
 */
(function (global) {
    const Alive = (global.Alive = global.Alive || {});
    Alive.Assets = Alive.Assets || {};

    const ASSETS_PATH = "assets/pets/";

    // Pet types mapped to image indices
    const PETS = [
        // Dogs (1-6)
        { id: "pets_1", type: "dog", breed: "Golden Retriever", image: ASSETS_PATH + "pets_1.webp", cost: 500, annualCost: 650 },
        { id: "pets_2", type: "dog", breed: "German Shepherd", image: ASSETS_PATH + "pets_2.webp", cost: 600, annualCost: 700 },
        { id: "pets_3", type: "dog", breed: "Labrador", image: ASSETS_PATH + "pets_3.webp", cost: 450, annualCost: 600 },
        { id: "pets_4", type: "dog", breed: "Bulldog", image: ASSETS_PATH + "pets_4.webp", cost: 800, annualCost: 750 },
        { id: "pets_5", type: "dog", breed: "Poodle", image: ASSETS_PATH + "pets_5.webp", cost: 700, annualCost: 650 },
        { id: "pets_6", type: "dog", breed: "Husky", image: ASSETS_PATH + "pets_6.webp", cost: 550, annualCost: 700 },

        // Cats (7-12)
        { id: "pets_7", type: "cat", breed: "Persian", image: ASSETS_PATH + "pets_7.webp", cost: 400, annualCost: 450 },
        { id: "pets_8", type: "cat", breed: "Siamese", image: ASSETS_PATH + "pets_8.webp", cost: 350, annualCost: 400 },
        { id: "pets_9", type: "cat", breed: "Maine Coon", image: ASSETS_PATH + "pets_9.webp", cost: 600, annualCost: 500 },
        { id: "pets_10", type: "cat", breed: "British Shorthair", image: ASSETS_PATH + "pets_10.webp", cost: 500, annualCost: 450 },
        { id: "pets_11", type: "cat", breed: "Ragdoll", image: ASSETS_PATH + "pets_11.webp", cost: 450, annualCost: 420 },
        { id: "pets_12", type: "cat", breed: "Bengal", image: ASSETS_PATH + "pets_12.webp", cost: 700, annualCost: 500 },

        // Other pets (13-18)
        { id: "pets_13", type: "bird", breed: "Parrot", image: ASSETS_PATH + "pets_13.webp", cost: 200, annualCost: 250 },
        { id: "pets_14", type: "bird", breed: "Canary", image: ASSETS_PATH + "pets_14.webp", cost: 100, annualCost: 150 },
        { id: "pets_15", type: "fish", breed: "Goldfish", image: ASSETS_PATH + "pets_15.webp", cost: 50, annualCost: 100 },
        { id: "pets_16", type: "rabbit", breed: "Rabbit", image: ASSETS_PATH + "pets_16.webp", cost: 150, annualCost: 200 },
        { id: "pets_17", type: "hamster", breed: "Hamster", image: ASSETS_PATH + "pets_17.webp", cost: 50, annualCost: 100 },
        { id: "pets_18", type: "turtle", breed: "Turtle", image: ASSETS_PATH + "pets_18.webp", cost: 100, annualCost: 120 }
    ];

    // Helper function to get pet by ID
    function getPetById(id) {
        if (!id) return null;
        return PETS.find(p => p.id === id) || null;
    }

    // Get pets by type
    function getPetsByType(type) {
        if (!type) return PETS;
        return PETS.filter(p => p.type === type);
    }

    // Get random pet
    function getRandomPet(type = null) {
        const candidates = type ? getPetsByType(type) : PETS;
        if (candidates.length === 0) return null;
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    // Export
    Alive.Assets.PETS = PETS;
    Alive.Assets.getPetById = getPetById;
    Alive.Assets.getPetsByType = getPetsByType;
    Alive.Assets.getRandomPet = getRandomPet;

})(window);
