import View from './View.js';
import Model from './Model.js';
import SafeHTML from './core/SafeHTML.js';
import Constants from './core/Constants.js';
import Partial from './core/Partial.js';
import EventsManager from './core/EventsManager.js';
import isComponent from './core/isComponent.js';
import validateListener from './utils/validateListener.js';
import getResult from './utils/getResult.js';
import parseHTML from './utils/parseHTML.js';
import isVoidElement from './utils/isVoidElement.js';
import findComment from './utils/findComment.js';
import replaceNode from './utils/replaceNode.js';
import createDevelopmentErrorMessage from './utils/createDevelopmentErrorMessage.js';
import createProductionErrorMessage from './utils/createProductionErrorMessage.js';
import formatTemplateSource from './utils/formatTemplateSource.js';
import __DEV__ from './utils/dev.js';

/**
 * Same as getResult, but pass context as argument to the expression, so an arrow function
 * can read the component without being bound to it. Used for every piece of template code
 * a component evaluates while rendering: `template()` itself and the expressions inside
 * the partials it returns.
 * @param {any} expression The expression to be evaluated.
 * @param {any} context The context to call the expression with.
 * @param {string} [meta] Optional metadata about the expression type for error messages.
 * @return {any} The result of the evaluated expression.
 * @private
 */
const getExpressionResult = (expression, context, meta) => {
    try {
        if (typeof expression !== 'function') return expression;
        // In development, detect uninstantiated Component classes and provide a helpful error.
        // This typically happens when a component tag is malformed and not properly expanded.
        if (__DEV__ && expression.prototype instanceof Component) {
            throw new Error(
                `Received uninstantiated Component class "${expression.name || 'Anonymous'}". ` +
                'This usually happens when a component tag is malformed (e.g., missing closing tag or typo). ' +
                'If that\'s not the case, make sure to instantiate child components using a component tag, mount(), or new.'
            );
        }

        return expression.call(context, context);
    } catch (error) {
        if (meta && !error._rasti) {
            let message;

            if (__DEV__) {
                // The source only locates an expression that belongs to the template, so it
                // is left out for the ones that don't, `template()` itself among them.
                const formattedSource = formatTemplateSource(context.source, expression);
                message = createDevelopmentErrorMessage(
                    `Error in ${context.constructor.name}#${context.uid} (${meta})\n${error.message}` +
                    (formattedSource ? `\n\nTemplate source:\n\n${formattedSource}` : '')
                );
            } else {
                message = createProductionErrorMessage(`Error in ${context.constructor.name}#${context.uid} expression`);
            }

            const enhancedError = new Error(message, { cause : error });
            enhancedError._rasti = true;

            throw enhancedError;
        }

        throw error;
    }
};

/**
 * Throw a component error. Call sites pass the development message as
 * `__DEV__ && \`...\`` so the long string is dead code when `__DEV__` is false.
 * @param {string|boolean} devMessage The development message, or `false` when `__DEV__` is false.
 * @param {string} prodMessage The short production message.
 * @private
 */
const throwComponentError = (devMessage, prodMessage) => {
    throw new Error(__DEV__ ?
        createDevelopmentErrorMessage(devMessage) :
        createProductionErrorMessage(prodMessage));
};

/**
 * Tell whether an expression is a component class (used by the template engine to
 * detect component tags).
 * @param {any} expression The expression to check.
 * @return {boolean} True if it is a `Component` subclass.
 * @private
 */
const isComponentClass = (expression) => !!(expression && expression.prototype instanceof Component);

/**
 * Call-site identity for the synthetic container wrapper (`${child}`). Every
 * container has that same shape, so one interned `strings` array is enough:
 * `Partial.create` caches a single subclass and the root stays reconcilable
 * across renders.
 * @type {Array<string>}
 * @private
 */
const CONTAINER_STRINGS = ['', ''];

/**
 * The handlers that do not depend on which component is rendering: telling a child
 * component apart from a plain value, escaping that plain value, and driving a child
 * through its lifecycle. Shared by every component, so they are built once.
 * @type {object}
 * @private
 */
const childHandlers = {
    isChild : (value) => value instanceof Component,
    sanitize : (value) => Component.sanitize(value),
    recycleMarker : (child) => Constants.MARKER_RECYCLED(child.uid),
    moveChild : (child, parent) => child.recycle(parent),
    hydrateChild : (child, parent) => child.hydrate(parent),
    childProps : (child) => child.props.toJSON(),
    destroyChild : (child) => child.destroy()
};

