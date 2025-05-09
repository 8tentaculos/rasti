import View from './View.js';
import getResult from './utils/getResult.js';
import deepFlat  from './utils/deepFlat.js';

/**
 * Wrapper class for HTML strings marked as safe.
 * @class SafeHTML
 * @param {string} value The HTML string to be marked as safe.
 * @property {string} value The HTML string.
 * @private
 */
class SafeHTML {
    constructor(value) {
        this.value = value;
    }

    toString() {
        return this.value;
    }
}

/**
 * Same as getResult, but pass context as argument to the expression.
 * Used to evaluate expressions in the context of a component.
 * @param {any} expression The expression to be evaluated.
 * @param {any} context The context to call the expression with.
 * @return {any} The result of the evaluated expression.
 * @private
 */
const getExpressionResult = (expression, context) => getResult(expression, context, context);

/**
 * Generate string with placeholders for interpolated expressions.
 * @param strings {array} Array of strings.
 * @param expressions {array} Array of expressions.
 * @return {string} String with placeholders.
 * @private
 */
const addPlaceholders = (strings, expressions) => 
    strings.reduce((out, string, i) => {
        // Add string part.
        out.push(string);
        // Add expression placeholders.
        if (typeof expressions[i] !== 'undefined') {
            out.push(Component.PLACEHOLDER_EXPRESSION(i));
        }
        return out;
    }, []).join('');

/**
 * Generate one dimensional array with strings and expressions.
 * @param main {string} The main template containing placeholders.
 * @param expressions {array} Array of expressions to replace placeholders.
 * @return {array} Array containing strings and expressions.
 * @private
 */
const splitPlaceholders = (main, expressions) => {
    const PH = Component.PLACEHOLDER_EXPRESSION('(\\d+)');
    const regExp = new RegExp(`${PH}`, 'g');
    const out = [];
    let lastIndex = 0;
    let match;
    // Generate one dimensional array with strings and expressions, 
    // so all the components are added as children by the parent component.
    while ((match = regExp.exec(main)) !== null) {
        const before = main.slice(lastIndex, match.index);
        out.push(Component.markAsSafeHTML(before), expressions[match[1]]);
        lastIndex = match.index + match[0].length;
    }
    out.push(Component.markAsSafeHTML(main.slice(lastIndex)));

    return out;
};

/**
 * Expand attributes.
 * @param attributes {array} Array of attributes as key, value pairs.
 * @param getExpressionResult {function} Function to render expressions.
 * @return {object}
 * @property {object} all All attributes.
 * @property {object} events Event listeners.
 * @property {object} attributes Attributes.
 * @private
 */
const expandAttributes = (attributes, getExpressionResult) => {
    const out = attributes.reduce((out, pair) => {
        const attribute = getExpressionResult(pair[0]);
        // Attribute without value. 
        if (pair.length === 1) {
            if (typeof attribute === 'object') {
                // Expand objects as attributes.
                out.all = Object.assign(out.all, attribute);
            } else if (typeof attribute === 'string') {
                // Treat as boolean.
                out.all[attribute] = true;
            }
        } else {
            // Attribute with value.
            const value = getExpressionResult(pair[1]);
            out.all[attribute] = value;
        }

        return out;
    }, { all : {}, events : {}, attributes : {} });

    Object.keys(out.all).forEach(key => {
        // Check if key is an event listener.
        const match = key.match(/on(([A-Z]{1}[a-z]+)+)/);
        if (match && match[1]) {
            // Add event listener.
            out.events[match[1].toLowerCase()] = out.all[key];
        } else {
            // Add attribute.
            out.attributes[key] = out.all[key];
        }
    });

    return out;
};

/**
 * Replace component tags with expressions.
 * `<${Component} />` or `<${Component}></${Component}>` will be replaced 
 * by a function that mounts the component.
 * Returns the template with component tags replaced by expressions placeholders 
 * modifies the expressions array adding the mount functions.
 * @param main {string} The main template.
 * @return {string} The template with components tags replaced by expressions
 * placeholders.
 * @private
 */
