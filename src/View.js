import Emitter from './Emitter.js';
import getResult from './utils/getResult.js';
import validateListener from './utils/validateListener.js';

/*
 * These option keys will be extended on the view instance.
 */
const viewOptions = ['el', 'tag', 'attributes', 'events', 'model', 'template', 'onDestroy'];

/**
 * - Listens for changes and renders the UI.
 * - Handles user input and interactivity.
 * - Sends captured input to the model.
 *
 * A `View` is an atomic unit of the user interface that can render data from a specific model or multiple models.
 * However, views can also be independent and have no associated data.  
 * Models must be unaware of views. Views, on the other hand, may render model data and listen to the change events 
 * emitted by the models to re-render themselves based on changes.  
 * Each `View` has a root element, `this.el`, which is used for event delegation.  
 * All element lookups are scoped to this element, and any rendering or DOM manipulations should be done inside it. 
 * If `this.el` is not present, an element will be created using `this.tag` (defaulting to `div`) and `this.attributes`.
 * @module
 * @extends Emitter
 * @param {object} options Object containing options. The following keys will be merged into the view instance: `el`, `tag`, `attributes`, `events`, `model`, `template`, `onDestroy`.
 * @property {node|Function} el Every view has a root DOM element stored at `this.el`. If not present, it will be created. If `this.el` is a function, it will be called to get the element at `this.ensureElement`, bound to the view instance. See {@link module_view__ensureelement View.ensureElement}.
 * @property {string|Function} tag If `this.el` is not present, an element will be created using `this.tag` and `this.attributes`. Default is `div`. If it is a function, it will be called to get the tag, bound to the view instance. See {@link module_view__ensureelement View.ensureElement}.
 * @property {object|Function} attributes If `this.el` is not present, an element will be created using `this.tag` and `this.attributes`. If it is a function, it will be called to get the attributes object, bound to the view instance. See {@link module_view__ensureelement View.ensureElement}.
 * @property {object|Function} events Object in the format `{'event selector' : 'listener'}`. It will be used to bind delegated event listeners to the root element. If it is a function, it will be called to get the events object, bound to the view instance. See {@link module_view_delegateevents View.delegateEvents}.
 * @property {object} model A model or any object containing data and business logic.
 * @property {Function} template A function that returns a string with the view's inner HTML. See {@link module_view__render View.render}. 
 * @property {number} uid Unique identifier for the view instance. This can be used to generate unique IDs for elements within the view. It is automatically generated and should not be set manually.
 * @example
 * import { View, Model } from 'rasti';
 * 
 * class Timer extends View {
 *     constructor(options) {
 *         super(options);
 *         // Create model to store internal state. Set `seconds` attribute to 0.
 *         this.model = new Model({ seconds : 0 });
 *         // Listen to changes in model `seconds` attribute and re-render.
 *         this.model.on('change:seconds', this.render.bind(this));
 *         // Increment model `seconds` attribute every 1000 milliseconds.
 *         this.interval = setInterval(() => this.model.seconds++, 1000);
 *     }
 *
 *     template(model) {
 *         return `Seconds: <span>${model.seconds}</span>`;
 *     }
 * }
 * // Render view and append view's element into the body.
 * document.body.appendChild(new Timer().render().el);
 */
export default class View extends Emitter {
    constructor(options = {}) {
        super();
        // Call preinitialize.
        this.preinitialize.apply(this, arguments);
        // Store delegated event listeners,
        // so they can be unbound later.
        this.delegatedEventListeners = [];
        // Store child views,
        // so they can be destroyed.
        this.children = [];
        // Mutable array to store handlers to be called on destroy.
        this.destroyQueue = [];
        this.viewOptions = [];
        // Extend "this" with options.
        viewOptions.forEach(key => {
            if (key in options) {
                this[key] = options[key];
                this.viewOptions.push(key);
            }
        });
        // Ensure that the view has a unique id at `this.uid`.
        this.ensureUid();
        // Ensure that the view has a root element at `this.el`.
        this.ensureElement();
    }

    /**
     * If you define a preinitialize method, it will be invoked when the view is first created, before any instantiation logic is run.
     * @param {object} options The view options.
     */
    preinitialize() {}

    /**
     * Returns the first element that matches the selector, 
     * scoped to DOM elements within the current view's root element (`this.el`).
     * @param {string} selector CSS selector.
     * @return {node} Element matching selector within the view's root element (`this.el`).
     */
    $(selector) {
        return this.el.querySelector(selector);
    }

    /**
     * Returns a list of elements that match the selector, 
     * scoped to DOM elements within the current view's root element (`this.el`).
     * @param {string} selector CSS selector.
     * @return {node[]} List of elements matching selector within the view's root element (`this.el`).
     */
    $$(selector) {
        return this.el.querySelectorAll(selector);
    }

