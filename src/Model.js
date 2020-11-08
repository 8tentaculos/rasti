import Emitter from './Emitter';
/**
 * - Orchestrates data and business logic.
 * - Emits events when data changes.
 * 
 * A Model manages an internal table of data attributes, and triggers "change" events 
 * when any of its data is modified.<br />
 * Models may handle syncing data with a persistence layer.<br />
 * Design your models as the atomic reusable objects containing all of the helpful functions for 
 * manipulating their particular bit of data.<br /> 
 * Models should be able to be passed around throughout your app, and used anywhere that bit of data is needed.<br />
 * Rasti Models stores its attributes in `this.attributes`, which is extended from `this.defaults` and constructor `attrs` parameter.
 * For every attribute, a getter is generated, which retrieve the model property from `this.attributes`.
 * And a setter, which sets the model property in `this.attributes` and emits `change` and `change:attribute` events.
 * @module
 * @param {object} attrs Object containing model attributes to extend `this.attributes`. Getters and setters are generated for `this.attributtes`, in order to emit `change` events.
 * @example
 * // Todo model
 * class TodoModel extends Rasti.Model {
 *     toggle() {
 *         // Set completed property. This will call a setter that will set `completed` 
 *         // in this.attributes, and emit `change` and `change:completed` events.
 *         this.completed = !this.completed; 
 *     }
 * }
 * // Todo model has `title` and `completed` default attributes. `defaults` will extend `this.attributes`. Getters and setters are generated for `this.attributtes`, in order to emit `change` events.
 * TodoModel.prototype.defaults = {
 *     title : '',
 *     completed : false
 * };
 * // Create todo. Pass `title` attribute as argument.
 * const todo = new TodoModel({ title : 'Learn Rasti' });
 * // Listen to `change:completed` event.
 * todo.on('change:completed', () => console.log('Completed:', todo.completed));
 * // Complete todo.
 * todo.toggle(); // Completed: true
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
     * Generate getter/setter for the given key. In order to emit `change` events.
     * This method is called internally by the constructor
     * for `this.attributes`.
     * @param {string} key Attribute key.
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
     * Get an attribute from `this.attributes`.
     * This method is called internally by generated getters.
     * @param {string} key Attribute key.
     * @return {any} The attribute value.
     */
    get(key) {
        return this.attributes[key];
    }
    
    /**
     * Set an attribute into `this.attributes`.
     * Emit `change` and `change:attribute` if value change.
     * Could be called in two forms, `this.set('key', value)` and
     * `this.set({ key : value })`.
     * This method is called internally by generated setters.
     * @param {string} key Attribute key or object containing keys/values.
     * @param [value] Attribute value.
     * @return {this} This model.
     * @emits change
     * @emits change:attribute
     */
    set(key, value) {
        let attrs = typeof key === 'object' ? key : { [key] : value };
        Object.keys(attrs).forEach(key => {
            let changed = key in this.attributes && attrs[key] !== this.attributes[key];

            this.previous[key] = this.attributes[key];
            this.attributes[key] = attrs[key];

            if (changed) {
                this.emit('change', this, key, attrs[key]);
                this.emit(`change:${key}`, this, attrs[key]);
            }
        });
        return this;
    }
    
    /**
     * Return object representation of the model to be used for JSON serialization.
     * By default returns `this.attributes`.
     * @return {object} Object representation of the model to be used for JSON serialization.
     */
    toJSON() {
        return this.attributes;
    }
}
