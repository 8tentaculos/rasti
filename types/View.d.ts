import Emitter from './Emitter.js';

export interface ViewOptions<M = any> {
    el?: HTMLElement | (() => HTMLElement);
    tag?: string | (() => string);
    attributes?: Record<string, any> | (() => Record<string, any>);
    events?: Record<string, string | Function> | (() => Record<string, string | Function>);
    model?: M;
    /**
     * Function returning the view's inner HTML. `View.render` assigns its result to
     * `innerHTML`, so a plain view returns a string; `Component` narrows this to return
     * a partial (or a component instance) instead.
     */
    template?: (...args: any[]) => any;
    onDestroy?: (...args: any[]) => void;
}

/**
 * - Listens for changes and renders the UI.
 * - Handles user input and interactivity.
 * - Sends captured input to the model.
 *
 * A `View` is an atomic unit of the user interface that can render data from a specific model or multiple models.
 * Each `View` has a root element, `this.el`, used for event delegation. All element lookups are scoped to it.
 * If `this.el` is not present, an element will be created using `this.tag` (defaulting to `div`) and `this.attributes`.
 *
 * @example
 * import { View, Model } from 'rasti';
 * class Timer extends View {
 *     constructor(options) {
 *         super(options);
 *         this.model = new Model({ seconds: 0 });
 *         this.model.on('change:seconds', this.render.bind(this));
 *     }
 *     template(model) {
 *         return `Seconds: <span>${View.sanitize(model.seconds)}</span>`;
 *     }
 *     render() {
 *         if (this.template) this.el.innerHTML = this.template(this.model);
 *         return this;
 *     }
 * }
 */
export default class View<M = any> extends Emitter {
    /**
     * Counter for generating unique IDs for view instances.
     * For server-side rendering, reset it to `0` on every request (see `resetUid`) so the
     * generated IDs match those on the client, enabling seamless hydration of components.
     * @default 0
     */
    static uid: number;

    /**
     * Escape HTML entities in a string.
     * Use this method to sanitize user-generated content before inserting it into the DOM.
     */
    static sanitize(value: string): string;

    /**
     * Reset the unique ID counter to 0.
     * Useful for server-side rendering scenarios to ensure generated unique IDs match the client,
     * enabling seamless hydration of components.
     */
    static resetUid(): void;

    /** Root DOM element of the view. */
    el: HTMLElement;

    /** A model or any object containing data and business logic. */
    model?: M;

    /** Tag used to create the root element when `el` is not provided (default `div`). */
    tag?: string | (() => string);

    /** Attributes used to create the root element when `el` is not provided. */
    attributes?: Record<string, any> | (() => Record<string, any>);

    /** Declarative DOM event listeners in the form `{'event selector': listener}`. */
    events?: Record<string, string | Function> | (() => Record<string, string | Function>);

    /**
     * Function returning the view's inner HTML, used by `render`. A plain view returns a
     * string assigned to `innerHTML`; `Component` narrows this to return a partial.
     * Declared as a method so subclasses can define it as one.
     */
    template?(...args: any[]): any;

    /** Unique identifier for the view instance. */
    uid: string;

    /** Child views. Destroyed automatically when the parent is destroyed. */
    children: View[];

    /** Whether `destroy()` has been called on this view. `undefined` until then. */
    destroyed?: boolean;

    /**
     * Functions run on `destroy()`. Push cleanup callbacks here for external subscriptions
     * Rasti doesn't manage (DOM events, timers, third-party libraries).
     */
    destroyQueue: Array<() => void>;

    /**
     * @param options View options. The following keys are merged into the view instance:
     * `el`, `tag`, `attributes`, `events`, `model`, `template`, `onDestroy`.
     */
    constructor(options?: ViewOptions<M>, ...args: any[]);

    /**
     * If you define a preinitialize method, it will be invoked when the view is first created,
     * before any instantiation logic is run. Receives all constructor arguments.
     */
    preinitialize(options?: ViewOptions<M>, ...args: any[]): void;

    /**
     * Returns the first element that matches the selector, scoped to the view's root element
     * (`this.el`), or `null` if none matches. Defaults to `HTMLElement`; pass a type argument
     * to narrow (e.g. `this.$<HTMLInputElement>('input.edit')`).
     */
    $<E extends Element = HTMLElement>(selector: string): E | null;

    /**
     * Returns a list of elements matching the selector, scoped to the view's root element
     * (`this.el`). Defaults to `HTMLElement`; pass a type argument to narrow.
     */
    $$<E extends Element = HTMLElement>(selector: string): NodeListOf<E>;

    /**
     * Destroy the view.
     * Destroys children views, undelegates events, stops listening to events, calls `onDestroy`.
     * @return This view for chaining.
     */
    destroy(...args: any[]): this;

    /**
     * Lifecycle method called after the view is destroyed. Override with your cleanup code.
     */
    onDestroy(...args: any[]): void;

    /**
     * Add a view as a child. Children are stored in `this.children` and destroyed when the parent is destroyed.
     * @return The child view for chaining.
     */
    addChild<C extends View>(child: C): C;

    /** Call `destroy()` on children views. */
    destroyChildren(): void;

    /** Ensure the view has a unique id at `this.uid`. */
    ensureUid(): void;

    /**
     * Ensure the view has a root element at `this.el`.
     * Called from the constructor. Override for custom element-creation logic.
     */
    ensureElement(): void;

    /**
     * Create a DOM element. Called from the constructor if `this.el` is undefined.
     * @param tag Tag for the element (default `div`).
     * @param attributes Attributes for the element.
     */
    createElement(tag?: string, attributes?: Record<string, any>): HTMLElement;

    /** Remove `this.el` from the DOM. */
    removeElement(): this;

    /**
     * Provide declarative listeners for DOM events. The events object follows
     * `{'event selector': 'listener'}` — listener may be a function or a method name on the view.
     *
     * Listener signature: `(event, view, matched)`.
     *
     * @example
     * class Modal extends View {
     *     onClickOk() { this.close(); }
     * }
     * Modal.prototype.events = { 'click button.ok': 'onClickOk' };
     */
    delegateEvents(events?: Record<string, string | Function>): this;

    /** Removes all of the view's delegated events. */
    undelegateEvents(): this;

    /**
     * Core render function. Override to populate the view's element (`this.el`) with HTML.
     * Convention: always return `this`.
     */
    render(): this;
}