    /**
     * Destroy the view.
     * Destroy children views if any, undelegate events, stop listening to events, call `onDestroy` lifecycle method.
     * @param {object} options Options object or any arguments passed to `destroy` method will be passed to `onDestroy` method.
     * @return {Rasti.View} Return `this` for chaining.
     */
    destroy() {
        // Call destroy on children.
        this.destroyChildren();
        // Undelegate `this.el` event listeners
        this.undelegateEvents();
        // Stop listening to events.
        this.stopListening();
        // Unbind `this` events.
        this.off();
        // Call destroy queue.
        this.destroyQueue.forEach(fn => fn());
        this.destroyQueue = [];
        // Call onDestroy lifecycle method
        this.onDestroy.apply(this, arguments);
        // Set destroyed flag.
        this.destroyed = true;
        // Return `this` for chaining.
        return this;
    }

    /**
     * `onDestroy` lifecycle method is called after the view is destroyed.
     * Override with your code. Useful to stop listening to model's events.
     * @param {object} options Options object or any arguments passed to `destroy` method.
     */
    onDestroy() {}

    /**
     * Add a view as a child.
     * Children views are stored at `this.children`, and destroyed when the parent is destroyed.
     * Returns the child for chaining.
     * @param {Rasti.View} child
     * @return {Rasti.View}
     */
    addChild(child) {
        this.children.push(child);
        return child;
    }

    /**
     * Call destroy method on children views.
     */
    destroyChildren() {
        this.children.forEach(child => child.destroy());
        this.children = [];
    }

    /**
     * Ensure that the view has a unique id at `this.uid`.
     */
    ensureUid() {
        if (!this.uid) this.uid = `r-${++View.uid}`;
    }

    /**
     * Ensure that the view has a root element at `this.el`.
     * You shouldn't call this method directly. It's called from the constructor.
     * You may override it if you want to use a different logic or to 
     * postpone element creation.
     */ 
    ensureElement() {
        // Element is already present.
        if (this.el) {
            // If "this.el" is a function, call it to get the element.
            this.el = getResult(this.el, this);
        } else {
            // If "this.el" is not present,
            // create a new element according "this.tag"
            // and "this.attributes".
            const tag = getResult(this.tag, this);
            const attrs = getResult(this.attributes, this);
            this.el = this.createElement(tag, attrs);
        }
        // Delegate events on element.
        this.delegateEvents();
    }

    /**
     * Create an element.
     * Called from the constructor if `this.el` is undefined, to ensure
     * the view has a root element.
     * @param {string} tag Tag for the element. Default to `div`
     * @param {object} attributes Attributes for the element.
     * @return {node} The created element.
     */
    createElement(tag = 'div', attributes = {}) {
        // Create DOM element.
        let el = document.createElement(tag);
        // Add element attributes.
        Object.keys(attributes)
            .forEach(key => el.setAttribute(key, attributes[key]));

        return el;
    }

    /**
     * Remove `this.el` from the DOM.
     * @return {Rasti.View} Return `this` for chaining.
     */
    removeElement() {
        this.el.parentNode.removeChild(this.el);
        // Return `this` for chaining.
        return this;
    }

