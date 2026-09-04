import View, { ViewOptions } from './View.js';
import Model from './Model.js';

export interface ComponentReservedOptions<S = any, M = any> extends ViewOptions<M> {
    /**
     * A unique key to identify the component.
     * Components with keys are recycled when the same key is found in the previous render
     * of the same interpolation. Unkeyed components are recycled based on type and position,
     * and are never recycled inside an array.
     */
    key?: string;
    /**
     * A `Model` or any emitter object containing data and business logic, to be used as internal
     * state. The component will listen to `change` events and call `onChange` lifecycle method.
     */
    state?: S;
    /** Lifecycle hook called at the end of the constructor. */
    onCreate?: (...args: any[]) => void;
    /** Lifecycle hook called when `model`, `state` or `props` emits `change`. */
    onChange?: (...args: any[]) => void;
    /** Lifecycle hook called after the first render (client only). */
    onHydrate?: () => void;
    /** Lifecycle hook called at the start of `recycle`, before any recycling happens. */
    onBeforeRecycle?: () => void;
    /** Lifecycle hook called after the component is recycled and props are updated. */
    onRecycle?: () => void;
    /** Lifecycle hook called at the start of `render` on update. */
    onBeforeUpdate?: () => void;
    /** Lifecycle hook called at the end of `render` on update. */
    onUpdate?: () => void;
}

export type ComponentOptions<P = {}, S = any, M = any> = P & ComponentReservedOptions<S, M>;

/** Marker type for strings that are safe to inject as HTML without sanitization. */
export interface SafeHTML {
    readonly __rastiSafeHTML: true;
    toString(): string;
}

/**
 * A partial template produced by `this.partial`. Return it from `template()` as the
 * component's root, or from a render expression to nest structure that is patched in
 * place across renders. Treat it as an opaque token: it carries the template's structure
 * and this render's expressions for the reconciler, and is not meant to be inspected.
 */
export interface ComponentPartial {
    readonly __rastiPartial: true;
}

/**
 * Helper type for typing event handlers passed to component templates.
 * `this` is bound to the component, and the handler also receives `(event, component, matched)`.
 *
 * @example
 * const onClick: EventHandler<Todo, MouseEvent> = function(ev) {
 *     this.model.toggle();
 * };
 */
export type EventHandler<C, E extends Event = Event> = (
    this: C,
    event: E,
    component: C,
    matched: Element,
) => void;

/**
 * Helper type for typing render expressions inside component templates.
 * Rasti calls the expression with the component as argument **and** binds `this` to it,
 * so both arrow and `function` forms are covered.
 *
 * @example
 * const renderTitle: RenderExpression<Todo> = ({ model }) => model.title;
 * const renderTotal: RenderExpression<Todo> = function() { return this.props.total; };
 */
export type RenderExpression<C> = (this: C, component: C) => any;

/** Extracts the props type `P` from a Component subclass. */
export type ComponentProps<C> = C extends Component<infer P, any, any> ? P : never;
/** Extracts the state type `S` from a Component subclass. */
export type ComponentState<C> = C extends Component<any, infer S, any> ? S : never;
/** Extracts the model type `M` from a Component / View subclass. */
export type ComponentModel<C> =
    C extends Component<any, any, infer M> ? M :
    C extends View<infer M> ? M :
    never;

/**
 * Lifecycle methods, with their real signatures, made available for contextual typing
 * inside `Component.extend({ ... })` so overrides don't need parameter annotations.
 */
export interface ComponentLifecycle {
    /** Lifecycle. Called at the end of the constructor. Runs on both client and server. */
    onCreate?(...args: any[]): void;
    /** Lifecycle. Called when model/state/props emit `change`. Default: triggers `render`. */
    onChange?(model: object, changed: Record<string, any>, ...args: any[]): void;
    /** Lifecycle. Called after the first render hydrates the DOM. Client only. */
    onHydrate?(): void;
    /** Lifecycle. Called at the start of `recycle`, before any recycling happens. */
    onBeforeRecycle?(): void;
    /** Lifecycle. Called when the component is recycled and its props are updated. */
    onRecycle?(): void;
    /** Lifecycle. Called at the start of `render` on update. */
    onBeforeUpdate?(): void;
    /** Lifecycle. Called at the end of `render` on update. */
    onUpdate?(): void;
    /** Lifecycle. Called when the component is destroyed. */
    onDestroy?(...args: any[]): void;
}

