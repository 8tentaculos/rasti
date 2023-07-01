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
 * Components are a special kind of view that is designed to be easily composable, 
 * making it simple to add child views and build complex user interfaces. 
 * Unlike views, which are render-agnostic, components have a specific set of rendering 
 * guidelines that allow for a more declarative development style.
 * @module
 * @example
 * import { Component, Model } from 'rasti';
 * // Create Timer component.
 * const Timer = Component.create`
 *    <div>Seconds: <span>${({ model }) => model.seconds}</span></div>
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
        if (this.attributes.id) {
            this.id = evalExpression(this.attributes.id, this, this);
        } else {
            // Generate a unique id and set it as id attribute.
            this.id = `rasti-component-${this.uid}`;
            // Add id to template including root element (this.el) as part of it.
            this.template.outer = this.template.outer.replace(/^<([a-z]+)/, `<$1 id="${this.id}"`);
        }
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
     * Lifecycle method. Called when the view is created.
     */
    onCreate() {}

    /**
     * Lifecycle method. Called when model emits `change` event.
     * By default calls render method.
     * This method should be extended with custom logic.
     * Maybe comparing new attributes with previous ones and calling
     * render when needed. Or doing some dom transformation.
     * @param model
     * @param key
     * @param value
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
    replaceExpressions(string, parseExpressionResult) {
        return string
            .replace(/{(\d+)}/g, (match) => {
                // Get expression index.
                const idx = match.match(/{(\d+)}/)[1];
                // Eval expression. Pass view as argument.
                const result = this.template.expressions[idx].call(this, this);
                // Treat all expressions as arrays.
                const results = result instanceof Array ? result : [result];
                // Replace expression with the result of the evaluation.
                return results.reduce((out, current) => {
                    // Concatenate expressions.
                    out += parseExpressionResult(current);
                    return out;
                }, '');

            })
            // Replace `attribute="true"` with `attribute`
            .replace(/([a-z]+)=["|']true["|']/g, '$1')
            // Replace `attribute="false"` with ``
            .replace(/([a-z]+)=["|']false["|']/g, '');
    }

    /*
     * Treat the whole view as a HTML string.
     */
    toString() {
        // Normally there won't be any children, but if there are, destroy them.
        this.destroyChildren();
        // Replace expressions.
        return this.replaceExpressions(this.template.outer, (result) => {
            let out = result;
            // Return empty string if result is null or undefined.
            if (result === null || typeof result === 'undefined') out = '';
            // If result is a view, add it to children array.
            else if (result && typeof result.render === 'function') {
                // Add child component.
                this.addChild(result);
            }

            return out;
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

        const previousChildren = this.children;
        this.children = [];

        const nextChildren = [];
        const recycledChildren = [];

        // Replace expressions.
        // Set html text inside `this.el`. Make it part of the dom.
        this.el.innerHTML = this.replaceExpressions(this.template.inner, (result) => {
            let out = result;
            // Return empty string if result is null or undefined.
            if (result === null || typeof result === 'undefined') out = '';

            // If result is a view, add it to children array.
            else if (result && typeof result.render === 'function') {
                const found = result.key && previousChildren.find(
                    previousChild => previousChild.key === result.key
                );

                if (found) {
                    out = `<${found.tag} id="${evalExpression(found.id, found, found)}"></${found.tag}>`;
                    recycledChildren.push(found);
                    result.destroy();
                } else {
                    nextChildren.push(result);
                }
            }
            
            return out;
        });

        nextChildren.forEach(nextChild => {
            this.addChild(nextChild).hydrate(this.el);
        });

        recycledChildren.forEach(recycledChild => {
            this.el.replaceChild(this.addChild(recycledChild).el, recycledChild.findElement(this.el));
        });

        previousChildren.forEach(previousChild => {
            const found = recycledChildren.indexOf(previousChild) > -1;
            if (!found) previousChild.destroy();
        });

        // Call onRender lifecycle method.
        this.onRender.call(this);
        // Return this for chaining.
        return this;
    }

    /**
     * Helper method to create a Component view subclass extending some methods.
     * @static
     * @param {object} object Object containing methods to be added to the new view subclass.
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
    * create is a tagged template that receives an HTML string, 
    * and returns a Component.
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
                        `{${i}}` :
                        expressions[i]
                );
            }
        });
        // Create output text for main template.
        const main = parts.join('').trim().replace(/\n/g, '');
        // Extract outer tag, attributes and inner html.
        const result = main.match(/^<([a-z]+)(.*?)>(.*)<\/\1>$/);
        // Remove events listeners.
        const string = main.replace(/on([A-Z]{1}[a-z]+)+=[^>\s]+/g, '');
        // Parse attributes from html text into an object.
        let attributes = getAttributes(result[2]);
        let events = {};
        // Filter events. Replace placeholders `{number}` with expressions.
        attributes = Object.keys(attributes).reduce((out, key) => {
            const matchKey = key.match(/on(([A-Z]{1}[a-z]+)+)/); // Is Event?
            const matchValue = attributes[key].match(/{(\d+)}/); // Is placeholder for function or object?
            // Get expression or value.
            const value = matchValue && matchValue[1] ? expressions[matchValue[1]] : attributes[key];
            // Is event handler.
            if (matchKey && matchKey[1]) {
                const eventType = matchKey[1].toLowerCase();
                Object.keys(value).forEach(
                    selector => events[`${eventType}${selector === '&' ? '' : ` ${selector}`}`] = value[selector]
                );
                return out;
            }
            // Is function expression.
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