const expandComponents = (main, expressions) => {
    const PH = Component.PLACEHOLDER_EXPRESSION('(\\d+)');
    // Match component tags.
    return main.replace(
        new RegExp(`<(${PH})([^>]*)>([\\s\\S]*?)</(${PH})>|<(${PH})([^>]*)/>`,'g'),
        function() {
            const { tag, attributes, inner, close, raw } = parseMatch(arguments, expressions);
            // No component found.
            if (!(tag.prototype instanceof Component)) return raw;

            let renderChildren;
            // Non void component.
            if (close) {
                // Close component tag must match open component tag.
                if (tag !== close) return raw;
                // Recursively expand inner components.
                const list = splitPlaceholders(expandComponents(inner, expressions), expressions);
                // Create renderChildren function.
                renderChildren = function() {
                    return deepFlat(list.map(item => getExpressionResult(item, this)));
                };
            }
            // Create mount function.
            const mount = function() {
                const options = expandAttributes(attributes, value => getExpressionResult(value, this)).all;
                // Add renderChildren function to options.
                if (renderChildren) options.renderChildren = renderChildren.bind(this);
                // Mount component.
                return tag.mount(options);
            };
            // Add mount function to expression.
            expressions.push(mount);
            // Replace whole string with expression placeholder.
            return Component.PLACEHOLDER_EXPRESSION(expressions.length - 1);
        }
    );
};

/**
 * Parse match data to get tag, attributes, inner html and close tag.
 * @param match {array}
 * @return {object}
 * @property {string} tag The tag.
 * @property {string} inner The inner html.
 * @property {string} close The closing tag.
 * @property {array} attributes Array of attributes as key, value pairs.
 * @property {string} raw The whole match.
 * @private
 */
const parseMatch = (match, expressions) => {
    const PH = Component.PLACEHOLDER_EXPRESSION('(\\d+)');

    const [all, openTag, openIdx, nonVoidAttrs, inner, closeTag, closeIdx,
        selfClosingTag, selfClosingIdx, selfClosingAttrs] = match;

    const data = { raw : all, attributes : [] };

    let attributesStr;
    if (openTag) {
        // Non void element.
        data.tag = typeof openIdx !== 'undefined' ? expressions[openIdx] : openTag;
        data.inner = inner;
        data.close = typeof closeIdx !== 'undefined' ? expressions[closeIdx] : closeTag;
        attributesStr = nonVoidAttrs;
    } else {
        // Self closing element.
        data.tag = typeof selfClosingIdx !== 'undefined' ? expressions[selfClosingIdx] : selfClosingTag;
        attributesStr = selfClosingAttrs;
    }
    // Parse attributes.
    const regExp = new RegExp(`(${PH}|[\\w-]+)(?:=(["']?)(?:${PH}|((?:.?(?!["']?\\s+(?:\\S+)=|\\s*/?[>"']))+.))\\3)?`, 'g');

    let attributeMatch;
    while ((attributeMatch = regExp.exec(attributesStr)) !== null) {
        const [, attribute, attributeIdx,, valueIdx, value] = attributeMatch;

        const attr = typeof attributeIdx !== 'undefined' ? expressions[attributeIdx] : attribute;
        const val = typeof valueIdx !== 'undefined' ? expressions[valueIdx] : value;

        if (typeof val !== 'undefined') {
            data.attributes.push([attr, val]);
        } else {
            data.attributes.push([attr]);
        }
    }

    return data;
};

/*
 * HTML tags that are self closing.
 */
const selfClosingTags = {
    area : true, base : true, br : true, col : true, embed : true, hr : true, 
    img : true, input : true, link : true, meta : true, source : true, track : true, wbr : true
};

/*
 * These option keys will be extended on the component instance.
 */
const componentOptions = ['key', 'state', 'onCreate', 'onChange', 'onRender'];

/**
 * Components are a special kind of `View` that is designed to be easily composable, 
 * making it simple to add child views and build complex user interfaces.  
 * Unlike views, which are render-agnostic, components have a specific set of rendering 
 * guidelines that allow for a more declarative development style.  
 * Components are defined with the {@link #module_component_create Component.create} static method, which takes a tagged template string or a function that returns another component.
 * @module
 * @extends Rasti.View
 * @param {object} options Object containing options. The following keys will be merged to `this`: model, state, key, onDestroy, onRender, onCreate, onChange.
 * @property {string} key A unique key to identify the component. Used to recycle child components.
 * @property {object} model A `Rasti.Model` or any emitter object containing data and business logic. The component will listen to `change` events and call `onChange` lifecycle method.
 * @property {object} state A `Rasti.Model` or any emitter object containing data and business logic, to be used as internal state. The component will listen to `change` events and call `onChange` lifecycle method.
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
 * const model = new Model({ seconds: 0 });
 * // Mount timer on body.
 * Timer.mount({ model }, document.body);
 * // Increment `model.seconds` every second.
 * setInterval(() => model.seconds++, 1000);
 */
