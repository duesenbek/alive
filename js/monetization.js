/**
 * Monetization Module - Alive Life Simulator
 * Handles Yandex Games SDK integration for Ads and Payments
 */
(function (global) {
    const Alive = (global.Alive = global.Alive || {});

    class Monetization {
        constructor() {
            this.ysdk = null;
            this.payments = null;
            this.hasSupportPack = false;
            this.lastInterstitialTime = 0;
            this.interstitialCooldown = 180 * 1000; // 3 minutes
            this.isProcessing = false; // Lock for async operations
        }

        /**
         * Initialize with Yandex SDK instance
         * @param {Object} ysdk - The Yandex Games SDK instance
         */
        async init(ysdk) {
            if (!ysdk) {
                console.warn("Monetization: Yandex SDK not provided, running in Mock Mode.");
                return;
            }
            this.ysdk = ysdk; // Store instance

            // Init Payments
            try {
                this.payments = await this.ysdk.getPayments({ signed: true });
                console.log("Monetization: Payments initialized");
                await this.checkEntitlements();
            } catch (e) {
                console.warn("Monetization: Payments failed to allow", e);
                // Silent warning is okay here, as it just disables IAP
            } // Not available on some platforms
        }

        /**
         * Check if player has purchased Support Pack
         */
        async checkEntitlements() {
            if (!this.payments) return;
            try {
                const purchases = await this.payments.getPurchases();
                const supportPack = purchases.find(p => p.productID === 'support_pack');
                if (supportPack) {
                    this.hasSupportPack = true;
                    console.log("Monetization: Support Pack active");
                    if (Alive.game) Alive.game.emitUpdate();
                }
            } catch (e) {
                console.error("Monetization: Failed to check purchases", e);
            }
        }

        /**
         * Buy Support Pack IAP
         */
        buySupportPack() {
            if (this.isProcessing) return Promise.reject("Action in progress");
            this.isProcessing = true;

            if (!this.payments) {
                // Mock success for testing locally
                if (!this.ysdk) {
                    this.hasSupportPack = true;
                    alert("MOCK: Support Pack Purchased! Ads removed.");
                    // Trigger UI update
                    if (Alive.game) Alive.game.emitUpdate();
                    this.isProcessing = false;
                    return Promise.resolve(true);
                }
                return Promise.reject("Payments not initialized");
            }

            return this.payments.purchase({ id: 'support_pack' })
                .then(purchase => {
                    this.hasSupportPack = true;
                    if (Alive.game) Alive.game.emitUpdate();
                    this.isProcessing = false;
                    return true;
                })
                .catch(err => {
                    this.isProcessing = false;
                    console.error("Purchase failed", err);
                    if (Alive.ui && Alive.ui.showToast) Alive.ui.showToast("Purchase could not be completed. Try again later.");
                    throw err;
                });
        }

        /**
         * Show a Rewarded Video Ad
         * @param {Object} callbacks - { onClose, onError, onRewarded }
         */
        showRewardedAd({ onClose, onError, onRewarded }) {
            if (this.isProcessing) return;
            this.isProcessing = true;

            const safeClose = () => {
                this.isProcessing = false;
                if (onClose) onClose();
            };

            if (!this.ysdk) {
                // Mock Mode
                console.log("Monetization: Showing MOCK Rewarded Ad...");
                const result = confirm("MOCK AD: Watch video for reward?");
                if (result) {
                    if (onRewarded) onRewarded();
                } else {
                    if (onError) onError("User skipped");
                    if (Alive.ui && Alive.ui.showToast) Alive.ui.showToast("Ad closed early. No reward this time.");
                }
                if (onClose) safeClose();
                return;
            }

            this.ysdk.adv.showRewardedVideo({
                callbacks: {
                    onOpen: () => {
                        console.log('Video ad open.');
                        if (Alive.Analytics) Alive.Analytics.trackAdOffer('rewarded', 'unknown_source');
                    },
                    onRewarded: () => {
                        console.log('Rewarded!');
                        this.isProcessing = false; // Early unlock for reward processing
                        if (Alive.Analytics) Alive.Analytics.trackAdRewarded('rewarded', 'MONEY_BOOST');
                        if (onRewarded) onRewarded();
                    },
                    onClose: () => {
                        console.log('Video ad closed.');
                        safeClose(); // Ensures unlock
                    },
                    onError: (e) => {
                        console.log('Error while open video ad:', e);
                        this.isProcessing = false;
                        if (onError) onError(e);
                        if (Alive.ui && Alive.ui.showToast) Alive.ui.showToast("Ad unavailable right now. Try again later.");
                    }
                }
            });
        }

        /**
         * Show Interstitial Ad (Fullscreen)
         * Checks cooldown to prevent spam
         */
        showInterstitial() {
            if (this.hasSupportPack) return; // No ads for supporters

            const now = Date.now();
            if (now - this.lastInterstitialTime < this.interstitialCooldown) {
                console.log("Monetization: Interstitial cooldown active");
                return;
            }

            if (!this.ysdk) {
                console.log("Monetization: MOCK Interstitial Ad");
                this.lastInterstitialTime = now;
                return;
            }

            this.ysdk.adv.showFullscreenAdv({
                callbacks: {
                    onClose: (wasShown) => {
                        // Action after close
                    },
                    onError: (error) => {
                        // some action on error
                    }
                }
            });
            this.lastInterstitialTime = now;
        }

        /**
         * Track analytics event
         */
        trackEvent(eventName, params = {}) {
            console.log(`Analytics: ${eventName}`, params);
            // Hook into Yandex Metrica or similar here if available
        }

    }

    // Export
    Alive.Monetization = Monetization;

})(window);
