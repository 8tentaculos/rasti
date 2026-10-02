import Emitter from './Emitter.js';

/** A value provided directly, or as a function returning it (called bound to the view). */
export type Resolvable<T> = T | (() => T);

/**
 * A `Resolvable` on the options side, where the function form is called with the view as
 * `this`. It carries `this` explicitly because an option has no assignment target for
 * TypeScript to infer it from, unlike the matching member on the instance.
 */
export type ResolvableOption<T, V> = T | ((this: V) => T);

/**
 * Options merged into the view instance. `V` is the instance the function forms are called
 * with as `this`, so a subclass with its own options (see `ComponentReservedOptions`) can
 * substitute its own instance type.
 */
export interface ViewOptions<M = any, V = View<M>> {
    el?: ResolvableOption<HTMLElement, V>;
    tag?: ResolvableOption<string, V>;
    attributes?: ResolvableOption<Record<string, any>, V>;
    events?: ResolvableOption<Record<string, string | Function>, V>;
    model?: M;
    /** Function for the view's own `render` to call. `View` never reads it itself. */
    template?: (this: V, ...args: any[]) => any;
    onDestroy?: (this: V, ...args: any[]) => void;
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
declare class View<M = any> extends Emitter {
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

    /**
     * Root DOM element of the view. `ensureElement` resolves it when the view is created,
     * so the member reads as the element. To provide it lazily, pass the function form as
     * the `el` option, which is where the declaration carries it.
     */
    el: HTMLElement;

    /** A model or any object containing data and business logic. */
    model?: M;

    /**
     * Function for your own `render` to call. A view is render-agnostic: `View` never reads
     * this member, so what it returns is whatever your `render` does with it — hence `any`.
     * Declared as a method, the form it always takes; the function can also be assigned to
     * the instance, to the prototype or as a class field.
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

/**
 * Members the view resolves while it is being created, declared apart from the class body so
 * a subclass can provide them as a getter: a getter lives on the prototype, where it is in
 * place before the constructor reads the member, and TypeScript rejects an accessor that
 * overrides a member declared in a base class body.
 */
interface View<M = any> {
    /**
     * Tag used to create the root element when `el` is not provided (default `div`).
     * A string, or a function returning one, called bound to the view. Provide it on the
     * prototype, as a getter, or via `this.tag` inside `preinitialize`: the constructor reads
     * it before a class field would be assigned.
     */
    tag?: Resolvable<string>;

    /**
     * Attributes used to create the root element when `el` is not provided.
     * An object, or a function returning one, called bound to the view. Provide it on the
     * prototype, as a getter, or via `this.attributes` inside `preinitialize`: the constructor
     * reads it before a class field would be assigned.
     */
    attributes?: Resolvable<Record<string, any>>;

    /**
     * Declarative DOM event listeners in the form `{'event selector': listener}`.
     * An object, or a function returning one, called bound to the view. Provide it on the
     * prototype, as a getter, or via `this.events` inside `preinitialize`: `delegateEvents`
     * reads it before a class field would be assigned.
     */
    events?: Resolvable<Record<string, string | Function>>;
}

export default View;
