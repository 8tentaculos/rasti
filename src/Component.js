import View from './View.js';
import Model from './Model.js';
import SafeHTML from './core/SafeHTML.js';
import Partial from './core/Partial.js';
import InterpolationWrapper from './core/InterpolationWrapper.js';
import EventsManager from './core/EventsManager.js';
import PathManager from './core/PathManager.js';
import Element from './core/Element.js';
import Interpolation from './core/Interpolation.js';
import validateListener from './utils/validateListener.js';
import getResult from './utils/getResult.js';
import deepFlat  from './utils/deepFlat.js';
import parseHTML from './utils/parseHTML.js';
import findComment from './utils/findComment.js';
import getAttributesHTML from './utils/getAttributesHTML.js';

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
 * Check if an element is a component root element.
 * Component root elements have the data attribute ending with '-1'.
 * @param {Element} el The element to check.
 * @return {boolean} True if the element is a component root element.
 * @private
 */
const isComponent = (el) => !!el.dataset[Component.DATASET_ELEMENT] && el.dataset[Component.DATASET_ELEMENT].endsWith('-1');

/**
 * Check if an element has the Rasti data attribute.
 * This includes both component root elements and regular tracked elements.
 * @param {Element} el The element to check.
 * @return {boolean} True if the element has the data attribute.
 * @private
 */
const isElement = (el) => !!el.dataset[Component.DATASET_ELEMENT];

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
            out.push(Component.PLACEHOLDER(i));
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
    const PH = Component.PLACEHOLDER('(\\d+)');
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
            if (listener) {
                const index = eventsManager.addListener(listener, type);
                // Add event listener index.
                out[Component.ATTRIBUTE_EVENT(type)] = index;
            }
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
 * @param {boolean} skipNormalization Skip placeholder normalization (for recursive calls).
 * @return {string} The template with components tags replaced by expressions
 * placeholders.
 * @private
 */
