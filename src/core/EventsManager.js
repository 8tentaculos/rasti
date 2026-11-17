import { ATTRIBUTE_EVENT } from './Constants.js';

/**
 * Manager for delegated events.
 * @param {string} uid The uid of the component the manager belongs to, which names its
 *     data-attributes.
 * @private
 */
class EventsManager {
    constructor(uid) {
        this.uid = uid;
        this.listeners = [];
        // The component a listener runs as, at the listener's index, when it is not the
        // one the manager belongs to: only slotted content records one.
        this.owners = [];
        // Each event type, with its position: the data-attribute names the type by it,
        // since a type may hold characters an attribute name or a selector can't.
        this.types = new Map();
        // The data-attribute of each type, at the type's position.
        this.attributes = [];
        this.previousSize = 0;
    }

    /**
     * Add a listener to the events manager.
     * @param {Function|string} listener The listener to add, or the name of a method of its owner.
     * @param {object} [owner] The component the listener runs as, when it is not the one
     *     the manager belongs to.
     * @return {number} The index of the listener.
     */
    addListener(listener, owner) {
        const index = this.listeners.push(listener) - 1;
        if (owner) this.owners[index] = owner;
        return index;
    }

    /**
     * The data-attribute that carries the listener index of an event type, registering
     * the type the first time it is seen.
     * @param {string} type The type of event.
     * @return {string} The data-attribute name.
     */
    attribute(type) {
        let position = this.types.get(type);
        if (typeof position === 'undefined') {
            position = this.types.size;
            this.types.set(type, position);
            this.attributes.push(ATTRIBUTE_EVENT(position, this.uid));
        }
        return this.attributes[position];
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
