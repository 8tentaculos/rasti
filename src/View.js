import Emitter from './Emitter';

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
 * @property {object} events Object in the format `{'event selector' : 'listener"'}`. Used to bind delegated event listeners to root element.
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
        Object.keys(options)
            .forEach(key => {
                if (viewOptions[key]) this[key] = options[key];
            });
        // Ensure that the view has a root element at `this.el`.
        this.ensureElement();
    }

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
        // Undelegate "this.el" event listeners
        this.undelegateEvents();
        // Unbind "this" events.
        this.off();
        // Remove "this.el" if "options.remove" is true.
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
     * Delegate event listeners. Called at the constructor.
     * Parse `events` parameter or `this.events`, and bind event listeners to `this.el`.<br />
     * Events are written in the format `{'event selector': 'listener'}`.
     * The listener may be either the name of a method on the view,
     * or a direct function body.
     * Omitting the selector causes the event to be bound to `this.el`.
     * @param {object} [events] Object in the format `{'event selector' : 'listener"'}`. Used to bind delegated event listeners to root element.
     * @example
     * view.prototype.events = {
     *      'click button.ok' : 'onClickOkButton'
     * };
     */
    delegateEvents(events = this.events) {
        if (!events) return;
        // Store events by type i.e.: "click", "submit", etc.
        let eventTypes = {};

        Object.keys(events).forEach(key => {
            let keyParts = key.split(' '),
                type = keyParts[0],
                selector = keyParts[1],
                listener = events[key];

            if (typeof listener === 'string') listener = this[listener].bind(this);

            if (!eventTypes[type]) eventTypes[type] = [];

            eventTypes[type].push({ selector, listener });
        });

        const indexOf = Array.prototype.indexOf;

        Object.keys(eventTypes).forEach(type => {
            let self = this;
            let typeListener = function(event) {
                eventTypes[type].forEach(function({ selector, listener}) {
                    if ((!selector && self.el === event.target) ||
                        (indexOf.call(self.el.querySelectorAll(selector), event.target) > -1)) {
                        listener(event, self);
                    }
                });
            };

            this.delegatedEventListeners.push({ type, listener : typeListener });
            this.el.addEventListener(type, typeListener);
        });
    }
    
    /**
     * Undelegate event listeners. Called when the view is destroyed.
     */
    undelegateEvents() {
        this.delegatedEventListeners.forEach(({ type, listener }) => {
            this.el.removeEventListener(type, listener);
        });

        this.delegatedEventListeners = [];
    }
    
    /**
     * Render the view.
     * This method should be overriden with custom logic.
     * The default implementation sets innerHTML of `this.el` with `this.template`.
     * Conventions are to only manipulate the dom in the scope of `this.el`, 
     * and to return `this` for chaining.
     * If you added any child view, you must call `this.destroyChildren`.
     * @return {Rasti.View} Return `this` for chaining.
     */
    render() {
        this.destroyChildren();
        if (this.template) this.el.innerHTML = this.template(this.model);
        return this;
    }
}

/*
 * Unique Id
 */
View.uid = 0;
