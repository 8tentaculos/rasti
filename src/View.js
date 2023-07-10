import Emitter from './Emitter.js';

// This options keys will be extended on view instance.
const viewOptions = {
    el : true,
    tag : true,
    attributes : true,
    events : true,
    model : true,
    template : true,
    onDestroy : true
};

/**
 * - Listens for changes and renders UI.
 * - Handles user input and interactivity.
 * - Sends captured input to the model.
 *
 * A View is an atomic chunk of user interface. It often renders the data from a specific model, 
 * or number of models, but views can also be data-less chunks of UI that stand alone.<br /> 
 * Models must be unaware of views. Instead, views listen to the model "change" events, 
 * and react or re-render themselves appropriately.<br />
 * Views has a root element, `this.el`. That element is used for event delegation. Elements lookups are scoped to that element. And render and dom manipulations should be done inside that element. 
 * If `this.el` is not present, an element will be created using `this.tag` (or `div` as default), and `this.attributes`.<br />
 * @module
 * @param {object} options Object containing options. The following keys will be merged to `this`: el, tag, attributes, events, model, template, onDestroy.
 * @property {node} el Every view has a root element, `this.el`. If not present it will be created.
 * @property {string} tag If `this.el` is not present, an element will be created using `this.tag`. Default is `div`.
 * @property {object} attributes If `this.el` is not present, an element will be created using `this.attributes`.
 * @property {object} events Object in the format `{'event selector' : 'listener'}`. Used to bind delegated event listeners to root element.
 * @property {object} model A `Rasti.Model` or any object containing data and business logic.
 * @property {function} template A function that receives data and returns a markup string (html for example).
 * @example
 * // Counter view.
 * class CounterView extends View {
 *     constructor(options) {
 *         super(options);
 *         // Bind method to `this`, to be called as listener.
 *         this.render = this.render.bind(this);
 *         // Listen to model change and re render.
 *         this.model.on('change:count', this.render);
 *     }
 *     onDestroy() {
 *         // Unbind events when destroyed.
 *         this.model.off('change:count', this.render);
 *     }
 *     // Listener method. Called when button is clicked.
 *     onClickIncrement() {
 *         // Increment count on model.
 *         this.model.count++;
 *     }
 * }
 * Object.assign(CounterView.prototype, {
 *     // Set delegated events.
 *     // Call `onClickIncrement` when button is clicked.
 *     events : {
 *         'click button' : 'onClickIncrement'
 *     },
 *     // View's template.
 *     template : (model) => `
 *         <div>The count is: ${model.count}</div>
 *         <button>Increment</button>
 *     `
 * });
 * // Model.
 * const model = new Model({ count : 0 });
 * // Instantiate CounterView.
 * const counterView = new CounterView({ model });
 * // Add to DOM.
 * document.body.appendChild(counterView.render().el);
 */
export default class View extends Emitter {
    constructor(options = {}) {
        super();
        // Call preinitialize.
        this.preinitialize.apply(this, arguments);
        // Generate unique id.
        // Useful to generate elements ids.
        this.uid = `uid${++View.uid}`;
        // Store delegated events listeners,
        // so they can be unbinded later.
        this.delegatedEventListeners = [];
        // Store child views,
        // so they can be destroyed.
        this.children = [];
        // Extend "this" with options, mapping viewOptions keys.
        Object.keys(options).forEach(key => {
            if (viewOptions[key]) this[key] = options[key];
        });
        // Ensure that the view has a root element at `this.el`.
        this.ensureElement();
    }

    /**
     * If you define a preinitialize method, it will be invoked when the view is first created, before any instantiation logic is run.
     * @param {object} attrs Object containing model attributes to extend `this.attributes`.
     */
    preinitialize() {}

    /**
     * Returns the first element that match the selector, 
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
     * Pass options.remove as true to remove the view's root element (`this.el`) from the DOM.
     * @param {object} options.remove Remove the view's root element (`this.el`) from the DOM.
     */
    destroy({ remove } = {}) {
        // Call destroy on children.
        this.destroyChildren();
        // Undelegate `this.el` event listeners
        this.undelegateEvents();
        // Unbind `this` events.
        this.off();
        // Remove `this.el` if "options.remove" is true.
        if (remove) this.removeElement();
        // Call onDestroy lifecycle method
        this.onDestroy();
    }

