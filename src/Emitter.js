import validateListener from './utils/validateListener.js';

/**
 * `Emitter` is a class that provides an easy way to implement the observer pattern 
 * in your applications.  
 * It can be extended to create new classes that have the ability to emit and bind custom named events.   
 * Emitter is used by `Model` and `View` classes, which inherit from it to implement 
 * event-driven functionality.
 * 
 * ## Inverse of Control Pattern
 * 
 * The Emitter class includes "inverse of control" methods (`listenTo`, `listenToOnce`, `stopListening`) 
 * that allow an object to manage its own listening relationships. Instead of:
 * 
 * ```javascript
 * // Traditional approach - harder to clean up
 * otherObject.on('change', this.myHandler);
 * otherObject.on('destroy', this.cleanup);
 * // Later you need to remember to clean up each listener
 * otherObject.off('change', this.myHandler);
 * otherObject.off('destroy', this.cleanup);
 * ```
 * 
 * You can use:
 * 
 * ```javascript
 * // Inverse of control - easier cleanup
 * this.listenTo(otherObject, 'change', this.myHandler);
 * this.listenTo(otherObject, 'destroy', this.cleanup);
 * // Later, clean up ALL listeners at once
 * this.stopListening(); // Removes all listening relationships
 * ```
 * 
 * This pattern is particularly useful for preventing memory leaks and simplifying cleanup
 * in component lifecycle management.
 *
 * @module
 * @example
 * import { Emitter } from 'rasti';
 * // Custom cart
 * class ShoppingCart extends Emitter {
 *     constructor() {
 *         super();
 *         this.items = [];
 *     }
 *
 *     addItem(item) {
 *         this.items.push(item);
 *         // Emit a custom event called `itemAdded`.
 *         // Pass the added item as an argument to the event listener.
 *         this.emit('itemAdded', item);
 *     }
 * }
 * // Create an instance of ShoppingCart and Logger
 * const cart = new ShoppingCart();
 * // Listen to the `itemAdded` event and log the added item using the logger.
 * cart.on('itemAdded', (item) => {
 *     console.log(`Item added to cart: ${item.name} - Price: $${item.price}`);
 * });
 * // Simulate adding items to the cart
 * const item1 = { name : 'Smartphone', price : 1000 };
 * const item2 = { name : 'Headphones', price : 150 };
 *
 * cart.addItem(item1); // Output: "Item added to cart: Smartphone - Price: $1000"
 * cart.addItem(item2); // Output: "Item added to cart: Headphones - Price: $150"
 */
export default class Emitter {
    /**
     * Adds event listener.
     * @param {string} type Type of the event (e.g. `change`).
     * @param {Function} listener Callback function to be called when the event is emitted.
     * @return {Function} A function to remove the listener.
     * @example
     * // Re render when model changes.
     * this.model.on('change', this.render.bind(this));
     */
    on(type, listener) {
        // Validate listener.
        validateListener(listener);
        // Create listeners object if it doesn't exist.
        if (!this.listeners) this.listeners = {};
        // Every type must have an array of listeners.
        if (!this.listeners[type]) this.listeners[type] = [];
        // Add listener to the array of listeners.
        this.listeners[type].push(listener);
        // Return a function to remove the listener.
        return () => this.off(type, listener);
    }

    /**
     * Adds event listener that executes once.
     * @param {string} type Type of the event (e.g. `change`).
     * @param {Function} listener Callback function to be called when the event is emitted.
     * @return {Function} A function to remove the listener.
     * @example
     * // Log a message once when model changes.
     * this.model.once('change', () => console.log('This will happen once'));
     */
    once(type, listener) {
        // Validate listener.
        validateListener(listener);
        // Wrap listener to remove it after it is called.
        const wrapper = (...args) => {
            listener(...args);
            this.off(type, wrapper);
        };
        // Add listener.
        return this.on(type, wrapper);
    }

    /**
     * Removes event listeners with flexible parameter combinations.
     * @param {string} [type] Type of the event (e.g. `change`). If not provided, removes ALL listeners from this emitter.
     * @param {Function} [listener] Specific callback function to remove. If not provided, removes all listeners for the specified type.
     * 
     * **Behavior based on parameters:**
     * - `off()` - Removes ALL listeners from this emitter
     * - `off(type)` - Removes all listeners for the specified event type
     * - `off(type, listener)` - Removes the specific listener for the specified event type
     * 
     * @example
     * // Remove all listeners from this emitter
     * this.model.off();
     * 
     * @example
     * // Remove all 'change' event listeners
     * this.model.off('change');
     * 
     * @example
     * // Remove specific listener for 'change' events
     * const myListener = () => console.log('changed');
     * this.model.on('change', myListener);
     * this.model.off('change', myListener);
     */
    off(type, listener) {
        // No listeners.
        if (!this.listeners) return;
        // No type provided, remove all listeners.
        if (!type) {
            delete this.listeners;
            return;
        }
        // No listeners for specified type.
        if (!this.listeners[type]) return;
        // No listener provided, remove all listeners for specified type.
        if (!listener) {
            delete this.listeners[type];
        } else {
            // Remove specific listener.
            this.listeners[type] = this.listeners[type].filter(fn => fn !== listener);
            if (!this.listeners[type].length) delete this.listeners[type];
        }
        // Remove listeners object if it's empty.
        if (!Object.keys(this.listeners).length) delete this.listeners;
    }

