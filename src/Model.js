import Emitter from './Emitter';
/**
* Orchestrates data and business logic.
* Emits events when data changes.
* A Model manages an internal table of data attributes, and triggers "change" events when any of its data is modified. Models may handle syncing data with a persistence layer. Design your models as the atomic reusable objects containing all of the helpful functions for manipulating their particular bit of data. Models should be able to be passed around throughout your app, and used anywhere that bit of data is needed. 
* @module
*/
export default class Model extends Emitter {
    constructor(attrs = {}) {
        super();
        // attributes object
        this.attributes = Object.assign({}, (this.defaults || {}), attrs);
        // previous attributes
        this.previous = {};
        // Generate getters/setters for every attr
        Object.keys(this.attributes).forEach(this.defineAttribute.bind(this));
    }
    /**
     * Generate getter/setter for the given key.
     * This method is called internally by the constructor
     * for this.attributes.
     * @param {string} key
     */
    defineAttribute(key) {
        Object.defineProperty(
            this,
            key, {
                get: () => this.get(key),
                set: (value) => this.set(key, value)
            }
        );
    }
    /**
     * Get an attribute from "this.attributes".
     * This method is called internally by generated getters.
     * @param {string} key
     */
    get(key) {
        return this.attributes[key];
    }
    /**
     * Set an attribute into "this.attrs".
     * Emit "change" and "change:key" if value change.
     * Could be called in two forms, "this.set('key', value)" and
     * "this.set({ key : value })".
     *  This method is called internally by generated setters.
     * @param {string|object} key
     * @param value
     */
    set(key, value) {
        let attrs = typeof key === 'object' ? key : { [key] : value };
        Object.keys(attrs).forEach(key => {
            let changed = key in this.attributes && attrs[key] !== this.attributes[key];

            this.attributes[key] = attrs[key];
            this.previous[key] = this.attributes[key];

            if (changed) {
                this.emit('change', this, key, attrs[key]);
                this.emit(`change:${key}`, this, attrs[key]);
            }
        });
        return this;
    }

    toJSON() {
        return this.attributes;
    }
}
