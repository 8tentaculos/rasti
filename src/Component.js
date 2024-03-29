import View from './View.js';

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
const extractAttributes = text => {
    const attributes = {};
    const re = /([\w|data-]+)(?:=["']?((?:.(?!["']?\s+(?:\S+)=|\s*\/?[>"']))+.)["']?)?/g;

    let result;
    while ((result = re.exec(text)) !== null) {
        attributes[result[1]] = typeof result[2] === 'undefined' ? true : result[2];
    }

    return attributes;
};

/*
 * Helper function. If first arg is a placeholder for an expression, return the expression.
 */
const getExpression = (placeholder, expressions) => {
    const match = placeholder &&
        placeholder.match && 
        placeholder.match(new RegExp(Component.EXPRESSION_PLACEHOLDER_TEMPLATE('(\\d+)')));

    return match && match[1] ? expressions[match[1]] : placeholder;
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
 * guidelines that allow for a more declarative development style.<br />
 * Components are defined with the `create` static method, which takes a tagged template.
 * @module
 * @extends Rasti.View
 * @param {object} options Object containing options. The following keys will be merged to `this`: model, state, key, onDestroy, onRender, onCreate, onChange.
 * @property {string} key A unique key to identify the component. Used to recycle child components.
 * @property {object} model A `Rasti.Model` or any emitter object containing data and business logic.
 * @property {object} state A `Rasti.Model` or any emitter object containing data and business logic, to be used as internal state.
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
        super(...arguments);
        // Extend "this" with options, mapping componentOptions keys.
        Object.keys(options).forEach(key => {
            if (componentOptions[key]) this[key] = options[key];
        });
        // Store options by default.
        this.options = options;
        // Bind onChange to this to be used as listener.
        // Store bound version, so it can be removed on onDestroy method.
        this.onChange = this.onChange.bind(this);
        // Listen to model changes and call onChange.
        if (this.model && this.model.on) this.model.on('change', this.onChange);
        if (this.state && this.state.on) this.state.on('change', this.onChange);
        // Call life cycle method.
        this.onCreate.apply(this, arguments);
    }

    /*
     * Override. We don't want to ensure an element on instantiation.
     * We will provide it later.
     */
    ensureElement() {
        // If el is provided, delegate events.
        if (this.el) {
            this.delegateEvents();
            this.id = this.el.id;
        }
        // Ensure id.
        if (!this.id) {
            this.id = this.attributes && this.attributes.id ? 
                // If id is provided, evaluate it.
                evalExpression(this.attributes.id, this, this) :
                // Generate a unique id and set it as id attribute.
                Component.ID_TEMPLATE(this.uid);
        }
    }

    /*
     * Find view's element on parent node, using id.
     */
    findElement(parent) {
        return (parent || document).querySelector(`#${this.id}`);
    }

    /*
     * Eval attributes expressions.
     */
    getAttributes() {
        const add = { id : this.id };
        const remove = {};
        const html = [`id="${this.id}"`];

        if (this.attributes) {
            Object.keys(this.attributes).forEach(key => {
                if (key === 'id') return;
                // Evaluate attribute value.
                let value = evalExpression(this.attributes[key], this, this);

                // Transform bool attribute values
                if (value === false) {
                    remove[key] = true;
                } else if (value === true) {
                    add[key] = '';
                    html.push(key);
                } else {
                    if (value === null || typeof value === 'undefined') value = '';

                    add[key] = value;
                    html.push(`${key}="${value}"`);
                }
            });
        }

        return { add, remove, html : html.join(' ') };
    }

    /*
     * Used internally on the render process.
     * Attach the view to the dom element.
     */
    hydrate(parent) {
        this.el = this.findElement(parent);
        this.delegateEvents();
        this.children.forEach(child => child.hydrate(this.el));
        this.onRender.call(this, 'hydrate');
    }

    /*
     * Used internally on the render process.
     * Reuse a view that has `key` when its parent is rendered.
     */
    recycle(parent) {
        // Find element to be replaced. It has same id.
        const toBeReplaced = this.findElement(parent);
        // Replace it with this.el.
        toBeReplaced.replaceWith(this.el);
        // Call `onRender` lifecycle method.
        this.onRender.call(this, 'recycle');
    }

    /*
     * Override. Add some custom logic to super `destroy` method.
     */
    destroy() {
        super.destroy.apply(this, arguments);
        // Stop listening to `change`.
        // Set destroyed flag to prevent a last render after destroyed. TODO: Review
        if (this.model && this.model.off) this.model.off('change', this.onChange);
        if (this.state && this.state.off) this.state.off('change', this.onChange);
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
     * @param model {Rasti.Model} The model that emitted the event.
     * @param changed {object} Object containing keys and values that has changed.
     * @param [...args] {any} Any extra arguments passed to set method.
     */
    onChange() {
        this.render();
    }

    /**
     * Lifecycle method. Called when the view is rendered.
     * @param type {string} The render type. Can be `render`, `hydrate` or `recycle`.
     */
    onRender() {}

    /**
     * Lifecycle method. Called when the view is destroyed.
     * @param {object} options Options object or any arguments passed to `destroy` method.
     */
    onDestroy() {}

    /*
     * Replace expressions.
     */
    replaceExpressions(string, addChild) {
        return string
            .replace(new RegExp(Component.EXPRESSION_PLACEHOLDER_TEMPLATE('(\\d+)'), 'g'), (match) => {
                const expression = getExpression(match, this.template.expressions);
                // Eval expression. Pass view as argument.
                const result = evalExpression(expression, this, this);
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
        // Get tag name.
        const tag = this.tag || 'div';
        // Get attributes.
        const attributes = this.getAttributes().html;
        // Replace expressions of inner template.
        const inner = this.template &&
            this.template.inner &&
            this.replaceExpressions(this.template.inner, (component) => {
                // Add child component.
                return this.addChild(component);
            });
        // Generate outer template.
        return inner ?
            `<${tag} ${attributes}>${inner}</${tag}>` :
            `<${tag} ${attributes} />`;
    }

    /*
     * View render method.
     */
    render() {
        // Prevent a last re render if view is already destroyed.
        if (this.destroyed) return this;
        // If `this.el` is not present, create a new `this.tag` element.
        if (!this.el) {
            this.el = this.createElement(this.tag);
            this.delegateEvents();
        }
        // Set `this.el` attributes.
        const attributes = this.getAttributes();
        // Remove attributes.
        Object.keys(attributes.remove).forEach(key => {
            this.el.removeAttribute(key);
        });
        // Add attributes.
        Object.keys(attributes.add).forEach(key => {
            this.el.setAttribute(key, attributes.add[key]);
        });
        // Check for `template.inner` to see if view has innerHTML.
        if (this.template && this.template.inner) {
            const previousChildren = this.children;

            this.children = [];

            const nextChildren = [];
            const recycledChildren = [];
            // Store active element.
            const activeElement = document.activeElement;
            // Replace expressions. Set html inside of `this.el`.
            this.el.innerHTML = this.replaceExpressions(this.template.inner, (component) => {
                let out = component;
                // Check if child already exists.
                const found = component.key && previousChildren.find(
                    previousChild => previousChild.key === component.key
                );

                if (found) {
                    // If child already exists, replace it html by its root element.
                    out = `<${found.el.tagName} id="${found.el.id}"></${found.el.tagName}>`;
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
                this.addChild(recycledChild).recycle(this.el);
            });
            // Destroy unused children.
            previousChildren.forEach(previousChild => {
                const found = recycledChildren.indexOf(previousChild) > -1;
                if (!found) previousChild.destroy();
            });
            // Restore focus.
            if (this.el.contains(activeElement)) {
                activeElement.focus();
            }
        }
        // Call onRender lifecycle method.
        this.onRender.call(this, 'render');
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
     * @return {Rasti.Component}
     */
    static mount(options, el, hydrate) {
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
        // Return view instance.
        return view;
    }
    /**
     * Takes a tagged template containing an HTML string, 
     * and returns a new `Component` class.
     * - The template outer tag and attributes will be used to create the view's root element.
     * - Boolean attributes should be passed in the form of `attribute="${() => true}"`.
     * - Event handlers should be passed, at the root element, in the form of `onEventName=${{'selector' : listener }}`. Where `selector` is a css selector. The event will be delegated to the view's root element.
     * - The template inner HTML will be used as the view's template.
     * - Template interpolations that are functions will be evaluated on the render process. Receiving the view instance as argument. And being bound to it.
     * - If the function returns `null`, `undefined`, `false` or empty string, the interpolation won't render any content.
     * - If the function returns a component instance, it will be added as a child component.
     * - If the function returns an array, each item will be evaluated as above.
     * @static
     * @param {string} HTML template for the component.
     * @return {Rasti.Component}
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
        // Parse attributes from html text into an object.
        let attributes = extractAttributes(result[2]);
        // Events to be delegated.
        let events = {};
        // Filter events. To generate events object.
        // Generate attributes object, replace placeholders with expressions.
        attributes = Object.keys(attributes).reduce((out, key) => {
            // Is Event?
            const matchKey = key.match(/on(([A-Z]{1}[a-z]+)+)/);
            // Is placeholder for function or object?
            // Get expression or value.
            const value = getExpression(attributes[key], expressions);
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
            // Set template.
            template : {
                // Template for innerHTML of root element.
                inner : result[3],
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
