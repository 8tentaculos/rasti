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
 * 
 * ## Construction Flow
 * 1. `preinitialize()` is called with all constructor arguments
 * 2. `this.defaults` are resolved (if function, it's called and bound to the model)
 * 3. `parse()` is called with all constructor arguments to process the data
 * 4. `this.attributes` is built by merging defaults and parsed data
 * 5. Getters/setters are generated for each attribute to emit change events
 * 
 * @module
 * @extends Emitter
 * @param {object} [attributes={}] Primary data object containing model attributes
 * @param {...*} [args] Additional arguments passed to `preinitialize` and `parse` methods
 * @property {object|Function} defaults Default attributes for the model. If a function, it's called bound to the model instance to get defaults.
 * @property {object} previous Object containing previous attributes when a change occurs.
 * @property {string} attributePrefix Static property that defines a prefix for generated getters/setters. Defaults to empty string.
 * @example
 * import { Model } from 'rasti';
 * 
 * // User model
 * class User extends Model {
 *     preinitialize() {
 *         this.defaults = { name : '', email : '', role : 'user' };
 *     }
 * }
 * // Order model with nested User and custom methods
 * class Order extends Model {
 *     preinitialize(attributes, options = {}) {
 *         this.defaults = {
 *             id : null,
 *             total : 0,
 *             status : 'pending',
 *             user : null
 *         };
 * 
 *         this.apiUrl = options.apiUrl || '/api/orders';
 *     }
 *
 *     parse(data, options = {}) {
 *         const parsed = { ...data };
 *         
 *         // Convert user object to User model instance
 *         if (data.user && !(data.user instanceof User)) {
 *             parsed.user = new User(data.user);
 *         }
 * 
 *         return parsed;
 *     }
 * 
 *     toJSON() {
 *         const result = {};
 *         for (const [key, value] of Object.entries(this.attributes)) {
 *             if (value instanceof Model) {
 *                 result[key] = value.toJSON();
 *             } else {
 *                 result[key] = value;
 *             }
 *         }
 *         return result;
 *     }
 * 
 *     async fetch() {
 *         try {
 *             const response = await fetch(`${this.apiUrl}/${this.id}`);
 *             const data = await response.json();
 *             
 *             // Parse the fetched data and update model
 *             const parsed = this.parse(data);
 *             this.set(parsed, { source : 'fetch' });
 * 
 *             return this;
 *         } catch (error) {
 *             console.error('Failed to fetch order:', error);
 *             throw error;
 *         }
 *     }
 * }
 * 
 * // Create order with nested user data
 * const order = new Order({
 *     id : 123,
 *     total : 99.99,
 *     user : { name : 'Alice', email : 'alice@example.com' }
 * });
 * 
 * console.log(order.user instanceof User); // true
 * // Serialize with nested models
 * const json = order.toJSON();
 * console.log(json); // { id: 123, total: 99.99, status: 'pending', user: { name: 'Alice', email: 'alice@example.com', role: 'user' } }
 * 
 * // Listen to fetch updates
 * order.on('change', (model, changed, options) => {
 *     if (options?.source === 'fetch') {
 *         console.log('Order updated from server:', changed);
 *     }
 * });
 * 
 * // Fetch latest data from server
 * await order.fetch();
 */
export default class Model extends Emitter {
    constructor() {
        super();
        // Call preinitialize.
        this.preinitialize.apply(this, arguments);
        // Set attributes object with defaults and passed attributes.
        this.attributes = Object.assign({}, getResult(this.defaults, this), this.parse.apply(this, arguments));
        // Object to store previous attributes when a change occurs.
        this.previous = {};
        // Generate getters/setters for every attribute.
        Object.keys(this.attributes).forEach(this.defineAttribute.bind(this));
    }

    /**
     * Called before any instantiation logic runs for the Model.
     * Receives all constructor arguments, allowing for flexible initialization patterns.
     * Use this to set up `defaults`, configure the model, or handle custom constructor arguments.
     * @param {object} [attributes={}] Primary data object containing model attributes
     * @param {...*} [args] Additional arguments passed from the constructor
     * @example
     * class User extends Model {
     *     preinitialize(attributes, options = {}) {
     *         this.defaults = { name : '', role : options.defaultRole || 'user' };
     *         this.apiEndpoint = options.apiEndpoint || '/users';
     *     }
     * }
     * const user = new User({ name : 'Alice' }, { defaultRole : 'admin', apiEndpoint : '/api/users' });
     */
    preinitialize() {}

    /**
     * Generate getter/setter for the given attribute key to emit `change` events.
     * The property name uses `attributePrefix` + key (e.g., with prefix 'attr_', key 'name' becomes 'attr_name').
     * Called internally by the constructor for each key in `this.attributes`.
     * Override with an empty method if you don't want automatic getters/setters.
     * 
     * @param {string} key Attribute key from `this.attributes`
     * @example
     * // Custom prefix for all attributes
     * class PrefixedModel extends Model {
     *     static attributePrefix = 'attr_';
     * }
     * const model = new PrefixedModel({ name: 'Alice' });
     * console.log(model.attr_name); // 'Alice'
     * 
     * // Disable automatic getters/setters
     * class ManualModel extends Model {
     *     defineAttribute() {
     *         // Empty - no getters/setters generated
     *     }
     *     
     *     getName() {
     *         return this.get('name'); // Manual getter
     *     }
     * }
     */
    defineAttribute(key) {
        Object.defineProperty(
            this,
            `${this.constructor.attributePrefix}${key}`,
            {
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
     * Set one or more attributes into `this.attributes` and emit change events.
     * Supports two call signatures: `set(key, value, ...args)` or `set(object, ...args)`.
     * Additional arguments are passed to change event listeners, enabling custom behavior.
     * 
     * @param {string|object} key Attribute key (string) or object containing key-value pairs
     * @param {*} [value] Attribute value (when key is string)
     * @param {...*} [args] Additional arguments passed to event listeners
     * @return {Model} This model instance for chaining
     * @emits change Emitted when any attribute changes. Listeners receive `(model, changedAttributes, ...args)`
     * @emits change:attribute Emitted for each changed attribute. Listeners receive `(model, newValue, ...args)`
     * @example
     * // Basic usage
     * model.set('name', 'Alice');
     * model.set({ name : 'Alice', age : 30 });
     * 
     * // With options for listeners
     * model.set('name', 'Bob', { silent : false, validate : true });
     * model.on('change:name', (model, value, options) => {
     *     if (options?.validate) {
     *         // Custom validation logic
     *     }
     * });
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
     * Transforms and validates data before it becomes model attributes.
     * Called during construction with all constructor arguments, allowing flexible data processing.
     * Override this method to transform incoming data, create nested models, or handle different data formats.
     * 
     * @param {object} [data={}] Primary data object to be parsed into attributes
     * @param {...*} [args] Additional arguments from constructor, useful for parsing options
     * @return {object} Processed data that will become the model's attributes
     * @example
     * // Transform nested objects into models
     * class User extends Model {}
     * class Order extends Model {
     *     parse(data, options = {}) {
     *         // Skip parsing if requested
     *         if (options.raw) return data;
     *         // Transform user data into User model
     *         const parsed = { ...data };
     *         if (data.user && !(data.user instanceof User)) {
     *             parsed.user = new User(data.user);
     *         }
     *         return parsed;
     *     }
     * }
     * 
     * // Usage with parsing options
     * const order1 = new Order({ id : 1, user : { name : 'Alice' } }); // user becomes User model
     * const order2 = new Order({ id : 2, user : { name : 'Bob' } }, { raw : true }); // user stays plain object
     */
    parse(data) {
        return data;
    }

    /**
     * Return object representation of the model to be used for JSON serialization.
     * By default returns a copy of `this.attributes`.
     * You can override this method to customize serialization behavior, such as calling `toJSON` recursively on nested Model instances.
     * @return {object} Object representation of the model to be used for JSON serialization.
     * @example
     * // Basic usage - returns a copy of model attributes:
     * const user = new Model({ name : 'Alice', age : 30 });
     * const json = user.toJSON();
     * console.log(json); // { name : 'Alice', age : 30 }
     * 
     * // Override toJSON for recursive serialization of nested models:
     * class User extends Model {}
     * class Order extends Model {
     *     parse(data) {
     *         // Ensure user is always a User model
     *         return { ...data, user : data.user instanceof User ? data.user : new User(data.user) };
     *     }
     * 
     *     toJSON() {
     *         const result = {};
     *         for (const [key, value] of Object.entries(this.attributes)) {
     *             if (value instanceof Model) {
     *                 result[key] = value.toJSON();
     *             } else {
     *                 result[key] = value;
     *             }
     *         }
     *         return result;
     *     }
     * }
     * const order = new Order({ id : 1, user : { name : 'Alice' } });
     * const json = order.toJSON();
     * console.log(json); // { id : 1, user : { name : 'Alice' } }
     */
    toJSON() {
        return Object.assign({}, this.attributes);
    }
}

/**
 * Static property that defines a prefix for generated getters/setters.
 * When set, all attribute properties will be prefixed (e.g., 'attr_name' instead of 'name').
 * Useful for avoiding naming conflicts or creating a consistent property naming convention.
 * @type {string}
 * @default ''
 * @example
 * // Set prefix for all models of this class
 * class ApiModel extends Model {
 *     static attributePrefix = 'attr_';
 * }
 * 
 * const user = new ApiModel({ name : 'Alice', email : 'alice@example.com' });
 * console.log(user.attr_name);  // 'Alice'
 * console.log(user.attr_email); // 'alice@example.com'
 * 
 * // Still access via get/set methods without prefix
 * console.log(user.get('name')); // 'Alice'
 * user.set('name', 'Bob');
 * console.log(user.attr_name); // 'Bob'
 */
Model.attributePrefix = '';