const expandComponents = (main, expressions, skipNormalization = false) => {
    const PH = Component.PLACEHOLDER('(\\d+)');
    const componentRefMap = new Map();
    // Normalize component references to use first placeholder index.
    // Only on first call, not on recursive calls.
    if (!skipNormalization) {
        main = main.replace(
            new RegExp(PH, 'g'),
            (match, idx) => {
                const expression = expressions[idx];
                if (expression && expression.prototype instanceof Component) {
                    if (componentRefMap.has(expression)) {
                        return componentRefMap.get(expression);
                    }
                    componentRefMap.set(expression, match);
                }
                return match;
            }
        );
    }
    // Match component tags with backreference to ensure correct pairing.
    return main.replace(
        new RegExp(`<(${PH})([^>]*)>([\\s\\S]*?)</\\1>|<(${PH})([^>]*)/>`,'g'),
        (match, openTag, openIdx, nonVoidAttrs, inner, selfClosingTag, selfClosingIdx, selfClosingAttrs) => {
            let tag, attributesStr, innerList;

            if (openTag) {
                tag = expressions[openIdx];
                attributesStr = nonVoidAttrs;
            } else {
                tag = typeof selfClosingIdx !== 'undefined' ? expressions[selfClosingIdx] : selfClosingTag;
                attributesStr = selfClosingAttrs;
            }
            // No component found.
            if (!(tag.prototype instanceof Component)) return match;
            // Non void component.
            if (openTag) {
                // Process inner content same way as partial().
                // Recursively expand inner components.
                const innerTemplate = expandComponents(inner, expressions, true);
                // Parse partial elements to handle dynamic attributes and events.
                const parsedInner = parsePartialElements(innerTemplate, expressions);
                // Split into items.
                innerList = splitPlaceholders(parsedInner, expressions);
            }
            // Parse attributes.
            const attributes = parseAttributes(attributesStr, expressions);
            // Create mount function.
            const mount = function() {
                const options = expandAttributes(attributes, value => getExpressionResult(value, this));
                // Add `renderChildren` function to options.
                if (innerList) {
                    // Evaluate items in parent context and create Partial.
                    options.renderChildren = () => new Partial(innerList.map(item => getExpressionResult(item, this)));
                }
                // Mount component.
                return tag.mount(options);
            };
            // Add mount function to expression.
            expressions.push(mount);
            // Replace whole string with expression placeholder.
            return Component.PLACEHOLDER(expressions.length - 1);
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
    const PH = Component.PLACEHOLDER('(?:\\d+)');
    return template.replace(
        new RegExp(`<(${PH}|[a-z]+[1-6]?)(?:\\s*)((?:"[^"]*"|'[^']*'|[^>])*)(/?>)`, 'gi'),
        replacer
    );
};

/**
 * Parse all HTML elements in template and extract their attributes.
 * @param {string} template Template string with placeholders.
 * @param {Array} expressions Array of expressions.
 * @param {Array} elements Array to store element references.
 * @return {string} Template with parsed attributes.
 * @throws {SyntaxError} If the template does not have a single root element or is a container component.
 * @private
 */
const parseElements = (template, expressions, elements) => {
    const PH = Component.PLACEHOLDER('(?:\\d+)');
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
        // Create element reference.
        const generateElementUid = componentUid => `${componentUid}-${currentElementUid}`;
        // Create function that returns attributes object.
        const getAttributes = function() {
            // Expand attributes and events.
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
            attributes[Component.ATTRIBUTE_ELEMENT] = generateElementUid(this.uid);

            return attributes;
        };

        const getSelector = function() {
            return `[${Component.ATTRIBUTE_ELEMENT}="${generateElementUid(this.uid)}"]`;
        };
        // Add element reference to elements array.
        elements.push({
            getSelector,
            getAttributes,
        });
        // Add new expression to expressions array.
        expressions.push(function() {
            const attributes = getAttributes.call(this);
            return Component.markAsSafeHTML(getAttributesHTML(attributes));
        });
        // Replace attributes with placeholder.
        const placeholder = Component.PLACEHOLDER(expressions.length - 1);
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
    const PH = Component.PLACEHOLDER('(?:\\d+)');
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

            return attributes;
        };
        // Add new expression to expressions array.
        expressions.push(function() {
            const attributes = getAttributes.call(this);
            return Component.markAsSafeHTML(getAttributesHTML(attributes));
        });
        // Replace attributes with placeholder.
        const placeholder = Component.PLACEHOLDER(expressions.length - 1);
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
    const PH = Component.PLACEHOLDER('(\\d+)');
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

            function getStart() {
                return Component.MARKER_START(`${this.uid}-${currentInterpolationUid}`);
            }
            function getEnd() {
                return Component.MARKER_END(`${this.uid}-${currentInterpolationUid}`);
            }
            // Add interpolation reference to interpolations array.
            interpolations.push({
                getStart,
                getEnd,
                expression : expressions[expressionIndex]
            });
            // Add new expression to expressions array.
            expressions.push(function() {
                const result = getExpressionResult(expressions[expressionIndex], this);
                const uid = `${this.uid}-${currentInterpolationUid}`;
                return new InterpolationWrapper(uid, result);
            });
            // Replace with new placeholder.
            return Component.PLACEHOLDER(expressions.length - 1);
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
    const PH = Component.PLACEHOLDER('(\\d+)');
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
const componentOptions = ['key', 'state', 'onCreate', 'onChange', 'onHydrate', 'onMount', 'onRecycle', 'onUpdate'];

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
            const dataAttribute = Component.ATTRIBUTE_EVENT(type);
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
     * Override super method. We don't want to ensure an element on instantiation.
     * We will provide it later.
     * @private
     */
    ensureElement() {
        // Store data event listeners.
        this.eventsManager = new EventsManager();
        // Store position tracking for recycling.
        this.pathManager = new PathManager();
        // Call template function.
        this.template = getResult(this.template, this);
        // If el is provided, delegate events.
        if (this.el) {
            // If "this.el" is a function, call it to get the element.
            this.el = getResult(this.el, this);
            // Render the component as a string to generate children components.
            this.toString();
            // Hydrate the component.
            this.hydrate(this.el.parentNode);
        }
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
        return this.template.elements.length === 0 && this.template.interpolations.length === 1;
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

        if (this.isContainer()) {
            // Get references for interpolation marker comments
            this.template.interpolations[0].hydrate(parent);
            // Call hydrate on children.
            this.children[0].hydrate(parent);
            // Set the first element as the component's element.
            this.el = this.children[0].el;
        } else {
            // Search for every element in template using getSelector
            this.template.elements.forEach((element, index) => { 
                if (index === 0) {
                    element.hydrate(parent);
                    if (this.el) element.ref = this.el;
                    else this.el = element.ref;
                }
                else {
                    element.hydrate(this.el);
                }
            });
            // Delegate events.
            this.delegateEvents();
            // Get references for interpolation marker comments
            this.template.interpolations.forEach(interpolation => interpolation.hydrate(this.el));
            this.children.forEach(child => child.hydrate(this.el));
        }
        // Call `onHydrate` lifecycle method.
        this.onHydrate.call(this);
        // Return `this` for chaining.
        return this;
    }

    /**
     * Used internally on the render process.
     * Reuse a `Component` by replacing the placeholder comment with the real nodes.
     * Call `onRecycle` lifecycle method.
     * @param parent {node} The parent node.
     * @return {Component} The component instance.
     * @private
     */
    recycle(parent) {
        // Locate the placeholder comment and replace it with the real nodes
        const toBeReplaced = findComment(parent, Component.MARKER_RECYCLED(this.uid), isComponent);
        // Replace it with this.el.
        toBeReplaced.replaceWith(...this.getNodes());
        // Call `onRecycle` lifecycle method.
        this.onRecycle.call(this);
        // Return `this` for chaining.
        return this;
    }

    /**
     * Get a `comment` marker with same data attribute as this component.
     * Used to replace the component when it is recycled.
     * @return {string} The recycle placeholder.
     * @private
     */
    getRecycledMarker() {
        return `<!--${Component.MARKER_RECYCLED(this.uid)}-->`;
    }

    /**
     * Get the component nodes to be inserted into the DOM.
     * Used internally during the render process, you usually don't need to call it if you use
     * `mount()`.
     * For components that render HTML elements you can safely rely on `this.el`.
     * For container components that render another component you need the wrapper nodes to insert
     * them into the DOM; use `getNodes()` for that.
     * @return {Node[]} The component nodes.
     */
    getNodes() {
        return this.isContainer() ?
            [this.template.interpolations[0].ref[0], ...this.children[0].getNodes(), this.template.interpolations[0].ref[1]] :
            [this.el];
    }

    /**
     * Call onMount lifecycle method on children and self.
     * Used internally during the mount and render process.
     * @private
     */
    callOnMount() {
        // Call onMount on children first.
        this.children.forEach(child => child.callOnMount());
        // Call onMount on self.
        this.onMount.call(this);
        // Return `this` for chaining.
        return this;
    }

    /**
     * Tagged template helper method.
     * Used to create a partial template.  
     * It will return a Partial object that preserves structure for position-based recycling.
     * Components will be added as children by the parent component. Template strings literals 
     * will be marked as safe HTML to be rendered.
     * This method is bound to the component instance by default.
     * @param {TemplateStringsArray} strings - Template strings.
     * @param  {...any} expressions - Template expressions.
     * @return {Partial} Partial object containing strings and expressions.
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
        const items = splitPlaceholders(
            parsePartialElements(
                expandComponents(
                    addPlaceholders(strings, expressions),
                    expressions
                ),
                expressions
            ),
            expressions
        ).map(item => getExpressionResult(item, this));

        return new Partial(items);
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

        const parse = item => {
            if (typeof item !== 'undefined' && item !== null && item !== false && item !== true) {
                if (item instanceof SafeHTML) return item;
                if (item instanceof Component) return addChild(item);

                if (item instanceof Partial) {
                    this.pathManager.push();
                    const out = item.items.map(subItem => { this.pathManager.increment(); return parse(subItem); }).join('');
                    this.pathManager.pop();
                    return out;
                }
                // Handle arrays (user loops) - disable tracking.
                if (Array.isArray(item)) {
                    this.pathManager.pause();
                    const out = deepFlat(item).map(parse).join('');
                    this.pathManager.resume();
                    return out;
                }
                // InterpolationWrapper: add markers and process maintaining tracking.
                if (item instanceof InterpolationWrapper) {
                    this.pathManager.increment();
                    const startMarker = `<!--${Component.MARKER_START(item.interpolationUid)}-->`;
                    const endMarker = `<!--${Component.MARKER_END(item.interpolationUid)}-->`;
                    return `${startMarker}${parse(item.result)}${endMarker}`;
                }

                return Component.sanitize(item);
            }
            // Return empty string if item is undefined, null, false, or true.
            return '';
        };

        return `${parse(result)}`;
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
        // Reset position tracking.
        this.pathManager.reset();
        // Bind addChild method.
        const addChild = component => {
            this.pathManager.track(component);
            return this.addChild(component);
        };
        // Render the template parts.
        return this.template.parts
            .map(part => this.renderTemplatePart(part, addChild))
            .join('');
    }

    /**
     * Render the `Component`.  
     * - If `this.el` is not present, the `Component` will be rendered as a string inside a `DocumentFragment` and hydrated, making `this.el` available. The `onHydrate` lifecycle method will be called.  
     * - If `this.el` is present, the method will update the attributes and inner HTML of the element, or recreate its child component in the case of a container. The `onUpdate` lifecycle method will be called.  
     * - When rendering child components, recycling happens in two ways:
     *   - Components with a `key` are recycled if a previous child with the same key exists.
     *   - Unkeyed components are recycled if they have the same type and position in the template or partial.
     *   A recycled `Component` will call the `onRecycle` lifecycle method.  
     * - All child components will have their `onMount` lifecycle method called after they are added to the DOM. New children will be hydrated first (calling their `onHydrate` lifecycle method).
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
        // Reset position tracking.
        this.pathManager.reset();
        // Store active element.
        const activeElement = this.isContainer() ? null : document.activeElement;
        // Update elements.
        this.template.elements.forEach(element => element.update());
        // Store previous children.
        const previousChildren = this.children;
        // Clear current children.
        this.children = [];
        // Update interpolations.
        this.template.interpolations.forEach(interpolation => {
            const nextChildren = [];
            const recycledChildren = [];

            this.pathManager.increment();

            const addChild = component => {
                let out = component;
                let found = null;
                // Check if child already exists by key.
                if (component.key) {
                    found = previousChildren.find(prev => prev.key === component.key);
                } else {
                    // Find by position and type.
                    found = this.pathManager.findRecyclable(component.constructor);
                }

                if (found) {
                    // If child already exists, replace it html by its root element.
                    out = found.getRecycledMarker();
                    // Add child to recycled children.
                    recycledChildren.push([found, component]);
                    // Track the component.
                    if (!found.key) this.pathManager.track(found);
                } else {
                    // Add new component.
                    nextChildren.push(component);
                    // Track the component.
                    this.pathManager.track(component);
                }
                // Return the component or placeholder.
                return out;
            };

            const fragment = parseHTML(this.renderTemplatePart(interpolation.expression, addChild));
            // Replace children root elements with recycled components.
            recycledChildren.forEach(([recycled, discarded]) => {
                this.addChild(recycled).recycle(fragment);
                // Update props.
                recycled.props.set(discarded.props.toJSON());
                // Destroy discarded component.
                discarded.destroy();
            });
            // Add new children. Hydrate them.
            nextChildren.forEach(child => this.addChild(child).hydrate(fragment));

            interpolation.update(fragment);
        });
        // Call onMount lifecycle method on all children after interpolations update.
        this.children.forEach(child => child.callOnMount());
        // Destroy unused children.
        previousChildren.forEach(prev => {
            if (this.children.indexOf(prev) < 0) prev.destroy();
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
     * Lifecycle method. Called when the component is mounted to the DOM.
     * This method is called after `onHydrate` and only when the component's element is actually present in the document.
     * It is called during the initial mount process (when using `Component.mount()`) and when new child components are added during render.
     * Use this method to perform operations that require the element to be in the DOM, such as measuring dimensions or focusing elements.
     */
    onMount() {}

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
     * The `onMount` lifecycle method will be called after the component is added to the DOM.
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
                el.append(...component.render().getNodes());
            }
            // Call onMount lifecycle method after nodes are in the DOM.
            component.callOnMount();
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
     *           ${({ props }) => props.children}
     *       </button>
     *   `;
     *   // Create a navigation component. Add buttons as children. Iterate over items.
     *   const Navigation = Component.create`
     *       <nav>
     *           ${({ props }) => props.items.map(
     *               item => Button.mount({ children : item.label })
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
     *            ${({ props }) => props.children}
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
        // Create subclass for this component.
        return this.extend({
            template() {
                return {
                    elements : elements.map(element => new Element({
                        getSelector : element.getSelector.bind(this),
                        getAttributes : element.getAttributes.bind(this)
                    })),
                    interpolations : interpolations.map(interpolation => new Interpolation({
                        getStart : interpolation.getStart.bind(this),
                        getEnd : interpolation.getEnd.bind(this),
                        expression : interpolation.expression,
                        isComponent,
                        isElement
                    })),
                    parts,
                };
            }
        });
    }
}

/*
 * Attributes used to identify elements and events.
 */
Component.ATTRIBUTE_ELEMENT = 'data-rasti-el';
Component.ATTRIBUTE_EVENT = (type) => `data-rasti-on-${type}`;

/*
 * Dataset attribute used to identify elements.
 */
Component.DATASET_ELEMENT = 'rastiEl';

/*
 * Placeholders used to temporarily replace expressions in the template.
 */
Component.PLACEHOLDER = (idx) => `__RASTI-${idx}__`;

/*
 * Markers used to identify interpolation and recycled components.
 */
Component.MARKER_RECYCLED = (uid) => `rasti-recycled-${uid}`;
Component.MARKER_START = (uid) => `rasti-start-${uid}`;
Component.MARKER_END = (uid) => `rasti-end-${uid}`;

/**
 * Components are a special kind of `View` that is designed to be easily composable, 
 * making it simple to add child views and build complex user interfaces.  
 * Unlike views, which are render-agnostic, components have a specific set of rendering 
 * guidelines that allow for a more declarative development style.  
 * Components are defined with the {@link #module_component_create Component.create} static method, which takes a tagged template string or a function that returns another component.
 * @module
 * @extends View
 * @param {object} options Object containing options. The following keys will be merged to `this`: model, state, key, onDestroy, onHydrate, onRecycle, onUpdate, onCreate, onChange. Any additional options not in the component or view options list will be automatically extracted as props and stored as `this.props`.
 * @property {string} [key] A unique key to identify the component. Components with keys are recycled when the same key is found in the previous render. Unkeyed components are recycled based on type and position.
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
