export type EventMap = Record<string, (...args: any[]) => void>;

/**
 * `Emitter` is a class that provides an easy way to implement the observer pattern
 * in your applications.
 *
 * It can be extended to create new classes that have the ability to emit and bind custom named events.
 * Emitter is used by `Model` and `View` classes, which inherit from it to implement
 * event-driven functionality.
 *
 * ## Inverse of Control Pattern
 *
 * The Emitter class includes "inverse of control" methods (`listenTo`, `listenToOnce`, `stopListening`)
 * that allow an object to manage its own listening relationships, making cleanup easier and
 * preventing memory leaks.
 *
 * @example
 * import { Emitter } from 'rasti';
 * class ShoppingCart extends Emitter {
 *     constructor() {
 *         super();
 *         this.items = [];
 *     }
 *     addItem(item) {
 *         this.items.push(item);
 *         this.emit('itemAdded', item);
 *     }
 * }
 */
export default class Emitter<E extends EventMap = EventMap> {
    /** Registered event listeners, keyed by event type. */
    listeners?: { [K in keyof E]?: Array<E[K]> };
    /** Active `listenTo` subscriptions, tracked so `stopListening` can clean them up. */
    listeningTo?: Array<{
        emitter: Emitter<any>;
        type: string;
        listener: (...args: any[]) => void;
    }>;

    /**
     * Adds event listener.
     * @param type Type of the event (e.g. `change`).
     * @param listener Callback function to be called when the event is emitted.
     * @return A function to remove the listener.
     * @example
     * this.model.on('change', this.render.bind(this));
     */
    on<K extends keyof E>(type: K, listener: E[K]): () => void;

    /**
     * Adds event listener that executes once.
     * @param type Type of the event (e.g. `change`).
     * @param listener Callback function to be called when the event is emitted.
     * @return A function to remove the listener.
     * @example
     * this.model.once('change', () => console.log('This will happen once'));
     */
    once<K extends keyof E>(type: K, listener: E[K]): () => void;

    /**
     * Removes event listeners with flexible parameter combinations.
     *
     * - `off()` - Removes ALL listeners from this emitter
     * - `off(type)` - Removes all listeners for the specified event type
     * - `off(type, listener)` - Removes the specific listener for the specified event type
     */
    off(): void;
    off<K extends keyof E>(type: K, listener?: E[K]): void;

    /**
     * Emits event of specified type. Listeners will receive specified arguments.
     * @param type Type of the event (e.g. `change`).
     * @param args Optional arguments to be passed to listeners.
     * @example
     * this.emit('change', { field: 'name', value: 'John' });
     */
    emit<K extends keyof E>(type: K, ...args: Parameters<E[K]>): void;

    /**
     * Listen to an event of another emitter (Inverse of Control pattern).
     *
     * Allows this object to track and clean up all its listeners at once via `stopListening()`.
     * @param emitter The emitter to listen to.
     * @param type The type of the event to listen to.
     * @param listener The listener to call when the event is emitted.
     * @return A function to stop listening to the event.
     * @example
     * this.listenTo(otherModel, 'change', this.render.bind(this));
     */
    listenTo<E2 extends EventMap, K extends keyof E2>(emitter: Emitter<E2>, type: K, listener: E2[K]): () => void;

    /**
     * Listen to an event of another emitter and remove the listener after it is called.
     * Similar to `listenTo()` but the listener runs only once.
     * @param emitter The emitter to listen to.
     * @param type The type of the event to listen to.
     * @param listener The listener to call when the event is emitted.
     * @return A function to stop listening to the event.
     */
    listenToOnce<E2 extends EventMap, K extends keyof E2>(emitter: Emitter<E2>, type: K, listener: E2[K]): () => void;

    /**
     * Stop listening to events from other emitters.
     *
     * - `stopListening()` - Stops listening to ALL events from ALL emitters
     * - `stopListening(emitter)` - Stops listening to all events from the specified emitter
     * - `stopListening(emitter, type)` - Stops listening to the specified event type from the specified emitter
     * - `stopListening(emitter, type, listener)` - Stops the specific listener for the specific event
     */
    stopListening(): void;
    stopListening<E2 extends EventMap, K extends keyof E2>(emitter: Emitter<E2>, type?: K, listener?: E2[K]): void;
}
