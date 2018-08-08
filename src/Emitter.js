/**
 * Emitter is a class that can be extended giving the subclass the ability to bind and emit custom named events. Model and View inherits from it.
 * @module
 * @example
 * import Emitter from 'rasti';
 * 
 * class Model extends Emitter {
 * 
 * }
 * 
 * const model = new Model();
 * 
 * model.on('hello', () => console.log('world!'));
 * model.emit('hello'); // world!
 */
export default class Emitter {
    /**
     * Add event listener.
     * @param {string} type
     * @param {function} listener
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
     * Add event listener that executes once.
     * @param {string} type
     * @param {function} listener
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
     * If is not provided, it removes all listeners.
     * If listener is not provided, it removes all listeners for specified type.
     * @param {string} [type]
     * @param {function} [listener]
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
     * @param {string} type
     * @param args
     */
    emit(type, ...args) {
        let listeners = this.listeners && this.listeners[type];

        if (!listeners || !listeners.length) return;

        let copy = listeners.slice();

        copy.forEach(function(fn) {
            fn(...args);
        });
    }

    /**
     * Emits event of specified type asynchronously. Listeners will receive specified arguments.
     * @param {string} type
     * @param args
     */
    emitAsync(type, ...args) {
        var self = this;
        setTimeout(function() {
            self.emit(type, ...args);
        }, 10);
    }
}