    /**
     * `onDestroy` lifecycle method is called after view is destroyed.
     * Override with your code. Useful to stop listening to model's events.
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
        while(this.children.length)
            this.children.shift().destroy();
    }

    /**
     * Ensure that the view has a root element at `this.el`.
     * You shouldn't call this method directly. It's called from constructor.
     * You may override it if you want to use a different logic or to 
     * postpone element creation.
     */ 
    ensureElement() {
        // If "this.el" is not present,
        // create a new element according "this.tag"
        // and "this.attributes".
        if (!this.el) this.el = this.createElement(this.tag, this.attributes);
        // Delegate events on element.
        this.delegateEvents();
    }

    /**
     * Create an element.
     * Called from constructor if `this.el` is undefined, to ensure
     * the view to have a root element.
     * @param {string} tag Tag for the element. Default to `div`
     * @param {object} attrs Attributes for the element.
     * @return {node} The created element.
     */
    createElement(tag = 'div', attrs = {}) {
        // Create dom element.
        let el = document.createElement(tag);
        // Add element attributes.
        Object.keys(attrs)
            .forEach(key => el.setAttribute(key, attrs[key]));

        return el;
    }

    /**
     * Remove `this.el` from DOM.
     */
    removeElement() {
        this.el.parentNode.removeChild(this.el);
    }

    /**
     * Provide declarative listeners for DOM events within a view. If an events hash is not passed directly, uses `this.events` as the source.<br />
     * Events are written in the format `{'event selector' : 'listener'}`. The listener may be either the name of a method on the view, or a direct function body.
     * Omitting the selector causes the event to be bound to the view's root element (`this.el`).<br />
     * By default, `delegateEvents` is called within the View's constructor, 
     * so if you have a simple events hash, all of your DOM events will always already be connected, and you will never have to call this function yourself. <br />
     * All attached listeners are bound to the view automatically, so when the listeners are invoked, `this` continues to refer to the view object.<br />
     * When `delegateEvents` is run again, perhaps with a different events hash, all listeners are removed and delegated afresh.
     * @param {object} [events] Object in the format `{'event selector' : 'listener'}`. Used to bind delegated event listeners to root element.
     * @return {Rasti.View} Return `this` for chaining.
     * @example
     * MyView.prototype.events = {
     *      'click button.ok' : 'onClickOkButton',
     *      'click button.cancel' : function() {}
     * };
     */
    delegateEvents(events = this.events) {
        if (!events) return this;

        if (this.delegatedEventListeners.length) this.undelegateEvents();

        // Store events by type i.e.: "click", "submit", etc.
        let eventTypes = {};

        Object.keys(events).forEach(key => {
            let keyParts = key.split(' '),
                type = keyParts.shift(),
                selector = keyParts.join(' '),
                listener = events[key];

            listener = (
                typeof listener === 'string' ?  
                    this[listener] : 
                    listener
            ).bind(this);

            if (!eventTypes[type]) eventTypes[type] = [];

            eventTypes[type].push({ selector, listener });
        });

        const indexOf = Array.prototype.indexOf;

        Object.keys(eventTypes).forEach(type => {
            let self = this;
            let typeListener = function (event) {
                eventTypes[type].forEach(function ({ selector, listener }) {
                    if (indexOf.call(selector ? self.el.querySelectorAll(selector) : [self.el], event.target) > -1) {
                        listener(event, self);
                    }
                });
            };

            this.delegatedEventListeners.push({ type, listener : typeListener });
            this.el.addEventListener(type, typeListener);
        });

        return this;
    }

    /**
     * Removes all of the view's delegated events. Useful if you want to disable or remove a view from the DOM temporarily. Called automatically when the view is destroyed.
     * @return {Rasti.View} Return `this` for chaining.
     */
    undelegateEvents() {
        this.delegatedEventListeners.forEach(({ type, listener }) => {
            this.el.removeEventListener(type, listener);
        });

        this.delegatedEventListeners = [];

        return this;
    }

    /**
     * Render the view.
     * This method should be overridden with custom logic.
     * The default implementation sets innerHTML of `this.el` with `this.template`.
     * Conventions are to only manipulate the dom in the scope of `this.el`, 
     * and to return `this` for chaining.
     * If you added any child view, you must call `this.destroyChildren`.
     * @return {Rasti.View} Return `this` for chaining.
     */
    render() {
        if (this.template) this.el.innerHTML = this.template(this.model);
        return this;
    }
}

/*
 * Unique Id
 */
View.uid = 0;
