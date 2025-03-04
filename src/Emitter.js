/**
 * `Emitter` is a class that provides an easy way to implement the observer pattern 
 * in your applications.  
 * It can be extended to create new classes that have the ability to emit and bind custom named events.   
 * Emitter is used by `Model` and `View` classes, which inherit from it to implement 
 * event-driven functionality.
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
     * @param {function} listener Callback function to be called when the event is emitted.
     * @example
     * // Re render when model changes.
     * this.model.on('change', this.render.bind(this));
     */
    on(type, listener) {
        // Validate listener.
        if (typeof listener !== 'function') {
            throw new TypeError('Listener must be a function');
        }
        // Create listeners object if it doesn't exist.
        if (!this.listeners) this.listeners = {};
        if (!this.listeners[type]) this.listeners[type] = [];
        // Add listener.
        this.listeners[type].push(listener);
        // Return a function to remove the listener.
        return () => this.off(type, listener);
    }

    /**
     * Adds event listener that executes once.
     * @param {string} type Type of the event (e.g. `change`).
     * @param {function} listener Callback function to be called when the event is emitted.
     * @example
     * // Log a message once when model changes.
     * this.model.once('change', () => console.log('This will happen once'));
     */
    once(type, listener) {
        // If listener is a function, wrap it to remove it after it is called.
        if (typeof listener === 'function') {
            const self = this;
            const originalListener = listener;

            listener = function(...args) {
                originalListener(...args);
                self.off(type, listener);
            };
        }
        // Add listener.
        return this.on(type, listener);
    }

    /**
     * Removes event listeners.
     * @param {string} [type] Type of the event (e.g. `change`). If is not provided, it removes all listeners.
     * @param {function} [listener] Callback function to be called when the event is emitted. If listener is not provided, it removes all listeners for specified type.
     * @example
     * // Stop listening to changes.
     * this.model.off('change');
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
     * @param {any} [...args] Arguments to be passed to listener.
     * @example
     * // Emit validation error event.
     * this.emit('invalid');
     */
    emit(type, ...args) {
        // No listeners.
        if (!this.listeners || !this.listeners[type]) return;
        // Call listeners. Use `slice` to make a copy and prevent errors when 
        // removing listeners inside a listener.
        this.listeners[type]
            .slice()
            .forEach(function(fn) {
                fn(...args);
            });
    }
}