/**
 * Build the handlers bag a component hands to its template engine, where it is the
 * partial's owner and, while it renders, its host. It is created once per component
 * (in `ensureElement`) and shared by the root partial and every nested partial, so the
 * emission counters (and therefore element / marker ids) are consistent across the
 * whole component. Every component-specific concern the engine needs is exposed here,
 * so the engine never has to name `Component`: what is bound to this component is built
 * below, and the rest is shared (see `childHandlers`).
 * @param {Component} component The owning component.
 * @return {object} The partial handlers bag.
 * @private
 */
const buildPartialHandlers = (component) => {
    let elementId = 0;
    let markerId = 0;
    return Object.assign({}, childHandlers, {
        evaluate : (expression, meta) => getExpressionResult(expression, component, meta),
        registerListener : (listener, type) => ({
            attribute : Constants.ATTRIBUTE_EVENT(type, component.uid),
            index : component.eventsManager.addListener(listener, type)
        }),
        nextElementId : () => `${component.uid}-${++elementId}`,
        nextMarkerId : () => `${component.uid}-${++markerId}`,
        addChild : (child) => component.addChild(child),
        updateChild : (child, props) => component.propsQueue.push([child, props])
    });
};

/*
 * These option keys will be extended on the component instance.
 */
const componentOptions = ['key', 'state', 'onCreate', 'onChange', 'onHydrate', 'onBeforeRecycle', 'onRecycle', 'onBeforeUpdate', 'onUpdate'];

/**
 * Components are a special kind of `View` that is designed to be easily composable,
 * making it simple to add child views and build complex user interfaces.
 * Unlike views, which are render-agnostic, components have a specific set of rendering
 * guidelines that allow for a more declarative development style.
 * A component renders from its {@link #module_component__template template} method, which returns a partial (built with {@link #module_component__partial partial}) or a child component. The {@link #module_component_create Component.create} static method is a factory that writes this method from a tagged template string or a template function.
 * @module
 * @extends View
 * @param {object} options Object containing options. The following keys will be merged to `this`: model, state, key, onDestroy, onHydrate, onBeforeRecycle, onRecycle, onBeforeUpdate, onUpdate, onCreate, onChange. Any additional options not in the component or view options list will be automatically extracted as props and stored as `this.props`.
 * @property {string} [key] A unique key to identify the component. Components with keys are recycled when the same key is found in the previous render of the same interpolation. Unkeyed components are recycled based on type and position.
 * @property {Model} [model] A `Model` or any emitter object containing data and business logic. The component will listen to `change` events and call `onChange` lifecycle method.
 * @property {Model} [state] A `Model` or any emitter object containing data and business logic, to be used as internal state. The component will listen to `change` events and call `onChange` lifecycle method.
 * @property {Model} [props] Automatically created from any options not merged to the component instance. Contains props passed from parent component as a `Model`. The component will listen to `change` events on props and call `onChange` lifecycle method. When a component with a `key` is recycled during parent re-render, new props are automatically updated and any changes trigger a re-render.
 * @see {@link #module_component_create Component.create}
 * @example
 * import { Component, Model } from 'rasti';
 * // Create Timer component.
 * const Timer = Component.create`
 *     <div>
 *         Seconds: <span>${({ model }) => model.seconds}</span>
 *     </div>
 * `;
 * // Create model to store seconds.
 * const model = new Model({ seconds : 0 });
 * // Mount timer on body.
 * Timer.mount({ model }, document.body);
 * // Increment `model.seconds` every second.
 * setInterval(() => model.seconds++, 1000);
 */
export default class Component extends View {
    constructor(options = {}) {
        super(...arguments);
        this.componentOptions = [];
        // Extend "this" with options.
        componentOptions.forEach(key => {
            if (key in options) {
                this[key] = options[key];
                this.componentOptions.push(key);
            }
        });
        // Extract props from options that aren't component or view options.
        const props = {};
        Object.keys(options).forEach(key => {
            if (this.viewOptions.indexOf(key) === -1 && this.componentOptions.indexOf(key) === -1) {
                props[key] = options[key];
            }
        });
        // Store props as Model for reactive updates.
        this.props = new Model(props);
        // Store options by default.
        this.options = options;
        // Bind `partial` method to `this`.
        this.partial = this.partial.bind(this);
        // Bind `onChange` method to `this`.
        this.onChange = this.onChange.bind(this);
        // Call lifecycle method.
        this.onCreate.apply(this, arguments);
    }

    /**
     * Get events object for automatic event delegation, based on data attributes.
     * @return {object} The events object.
     * @private
     */
    events() {
        const events = {};
        // Create events object.
        this.eventsManager.types.forEach(type => {
            const dataAttribute = Constants.ATTRIBUTE_EVENT(type, this.uid);
            // Create a listener function that gets the listener index from the data attribute and calls the listener.
            const listener = function(event, component, matched) {
                // Get the listener index from the data attribute.
                const index = matched.getAttribute(dataAttribute);
                // Root element listener may not have a data attribute.
                if (index) {
                    let currentListener = this.eventsManager.listeners[parseInt(index, 10)];
                    if (typeof currentListener === 'string') currentListener = this[currentListener];
                    validateListener(currentListener);
                    // Call the listener.
                    currentListener.call(this, event, component, matched);
                }
            };
            // Add an event listener to the events object for each event type, using the data attribute
            // as both a CSS selector and to store the listener's index.
            events[`${type} [${dataAttribute}]`] = listener;
            // Add an event listener to the events object for each event type that matches the root element.
            events[type] = listener;
        });

        return events;
    }

