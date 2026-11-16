/**
 * Manager for delegated events.
 * @private
 */
class EventsManager {
    constructor() {
        this.listeners = [];
        // The component each listener runs as, at the same index.
        this.owners = [];
        this.types = new Set();
        this.previousSize = 0;
    }

    /**
     * Add a listener to the events manager.
     * @param {Function|string} listener The listener to add, or the name of a method of `owner`.
     * @param {string} type The type of event.
     * @param {object} owner The component the listener runs as.
     * @return {number} The index of the listener.
     */
    addListener(listener, type, owner) {
        this.types.add(type);
        this.owners.push(owner);
        return this.listeners.push(listener) - 1;
    }

    /**
     * Reset the events manager.
     */
    reset() {
        this.listeners = [];
        this.owners = [];
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