/**
 * Class returned by `Component.extend`: keeps the statics and constructor signature of the
 * parent class `T`, and adds the members of `O` to the instance type.
 */
export type ExtendedComponent<T extends new (...args: any[]) => any, O> =
    Omit<T, never> & (new (...args: ConstructorParameters<T>) => InstanceType<T> & O);

/**
 * Components are a special kind of `View` designed to be easily composable. Unlike views,
 * which are render-agnostic, components have a specific set of rendering guidelines that
 * allow for a more declarative development style.
 *
 * A component renders from its `template()` method. Define it by subclassing, or let the
 * {@link Component.create} static method write it for you from a tagged template string or
 * a template function. In TypeScript the subclass form types best: `props` and `state` come
 * from the generics, the interpolations are ordinary expressions checked by the compiler,
 * and the class name is both a value and a type.
 *
 * @example
 * import { Component, Model } from 'rasti';
 * const Timer = Component.create`
 *     <div>Seconds: <span>${({ model }) => model.seconds}</span></div>
 * `;
 * const model = new Model({ seconds: 0 });
 * Timer.mount({ model }, document.body);
 * setInterval(() => model.seconds++, 1000);
 *
 * @example
 * class Timer extends Component<{ label: string }, Model<{ seconds: number }>> {
 *     template() {
 *         return this.partial`<div>${this.props.label}: <span>${this.state?.seconds}</span></div>`;
 *     }
 * }
 */
declare class Component<P = {}, S = any, M = any> extends View<M> {
    /**
     * Mark a string as safe HTML to be rendered.
     * Rasti marks string literals as safe automatically when a component is created or when
     * using `this.partial`. Only use this manually when you're sure the string is safe.
     */
    static markAsSafeHTML(value: string): SafeHTML;

    /**
     * Helper method used to extend a `Component`, creating a subclass.
     *
     * The members of `object` are added to the resulting instance type, and `this` inside
     * its methods is typed as the extended component. Lifecycle overrides (`onCreate`,
     * `onChange`, ...) get their parameters typed automatically.
     *
     * @param object Object with methods to add to the subclass, or a function that receives
     * the parent prototype and returns such an object.
     * @return The newly created Component subclass.
     */
    static extend<T extends new (...args: any[]) => Component<any, any, any>, O extends object>(
        this: T,
        object: (proto: InstanceType<T>) => O & ThisType<InstanceType<T> & O>,
    ): ExtendedComponent<T, O>;
    static extend<T extends new (...args: any[]) => Component<any, any, any>, O extends object>(
        this: T,
        object: O & ComponentLifecycle & ThisType<InstanceType<T> & O>,
    ): ExtendedComponent<T, O>;

    /**
     * Mount the component into the DOM.
     *
     * - **Normal mount** (default): renders as HTML and appends it to `el`.
     * - **Hydration mode**: assumes the DOM already contains the component's HTML (SSR).
     *
     * If `el` is omitted, the component is instantiated but not mounted.
     *
     * @param options Passed to the constructor.
     * @param el Target DOM element.
     * @param hydrate If `true`, hydrate an existing SSR tree instead of rendering from scratch.
     * @return The component instance.
     */
    static mount<T extends new (...args: any[]) => Component<any, any, any>>(
        this: T,
        options?: ConstructorParameters<T>[0],
        el?: Element,
        hydrate?: boolean,
    ): InstanceType<T>;

    /**
     * Takes a tagged template string (or a function that returns a partial or a component)
     * and returns a new `Component` class. The function form is sugar for defining
     * `template()` directly; in the tagged form the expressions are captured once, so
     * anything dynamic must be a function.
     *
     * - The tagged template becomes the component's root partial; its outer element
     *   becomes `this.el` and is retained across updates.
     * - Interpolations become dynamic regions that are patched, recycled, or regenerated
     *   according to their current occupant.
     * - Function interpolations are evaluated on render, bound to the component instance.
     * - DOM event handlers via camelCased attributes (`onClick=${handler}`), delegated to the root.
     * - Returning a component instance (or array of them) adds it as a child.
     * - Use `<${Sub}>…</${Sub}>` syntax for child component tags.
     *
     * @example
     * const Button = Component.create`
     *     <button class="${({ props }) => props.className}"
     *             onClick=${function(event, self) { self.emit('click'); }}>
     *         ${({ props }) => props.label}
     *     </button>
     * `;
     */
    static create<P = Record<string, any>, S = any, M = any>(
        strings: TemplateStringsArray | ((...args: any[]) => ComponentPartial | Component<any, any, any>),
        ...expressions: any[]
    ): typeof Component<P, S, M>;