export default class Component extends View {
    constructor(options = {}) {
        super(...arguments);
        // Extend "this" with options.
        componentOptions.forEach(key => {
            if (key in options) this[key] = options[key];
        });
        // Store options by default.
        this.options = options;
        // Bind `partial` method to `this`.
        this.partial = this.partial.bind(this);
        // Call lifecycle method.
        this.onCreate.apply(this, arguments);
    }

    /**
     * Listen to `change` event on a model or emitter object and call `onChange` lifecycle method.
     * The listener will be removed when the component is destroyed.
     * By default the component will be subscribed to `this.model` and `this.state`.
     * @param {Rasti.Model} model A model or emitter object to listen to changes.
     * @return {Rasti.Component} The component instance.
     */
    subscribe(model) {
        // Check if model has `on` method.
        if (!model.on) return;
        // Store bound onChange method.
        const onChange = this.onChange.bind(this);
        // Listen to model changes and store unbind function.
        const off = model.on('change', onChange);
        // Add unbind function to destroy queue.
        // So the component stops listening to model changes when destroyed.
        this.destroyQueue.push(
            // Rasti `on` method returns an unbind function.
            // But other libraries may return the object itself.
            typeof off === 'function' ? off : () => model.off('change', onChange)
        );

        return this;
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
        return !!(!this.tag && this.template);
    }

    /**
     * Override super method. We don't want to ensure an element on instantiation.
     * We will provide it later.
     * @private
     */
    ensureElement() {
        // If el is provided, delegate events.
        if (this.el) {
            // If "this.el" is a function, call it to get the element.
            this.el = getResult(this.el, this);
            this.delegateEvents();
        }
    }

    /**
     * Locate the root element of the `Component` within a specified parent node.
     * This is achieved by searching for the element using the unique data attribute assigned to the `Component`.
     * @param {Node} parent - The parent node to search within.
     * @return {Node} The root element of the component, or `null` if not found.
     * @private
     */
    findElement(parent) {
        return (parent || document).querySelector(`[${Component.DATA_ATTRIBUTE_UID}="${this.uid}"]`);
    }

    /**
     * Retrieve the attributes to be applied to the element.
     * This includes attributes to be added, removed, and their HTML representation.
     * @return {object} An object containing the following properties:
     * @property {object} add - Attributes to be added to the element, with their values.
     * @property {object} remove - Attributes to be removed from the element.
     * @property {string} html - A string representation of the attributes for use in HTML.
     * @private
     */
    getAttributes() {
        const add = {};
        const remove = {};
        const html = [];

        const attributes = { [Component.DATA_ATTRIBUTE_UID] : this.uid };

        if (this.attributes) Object.assign(attributes, getResult(this.attributes, this));
        // Store previous attributes.
        const previousAttributes = this.previousAttributes || {};
        this.previousAttributes = attributes;

        Object.keys(attributes).forEach(key => {
            let value = attributes[key];
            // Transform bool attribute values
            if (value === false) {
                remove[key] = true;
            } else if (value === true) {
                add[key] = '';
                html.push(key);
            } else {
                if (value === null || typeof value === 'undefined') value = '';

                add[key] = value;
                html.push(`${Component.sanitize(key)}="${Component.sanitize(value)}"`);
            }
        });
        // Remove attributes that were in previousAttributes but not in current attributes.
        Object.keys(previousAttributes).forEach(key => {
            if (!(key in attributes)) {
                remove[key] = true;
            }
        });

        return { add, remove, html : html.join(' ') };
    }

