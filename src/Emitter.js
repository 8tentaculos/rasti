/**
 * `Emitter` is a class that provides an easy way to implement the observer pattern 
 * in your applications. It can be extended to create new classes that have the 
 * ability to emit and bind custom named events. 
 * Emitter is used by `Model` and `View` classes, which inherit from it to implement 
 * event-driven functionality.
 *
 * @module
 * @example
 * import { Emitter } from 'rasti';
 * class MyEmitter extends Emitter {
 *     constructor() {
 *         super();
 *         this.count = 0;
 *     }
 *
 *     incrementCount() {
 *         this.count++;
 *         this.emit('countChanged', this.count);
 *     }
 * }
 *
 * const myEmitter = new MyEmitter();
 *
 * myEmitter.on('countChanged', (count) => {
 *     console.log(`Count changed to ${count}`);
 * });
 *
 * myEmitter.incrementCount(); // Output: "Count changed to 1"
 * myEmitter.incrementCount(); // Output: "Count changed to 2"
 */
export default class Emitter {
    /**
     * Adds event listener.
     * @param {string} type Type of the event (e.g. `change`).
     * @param {function} listener Callback function to be called when the event is emitted.
     * @example
     * this.model.on('change', this.render.bind(this)); // Re render when model changes.
     */
    on(type, listener) {
        if (typeof listener !== 'function') {
            throw TypeError('Listener must be a function');
        }

        if (!this.listeners) this.listeners = {};
        if (!this.listeners[type]) this.listeners[type] = [];

        this.listeners[type].push(listener);
    }

    /**
     * Adds event listener that executes once.
     * @param {string} type Type of the event (e.g. `change`).
     * @param {function} listener Callback function to be called when the event is emitted.
     * @example
     * this.model.once('change', () => console.log('This will happen once'));
     */
    once(type, listener) {
        if (typeof listener === 'function') {
            let self = this;
            let _listener = listener;

            listener = function(...args) {
                _listener(...args);
                self.off(type, listener);
            };
        }
        this.on(type, listener);
    }

    /**
     * Removes event listeners.
     * @param {string} [type] Type of the event (e.g. `change`). If is not provided, it removes all listeners.
     * @param {function} [listener] Callback function to be called when the event is emitted. If listener is not provided, it removes all listeners for specified type.
     * @example
     * this.model.off('change'); // Stop listening to changes.
     */
    off(type, listener) {
        if (!type) {
            this.listeners = {};
        } else {
            if (!listener) {
                delete this.listeners[type];
            } else {
                let listeners = this.listeners[type];
                if (listeners) {
                    let copy = listeners.slice();

                    copy.forEach(function (fn, idx) {
                        if (fn === listener) listeners.splice(idx, 1);
                    });

                    if (!listeners.length) {
                        delete this.listeners[type];
                    }
                }
            }
        }
    }

    /**
     * Emits event of specified type. Listeners will receive specified arguments.
     * @param {string} type Type of the event (e.g. `change`).
     * @param {any} [...args] Arguments to be passed to listener.
     * @example
     * this.emit('invalid'); // Emit validation error event.
     */
    emit(type, ...args) {
        let listeners = this.listeners && this.listeners[type];

        if (!listeners || !listeners.length) return;

        let copy = listeners.slice();

        copy.forEach(function(fn) {
            fn(...args);
        });
    }
}