    /**
     * Override super method. A component's root element is produced by its template,
     * which runs on the first render rather than on instantiation (so it sees `state`,
     * `props` and anything set up in the constructor). The element is therefore created
     * later, in `render`; only the render-time collaborators that every render relies on
     * are set up here.
     * @private
     */
    ensureElement() {
        // Store data event listeners.
        this.eventsManager = new EventsManager();
        // Recycled children whose props are reconciled after the render's destroy sweep,
        // so a prop change cannot re-enter render while the tree is still being patched.
        this.propsQueue = [];
        // Build the handlers bag shared by the root partial and every nested partial.
        this.partialHandlers = buildPartialHandlers(this);
    }

    /**
     * Build the root partial from the template on first use and adopt it: the root
     * element merges the component's `attributes`, and the template source is exposed
     * for expression error messages. Runs once; later renders reconcile against it.
     * @private
     */
    ensureRootPartial() {
        if (this.rootPartial) return;
        this.rootPartial = this.buildRootPartial();
        // Adopting it as the root is what makes a single-interpolation partial a
        // container: the component borrows the element of the child it resolves to.
        this.rootPartial.isRoot = true;
        // The root element merges the component's `attributes` (root treatment).
        if (this.attributes) this.rootPartial.rootAttributes = () => getResult(this.attributes, this);
        // Expose the template source for expression error messages (dev only).
        if (__DEV__) this.source = this.rootPartial.constructor.source;
    }

    /**
     * Resolve the component's root partial for this render. `template()` may return a
     * partial, used as the root directly, or a component instance, rendered as a
     * container: a single-slot partial that borrows the child's element.
     * @return {Partial} The root partial for this render.
     * @private
     */
    buildRootPartial() {
        const result = getExpressionResult(this.template, this, 'template');
        if (result instanceof Partial) return result;
        if (result instanceof Component) {
            return this.partial(CONTAINER_STRINGS, result);
        }
        throwComponentError(
            __DEV__ &&
                `Invalid template in ${this.constructor.name}#${this.uid}\n` +
                '`template()` must return a partial (this.partial`...`) or a component instance.',
            `Invalid template in ${this.constructor.name}#${this.uid}`
        );
    }

    /**
     * Tell if `Component` is a container.
     * In which case, it will not have an element by itself.
     * It will render a single expression which is expected to return a single component as child.
     * `this.el` will be a reference to that child component's element.
     * @return {boolean}
     * @private
     */
    isContainer() {
        return this.rootPartial.isContainer();
    }

    /**
     * Subscribes to a `change` event on a model or emitter object and invokes the `onChange` lifecycle method.
     * The subscription is automatically cleaned up when the component is destroyed.
     * By default, the component subscribes to changes on `this.model`, `this.state`, and `this.props`.
     *
     * @param {Object} model - The model or emitter object to listen to.
     * @param {string} [type='change'] - The event type to listen for.
     * @param {Function} [listener=this.onChange] - The callback to invoke when the event is emitted.
     * @returns {Component} The current component instance for chaining.
     */
    subscribe(model, type = 'change', listener = this.onChange) {
        // Check if model has `on` method.
        if (model.on) this.listenTo(model, type, listener);
        return this;
    }

    /**
     * Used internally on the render process.
     * Attach the `Component` to the dom element providing `this.el`, delegate events,
     * subscribe to model changes and call `onHydrate` lifecycle method.
     * @param parent {node} The parent node.
     * @return {Component} The component instance.
     * @private
     */
    hydrate(parent) {
        ['model', 'state', 'props'].forEach(key => {
            if (this[key]) this.subscribe(this[key]);
        });

        // Hydrate the root partial: it recursively hydrates its structure, the nested
        // partials and the child components in its slots, so the whole subtree hydrates
        // from this one call. Then adopt its resolved root element — for a container,
        // the wrapped child's element, already hydrated during the walk.
        this.rootPartial.hydrate(parent);
        this.el = this.rootPartial.rootElement();
        // Mark as hydrated so later renders take the update path.
        this.hydrated = true;
        // Delegate events.
        this.delegateEvents();
        // Call `onHydrate` lifecycle method.
        this.onHydrate.call(this);
        // Return `this` for chaining.
        return this;
    }