    /**
     * Used internally on the render process.
     * Attach the `Component` to the dom element providing `this.el`, delegate events, 
     * subscribe to model changes and call `onRender` lifecycle method with `Component.RENDER_TYPE_HYDRATE` as argument.
     * @param parent {node} The parent node.
     * @return {Rasti.Component} The component instance.
     * @private
     */
    hydrate(parent) {
        // Listen to model changes and call onChange.
        if (this.model) this.subscribe(this.model);
        // Listen to state changes and call onChange.
        if (this.state) this.subscribe(this.state);

        if (this.isContainer()) {
            this.children[0].hydrate(parent);
            this.el = this.children[0].el;
        } else {
            this.el = this.findElement(parent);
            this.delegateEvents();
            this.children.forEach(child => child.hydrate(this.el));
        }
        // Call `onRender` lifecycle method.
        this.onRender.call(this, Component.RENDER_TYPE_HYDRATE);
        // Return `this` for chaining.
        return this;
    }

    /**
     * Used internally on the render process.
     * Reuse a `Component` that has `key` when its parent is rendered.
     * Call `onRender` lifecycle method with `Component.RENDER_TYPE_RECYCLE` as argument.
     * @param parent {node} The parent node.
     * @return {Rasti.Component} The component instance.
     * @private
     */
    recycle(parent) {
        // If component is a container, call recycle on its child.
        if (this.isContainer()) {
            this.children[0].recycle(parent);
        } else {
            // Find placeholder element to be replaced. It has same data attribute as this component.
            const toBeReplaced = this.findElement(parent);
            // Replace it with this.el.
            toBeReplaced.replaceWith(this.el);
        }
        // Call `onRender` lifecycle method.
        this.onRender.call(this, Component.RENDER_TYPE_RECYCLE);
        // Return `this` for chaining.
        return this;
    }

    /**
     * Destroy the `Component`.
     * Destroy children components if any, undelegate events, stop listening to events, call `onDestroy` lifecycle method.
     * @param {object} options Options object or any arguments passed to `destroy` method will be passed to `onDestroy` method.
     * @return {Rasti.View} Return `this` for chaining.
     */
    destroy() {
        // Call super destroy method.
        super.destroy.apply(this, arguments);
        // Set destroyed flag to prevent a last render after destroyed.
        this.destroyed = true;
        // Return `this` for chaining.
        return this;
    }

    /**
     * Lifecycle method. Called when the view is created, at the end of the `constructor`.
     * @param options {object} The view options.
     */
    onCreate() {}

    /**
     * Lifecycle method. Called when model emits `change` event.
     * By default calls `render` method.
     * This method can be extended with custom logic.
     * Maybe comparing new attributes with previous ones and calling
     * render when needed.
     * @param model {Rasti.Model} The model that emitted the event.
     * @param changed {object} Object containing keys and values that has changed.
     * @param [...args] {any} Any extra arguments passed to set method.
     */
    onChange() {
        this.render();
    }

    /**
     * Lifecycle method. Called after the component is rendered.
     * - When the component is rendered for the first time, this method is called with `Component.RENDER_TYPE_HYDRATE` as the argument.
     * - When the component is updated or re-rendered, this method is called with `Component.RENDER_TYPE_RENDER` as the argument.
     * - When the component is recycled (reused with the same key), this method is called with `Component.RENDER_TYPE_RECYCLE` as the argument.
     * @param {string} type - The render type. Possible values are: `Component.RENDER_TYPE_HYDRATE`, `Component.RENDER_TYPE_RENDER` and `Component.RENDER_TYPE_RECYCLE`.
     */
    onRender() {}

    /**
     * Lifecycle method. Called when the view is destroyed.
     * @param {object} options Options object or any arguments passed to `destroy` method.
     */
    onDestroy() {}

