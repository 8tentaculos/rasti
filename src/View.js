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
 * Listens for changes and renders UI.
 * Handles user input and interactivity.
 * Sends captured input to the model.
 * A View is an atomic chunk of user interface. It often renders the data from a specific model, or number of models, but views can also be data-less chunks of UI that stand alone. Models must be unaware of views. Instead, views listen to the model "change" events, and react or re-render themselves appropriately. 
 * @module
 */
export default class View extends Emitter {
    constructor(options = {}) {
        super();
        // Generate unique id.
        // Useful to generate elements ids.
        this.uid = `uid${++this.constructor.uid}`;
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
        // If "this.el" is not present,
        // create a new element according "this.tag"
        // and "this.attributes".
        if (!this.el) this.el = this.createElement(this.tag, this.attributes);
        // Delegate events on element.
        this.delegateEvents();
    }

    /**
     * Element lookup, scoped to DOM elements within the
     * current view's root element ("this.element").
     * @param {string} selector - css selector
     * @return {node}
     */
    $(selector) {
        return this.el.querySelector(selector);
    }

    /**
     * Element lookup, scoped to DOM elements within the
     * current view's root element ("this.element").
     * @param {string} selector - css selector
     * @return {nodeList}
     */
    $$(selector) {
        return this.el.querySelectorAll(selector);
    }

    /**
     * Destroy the view.
     * Pass options.remove as true to remove element.
     * @param {object} options
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
     * "onDestroy" lifecycle method.
     * Called after view is destroyed..
     * @param {object} options
     */
    onDestroy() {}
    /**
     * Add a view as a child.
     * Returns the child for chaining.
     * @param {Rasti.View} child
     * @return {Rasti.View}
     */
    addChild(child) {
        this.children.push(child);
        return child;
    }
    /**
     * Call destroy on children views.
     */
    destroyChildren() {
        while(this.children.length)
            this.children.shift().destroy();
    }
    /**
     * Create an element.
     * Called from constructor if "this.el" is undefined, to ensure
     * the view to have a root element.
     * @param {string} tag default to "div"
     * @param {object} attrs
     * @return {node}
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
     * Remove the view element.
     */
    removeElement() {
        this.el.parentNode.removeChild(this.el);
    }
    /**
     * Delegate event listeners.
     * Parse "this.events" and bind event listeners to "this.el"
     * Events are written in the format {"event selector": "callback"}.
     * The callback may be either the name of a method on the view,
     * or a direct function body.
     * Omitting the selector causes the event to be bound to "this.el".
     * this.events = {
     *      'click button.ok' : 'onClickOkButton'
     * };
     * @param {object} events
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
     * Undelegate event listeners.
     */
    undelegateEvents() {
        this.delegatedEventListeners.forEach(({ type, listener }) => {
            this.el.removeEventListener(type, listener);
        });

        this.delegatedEventListeners = [];
    }
    /**
     * Render the view.
     * Override if needed, but remember calling "this.destroyChildren"
     * and returning "this".
     * @return {Rasti.View}
     */
    render() {
        this.destroyChildren();
        if (this.template) this.el.innerHTML = this.template(this.model);
        return this;
    }
}

/**
 * Unique Id
 * @static
 */
View.uid = 0;