    /**
     * Provide declarative listeners for DOM events within a view. If an events object is not provided, 
     * it defaults to using `this.events`. If `this.events` is a function, it will be called to get the events object.
     * 
     * The events object should follow the format `{'event selector': 'listener'}`:
     * - `event`: The type of event (e.g., 'click').
     * - `selector`: A CSS selector to match the event target. If omitted, the event is bound to the root element.
     * - `listener`: A function or a string representing a method name on the view. The method will be called with `this` bound to the view instance.
     * 
     * By default, `delegateEvents` is called within the View's constructor. If you have a simple events object, 
     * all of your DOM events will be connected automatically, and you will not need to call this function manually.
     * 
     * All attached listeners are bound to the view, ensuring that `this` refers to the view object when the listeners are invoked.
     * When `delegateEvents` is called again, possibly with a different events object, all previous listeners are removed and delegated afresh.
     * 
     * **Listener signature:** `(event, view, matched)`
     * - `event`:   The native DOM event object.
     * - `view`:    The current view instance (`this`).
     * - `matched`: The element that satisfies the selector. If no selector is provided, it will be the view's root element (`this.el`).
     *
     * If more than one ancestor between `event.target` and the view's root element matches the selector, the listener will be
     * invoked **once for each matched element** (from inner to outer).
     *
     * @param {object} [events] Object in the format `{'event selector' : 'listener'}`. Used to bind delegated event listeners to the root element.
     * @return {Rasti.View} Returns `this` for chaining.
     * @example
     * // Using prototype (recommended for static events)
     * class Modal extends View {
     *     onClickOk(event, view, matched) {
     *         // matched === the button.ok element that was clicked
     *         this.close();
     *     }
     *     
     *     onClickCancel() {
     *         this.destroy();
     *     }
     * }
     * Modal.prototype.events = {
     *     'click button.ok': 'onClickOk',
     *     'click button.cancel': 'onClickCancel',
     *     'submit form': 'onSubmit'
     * };
     * 
     * // Using a function for dynamic events
     * class DynamicView extends View {
     *     events() {
     *         return {
     *             [`click .${this.model.buttonClass}`]: 'onButtonClick',
     *             'click': 'onRootClick'
     *         };
     *     }
     * }
     */
    delegateEvents(events) {
        if (!events) events = getResult(this.events, this);
        if (!events) return this;

        if (this.delegatedEventListeners.length) this.undelegateEvents();

        // Store events by type i.e.: "click", "submit", etc.
        let eventTypes = {};

        Object.keys(events).forEach(key => {
            const keyParts = key.split(' ');
            const type = keyParts.shift();
            const selector = keyParts.join(' ');

            let listener = events[key];
            // Listener may be a string representing a method name on the view, or a function.
            if (typeof listener === 'string') listener = this[listener];
            // Validate listener is a function.
            validateListener(listener);

            if (!eventTypes[type]) eventTypes[type] = [];

            eventTypes[type].push({ selector, listener });
        });

        Object.keys(eventTypes).forEach(type => {
            // Listener for the type of event.
            const typeListener = (event) => {
                // Iterate and run every individual listener if the selector matches.
                eventTypes[type].forEach(({ selector, listener }) => {
                    // No selector provided: invoke listener once with root element.
                    if (!selector) {
                        listener.call(this, event, this, this.el);
                        return;
                    }

                    let node = event.target;
                    // Traverse ancestors until reaching the view root (`this.el`).
                    while (node && node !== this.el) {
                        if (node.matches && node.matches(selector)) {
                            listener.call(this, event, this, node);
                        }
                        node = node.parentElement;
                    }
                });
            };

            this.delegatedEventListeners.push({ type, listener : typeListener });
            this.el.addEventListener(type, typeListener);
        });
        // Return `this` for chaining.
        return this;
    }

    /**
     * Removes all of the view's delegated events. 
     * Useful if you want to disable or remove a view from the DOM temporarily. 
     * Called automatically when the view is destroyed and when `delegateEvents` is called again.
     * @return {Rasti.View} Return `this` for chaining.
     */
    undelegateEvents() {
        this.delegatedEventListeners.forEach(({ type, listener }) => {
            this.el.removeEventListener(type, listener);
        });

        this.delegatedEventListeners = [];
        // Return `this` for chaining.
        return this;
    }

    /**
     * Renders the view.  
     * This method should be overridden with custom logic.
     * The only convention is to manipulate the DOM within the scope of `this.el`,
     * and to return `this` for chaining.  
     * If you add any child views, you should call `this.destroyChildren` before re-rendering.  
     * The default implementation updates `this.el`'s innerHTML with the result
     * of calling `this.template`, passing `this.model` as the argument.
     * <br><br> &#9888; **Security Notice:** The default implementation utilizes `innerHTML`, which may introduce Cross-Site Scripting (XSS) risks.  
     * Ensure that any user-generated content is properly sanitized before inserting it into the DOM. 
     * You can use the {@link #module_view_sanitize View.sanitize} static method to escape HTML entities in a string.  
     * For best practices on secure data handling, refer to the 
     * [OWASP's XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html).<br><br>
     * @return {Rasti.View} Returns `this` for chaining.
     */
    render() {
        if (this.template) this.el.innerHTML = this.template(this.model);
        // Return `this` for chaining.
        return this;
    }

    /**
     * Escape HTML entities in a string.
     * Use this method to sanitize user-generated content before inserting it into the DOM.
     * Override this method to provide a custom escape function.
     * This method is inherited by {@link #module_component Component} and used to escape template interpolations.
     * @static
     * @param {string} value String to escape.
     * @return {string} Escaped string.
     */
    static sanitize(value) {
        return `${value}`.replace(/[&<>"']/g, match => ({
            '&' : '&amp;',
            '<' : '&lt;',
            '>' : '&gt;',
            '"' : '&quot;',
            '\'' : '&#039;'
        }[match]));
    }
}

/**
 * Counter for generating unique IDs for view instances.  
 * This is primarily used to assign unique identifiers to each view instance (`this.uid`), which can be helpful for tasks like 
 * generating element IDs.  
 * {@link #module_component Component}s use `this.uid` to generate data attributes for their elements, to be looked up on hydration.  
 * For server-side rendering, this counter should be reset to `0` on every request to ensure that the generated 
 * unique IDs match those on the client, enabling seamless hydration of components.  
 * @static
 * @type {number}
 * @default 0
 */
View.uid = 0;
