import View from './View';

// This options keys will be extended on view instance.
const componentOptions = {
    key : true,
    state : true,
    onCreate : true,
    onChange : true,
    onRender : true
};

/*
 * Helper function. Extract attributes from html tag
 * @param text {string} html text
 * @return {object} Object with keys / values representing attributes.
 */
const getAttributes = text => {
    const attributes = {};
    const re = /([a-z]+)=?(\S+)?/gi;

    let result;
    while ((result = re.exec(text)) !== null) {
        attributes[result[1]] = result[2] ?
            result[2].replace(/'|"/g, '') : true;
    }

    return attributes;
};

/*
 * Helper function. If expression is a function, call it with context and args.
 */
const evalExpression = (expression, context, ...args) =>
    typeof expression === 'function' ?
        expression.apply(context, args) :
        expression;

/**
 * Components are a special kind of `View` that is designed to be easily composable, 
 * making it simple to add child views and build complex user interfaces.<br />
 * Unlike views, which are render-agnostic, components have a specific set of rendering 
 * guidelines that allow for a more declarative development style.
 * @module
 * @param {object} options Object containing options. The following keys will be merged to `this`: model, state, key, onDestroy, onRender, onCreate, onChange.
 * @example
 * import { Component, Model } from 'rasti';
 * // Create Timer component.
 * const Timer = Component.create`
 *     <div>
 *         Seconds: <span>${({ model }) => model.seconds}</span>
 *     </div>
 * `;
 * // Create model to store seconds.
 * const model = new Model({ seconds: 0 });
 * // Mount timer on body.
 * Timer.mount({ model }, document.body);
 * // Increment `model.seconds` every second.
 * setInterval(() => model.seconds++, 1000);
 */
export default class Component extends View {
    constructor(options = {}) {
        super(options);
        // Extend "this" with options, mapping componentOptions keys.
        Object.keys(options).forEach(key => {
            if (componentOptions[key]) this[key] = options[key];
        });
        // Store options by default.
        this.options = options;
        // Ensure id.
        this.id = this.attributes.id ? 
            // If id is provided, evaluate it.
            evalExpression(this.attributes.id, this, this) :
            // Generate a unique id and set it as id attribute.
            Component.ID_TEMPLATE(this.uid);
        // Bind onChange to this to be used as listener.
        // Store bound version, so it can be removed on onDestroy method.
        this.onChange = this.onChange.bind(this);
        // Listen to model changes and call onChange.
        if (this.model) this.model.on('change', this.onChange);
        if (this.state) this.state.on('change', this.onChange);
        // Call life cycle method.
        this.onCreate.apply(this, arguments);
    }

    /*
     * Override. We don't want to ensure an element on instantiation.
     * We will provide it later.
     */
    ensureElement() {
        // If el is provided, delegate events.
        if (this.el) this.delegateEvents();
    }

    findElement(parent) {
        return (parent || document).querySelector(`#${this.id}`);
    }

    /*
     * Used internally on the render process. Attach the view to the dom element.
     */
    hydrate(parent) {
        this.el = this.findElement(parent);
        this.delegateEvents();
        this.children.forEach(child => child.hydrate(this.el));
        this.onRender.call(this);
    }

    /*
     * Override. Add some custom logic to super `destroy` method.
     */
    destroy(options) {
        super.destroy(options);
        // Stop listening to `change`.
        // Set destroyed flag to prevent a last render after destroyed. TODO: Review
        if (this.model) this.model.off('change', this.onChange);
        if (this.state) this.state.off('change', this.onChange);
        this.destroyed = true;
    }

    /**
     * Lifecycle method. Called when the view is created at the end of the constructor.
     * @param options {object} The view options.
     */
    onCreate() {}

    /**
     * Lifecycle method. Called when model emits `change` event.
     * By default calls render method.
     * This method should be extended with custom logic.
     * Maybe comparing new attributes with previous ones and calling
     * render when needed. Or doing some dom transformation.
     * @param model {Rasti.Model}
     * @param key {string}
     * @param value {any}
     */
    onChange() {
        this.render();
    }

    /**
     * Lifecycle method. Called when the view is rendered.
     */
    onRender() {}
    
    /**
     * Lifecycle method. Called when the view is destroyed.
     */
    onDestroy() {}

    /*
     * Replace expressions.
     */
    replaceExpressions(string, addChild) {
        return string
            .replace(new RegExp(Component.EXPRESSION_PLACEHOLDER_TEMPLATE('(\\d+)'), 'g'), (match) => {
                // Get expression index.
                const idx = match.match(new RegExp(Component.EXPRESSION_PLACEHOLDER_TEMPLATE('(\\d+)')))[1];
                // Eval expression. Pass view as argument.
                const result = this.template.expressions[idx].call(this, this);
                // Treat all expressions as arrays.
                const results = result instanceof Array ? result : [result];
                // Replace expression with the result of the evaluation.
                return results.reduce((out, result) => {
                    let parsed;
                    // If result is true, replace it with a placeholder.
                    if (result === true) parsed = Component.TRUE_PLACEHOLDER;
                    // If result is false, replace it with a placeholder.
                    else if (result === false) parsed = Component.FALSE_PLACEHOLDER;
                    // Replace null or undefined with empty string.
                    else if (result === null || typeof result === 'undefined') parsed = '';
                    // If result is a view, call addChild callback.
                    else if (result && typeof result.render === 'function') parsed = addChild(result);
                    // Return expression itself.
                    else parsed = result;
                    // Concatenate expressions.
                    return out + parsed;
                }, '');

            })
            // Replace `attribute="true"` with `attribute`
            .replace(new RegExp(`([a-z]+)=["|']${Component.TRUE_PLACEHOLDER}["|']`, 'g'), '$1')
            // Replace `attribute="false"` with empty string.
            .replace(new RegExp(`([a-z]+)=["|']${Component.FALSE_PLACEHOLDER}["|']`, 'g'), '')
            // Replace rest of false expressions with empty string.
            .replace(new RegExp(Component.FALSE_PLACEHOLDER, 'g'), '');
    }

    /*
     * Treat the whole view as a HTML string.
     */
    toString() {
        // Normally there won't be any children, but if there are, destroy them.
        this.destroyChildren();
        // Add id to template including root element (this.el) as part of it.
        const tpl = this.attributes.id ?
            this.template.outer :
            this.template.outer.replace(/^<([a-z]+)/, `<$1 id="${this.id}"`);
        // Replace expressions.
        return this.replaceExpressions(tpl, (component) => {
            // Add child component.
            return this.addChild(component);
        });
    }

    /*
     * View render method.
     */
    render() {
        // Prevent a last re render if view is already destroyed.
        if (this.destroyed) return this;
        // If "this.el" is not present,
        // create a new element according "this.tag"
        // and "this.attributes".
        if (!this.el) {
            this.el = this.createElement(this.tag);
            this.delegateEvents();
        }
        // Set `this.el` attributes.
        Object.keys(this.attributes).forEach(key => {
            // Omit changing id.
            if (key === 'id') return;
            // Evaluate attribute value.
            let value = evalExpression(this.attributes[key], this, this);
            // Transform bool attribute values
            if (value === false) {
                // Remove false attributes.
                this.el.removeAttribute(key);
            } else {
                if (value === true) value = '';
                this.el.setAttribute(key, value);
            }
        });

        // Check for `template.inner`.
        // Root element may be a self enclosed tag element without innerHTML.
        if (this.template.inner) {
            const previousChildren = this.children;
            this.children = [];

            const nextChildren = [];
            const recycledChildren = [];

            // Replace expressions.
            // Set html text inside `this.el`. Make it part of the dom.
            this.el.innerHTML = this.replaceExpressions(this.template.inner, (component) => {
                let out = component;
                // Check if child already exists.
                const found = component.key && previousChildren.find(
                    previousChild => previousChild.key === component.key
                );

                if (found) {
                    // If child already exists, replace it html by its root element.
                    out = `<${found.tag} id="${found.id}"></${found.tag}>`;
                    // Add child to recycled children.
                    recycledChildren.push(found);
                    // Destroy new child component. Use recycled one instead.
                    component.destroy();
                } else {
                    // Not found. Add new child component.
                    nextChildren.push(component);
                }
                // Component html.
                return out;
            });
            // Add new children. Hydrate them.
            nextChildren.forEach(nextChild => {
                this.addChild(nextChild).hydrate(this.el);
            });
            // Replace children root elements with recycled components.
            recycledChildren.forEach(recycledChild => {
                this.el.replaceChild(this.addChild(recycledChild).el, recycledChild.findElement(this.el));
            });
            // Destroy unused children.
            previousChildren.forEach(previousChild => {
                const found = recycledChildren.indexOf(previousChild) > -1;
                if (!found) previousChild.destroy();
            });
        }
        // Call onRender lifecycle method.
        this.onRender.call(this);
        // Return this for chaining.
        return this;
    }

    /**
     * Helper method used to extend a `Component`, creating a subclass.
     * @static
     * @param {object} object Object containing methods to be added to the new `Component` subclass. Also can be a function that receives the parent prototype and returns an object.
     */
    static extend(object) {
        const Current = this;

        class Extended extends Current {}

        Object.assign(
            Extended.prototype,
            typeof object === 'function' ? object(Current.prototype) : object
        );

        return Extended;
    }

    /**
     * Mount the component into the dom.
     * It instantiate the Component view using options, 
     * appends its element into the DOM (if `el` is provided).
     * And returns the view instance.
     * @static
     * @param {object} options The view options.
     * @param {node} el Dom element to append the view element.
     * @param {boolean} hydrate If true, the view will use existing html.
     * @return {Rasti.View}
     */
    static mount(options = {}, el, hydrate) {
        // Instantiate view.
        const view = new this(options);

        // If `el` is passed, mount component.
        if (el) {
            if (hydrate) {
                view.toString();
            } else {
                const fragment = document.createElement('template');
                // Add html text into element inner html.
                fragment.innerHTML = view;
                // Add to dom.
                el.appendChild(fragment.content);
            }
            view.hydrate(el);
        }

        return view;
    }
    /**
     * Tagged template that receives an HTML string, 
     * and returns a `Component`.
     * @static
     */
    static create(strings, ...expressions) {
        const parts = [];
        // Replace functions and objects interpolations with `{number}`.
        // Where `number` is the index on expressions array.
        strings.forEach((string, i) => {
            // Add string part.
            parts.push(string);
            // Add expression placeholder for later or expression eval.
            if (expressions[i]) {
                parts.push(
                    typeof expressions[i] === 'function' || typeof expressions[i] === 'object' ?
                        Component.EXPRESSION_PLACEHOLDER_TEMPLATE(i) :
                        expressions[i]
                );
            }
        });
        // Create output text for main template.
        const main = parts.join('').trim().replace(/\n/g, '');
        // Extract outer tag, attributes and inner html.
        const result = main.match(/^<([a-z]+)(.*?)>(.*)<\/\1>$/) || main.match(/^<([a-z]+)(.*?)\/>$/);
        // Remove events listeners.
        const string = main.replace(/on([A-Z]{1}[a-z]+)+=[^>\s]+/g, '');
        // Parse attributes from html text into an object.
        let attributes = getAttributes(result[2]);
        // Events to be delegated.
        let events = {};
        // Filter events. To generate events object.
        // Generate attributes object, replace placeholders with expressions.
        attributes = Object.keys(attributes).reduce((out, key) => {
            // Is Event?
            const matchKey = key.match(/on(([A-Z]{1}[a-z]+)+)/);
            // Is placeholder for function or object?
            const matchValue = attributes[key].match(new RegExp(Component.EXPRESSION_PLACEHOLDER_TEMPLATE('(\\d+)')));
            // Get expression or value.
            const value = matchValue && matchValue[1] ? expressions[matchValue[1]] : attributes[key];
            // Is event handler. Add to events object.
            if (matchKey && matchKey[1]) {
                const eventType = matchKey[1].toLowerCase();
                Object.keys(value).forEach(
                    selector => events[`${eventType}${selector === '&' ? '' : ` ${selector}`}`] = value[selector]
                );
                return out;
            }
            // Is attribute. Add to attributes object.
            out[key] = value;
            return out;
        }, {});

        const Current = this;

        // Create subclass for this component.
        return Current.extend({
            // Set events.
            events,
            // Set attributes.
            attributes,
            // Set template data.
            template : {
                // Template including root element (this.el) as part of the template.
                outer: string,
                // Template for innerHTML of root element.
                inner: result[3],
                // Template expressions.
                expressions,
            },
            // Set root element tag.
            tag : result[1]
        });
    }
}

Component.ID_TEMPLATE = (uid) => `rasti-component-${uid}`;
Component.EXPRESSION_PLACEHOLDER_TEMPLATE = (idx) => `__RASTI_EXPRESSION{${idx}}`;
Component.TRUE_PLACEHOLDER = '__RASTI_TRUE';
Component.FALSE_PLACEHOLDER = '__RASTI_FALSE';