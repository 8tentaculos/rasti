import Emitter from './Emitter.js';

/** Extracts the attribute type `A` from a Model subclass. */
export type Attrs<M> = M extends Model<infer A> ? A : never;

export type ModelEvents<A> =
    & {
        change: (model: Model<A>, changed: Partial<A>, ...args: any[]) => void;
        [event: string]: (...args: any[]) => void;
    }
    & {
        [K in keyof A & string as `change:${K}`]: (model: Model<A>, value: A[K], ...args: any[]) => void;
    };

/**
 * - Orchestrates data and business logic.
 * - Emits events when data changes.
 *
 * A `Model` manages an internal table of data attributes and triggers change events when
 * any of its data is modified. Models may handle syncing data with a persistence layer.
 *
 * ## Construction Flow
 * 1. `preinitialize()` is called with all constructor arguments
 * 2. `this.defaults` are resolved (if function, it's called and bound to the model)
 * 3. `parse()` is called with all constructor arguments to process the data
 * 4. `this.attributes` is built by merging defaults and parsed data
 * 5. Getters/setters are generated for each attribute to emit change events
 *
 * @example
 * import { Model } from 'rasti';
 * class User extends Model {
 *     preinitialize() {
 *         this.defaults = { name: '', email: '', role: 'user' };
 *     }
 * }
 */
export default class Model<A = any> extends Emitter<ModelEvents<A>> {
    /**
     * Static property that defines a prefix for generated getters/setters.
     * When set, all attribute properties will be prefixed (e.g., 'attr_name' instead of 'name').
     * @default ''
     */
    static attributePrefix: string;

    /**
     * Default attributes for the model, merged into `this.attributes` during construction.
     * Can be a plain object, or a function (called bound to the instance) that returns the
     * defaults. Assign it on the prototype, or via `this.defaults` inside
     * `preinitialize`.
     */
    defaults?: Partial<A> | (() => Partial<A>);

    /** Primary data object holding the model attributes. */
    attributes: A;

    /** Object containing previous attributes when a change occurs. */
    previous: Partial<A>;

    /**
     * @param attributes Primary data object containing model attributes.
     * @param args Additional arguments passed to `preinitialize` and `parse`.
     */
    constructor(attributes?: Partial<A>, ...args: any[]);

    /**
     * Called before any instantiation logic runs for the Model.
     * Receives all constructor arguments, allowing for flexible initialization patterns.
     * Use this to set up `defaults`, configure the model, or handle custom constructor arguments.
     * @example
     * class User extends Model {
     *     preinitialize(attributes, options = {}) {
     *         this.defaults = { name: '', role: options.defaultRole || 'user' };
     *         this.apiEndpoint = options.apiEndpoint || '/users';
     *     }
     * }
     */
    preinitialize(attributes?: Partial<A>, ...args: any[]): void;

    /**
     * Generate getter/setter for the given attribute key to emit `change` events.
     * Called internally by the constructor for each key in `this.attributes`.
     * Override with an empty method if you don't want automatic getters/setters.
     */
    defineAttribute(key: keyof A & string): void;

    /**
     * Get an attribute from `this.attributes`.
     * @param key Attribute key.
     * @return The attribute value.
     */
    get<K extends keyof A>(key: K): A[K];
    get(key: string): any;

    /**
     * Set one or more attributes into `this.attributes` and emit change events.
     * Supports two call signatures: `set(key, value, ...args)` or `set(object, ...args)`.
     * Additional arguments are passed to change event listeners.
     *
     * Emits `change` (listeners receive `(model, changedAttributes, ...args)`) and
     * `change:<attribute>` (listeners receive `(model, newValue, ...args)`).
     *
     * @return This model instance for chaining.
     * @example
     * model.set('name', 'Alice');
     * model.set({ name: 'Alice', age: 30 });
     * model.set('name', 'Bob', { silent: false });
     */
    set<K extends keyof A>(key: K, value: A[K], ...args: any[]): this;
    set(attrs: Partial<A>, ...args: any[]): this;

    /**
     * Transforms and validates data before it becomes model attributes.
     * Called during construction with all constructor arguments.
     * Override this method to transform incoming data, create nested models, or handle different data formats.
     */
    parse(data?: Partial<A>, ...args: any[]): Partial<A>;

    /**
     * Return object representation of the model to be used for JSON serialization.
     * By default returns a copy of `this.attributes`.
     */
    toJSON(): A;
}
