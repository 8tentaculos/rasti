import Emitter from './Emitter';
/**
 * - Orchestrates data and business logic.
 * - Emits events when data changes.
 * 
 * A `Model` manages an internal table of data attributes and triggers change events when any of its data is modified. 
 * Models may handle syncing data with a persistence layer. To design your models, create atomic, reusable objects 
 * that contain all the necessary functions for manipulating their specific data. 
 * Models should be easily passed throughout your app and used anywhere the corresponding data is needed.
 * Rasti `Models` stores its attributes in `this.attributes`, which is extended from `this.defaults` and the 
 * constructor `attrs` parameter. For every attribute, a getter is generated to retrieve the model property 
 * from `this.attributes`, and a setter is created to set the model property in `this.attributes` and emit `change` 
 * and `change:attribute` events.
 * @module
 * @param {object} attrs Object containing model attributes to extend `this.attributes`. Getters and setters are generated for `this.attributtes`, in order to emit `change` events.
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
        // attributes object.
        this.attributes = Object.assign({}, (this.defaults || {}), attrs);
        // Previous attributes.
        this.previous = {};
        // Generate getters/setters for every attr.
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
            // Emit change events.
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