    /**
     * Emits event of specified type. Listeners will receive specified arguments.
     * @param {string} type Type of the event (e.g. `change`).
     * @param {...any} [args] Optional arguments to be passed to listeners.
     * @example
     * // Emit validation error event with no arguments
     * this.emit('invalid');
     * 
     * @example
     * // Emit change event with data
     * this.emit('change', { field : 'name', value : 'John' });
     */
    emit(type, ...args) {
        // No listeners.
        if (!this.listeners || !this.listeners[type]) return;
        // Call listeners. Use `slice` to make a copy and prevent errors when 
        // removing listeners inside a listener.
        this.listeners[type].slice().forEach(fn => fn(...args));
    }

    /**
     * Listen to an event of another emitter (Inverse of Control pattern).
     * 
     * This method allows this object to manage its own listening relationships,
     * making cleanup easier and preventing memory leaks. Instead of calling
     * `otherEmitter.on()`, you call `this.listenTo(otherEmitter, ...)` which
     * allows this object to track and clean up all its listeners at once.
     * 
     * @param {Emitter} emitter The emitter to listen to.
     * @param {string} type The type of the event to listen to.
     * @param {Function} listener The listener to call when the event is emitted.
     * @return {Function} A function to stop listening to the event.
     * 
     * @example
     * // Instead of: otherModel.on('change', this.render.bind(this));
     * // Use: this.listenTo(otherModel, 'change', this.render.bind(this));
     * // This way you can later call this.stopListening() to clean up all listeners
     */
    listenTo(emitter, type, listener) {
        // Add listener to the emitter.
        emitter.on(type, listener);
        // Create listeningTo array if it doesn't exist.
        if (!this.listeningTo) this.listeningTo = [];
        // Add listener to the array of listeners.
        this.listeningTo.push({ emitter, type, listener });
        // Return a function to stop listening to the event.
        return () => this.stopListening(emitter, type, listener);
    }

    /**
     * Listen to an event of another emitter and remove the listener after it is called (Inverse of Control pattern).
     * 
     * Similar to `listenTo()` but automatically removes the listener after the first execution,
     * like `once()` but with the inverse of control benefits for cleanup management.
     * 
     * @param {Emitter} emitter The emitter to listen to.
     * @param {string} type The type of the event to listen to.
     * @param {Function} listener The listener to call when the event is emitted.
     * @return {Function} A function to stop listening to the event.
     * 
     * @example
     * // Listen once to another emitter's initialization event
     * this.listenToOnce(otherModel, 'initialized', () => {
     *     console.log('Other model initialized');
     * });
     */
    listenToOnce(emitter, type, listener) {
        validateListener(listener);
        // Wrap listener to remove it after it is called.
        const wrapper = (...args) => {
            listener(...args);
            this.stopListening(emitter, type, wrapper);
        };
        // Add listener.
        return this.listenTo(emitter, type, wrapper);
    }

    /**
     * Stop listening to events from other emitters (Inverse of Control pattern).
     * 
     * This method provides flexible cleanup of listening relationships established with `listenTo()`.
     * All parameters are optional, allowing different levels of cleanup granularity.
     * 
     * @param {Emitter} [emitter] The emitter to stop listening to. If not provided, stops listening to ALL emitters.
     * @param {string} [type] The type of event to stop listening to. If not provided, stops listening to all event types from the specified emitter.
     * @param {Function} [listener] The specific listener to remove. If not provided, removes all listeners for the specified event type from the specified emitter.
     * 
     * **Behavior based on parameters:**
     * - `stopListening()` - Stops listening to ALL events from ALL emitters
     * - `stopListening(emitter)` - Stops listening to all events from the specified emitter
     * - `stopListening(emitter, type)` - Stops listening to the specified event type from the specified emitter
     * - `stopListening(emitter, type, listener)` - Stops listening to the specific listener for the specific event from the specific emitter
     * 
     * @example
     * // Stop listening to all events from all emitters (complete cleanup)
     * this.stopListening();
     * 
     * @example
     * // Stop listening to all events from a specific emitter
     * this.stopListening(otherModel);
     * 
     * @example
     * // Stop listening to 'change' events from a specific emitter
     * this.stopListening(otherModel, 'change');
     * 
     * @example
     * // Stop listening to a specific listener
     * const myListener = () => console.log('changed');
     * this.listenTo(otherModel, 'change', myListener);
     * this.stopListening(otherModel, 'change', myListener);
     */
    stopListening(emitter, type, listener) {
        // No listeningTo object.
        if (!this.listeningTo) return;
        // Remove listener from the array of listeners.
        this.listeningTo = this.listeningTo.filter(item => {
            if (
                !emitter ||
                (emitter === item.emitter && !type) ||
                (emitter === item.emitter && type === item.type && !listener) ||
                (emitter === item.emitter && type === item.type && listener === item.listener)
            ) {
                item.emitter.off(item.type, item.listener);
                return false;
            }
            return true;
        });
        // Remove listeningTo object if it's empty.
        if (!this.listeningTo.length) delete this.listeningTo;
    }
}