    /**
     * Used internally on the render process.
     * Reuse a `Component` by replacing the placeholder comment with the real nodes.
     * Calls `onBeforeRecycle` lifecycle method at the beginning, before any recycling operations occur.
     * @param parent {node} The parent node. If not provided, the node is already in the correct position and won't be moved.
     * @return {Component} The component instance.
     * @private
     */
    recycle(parent) {
        // Call `onBeforeRecycle` lifecycle method.
        this.onBeforeRecycle.call(this);
        // No parent means the node is already in the correct position. So we don't need to replace it.
        if (parent) {
            // Locate the placeholder comment and replace it with the real nodes
            const placeholder = findComment(parent, Constants.MARKER_RECYCLED(this.uid), isComponent);
            replaceNode(placeholder, this.el);
        }
        // Return `this` for chaining.
        return this;
    }

    /**
     * Update the component's props.
     * Sets the props and calls the `onRecycle` lifecycle method.
     * @param props {object} The props to set on the component.
     * @return {Component} The component instance.
     * @private
     */
    updateProps(props) {
        // Set the props.
        this.props.set(props);
        // Call `onRecycle` lifecycle method.
        this.onRecycle.call(this);
        // Return `this` for chaining.
        return this;
    }

    /**
     * Tagged template helper method.
     * Used to create a partial template.
     * It will return a `Partial`: the template's structure paired with this render's
     * expressions, which the component renders and then patches in place on later renders.
     * Components interpolated in it will be added as children by the parent component.
     * Template strings literals will be marked as safe HTML to be rendered.
     * This method is bound to the component instance by default.
     *
     * A partial used inside an interpolation may render any number of nodes, and may be
     * swapped for a different template between renders. The partial returned by
     * {@link #module_component__template template} is the component's root and is
     * restricted on both counts.
     * @param {TemplateStringsArray} strings - Template strings.
     * @param  {...any} expressions - Template expressions.
     * @return {Partial} The partial to render.
     * @example
     * import { Component } from 'rasti';
     * // Create a Title component.
     * const Title = Component.create`
     *     <h1>${({ props }) => props.renderChildren()}</h1>
     * `;
     * // Create Main component.
     * const Main = Component.create`
     *     <main>
     *         ${self => self.renderHeader()}
     *     </main>
     * `.extend({
     *     // Render header method.
     *     // Use `partial` to render an HTML template adding children components.
     *     renderHeader() {
     *         return this.partial`
     *             <header>
     *                 <${Title}>${({ model }) => model.title}</${Title}>
     *             </header>
     *         `;
     *     }
     * });
     */
    partial(strings, ...expressions) {
        const PartialClass = Partial.create(strings, expressions, isComponentClass);
        return new PartialClass(expressions, this.partialHandlers);
    }

    /**
     * Return the component's root partial. Called on every render, so interpolated
     * values are recomputed. Override it (directly, via `extend`, or through `create`)
     * to define the markup. It may also return a child component instance, in which case
     * the component is rendered as a <b>container</b> around it.
     *
     * The base implementation builds the element the way a view does: from `this.tag`
     * (defaulting to `div`) and the component's `attributes`, rendering the content the
     * parent slotted into it (`props.renderChildren`). A void tag renders self-closed
     * and takes no content.
     *
     * ```javascript
     * // <section class="panel">Content</section>
     * Component.mount({
     *     tag : 'section',
     *     attributes : { class : 'panel' },
     *     renderChildren : () => 'Content'
     * }, document.body);
     * ```
     *
     * The root element is created on the first render and keeps its tag from then on:
     * later renders patch that element in place, so a `tag` that changes afterwards is
     * not applied — and one that changes between a void and a non-void tag throws, since
     * that does change the root template.
     *
     * Two restrictions apply to the root partial, and only to it — the partials rendered
     * inside an interpolation are free of both:
     *
     * - It must have a <b>single root element</b>, which becomes the component's `this.el`.
     * - It must be built from the <b>same template</b> on every render, since the root is
     *   patched in place; returning a different one throws. Branch inside the interpolations
     *   instead of switching the root itself.
     * @return {Partial|Component} The root partial, or a child component to contain.
     */
    template() {
        const tag = getResult(this.tag, this) || 'div';

        if (isVoidElement(tag)) {
            if (__DEV__ && this.props.renderChildren) {
                throw new Error(createDevelopmentErrorMessage(
                    `Invalid template in ${this.constructor.name}#${this.uid}\n` +
                    `\`${tag}\` is a void element, so it cannot render the content passed to it.`
                ));
            }
            return this.partial`<${tag} />`;
        }

        // The tag goes in as an expression rather than as template text, so each branch
        // compiles to a single skeleton shared by every component that renders through
        // the default template, whatever its tag.
        return this.partial`<${tag}>${({ props }) => props.renderChildren && props.renderChildren()}</${tag}>`;
    }