    /**
     * Tagged template helper method.
     * Used to create a partial template.  
     * It will return a one-dimensional array with strings and expressions.  
     * Components will be added as children by the parent component. Template strings literals 
     * will be marked as safe HTML to be rendered.
     * This method is bound to the component instance by default.
     * @param {TemplateStringsArray} strings - Template strings.
     * @param  {...any} expressions - Template expressions.
     * @return {Array} Array containing strings and expressions.
     * @example
     * import { Component } from 'rasti';
     * // Create a Title component.
     * const Title = Component.create`
     *     <h1>${self => self.renderChildren()}</h1>
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
        return deepFlat(
            splitPlaceholders(
                expandComponents(addPlaceholders(strings, expressions), expressions), expressions
            ).map(item => getExpressionResult(item, this))
        );
    }

    getRecyclePlaceholder() {
        if (this.isContainer()) return this.children[0].getRecyclePlaceholder();
        
        const tag = getResult(this.tag, this) || 'div';
        const attributes = `${Component.DATA_ATTRIBUTE_UID}="${this.uid}"`;

        return this.template || !selfClosingTags[tag] ?
            `<${tag} ${attributes}></${tag}>` :
            `<${tag} ${attributes} />`;
    }

    /*
     * Treat the whole view as a HTML string.
     */
    toString() {
        // Normally there won't be any children, but if there are, destroy them.
        this.destroyChildren();
        // Container.
        if (this.isContainer()) return this.template.call(this, this.addChild.bind(this));
        // Get tag name.
        const tag = getResult(this.tag, this) || 'div';
        // Get attributes.
        const attributes = this.getAttributes().html;
        // Replace expressions of inner template.
        const inner = this.template ? this.template.call(this, this.addChild.bind(this)) : '';
        // Generate outer template.
        return this.template || !selfClosingTags[tag] ?
            `<${tag} ${attributes}>${inner}</${tag}>` :
            `<${tag} ${attributes} />`;
    }

