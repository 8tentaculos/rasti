import Emitter from './Emitter.js';
import getResult from './utils/getResult.js';

/**
 * - Orchestrates data and business logic.
 * - Emits events when data changes.
 * 
 * A `Model` manages an internal table of data attributes and triggers change events when any of its data is modified.  
 * Models may handle syncing data with a persistence layer. To design your models, create atomic, reusable objects 
 * that contain all the necessary functions for manipulating their specific data.  
 * Models should be easily passed throughout your app and used anywhere the corresponding data is needed.  
 * Rasti models store their attributes in `this.attributes`, which is extended from `this.defaults` and the 
 * constructor `attrs` parameter. For every attribute, a getter is generated to retrieve the model property 
 * from `this.attributes`, and a setter is created to set the model property in `this.attributes` and emit `change` 
 * and `change:attribute` events.
 * @module
 * @extends Rasti.Emitter
 * @param {object} attrs Object containing model attributes to extend `this.attributes`. Getters and setters are generated for `this.attributtes`, in order to emit `change` events.
 * @property {object} defaults Object containing default attributes for the model. It will extend `this.attributes`. If a function is passed, it will be called to get the defaults. It will be bound to the model instance.
 * @property {object} previous Object containing previous attributes when a change occurs.
 * @example
 * import { Model } from 'rasti';
 * // Product model
 * class ProductModel extends Model {
 *     preinitialize() {
 *         // The Product model has `name` and `price` default attributes.
 *         // `defaults` will extend `this.attributes`.
 *         // Getters and setters are generated for `this.attributes`,
 *         // in order to emit `change` events.
 *         this.defaults = {
 *             name: '',
 *             price: 0
 *         };
 *     }
 *
 *     setDiscount(discountPercentage) {
 *         // Apply a discount to the price property.
 *         // This will call a setter that will update `price` in `this.attributes`,
 *         // and emit `change` and `change:price` events.
 *         const discount = this.price * (discountPercentage / 100);
 *         this.price -= discount;
 *     }
 * }
 * // Create a product instance with a name and price.
 * const product = new ProductModel({ name: 'Smartphone', price: 1000 });
 * // Listen to the `change:price` event.
 * product.on('change:price', () => console.log('New Price:', product.price));
 * // Apply a 10% discount to the product.
 * product.setDiscount(10); // Output: "New Price: 900"
 */
export default class Model extends Emitter {
    constructor(attrs = {}) {
        super();
        // Call preinitialize.
        this.preinitialize.apply(this, arguments);
        // Get defaults. If `this.defaults` is a function, call it.
        const defaults = getResult(this.defaults, this) || {};
        // Set attributes object with defaults and passed attributes.
        this.attributes = Object.assign({}, defaults, attrs);
        // Object to store previous attributes when a change occurs.
        this.previous = {};
        // Generate getters/setters for every attribute.
        Object.keys(this.attributes).forEach(this.defineAttribute.bind(this));
    }

    /**
     * If you define a preinitialize method, it will be invoked when the Model is first created, before any instantiation logic is run for the Model.
     * @param {object} attrs Object containing model attributes to extend `this.attributes`.
     */
    preinitialize() {}

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
                get : () => this.get(key),
                set : (value) => { this.set(key, value); }
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
     * Emit `change` and `change:attribute` if a value changes.  
     * Could be called in two forms, `this.set('key', value)` and
     * `this.set({ key : value })`.  
     * This method is called internally by generated setters.  
     * The `change` event listener will receive the model instance, an object containing the changed attributes, and the rest of the arguments passed to `set` method.  
     * The `change:attribute` event listener will receive the model instance, the new attribute value, and the rest of the arguments passed to `set` method.
     * @param {string} key Attribute key or object containing keys/values.
     * @param [value] Attribute value.
     * @return {this} This model.
     * @emits change
     * @emits change:attribute
     */
    set(key, value, ...rest) {
        let attrs, args;
        // Handle both `"key", value` and `{key: value}` style arguments.
        if (typeof key === 'object') {
            attrs = key;
            args = [value, ...rest];
        } else {
            attrs = { [key] : value };
            args = rest;
        }
        // Are we in a nested `set` call?
        // Calling a `set` inside a `change:attribute` or `change` event listener
        const changing = this._changing;
        this._changing = true;
        // Store changed attributes.
        const changed = {};
        // Store previous attributes.
        if (!changing) {
            this.previous = Object.assign({}, this.attributes);
        }
        // Set attributes.
        Object.keys(attrs).forEach(key => {
            // Use equality to determine if value changed.
            if (attrs[key] !== this.attributes[key]) {
                changed[key] = attrs[key];
                this.attributes[key] = attrs[key];
            }
        });

        const changedKeys = Object.keys(changed);
        // Pending `change` event arguments.
        if (changedKeys.length) this._pending = ['change', this, changed, ...args];
        // Emit `change:attribute` events.
        changedKeys.forEach(key => {
            this.emit(`change:${key}`, this, attrs[key], ...args);
        });
        // Don't emit `change` event until the end of the nested 
        // `set` calls inside `change:attribute` event listeners.
        if (changing) return this;
        // Emit `change` events, that might be nested.
        while (this._pending) {
            const pendingChange = this._pending;
            this._pending = null;
            this.emit.apply(this, pendingChange);
        }
        // Reset flags.
        this._pending = null;
        this._changing = false;

        return this;
    }

    /**
     * Return object representation of the model to be used for JSON serialization.
     * By default returns a copy of `this.attributes`.
     * @return {object} Object representation of the model to be used for JSON serialization.
     */
    toJSON() {
        return Object.assign({}, this.attributes);
    }
}