    /**
     * Render the component as a string.
     * Used internally on the render process.
     * Use it for server-side rendering or static site generation.
     * @return {string} The rendered component.
     * @example
     * import { Component } from 'rasti';
     * const Button = Component.create`
     *     <button class="button">Click me</button>
     * `;
     * const App = Component.create`
     *     <div>
     *         <${Button}>Click me</${Button}>
     *     </div>
     * `;
     *
     * const app = new App();
     *
     * console.log(app.toString());
     * // <div data-rst-el="r1-1"><!--rst-s-r1-1--><button class="button" data-rst-el="r2-1">Click me</button><!--rst-e-r1-1--></div>
     *
     * console.log(`${app}`);
     * // <div data-rst-el="r1-1"><!--rst-s-r1-1--><button class="button" data-rst-el="r2-1">Click me</button><!--rst-e-r1-1--></div>
     */
    toString() {
        // Build the root partial from the template on first render.
        this.ensureRootPartial();
        // Normally there won't be any children, but if there are, destroy them.
        this.destroyChildren();
        // Normally there won't be any data event listeners, but if there are, clear them.
        this.eventsManager.reset();
        // Delegate the render to the root partial, hosting its children on this component.
        return this.rootPartial.render();
    }

    /**
     * Render the `Component`.
     *
     * **First render (before the component is hydrated):**
     * This is the initial render call, where `template()` runs for the first time. The component will be rendered
     * as a string inside a `DocumentFragment` and hydrated, making `this.el` available. `this.el` is the root DOM
     * element of the component that can be applied to the DOM. If an element was provided as an option, the component
     * hydrates onto that existing DOM instead (server-side rendered markup).
     * The `onHydrate` lifecycle method will be called.
     *
     * **Note:** Typically, you don't need to call `render()` directly for the first render. The static method `Component.mount()`
     * handles this process automatically, creating the component instance, rendering it, and appending it to the DOM.
     *
     * **Update render (once the component is hydrated):**
     * This indicates the component is being updated. The DOM is patched in place, never regenerated. The method will:
     * - Diff and update the attributes of every element in the template and in its partials
     * - Reconcile the content of each interpolation (the dynamic parts of the template), updating nested partials in place
     * - For container components (components that render a single child component), update the single interpolation
     *
     * The `onBeforeUpdate` lifecycle method will be called at the beginning, followed by the `onUpdate` lifecycle method at the end.
     *
     * **Child component handling:**
     * When rendering child components, they can be either recreated or recycled:
     *
     * - **Recreation:** A new component instance is created, running the constructor again. This happens when no matching component
     *   is found for recycling.
     *
     * - **Recycling:** The same component instance is reused. Recycling happens in two ways:
     *   - Unkeyed components are recycled if they have the same type and position in the template or partial
     *   - Components with a `key` are recycled if a previous child with the same key occupied the same interpolation
     *
     *   A `key` identifies a component among the siblings of its own interpolation, which is what lets the items
     *   of a list be reordered without recreating them: ``items.map(item => partial`<${Row} key="${item.id}" />`)``
     *   reuses the rows and moves them into place. A component wrapped in markup
     *   (``partial`<li><${Row} key="…" /></li>` ``) belongs to that partial instead, and is recreated with it
     *   whenever the partial is regenerated. Development builds warn about it.
     *
     *   When a component is recycled:
     *   - The `onBeforeRecycle` lifecycle method is called when recycling starts
     *   - The component's `this.props` is updated with the new props from the parent
     *   - The `onRecycle` lifecycle method is called after props are updated
     *
     *   A recycled component may not use props at all and remain unchanged, or it may be subscribed to a different model
     *   (or even the same model as the parent) and update independently in subsequent render cycles.
     *
     * @return {Component} The component instance.
     */
    render() {
        // Prevent a last re render if view is already destroyed.
        if (this.destroyed) return this;
        return this.hydrated ? this.renderUpdate() : this.renderFirst();
    }

    /**
     * First render: build the root from the template and hydrate it. When an
     * element is provided, hydrate onto it (server-rendered DOM); otherwise
     * render to a fragment. `template()` runs here, after construction, so it
     * sees `state`/`props`.
     * @return {Component} The component instance.
     * @private
     */
    renderFirst() {
        if (this.el) {
            // If `this.el` is a function, call it to get the element.
            this.el = getResult(this.el, this);
            // The element must be in the DOM to hydrate onto it.
            if (!this.el.parentNode) {
                throwComponentError(
                    __DEV__ &&
                        `Hydration failed in ${this.constructor.name}#${this.uid}\n` +
                        'The element must have a parent node for hydration to work.\n' +
                        'Make sure the element is mounted in the DOM before hydrating.',
                    `Hydration failed in ${this.constructor.name}#${this.uid}`
                );
            }
            // Render the component as a string to generate children components.
            this.toString();
            // Hydrate onto the provided element.
            this.hydrate(this.el.parentNode);
        } else {
            // Render to a fragment and hydrate.
            this.hydrate(parseHTML(this));
        }
        return this;
    }