    /**
     * A unique key to identify the component, merged from options.
     * Components with keys are recycled when the same key is found in the previous render
     * of the same interpolation. Unkeyed components are recycled by type and position for
     * a single value, but are never recycled inside an array.
     */
    key?: string;

    /**
     * Props passed from the parent component, stored as a `Model` for reactive updates.
     * Accessible directly (`this.props.foo`) or via `Model` API (`this.props.get('foo')`).
     */
    props: Model<P> & P;

    /**
     * A `Model` or any emitter object containing data and business logic, to be used as internal
     * state. The component will listen to `change` events and call `onChange` lifecycle method.
     */
    state?: S;

    /** The original options object passed to the constructor. */
    options: ComponentOptions<P, S, M>;

    /**
     * Returns the component's root for this render: a partial built with `this.partial`,
     * or a component instance to render as a container (whose element this component
     * borrows). Called on every render, so interpolated values are recomputed. The base
     * implementation builds `this.tag` (default `div`) with `this.attributes` and the
     * content passed through `props.renderChildren`; override it directly, via `extend`,
     * or through `create`.
     *
     * The root partial must have a single root element — it becomes `this.el` — and must be
     * built from the same template on every render, since the root is patched in place.
     * Neither restriction applies to the partials rendered inside an interpolation.
     */
    template(): ComponentPartial | Component<any, any, any>;

    /**
     * @param options Component options. Keys `model`, `state`, `key`, `onCreate`, `onChange`,
     * `onHydrate`, `onBeforeRecycle`, `onRecycle`, `onBeforeUpdate`, `onUpdate`, `onDestroy`
     * are merged into `this`. Any remaining options become `this.props`.
     */
    constructor(options?: ComponentOptions<P, S, M>, ...args: any[]);

    /**
     * Tagged template helper bound to the component instance.
     * Returns a `ComponentPartial`, which is rendered once and then patched in place on
     * later renders. String literals are marked as safe HTML automatically.
     *
     * @example
     * renderHeader() {
     *     return this.partial`<header><${Title}>${this.model.title}</${Title}></header>`;
     * }
     */
    partial(strings: TemplateStringsArray, ...expressions: any[]): ComponentPartial;

    /**
     * Subscribes to a `change` event on a model or emitter and invokes `onChange`.
     * Cleaned up automatically on destroy. By default the component subscribes to
     * `this.model`, `this.state` and `this.props`.
     */
    subscribe(model: object, type?: string, listener?: (...args: any[]) => void): this;

    /**
     * Render the component to an HTML string. Used for server-side rendering and static
     * site generation; string coercion delegates to the same method.
     */
    toString(): string;

    /**
     * Render the component.
     *
     * - **First render** (before hydration): renders as a string inside a `DocumentFragment`
     *   and hydrates it, or hydrates onto the element given as an option. `onHydrate` is called.
     * - **Update render** (once hydrated): runs `template()` again and patches the DOM in place,
     *   diffing attributes and reconciling interpolations. `onBeforeUpdate` and `onUpdate` are called.
     */
    render(): this;

    /** Lifecycle. Called at the end of the constructor. Runs on both client and server. */
    onCreate(...args: any[]): void;

    /** Lifecycle. Called when model/state/props emit `change`. Default: triggers `render`. */
    onChange(model: object, changed: Record<string, any>, ...args: any[]): void;

    /** Lifecycle. Called after the first render hydrates the DOM. Client only. */
    onHydrate(): void;

    /** Lifecycle. Called at the start of `recycle`, before any recycling happens. */
    onBeforeRecycle(): void;

    /** Lifecycle. Called when the component is recycled and its props are updated. */
    onRecycle(): void;

    /** Lifecycle. Called at the start of `render` on update. */
    onBeforeUpdate(): void;

    /** Lifecycle. Called at the end of `render` on update. */
    onUpdate(): void;
}

declare const _default: typeof Component;
export default _default;
export { Component };
