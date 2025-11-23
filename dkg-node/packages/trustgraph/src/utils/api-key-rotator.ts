/**
 * API Key Rotator for load balancing across multiple Cerebras API keys
 * Implements round-robin algorithm to distribute requests evenly
 */

export class APIKeyRotator {
    private keys: string[];
    private currentIndex: number = 0;

    constructor(keys: string[]) {
        if (!keys || keys.length === 0) {
            throw new Error('At least one API key must be provided');
        }
        this.keys = keys;
    }

    /**
     * Get the next API key using round-robin rotation
     */
    getNextKey(): string {
        const key = this.keys[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.keys.length;
        return key;
    }

    /**
     * Get a random API key
     */
    getRandomKey(): string {
        const randomIndex = Math.floor(Math.random() * this.keys.length);
        return this.keys[randomIndex];
    }

    /**
     * Get current index (for logging/debugging)
     */
    getCurrentIndex(): number {
        return this.currentIndex;
    }

    /**
     * Get total number of keys
     */
    getKeyCount(): number {
        return this.keys.length;
    }
}