    /**
     * Update render: re-run `template()` and patch the existing DOM in place.
     * @return {Component} The component instance.
     * @private
     */
    renderUpdate() {
        // Call `onBeforeUpdate` lifecycle method.
        this.onBeforeUpdate.call(this);
        // Clear event listeners.
        this.eventsManager.reset();
        // Store previous children.
        const previousChildren = this.children;
        // Clear current children.
        this.children = [];
        // Clear the queue of recycled children props.
        this.propsQueue = [];
        // Re-run `template()` to get a fresh carrier holding this render's expressions, so
        // templates that interpolate plain values (recomputed on each call) stay reactive.
        const carrier = this.buildRootPartial();
        // The root partial is retained across renders and reconciled by structure, so the
        // carrier must come from the same template. A changed root can't be patched in place.
        if (carrier.constructor !== this.rootPartial.constructor) {
            throwComponentError(
                __DEV__ &&
                    `Root template changed in ${this.constructor.name}#${this.uid}\n` +
                    'A component\'s `template()` must return the same template on every render.\n' +
                    'Branch inside interpolations instead of switching the root template itself.',
                `Root template changed in ${this.constructor.name}#${this.uid}`
            );
        }
        // Patch the DOM in place: reconcile interpolations (children / nested partials) and
        // diff element attributes. Expressions are re-evaluated in the component's context.
        this.rootPartial.update(carrier.expressions);
        // A container may now point to a different child element.
        if (this.isContainer()) this.el = this.rootPartial.rootElement();
        // Destroy unused children: those not re-added to `children` during the reconcile.
        const liveChildren = new Set(this.children);
        previousChildren.forEach(prev => {
            if (!liveChildren.has(prev)) prev.destroy();
        });
        // Update recycled children props.
        this.propsQueue.forEach(([child, props]) => child.updateProps(props));
        // If there are pending event types, delegate events again.
        if (this.eventsManager.hasPendingTypes()) {
            this.delegateEvents();
        }
        // Call onUpdate lifecycle method.
        this.onUpdate.call(this);
        // Return this for chaining.
        return this;
    }

    /**
     * Lifecycle method. Called when the component is created, at the end of the constructor.
     * This method receives the same arguments passed to the constructor (options and any additional parameters).
     * It executes both on client and server.
     * Use this method to define models or state that will be used later in `onHydrate`.
     * @param {...*} args The constructor arguments (options and any additional parameters).
     */
    onCreate() {}

    /**
     * Lifecycle method. Called when model emits `change` event.
     * By default calls `render` method.
     * This method can be extended with custom logic.
     * Maybe comparing new attributes with previous ones and calling
     * render when needed.
     * @param model {Model} The model that emitted the event.
     * @param changed {object} Object containing keys and values that has changed.
     * @param [...args] {any} Any extra arguments passed to set method.
     */
    onChange() {
        this.render();
    }

    /**
     * Lifecycle method. Called when the component is rendered for the first time and hydrated in a DocumentFragment.
     * This method only executes on the client and only during the first render.
     * Use this method for client-only operations like making API requests or setting up browser-specific functionality.
     */
    onHydrate() {}

    /**
     * Lifecycle method. Called before the component is recycled and reused between renders.
     * This method is called at the beginning of the `recycle` method, before any recycling operations occur.
     *
     * A component is recycled when:
     * - It has a `key` and a previous child with the same key exists
     * - It doesn't have a `key` but has the same type and position in the template or partial
     *
     * Use this method to perform operations that need to happen before the component is recycled,
     * such as storing previous state or preparing for the recycling.
     */
    onBeforeRecycle() {}

    /**
     * Lifecycle method. Called when the component is recycled and reused between renders.
     *
     * A component is recycled when:
     * - It has a `key` and a previous child with the same key exists
     * - It doesn't have a `key` but has the same type and position in the template or partial
     *
     * During recycling, the component instance is reused and its props are updated with new values.
     * The component's element may be moved in the DOM if the new template structure differs from the previous one.
     */
    onRecycle() {}

    /**
     * Lifecycle method. Called before the component is updated or re-rendered.
     * This method is called at the beginning of the `render` method when the component's state, model, or props change and trigger a re-render.
     * Use this method to perform operations that need to happen before the component is updated,
     * such as saving previous state or preparing for the update.
     */
    onBeforeUpdate() {}

