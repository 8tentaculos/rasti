/**
 * Manager for delegated events.
 * @private
 */
class EventsManager {
    constructor() {
        this.listeners = [];
        this.types = new Set();
        this.previousSize = 0;
    }

    /**
     * Add a listener to the events manager.
     * @param {Function} listener The listener to add.
     * @param {string} type The type of event.
     * @return {number} The index of the listener.
     */
    addListener(listener, type) {
        this.types.add(type);
        this.listeners.push(listener);
        return this.listeners.length - 1;
    }

    /**
     * Reset the events manager.
     */
    reset() {
        this.listeners = [];
        this.previousSize = this.types.size;
    }

    /**
     * Check if there are pending types.
     * @return {boolean} True if there are pending types, false otherwise.
     */
    hasPendingTypes() {
        return this.types.size > this.previousSize;
    }
}

export default EventsManager;