    /**
     * Render the `Component`.  
     * - If `this.el` is not present, the `Component` will be rendered as a string inside a `DocumentFragment` and hydrated, making `this.el` available. The `onRender` lifecycle method will be called with `Component.RENDER_TYPE_HYDRATE` as an argument.  
     * - If `this.el` is present, the method will update the attributes and inner HTML of the element, or recreate its child component in the case of a container. The `onRender` lifecycle method will be called with `Component.RENDER_TYPE_RENDER` as an argument.  
     * - When rendering child components, if the new children have the same key as the previous ones, they will be recycled. A recycled `Component` will call the `onRender` lifecycle method with `Component.RENDER_TYPE_RECYCLE` as an argument.  
     * - If the active element is inside the component, it will retain focus after the render.  
     * @return {Rasti.Component} The component instance.
     */
    render() {
        // Prevent a last re render if view is already destroyed.
        if (this.destroyed) return this;
        // If `this.el` is not present, render the view as a string and hydrate it.
        if (!this.el) {
            const fragment = this.createElement('template');
            fragment.innerHTML = this;
            this.hydrate(fragment.content);
            return this;
        }
        // Update attributes.
        if (!this.isContainer()) {
            const attributes = this.getAttributes();
            // Remove attributes.
            Object.keys(attributes.remove).forEach(key => {
                this.el.removeAttribute(key);
            });
            // Add attributes.
            Object.keys(attributes.add).forEach(key => {
                this.el.setAttribute(key, attributes.add[key]);
            });
        }
        // Check for `template` to see if view has innerHTML or a child component.
        if (this.template) {
            // Store active element.
            const activeElement = document.activeElement;

            const nextChildren = [];
            const recycledChildren = [];

            const previousChildren = this.children;
            this.children = [];
            // Replace expressions. Set html inside of `this.el`.
            const inner = this.template.call(this, component => {
                let out = component;
                // Check if child already exists.
                const found = component.key && previousChildren.find(
                    previousChild => previousChild.key === component.key
                );

                if (found) {
                    // If child already exists, replace it html by its root element.
                    out = found.getRecyclePlaceholder();
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

            if (this.isContainer()) {
                if (nextChildren[0]) {
                    const fragment = this.createElement('template');
                    fragment.innerHTML = inner;
                    // Add new child to dom fragment and hydrate it.
                    this.addChild(nextChildren[0]).hydrate(fragment.content);
                    // Get next child element.
                    const nextEl = fragment.content.children[0];
                    // Replace `this.el` with nextEl.
                    this.el.replaceWith(nextEl);
                    // Set `this.el` to nextEl.
                    this.el = nextEl;
                } else if (recycledChildren[0]) {
                    this.addChild(recycledChildren[0]);
                } else {
                    throw new Error('Container component must have a child component');
                }
            } else {
                this.el.innerHTML = inner;
                // Add new children. Hydrate them.
                nextChildren.forEach(nextChild => {
                    this.addChild(nextChild).hydrate(this.el);
                });
                // Replace children root elements with recycled components.
                recycledChildren.forEach(recycledChild => {
                    this.addChild(recycledChild).recycle(this.el);
                });
            }
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
        this.onRender.call(this, Component.RENDER_TYPE_RENDER);
        // Return this for chaining.
        return this;
    }

    /**
     * Mark a string as safe HTML to be rendered.  
     * Normally you don't need to use this method, as Rasti will automatically mark string literals 
     * as safe HTML when the component is {@link #module_component_create created} and when 
     * using the {@link #module_component__partial Component.partial} method.  
     * Be sure that the string is safe to be rendered, as it will be inserted into the DOM without any sanitization.
     * @static
     * @param {string} value 
     * @return {Rasti.SafeHTML} A safe HTML object.
     */
    static markAsSafeHTML(value) {
        return new SafeHTML(value);
    }

    /**
     * Helper method used to extend a `Component`, creating a subclass.
     * @static
     * @param {object} object Object containing methods to be added to the new `Component` subclass. Also can be a function that receives the parent prototype and returns an object.
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
     * Mount the component into the dom.
     * It instantiate the Component view using options, 
     * appends its element into the DOM (if `el` is provided).
     * And returns the view instance.
     * @static
     * @param {object} options The view options.
     * @param {node} el Dom element to append the view element.
     * @param {boolean} hydrate If true, the view will hydrate existing DOM.
     * @return {Rasti.Component}
     */
    static mount(options, el, hydrate) {
        // Instantiate view.
        const view = new this(options);
        // If `el` is passed, mount component.
        if (el) {
            if (hydrate) {
                // Hydrate existing DOM.
                view.toString();
                view.hydrate(el);
            } else {
                // Append element to the DOM.
                el.appendChild(view.render().el);
            }
        }
        // Return view instance.
        return view;
    }

    /**
     * Takes a tagged template string or a function that returns another component, and returns a new `Component` class.
     * - The template outer tag and attributes will be used to create the view's root element.
     * - The template inner HTML will be used as the view's template.
     *   ```javascript
     *   const Button = Component.create`<button class="button">Click me</button>`;
     *   ```
     * - Template interpolations that are functions will be evaluated during the render process, receiving the view instance as an argument and being bound to it. If the function returns `null`, `undefined`, `false`, or an empty string, the interpolation won't render any content.
     *   ```javascript
     *   const Button = Component.create`
     *       <button class="${({ options }) => options.className}">
     *           ${({ options }) => options.renderChildren()}
     *       </button>
     *   `;
     *   ```
     * - Event handlers should be passed, at the root element as camelized attributes, in the format `onEventName=${{'selector' : listener }}`. They will be transformed to an event object and delegated to the root element. See {@link #module_view__delegateevents View.delegateEvents}. 
     * - Boolean attributes should be passed in the format `attribute="${() => true}"`. `false` attributes won't be rendered. `true` attributes will be rendered without a value.
     *   ```javascript
     *   const Input = Component.create`
     *       <input type="text" disabled=${({ options }) => options.disabled} />
     *   `;
     *   ```
     * - If the interpolated function returns a component instance, it will be added as a child component.
     * - If the interpolated function returns an array, each item will be evaluated as above.
     *   ```javascript
     *   // Create a button component.
     *   const Button = Component.create`
     *       <button class="button">
     *           ${({ options }) => options.renderChildren()}
     *       </button>
     *   `;
     *   // Create a navigation component. Add buttons as children. Iterate over items.
     *   const Navigation = Component.create`
     *       <nav>
     *           ${({ options }) => options.items.map(
     *               item => Button.mount({ renderChildren: () => item.label })
     *           )}
     *       </nav>
     *   `;
     *   // Create a header component. Add navigation as a child.
     *   const Header = Component.create`
     *       <header>
     *           ${({ options }) => Navigation.mount({ items : options.items})}
     *       </header>
     *   `;
     *   ```
     * - Child components can be added using a component tag.
     *   ```javascript
     *   // Create a button component.
     *   const Button = Component.create`
     *       <button class="button">
     *            ${({ options }) => options.renderChildren()}
     *       </button>
     *   `;
     *   // Create a navigation component. Add buttons as children. Iterate over items.
     *   const Navigation = Component.create`
     *       <nav>
     *           ${({ options, partial }) => options.items.map(
     *               item => partial`<${Button}>${item.label}</${Button}>`
     *           )}
     *       </nav>
     *   `;
     *   // Create a header component. Add navigation as a child.
     *   const Header = Component.create`
     *       <header>
     *           <${Navigation} items="${({ options }) => options.items}" />
     *       </header>
     *   `;
     *   ```
     * - If the tagged template contains only one expression that mounts a component, or the tags are references to a component, the component will be considered a <b>container</b>. It will render a single component as a child. `this.el` will be a reference to that child component's element.
     *   ```javascript
     *   // Create a button component.
     *   const Button = Component.create`
     *       <button class="${({ options }) => options.className}">
     *           ${self => self.renderChildren()}
     *       </button>
     *   `;
     *   // Create a container that renders a Button component.
     *   const ButtonOk = Component.create`
     *       <${Button} className="ok">Ok</${Button}>
     *   `;
     *   // Create a container that renders a Button component, using a function.
     *   const ButtonCancel = Component.create(() => Button.mount({
     *       className: 'cancel',
     *       renderChildren: () => 'Cancel'
     *   }));
     *   ```
     * @static
     * @param {string|function} strings - HTML template for the component or a function that mounts a sub component.
     * @param {...*} expressions - The expressions to be interpolated within the template.
     * @return {Rasti.Component} The newly created component class.
     */
    static create(strings, ...expressions) {
        const PH = Component.PLACEHOLDER_EXPRESSION('(\\d+)');
        // Containers can be created using create as a functions instead of a tagged template.
        if (typeof strings === 'function') {
            expressions = [strings];
            strings = ['', ''];
        }

        let tag, attributes, events, template;
        // Create output string for main template. Add placeholders for new lines.
        const main = expandComponents(addPlaceholders(strings, expressions), expressions);

        let match = main.match(
            new RegExp(`^\\s*<([a-z]+[1-6]?|${PH})([^>]*)>([\\s\\S]*?)</(\\1|${PH})>\\s*$|^\\s*<([a-z]+[1-6]?|${PH})([^>]*)/>\\s*$`)
        );

        if (match) {
            // It's a component with tag.
            const { tag : tagExpression, attributes : attributesAndEvents, inner, close } = parseMatch(match, expressions);
            // Get tag, attributes.
            tag = function() {
                return Component.sanitize(getExpressionResult(tagExpression, this));
            };
            // Get attributes.
            attributes = function() {
                return expandAttributes(attributesAndEvents, value => getExpressionResult(value, this)).attributes;
            };
            // Get events.
            events = function() {
                const onlyEvents = expandAttributes(attributesAndEvents, value => getExpressionResult(value, this)).events;

                return Object.keys(onlyEvents).reduce((out, key) => {
                    const typeListeners = getExpressionResult(onlyEvents[key], this);

                    Object.keys(typeListeners).forEach(selector => {
                        out[`${key}${selector === '&' ? '' : ` ${selector}`}`] = typeListeners[selector];
                    });

                    return out;
                }, {});
            };
            // If there is a closing tag, get template.
            if (close) {
                const list = inner ? splitPlaceholders(inner, expressions) : [];
                template = function(addChild) {
                    return deepFlat(list.map(item => getExpressionResult(item, this))).map(item => {
                        if (typeof item !== 'undefined' && item !== null && item !== false &&  item !== true) {
                            if (item instanceof SafeHTML) return item;
                            if (item instanceof Component) return addChild(item);
                            return Component.sanitize(item);
                        }
                        return '';
                    }).join('');
                };
            }
        } else {
            // It's a container.
            match = main.match(new RegExp(`^\\s*${PH}\\s*$`));

            if (match) {
                // If there is only one expression and no tag, is a container.
                template = function(addChild) {
                    // Replace expressions.
                    return addChild(getExpressionResult(expressions[match[1]], this)).toString();
                };
            } else {
                throw new SyntaxError('Invalid component');
            }
        }

        const Current = this;
        // Create subclass for this component.
        return Current.extend({
            // Set root element tag.
            tag,
            // Set attributes.
            attributes,
            // Set events.
            events,
            // Set template.
            template
        });
    }
}

Component.PLACEHOLDER_EXPRESSION = (idx) => `__RASTI_{${idx}}__`;
Component.DATA_ATTRIBUTE_UID = 'data-rasti-uid';
Component.RENDER_TYPE_HYDRATE = 'hydrate';
Component.RENDER_TYPE_RECYCLE = 'recycle';
Component.RENDER_TYPE_RENDER = 'render';