    /**
     * Lifecycle method. Called when the component is updated or re-rendered.
     * This method is called when the component's state, model, or props change and trigger a re-render.
     * Use this method to perform operations that need to happen on every update.
     */
    onUpdate() {}

    /**
     * Lifecycle method. Called when the component is destroyed.
     * Use this method to clean up resources, cancel timers, remove event listeners, etc.
     * @param {...*} args Options object or any arguments passed to `destroy` method.
     */
    onDestroy() {}

    /**
     * Mark a string as safe HTML to be rendered.
     * Normally you don't need to use this method, as Rasti will automatically mark string literals
     * as safe HTML when the component is {@link #module_component_create created} and when
     * using the {@link #module_component__partial Component.partial} method.
     * Be sure that the string is safe to be rendered, as it will be inserted into the DOM without any sanitization.
     * @static
     * @param {string} value
     * @return {SafeHTML} A safe HTML object.
     */
    static markAsSafeHTML(value) {
        return new SafeHTML(value);
    }

    /**
     * Helper method used to extend a `Component`, creating a subclass.
     * @static
     * @param {object|Function} object Object containing methods to be added to the new `Component` subclass. Also can be a function that receives the parent prototype and returns an object.
     */
    static extend(object) {
        const Current = this;

        class Component extends Current {}

        Object.assign(
            Component.prototype,
            typeof object === 'function' ? object(Current.prototype) : object
        );

        return Component;
    }

    /**
     * Mount the component into the DOM.
     * Creates a new component instance with the provided options and optionally mounts it into the DOM.
     *
     * **Mounting modes:**
     * - **Normal mount** (default): Renders the component as HTML and appends it to the provided element. Use this for client-side rendering.
     * - **Hydration mode**: Assumes the DOM already contains the component's HTML (from server-side rendering).
     *
     * If `el` is not provided, the component is instantiated but not mounted (the same as using `new Component(options)`). You can mount it later by calling `render()` and appending the element (`this.el`) to the DOM.
     *
     * @static
     * @param {object} [options={}] The component options. These will be passed to the constructor and can include
     *                              `model`, `state`, `props`, lifecycle methods, and any other component-specific options.
     * @param {node} [el] The DOM element where the component will be mounted. If provided, the component will be
     *                    rendered and appended to this element. If not provided, the component is created but not mounted.
     * @param {boolean} [hydrate=false] If `true`, enables hydration mode for server-side rendering. The component will
     *                                  assume the DOM already contains its HTML structure and will only hydrate it.
     *                                  If `false` (default), the component will be rendered from scratch and appended to `el`.
     * @return {Component} The component instance.
     * @example
     * import { Component, Model } from 'rasti';
     *
     * const Button = Component.create`
     *     <button class="${({ props }) => props.className}">
     *         ${({ props }) => props.label}
     *     </button>
     * `;
     *
     * // Normal mount: render and append to DOM.
     * const button = Button.mount({
     *     label: 'Click me'
     * }, document.body);
     *
     * // Create without mounting (mount later).
     * const button2 = Button.mount({ className : 'secondary', label : 'Save' });
     * // Later, render and append it to the DOM.
     * document.body.appendChild(button2.render().el);
     *
     * // Hydration mode: hydrate existing server-rendered HTML
     * // Assuming document.body already contains the HTML structure of the button.
     * const hydratedButton = Button.mount({
     *     className : 'primary',
     *     label : 'Click me'
     * }, document.body, true);
     */
    static mount(options, el, hydrate) {
        // Instantiate component.
        const component = new this(options);
        // If `el` is passed, mount component.
        if (el) {
            if (hydrate) {
                // Hydrate existing DOM, only generate subcomponents calling `toString`.
                component.toString();
            } else {
                // Render the component and append it to the provided element.
                el.append(parseHTML(component));
            }
            // Hydrate in both cases.
            component.hydrate(el);
        }
        // Return component instance.
        return component;
    }

