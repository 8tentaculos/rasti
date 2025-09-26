import View from './View.js';
import Model from './Model.js';
import getResult from './utils/getResult.js';
import deepFlat  from './utils/deepFlat.js';
import parseHTML from './utils/parseHTML.js';
import syncNode from './utils/syncNode.js';

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
 * Manager for delegated events.
 * @class EventsManager
 * @private
 */
class EventsManager {
    constructor() {
        this.listeners = [];
        this.types = new Set();
        this.previousSize = 0;
    }

    /**
     * Add a listener to the events manager.
     * @param {Function} listener The listener to add.
     * @param {string} type The type of event.
     * @return {number} The index of the listener.
     */
    addListener(listener, type) {
        this.types.add(type);
        this.listeners.push(listener);
        return this.listeners.length - 1;
    }

    /**
     * Reset the events manager.
     */
    reset() {
        this.listeners = [];
        this.previousSize = this.types.size;
    }

    /**
     * Check if there are pending types.
     * @return {boolean} True if there are pending types, false otherwise.
     */
    hasPendingTypes() {
        return this.types.size > this.previousSize;
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
 * @param {Array<string>} strings Array of strings.
 * @param {Array<any>} expressions Array of expressions.
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
 * @param {Array<any>} expressions Array of expressions to replace placeholders.
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
 * @param {Array<Array<any>>} attributes Array of attributes as key, value pairs.
 * @param {Function} getExpressionResult Function to render expressions.
 * @return {object}
 * @property {object} all All attributes.
 * @property {object} events Event listeners.
 * @property {object} attributes Attributes.
 * @private
 */
const expandAttributes = (attributes, getExpressionResult) => attributes.reduce((out, pair) => {
    const attribute = getExpressionResult(pair[0]);
    // Attribute without value. 
    if (pair.length === 1) {
        if (typeof attribute === 'object') {
            // Expand objects as attributes.
            out = Object.assign(out, attribute);
        } else if (typeof attribute === 'string') {
            // Treat as boolean.
            out[attribute] = true;
        }
    } else {
        // Attribute with value.
        const value = pair[2] ? getExpressionResult(pair[1]) : pair[1];
        out[attribute] = value;
    }

    return out;
}, {});

/**
 * Expand events.
 * @param {object} attributes Attributes object.
 * @param {EventsManager} eventsManager Events manager.
 * @return {object} Attributes object.
 * @private
 */
const expandEvents = (attributes, eventsManager) => {
    const out = {};
    Object.keys(attributes).forEach(key => {
        // Check if key is an event listener.
        const match = key.match(/on(([A-Z]{1}[a-z]+)+)/);

        if (match && match[1]) {
            const type = match[1].toLowerCase();
            const listener = attributes[key];
            const index = eventsManager.addListener(listener, type);
            // Add event listener index.
            out[Component.DATA_ATTRIBUTE_EVENT(type)] = index;
        } else {
            // Add attribute.
            out[key] = attributes[key];
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
 * @param {Array<any>} expressions Array of expressions.
 * @return {string} The template with components tags replaced by expressions
 * placeholders.
 * @private
 */
const expandComponents = (main, expressions) => {
    const PH = Component.PLACEHOLDER_EXPRESSION('(\\d+)');
    // Match component tags.
    return main.replace(
        new RegExp(`<(${PH})([^>]*)>([\\s\\S]*?)</(${PH})>|<(${PH})([^>]*)/>`,'g'),
        (match, openTag, openIdx, nonVoidAttrs, inner, closeTag, closeIdx, selfClosingTag, selfClosingIdx, selfClosingAttrs) => {
            let tag, close, attributesStr;

            if (openTag) {
                tag = typeof openIdx !== 'undefined' ? expressions[openIdx] : openTag;
                close = typeof closeIdx !== 'undefined' ? expressions[closeIdx] : closeTag;
                attributesStr = nonVoidAttrs;
            } else {
                tag = typeof selfClosingIdx !== 'undefined' ? expressions[selfClosingIdx] : selfClosingTag;
                attributesStr = selfClosingAttrs;
            }
            // No component found.
            if (!(tag.prototype instanceof Component)) return match;

            let innerList;
            // Non void component.
            if (close) {
                // Close component tag must match open component tag.
                if (tag !== close) return match;
                // Recursively expand inner components.
                innerList = splitPlaceholders(expandComponents(inner, expressions), expressions);
            }
            // Parse attributes.
            const attributes = parseAttributes(attributesStr, expressions);
            // Create mount function.
            const mount = function() {
                const options = expandAttributes(attributes, value => getExpressionResult(value, this));
                // Add children to options.
                if (innerList) {
                    options.children = deepFlat(innerList.map(item => getExpressionResult(item, this)));
                }
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
 * Replace elements in template.
 * @param {string} template Template string.
 * @param {Function} replacer Replacer function.
 * @return {string} Template string with replaced elements.
 * @private
 */
const replaceElements = (template, replacer) => {
    const PH = Component.PLACEHOLDER_EXPRESSION('(?:\\d+)');
    return template.replace(
        new RegExp(`<(${PH}|[a-z]+[1-6]?)(?:\\s*)((?:"[^"]*"|'[^']*'|[^>])*)(/?>)`, 'gi'),
        replacer
    );
};

/**
 * Generate attributes.
 * @param {object} attributes Attributes object.
 * @param {object} previous Previous attributes object.
 * @return {object} Attributes object containing `add`, `remove` and `html` properties.
 * @private
 */
const generateAttributes = (attributes, previous = {}) => {
    const add = {};
    const remove = [];
    const html = [];

    Object.keys(attributes).forEach(key => {
        let value = attributes[key];

        if (value === true) {
            add[key] = '';
            html.push(Component.sanitize(key));
        } else if (value !== false) {
            if (value === null || typeof value === 'undefined') value = '';
            add[key] = value;
            html.push(`${Component.sanitize(key)}="${Component.sanitize(value)}"`);
        }
    });
    // Remove attributes that were in previous attributes but not in current attributes.
    Object.keys(previous).forEach(key => {
        if (!(key in attributes) || ((previous[key] !== attributes[key]) && attributes[key] === false)) {
            remove.push(key);
        }
    });

    return {
        add,
        remove,
        html : html.join(' ')
    };
};

/**
 * Parse all HTML elements in template and extract their attributes.
 * @param {string} template Template string with placeholders.
 * @param {Array} expressions Array of expressions.
 * @param {Array} elements Array to store element references.
 * @return {string} Template with parsed attributes.
 * @private
 */
const parseElements = (template, expressions, elements) => {
    const PH = Component.PLACEHOLDER_EXPRESSION('(?:\\d+)');
    // Check if template is a container (single placeholder, no tag).
    const containerMatch = template.match(new RegExp(`^\\s*${PH}\\s*$`));
    if (containerMatch) return template;
    // Validate that template has a root element.
    const rootElementMatch = template.match(new RegExp(`^\\s*<([a-z]+[1-6]?|${PH})([^>]*)>([\\s\\S]*?)</(\\1|${PH})>\\s*$|^\\s*<([a-z]+[1-6]?|${PH})([^>]*)/>\\s*$`));
    if (!rootElementMatch) throw new SyntaxError(`Template must have a single root element or be a container component: "${template.trim()}"`);

    let elementUid = 0;
    // Match all HTML elements including placeholders and self-closed elements.
    return replaceElements(template, (match, tag, attributesStr, ending) => {
        const isRoot = elementUid === 0;
        const currentElementUid = ++elementUid;
        // If there are no dynamic attributes, return original match.
        if (!isRoot && !attributesStr.match(new RegExp(PH))) {
            return match;
        }
        // Parse attributes.
        const parsedAttributes = parseAttributes(attributesStr, expressions);
        // Store previous attributes.
        let previousAttributes = {};
        // Create element reference.
        const generateElementUid = componentUid => `${componentUid}-${currentElementUid}`;
        // Create function that returns attributes object.
        const getAttributes = function() {
            const attributes = expandEvents(
                expandAttributes(parsedAttributes, value => getExpressionResult(value, this)),
                this.eventsManager
            );
            // Extend template attributes with `options.attributes`.
            if (isRoot && this.attributes) {
                Object.assign(attributes, getResult(this.attributes, this));
            }
            // Add data attribute for element identification.
            // First element gets the component uid, others get element uid.
            attributes[Component.DATA_ATTRIBUTE_ELEMENT] = generateElementUid(this.uid);
            // Store previous attributes.
            const previous = previousAttributes;
            previousAttributes = attributes;

            return generateAttributes(attributes, previous);
        };

        const getSelector = function() {
            return `[${Component.DATA_ATTRIBUTE_ELEMENT}="${generateElementUid(this.uid)}"]`;
        };
        // Add element reference to elements array.
        elements.push({
            getSelector,
            getAttributes,
        });
        // Add new expression to expressions array.
        expressions.push(function() {
            return Component.markAsSafeHTML(getAttributes.call(this).html);
        });
        // Replace attributes with placeholder.
        const placeholder = Component.PLACEHOLDER_EXPRESSION(expressions.length - 1);
        // Preserve original tag ending (> or />)
        return `<${tag} ${placeholder}${ending}`;
    });
};

/**
 * Parse elements in partial template.
 * @param {string} template Template string with placeholders.
 * @param {Array} expressions Array of expressions.
 * @return {string} Template with parsed attributes.
 * @private
 */
const parsePartialElements = (template, expressions) => {
    const PH = Component.PLACEHOLDER_EXPRESSION('(?:\\d+)');
    // Match all HTML elements including placeholders and self-closed elements.
    return replaceElements(template, (match, tag, attributesStr, ending) => {
        // If there are no dynamic attributes, return original match.
        if (!attributesStr.match(new RegExp(PH))) {
            return match;
        }
        // Parse attributes.
        const parsedAttributes = parseAttributes(attributesStr, expressions);
        // Create function that returns attributes object.
        const getAttributes = function() {
            const attributes = expandEvents(
                expandAttributes(parsedAttributes, value => getExpressionResult(value, this)),
                this.eventsManager
            );

            return generateAttributes(attributes).html;
        };
        // Add new expression to expressions array.
        expressions.push(function() {
            return Component.markAsSafeHTML(getAttributes.call(this));
        });
        // Replace attributes with placeholder.
        const placeholder = Component.PLACEHOLDER_EXPRESSION(expressions.length - 1);
        // Preserve original tag ending (> or />)
        return `<${tag} ${placeholder}${ending}`;
    });
};

/**
 * Parse all interpolations in template text content.
 * @param {string} template Template string with placeholders.
 * @param {Array} expressions Array of expressions.
 * @param {Array} interpolations Array to store interpolation references.
 * @return {string} Template with interpolation markers.
 * @private
 */
const parseInterpolations = (template, expressions, interpolations) => {
    const PH = Component.PLACEHOLDER_EXPRESSION('(\\d+)');
    let interpolationUid = 0;
    // Match all expression placeholders.
    return template.replace(
        new RegExp(PH, 'g'),
        function(match, expressionIndex, offset) {
            // Check if this placeholder is inside an element tag (attribute).
            // `offset` is the index of the match in the original string.
            const beforeMatch = template.substring(0, offset);
            const lastOpenTag = beforeMatch.lastIndexOf('<');
            const lastCloseTag = beforeMatch.lastIndexOf('>');
            // If we're inside an element tag, don't process as interpolation.
            if (lastOpenTag > lastCloseTag) {
                return match;
            }

            const currentInterpolationUid = ++interpolationUid;
            // Add interpolation reference to interpolations array.
            interpolations.push({
                getUid : function() {
                    return `${this.uid}-${currentInterpolationUid}`;
                },
                expression : expressions[expressionIndex]
            });
            // Create a new expression that contains markers and the result of the original expression.
            const newExpression = function() {
                const result = getExpressionResult(expressions[expressionIndex], this);
                const interpolationUid = `${this.uid}-${currentInterpolationUid}`;
                const startMarker = `<!--${Component.INTERPOLATION_START(interpolationUid)}-->`;
                const endMarker = `<!--${Component.INTERPOLATION_END(interpolationUid)}-->`;
                return [Component.markAsSafeHTML(startMarker), result, Component.markAsSafeHTML(endMarker)];
            };
            // Add new expression to expressions array.
            expressions.push(newExpression);
            // Replace with new placeholder.
            return Component.PLACEHOLDER_EXPRESSION(expressions.length - 1);
        }
    );
};

/**
 * Parse attributes string to extract dynamic attributes.
 * @param {string} attributesStr Attributes string from HTML element.
 * @param {Array} expressions Array of expressions.
 * @return {Array} Array of attribute pairs [key, value] or [key, value, hasQuotes].
 * @private
 */
const parseAttributes = (attributesStr, expressions) => {
    const PH = Component.PLACEHOLDER_EXPRESSION('(\\d+)');
    const attributes = [];
    // Parse attributes string with support for placeholders in both names and values.
    const regExp = new RegExp(`(${PH}|[\\w-]+)(?:=(["']?)(?:${PH}|((?:.?(?!["']?\\s+(?:\\S+)=|\\s*/?[>"']))+.))\\3)?`, 'g');

    let attributeMatch;
    while ((attributeMatch = regExp.exec(attributesStr)) !== null) {
        const [, attribute, attributeIdx, quotes, valueIdx, value] = attributeMatch;

        const attr = typeof attributeIdx !== 'undefined' ? expressions[parseInt(attributeIdx, 10)] : attribute;
        const val = typeof valueIdx !== 'undefined' ? expressions[parseInt(valueIdx, 10)] : value;

        if (typeof val !== 'undefined') {
            attributes.push([attr, val, !!quotes]);
        } else {
            attributes.push([attr]);
        }
    }

    return attributes;
};

/*
 * These option keys will be extended on the component instance.
 */
const componentOptions = ['key', 'state', 'onCreate', 'onChange', 'onHydrate', 'onRecycle', 'onUpdate'];

/**
 * @lends module:Component
 */
class Component extends View {
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
            if (!this.viewOptions.includes(key) && !this.componentOptions.includes(key)) {
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
            const dataAttribute = Component.DATA_ATTRIBUTE_EVENT(type);
            // Create a listener function that gets the listener index from the data attribute and calls the listener.
            const listener = function(event, component, matched) {
                // Get the listener index from the data attribute.
                const index = matched.getAttribute(dataAttribute);
                // Root element listener may not have a data attribute.
                if (index) {
                    const currentListener = this.eventsManager.listeners[parseInt(index, 10)];
                    // Call the listener.
                    if (currentListener) currentListener.call(this, event, component, matched);
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
     * Listen to `change` event on a model or emitter object and call `onChange` lifecycle method.
     * The listener will be removed when the component is destroyed.
     * By default the component will be subscribed to `this.model`, `this.state`, and `this.props`.
     * @param {Rasti.Model} model A model or emitter object to listen to changes.
     * @return {Component} The component instance.
     */
    subscribe(model) {
        // Check if model has `on` method.
        if (!model.on) return this;
        // Listen to model changes and store unbind function.
        const off = model.on('change', this.onChange);
        // Add unbind function to destroy queue.
        // So the component stops listening to model changes when destroyed.
        this.destroyQueue.push(
            // Rasti `on` method returns an unbind function.
            // But other libraries may return the object itself.
            typeof off === 'function' ? off : () => model.off('change', this.onChange)
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
        return this.template.elements.length === 0;
    }

    /**
     * Override super method. We don't want to ensure an element on instantiation.
     * We will provide it later.
     * @private
     */
    ensureElement() {
        // Store data event listeners.
        this.eventsManager = new EventsManager();
        // If el is provided, delegate events.
        if (this.el) {
            // If "this.el" is a function, call it to get the element.
            this.el = getResult(this.el, this);
            this.delegateEvents();
        }
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
        // Search for every element in template using getSelector
        if (!this.isContainer()) {
            this.template.elements.forEach(element => {
                const selector = element.getSelector.call(this);
                element.ref = parent.querySelector(selector);
            });
            this.el = this.template.elements[0].ref;
            this.delegateEvents();
        }
        // Get references for interpolation marker comments
        if (this.template.interpolations.length > 0) {
            const commentMap = new Map();
            const walker = document.createTreeWalker(parent, NodeFilter.SHOW_COMMENT);

            let node;
            while ((node = walker.nextNode())) {
                commentMap.set(node.textContent, node);
            }

            this.template.interpolations.forEach(interpolation => {
                const uid = interpolation.getUid.call(this);
                const startMarker = Component.INTERPOLATION_START(uid);
                const endMarker = Component.INTERPOLATION_END(uid);

                interpolation.ref = [
                    commentMap.get(startMarker), 
                    commentMap.get(endMarker)
                ];
            });
        }
        // Call hydrate on children.
        if (this.isContainer()) {
            this.children[0].hydrate(parent);
            this.el = this.children[0].el;
        } else {
            this.children.forEach(child => child.hydrate(this.el));
        }
        // Call `onHydrate` lifecycle method.
        this.onHydrate.call(this);
        // Return `this` for chaining.
        return this;
    }

    /**
     * Get the recycle placeholder.
     * @return {string} The recycle placeholder.
     * @private
     */
    getRecyclePlaceholder() {
        return `<span ${Component.DATA_ATTRIBUTE_ELEMENT}="${this.uid}-1"></span>`;
    }

    /**
     * Get the recycle nodes.
     * @return {Node[]} The recycle nodes.
     * @private
     */
    getRecycleNodes() {
        return this.isContainer() ?
            [this.template.interpolations[0].ref[0], ...this.children[0].getRecycleNodes(), this.template.interpolations[0].ref[1]] :
            [this.el];
    }

    /**
     * Used internally on the render process.
     * Reuse a `Component` that has `key` when its parent is rendered.
     * Call `onRecycle` lifecycle method.
     * @param parent {node} The parent node.
     * @return {Component} The component instance.
     * @private
     */
    recycle(parent) {
        // Find placeholder element to be replaced. It has same data attribute as this component.
        const toBeReplaced = parent.querySelector(`[${Component.DATA_ATTRIBUTE_ELEMENT}="${this.uid}-1"]`);
        // Replace it with this.el.
        toBeReplaced.replaceWith(...this.getRecycleNodes());
        // Call `onRecycle` lifecycle method.
        this.onRecycle.call(this);
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
     * Lifecycle method. Called when the component is rendered for the first time and hydrated.
     */
    onHydrate() {}

    /**
     * Lifecycle method. Called when the component is recycled (reused with the same key) and added to the DOM again.
     */
    onRecycle() {}

    /**
     * Lifecycle method. Called when the component is updated or re-rendered.
     */
    onUpdate() {}

    /**
     * Lifecycle method. Called when the component is destroyed.
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
     *     <h1>${({ props }) => props.children}</h1>
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
                parsePartialElements(
                    expandComponents(
                        addPlaceholders(strings, expressions),
                        expressions
                    ),
                    expressions
                ),
                expressions
            ).map(item => getExpressionResult(item, this))
        );
    }

    /**
     * Render a template part.
     * @param {any} part - The template part.
     * @param {function} addChild - The addChild function.
     * @return {string} The rendered template part.
     * @private
     */
    renderTemplatePart(part, addChild) {
        const result = getExpressionResult(part, this);

        const parse = (item) => {
            if (typeof item !== 'undefined' && item !== null && item !== false && item !== true) {
                if (item instanceof SafeHTML) return item;
                if (item instanceof Component) return addChild(item);
                return Component.sanitize(item);
            }
            return '';
        };

        return Array.isArray(result) ? deepFlat(result).map(parse).join('') : `${parse(result)}`;
    }

    /**
     * Render the component as a string.
     * Used internally on the render process.
     * Use it for server-side rendering or static site generation.
     * @return {string} The rendered component.
     */
    toString() {
        // Normally there won't be any children, but if there are, destroy them.
        this.destroyChildren();
        // Normally there won't be any data event listeners, but if there are, clear them.
        this.eventsManager.reset();
        // Bind addChild method.
        const addChild = this.addChild.bind(this);
        // Render the template parts.
        return this.template.parts
            .map(part => this.renderTemplatePart(part, addChild))
            .join('');
    }

    /**
     * Render the `Component`.  
     * - If `this.el` is not present, the `Component` will be rendered as a string inside a `DocumentFragment` and hydrated, making `this.el` available. The `onHydrate` lifecycle method will be called.  
     * - If `this.el` is present, the method will update the attributes and inner HTML of the element, or recreate its child component in the case of a container. The `onUpdate` lifecycle method will be called.  
     * - When rendering child components, if the new children have the same key as the previous ones, they will be recycled. A recycled `Component` will call the `onRecycle` lifecycle method.  
     * - If the active element is inside the component, it will retain focus after the render.  
     * @return {Component} The component instance.
     */
    render() {
        // Prevent a last re render if view is already destroyed.
        if (this.destroyed) return this;
        // If `this.el` is not present, render the view as a string and hydrate it.
        if (!this.el) {
            const fragment = parseHTML(this);
            this.hydrate(fragment);
            return this;
        }
        // Clear event listeners.
        this.eventsManager.reset();
        // Store active element.
        const activeElement = this.isContainer() ? null : document.activeElement;

        this.template.elements.forEach(element => {
            const attributes = element.getAttributes.call(this);
            // Remove attributes.
            attributes.remove.forEach(attribute => {
                element.ref.removeAttribute(attribute);
            });
            // Add attributes.
            Object.keys(attributes.add).forEach(key => {
                const value = attributes.add[key];
                element.ref.setAttribute(key, value);
            });
        });

        const previousChildren = this.children;
        this.children = [];

        this.template.interpolations.forEach(interpolation => {
            const nextChildren = [];
            const recycledChildren = [];

            const fragment = parseHTML(this.renderTemplatePart(interpolation.expression, component => {
                let out = component;
                // Check if child already exists.
                const found = !!component.key && previousChildren.find(
                    previousChild => previousChild.key === component.key
                );

                if (found) {
                    // If child already exists, replace it html by its root element.
                    out = found.getRecyclePlaceholder();
                    // Add child to recycled children.
                    recycledChildren.push([found, component]);
                } else {
                    // Not found. Add new child component.
                    nextChildren.push(component);
                }
                // Component html.
                return out;
            }));

            // Replace children root elements with recycled components.
            recycledChildren.forEach(([recycledChild, discardedComponent]) => {
                this.addChild(recycledChild).recycle(fragment);
                // Update props.
                recycledChild.props.set(discardedComponent.props.toJSON());
                // Destroy new child component. Use recycled one instead.
                discardedComponent.destroy();
            });
            // Add new children. Hydrate them.
            nextChildren.forEach(nextChild => {
                this.addChild(nextChild).hydrate(fragment);
            });

            const [startComment, endComment] = interpolation.ref;

            const currentFirstElement = startComment.nextSibling;
            const currentSingleChildElement = currentFirstElement.nextSibling === endComment;
            const fragmentChildren = fragment.children;

            if (currentSingleChildElement && fragmentChildren.length === 1 && !currentFirstElement.getAttribute(Component.DATA_ATTRIBUTE_ELEMENT)) {
                // Update a single node.
                syncNode(currentFirstElement, fragmentChildren[0]);
            } else {
                const range = document.createRange();
                range.setStartAfter(startComment);
                range.setEndBefore(endComment);
                range.deleteContents();
                range.insertNode(fragment);
            }
        });
        // Destroy unused children.
        previousChildren.forEach(previousChild => {
            // Not found in recycled children. Destroy.
            if (this.children.indexOf(previousChild) < 0) previousChild.destroy();
        });
        // If container, set el to the child element.
        if (this.isContainer()) {
            this.el = this.children[0].el;
        } else {
            // If there are pending event types, delegate events again.
            if (this.eventsManager.hasPendingTypes()) {
                this.delegateEvents();
            }
        }
        // Restore focus.
        if (activeElement && this.el.contains(activeElement)) {
            activeElement.focus();
        }
        // Call onUpdate lifecycle method.
        this.onUpdate.call(this);
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
     * Mount the component into the dom.
     * It instantiate the Component view using options, 
     * appends its element into the DOM (if `el` is provided).
     * And returns the view instance.
     * @static
     * @param {object} [options] The view options.
     * @param {node} [el] Dom element to append the view element.
     * @param {boolean} [hydrate] If true, the view will hydrate existing DOM.
     * @return {Component} The component instance.
     */
    static mount(options, el, hydrate) {
        // Instantiate component.
        const component = new this(options);
        // If `el` is passed, mount component.
        if (el) {
            if (hydrate) {
                // Generate subcomponents.
                component.toString();
                // Hydrate existing DOM.
                component.hydrate(el);
            } else {
                // Append element to the DOM.
                el.appendChild(component.render().el);
            }
        }
        // Return component instance.
        return component;
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
     *       <button class="${({ props }) => props.className}">
     *           ${({ props }) => props.children}
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
     *           ${({ props }) => props.children}
     *       </button>
     *   `;
     *   // Create a navigation component. Add buttons as children. Iterate over items.
     *   const Navigation = Component.create`
     *       <nav>
     *           ${({ options }) => options.items.map(
     *               item => Button.mount({ children : item.label })
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
     *            ${({ props }) => props.children}
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
     *           ${({ props }) => props.children}
     *       </button>
     *   `;
     *   // Create a container that renders a Button component.
     *   const ButtonOk = Component.create`
     *       <${Button} className="ok">Ok</${Button}>
     *   `;
     *   // Create a container that renders a Button component, using a function.
     *   const ButtonCancel = Component.create(() => Button.mount({
     *       className : 'cancel',
     *       children : 'Cancel'
     *   }));
     *   ```
     * @static
     * @param {string|Function} strings - HTML template for the component or a function that mounts a sub component.
     * @param {...*} expressions - The expressions to be interpolated within the template.
     * @return {Component} The newly created component class.
     */
    static create(strings, ...expressions) {
        // Containers can be created using create as a functions instead of a tagged template.
        if (typeof strings === 'function') {
            expressions = [strings];
            strings = ['', ''];
        }
        // Create elements, interpolations and parts arrays.
        const elements = [], interpolations = [];
        const parts = splitPlaceholders(
            parseInterpolations(
                parseElements(
                    expandComponents(
                        addPlaceholders(
                            strings,
                            expressions
                        ).trim(),
                        expressions
                    ),
                    expressions,
                    elements
                ),
                expressions,
                interpolations
            ),
            expressions
        );
        // Create template object.
        const template = {
            elements,
            interpolations,
            parts,
        };
        // Create subclass for this component.
        return this.extend({ template });
    }
}

Component.DATA_ATTRIBUTE_ELEMENT = 'data-rasti-el';
Component.DATA_ATTRIBUTE_EVENT = (type) => `rasti-on-${type}`;

Component.PLACEHOLDER_EXPRESSION = (idx) => `__RASTI-${idx}__`;
Component.INTERPOLATION_START = (uid) => `rasti-start-${uid}`;
Component.INTERPOLATION_END = (uid) => `rasti-end-${uid}`;

/**
 * Components are a special kind of `View` that is designed to be easily composable, 
 * making it simple to add child views and build complex user interfaces.  
 * Unlike views, which are render-agnostic, components have a specific set of rendering 
 * guidelines that allow for a more declarative development style.  
 * Components are defined with the {@link #module_component_create Component.create} static method, which takes a tagged template string or a function that returns another component.
 * @module
 * @extends View
 * @param {object} options Object containing options. The following keys will be merged to `this`: model, state, key, onDestroy, onHydrate, onRecycle, onUpdate, onCreate, onChange. Any additional options not in the component or view options list will be automatically extracted as props and stored as `this.props`.
 * @property {string} [key] A unique key to identify the component. Used to recycle child components.
 * @property {Rasti.Model} [model] A `Rasti.Model` or any emitter object containing data and business logic. The component will listen to `change` events and call `onChange` lifecycle method.
 * @property {Rasti.Model} [state] A `Rasti.Model` or any emitter object containing data and business logic, to be used as internal state. The component will listen to `change` events and call `onChange` lifecycle method.
 * @property {Rasti.Model} [props] Automatically created from any options not merged to the component instance. Contains props passed from parent component as a `Rasti.Model`. The component will listen to `change` events on props and call `onChange` lifecycle method. When a component with a `key` is recycled during parent re-render, new props are automatically updated and any changes trigger a re-render.
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
export default Component.create`<div></div>`;