    /**
     * Takes a tagged template string, or a template function that returns a partial or a component, and returns a new `Component` class. It is sugar for defining the component's {@link #module_component__template template} method: the tagged form captures its expressions once, while the function form is used as `template()` itself and re-runs on every render (so it may interpolate plain values, not only functions).
     * - The template outer tag and attributes will be used to create the view's root element.
     * - The template inner HTML will be used as the view's template.
     *   ```javascript
     *   const Button = Component.create`<button class="button">Click me</button>`;
     *   ```
     * - Template interpolations that are functions will be evaluated during the render process, receiving the view instance as an argument and being bound to it. If the function returns `null`, `undefined`, `false`, or an empty string, the interpolation won't render any content.
     *   ```javascript
     *   const Button = Component.create`
     *       <button class="${({ props }) => props.className}">
     *           ${({ props }) => props.renderChildren()}
     *       </button>
     *   `;
     *   ```
     * - Attach DOM event handlers per element using camel-cased attributes.
     *   Event handlers are automatically bound to the component instance (`this`).
     *   Internally, Rasti uses event delegation to the component's root element for performance.
     *
     *   **Attribute Quoting:**
     *   - **Quoted attributes** (`onClick="${handler}"`) evaluate the expression first, useful for dynamic values
     *   - **Unquoted attributes** (`onClick=${handler}`) pass the function reference directly
     *
     *   **Listener Signature:** `(event, component, matched)`
     *   - `event`: The native DOM event object
     *   - `component`: The component instance (same as `this`)
     *   - `matched`: The element that matched the event (useful for delegation)
     *
     *   ```javascript
     *   const Button = Component.create`
     *       <button
     *           onClick=${function(event, component, matched) {
     *               // this === component
     *               console.log('Button clicked:', matched);
     *           }}
     *           onMouseOver="${({ model }) => () => model.isHovered = true}"
     *           onMouseOut="${({ model }) => () => model.isHovered = false}"
     *       >
     *           Click me
     *       </button>
     *   `;
     *   ```
     *
     *   If you need custom delegation (e.g., `{'click .selector': 'handler'}`),
     *   you may override the `events` property as described in {@link #module_view__delegateevents View.delegateEvents}.
     * - Boolean attributes should be passed in the format `attribute="${() => true}"`. `false` attributes won't be rendered. `true` attributes will be rendered without a value.
     *   ```javascript
     *   const Input = Component.create`
     *       <input type="text" disabled=${({ props }) => props.disabled} />
     *   `;
     *   ```
     * - If the interpolated function returns a component instance, it will be added as a child component.
     * - If the interpolated function returns an array, each item will be evaluated as above.
     *   ```javascript
     *   // Create a button component.
     *   const Button = Component.create`
     *       <button class="button">
     *           ${({ props }) => props.renderChildren()}
     *       </button>
     *   `;
     *   // Create a navigation component. Add buttons as children. Iterate over items.
     *   const Navigation = Component.create`
     *       <nav>
     *           ${({ props }) => props.items.map(
     *               item => Button.mount({ renderChildren : () => item.label })
     *           )}
     *       </nav>
     *   `;
     *   // Create a header component. Add navigation as a child.
     *   const Header = Component.create`
     *       <header>
     *           ${({ props }) => Navigation.mount({ items : props.items})}
     *       </header>
     *   `;
     *   ```
     * - Child components can be added using a component tag.
     *   ```javascript
     *   // Create a button component.
     *   const Button = Component.create`
     *       <button class="button">
     *            ${({ props }) => props.renderChildren()}
     *       </button>
     *   `;
     *   // Create a navigation component. Add buttons as children. Iterate over items.
     *   const Navigation = Component.create`
     *       <nav>
     *           ${({ props, partial }) => props.items.map(
     *               item => partial`<${Button}>${item.label}</${Button}>`
     *           )}
     *       </nav>
     *   `;
     *   // Create a header component. Add navigation as a child.
     *   const Header = Component.create`
     *       <header>
     *           <${Navigation} items="${({ props }) => props.items}" />
     *       </header>
     *   `;
     *   ```
     * - If the tagged template contains only one expression that mounts a component, or the tags are references to a component, the component will be considered a <b>container</b>. It will render a single component as a child. `this.el` will be a reference to that child component's element.
     *   ```javascript
     *   // Create a button component.
     *   const Button = Component.create`
     *       <button class="${({ props }) => props.className}">
     *           ${({ props }) => props.renderChildren()}
     *       </button>
     *   `;
     *   // Create a container that renders a Button component.
     *   const ButtonOk = Component.create`
     *       <${Button} className="ok">Ok</${Button}>
     *   `;
     *   // Create a container that renders a Button component, using a function.
     *   const ButtonCancel = Component.create(() => Button.mount({
     *       className : 'cancel',
     *       renderChildren : () => 'Cancel'
     *   }));
     *   ```
     * @static
     * @param {string|Function} strings - A tagged template string for the component, or a template function that returns a partial or a child component.
     * @param {...*} expressions - The expressions to be interpolated within the template.
     * @return {Component} The newly created component class.
     */
    static create(strings, ...expressions) {
        // Both forms end up as the subclass's `template()`. A function authors it
        // directly, and may return a partial (the component's root) or a component
        // instance (rendered as a container). A tagged template builds the root partial
        // from the captured template: `strings` keeps its identity across instances, so
        // the skeleton is compiled once and cached, while the expressions are captured
        // here and re-evaluated on every render.
        const template = typeof strings === 'function' ? strings : function() {
            return this.partial(strings, ...expressions);
        };

        return this.extend({ template });
    }
}
