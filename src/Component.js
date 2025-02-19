import View from './View.js';
import getResult from './utils/getResult.js';

/*
 * These option keys will be extended on the component instance.
 */
const componentOptions = {
    key : true,
    state : true,
    onCreate : true,
    onChange : true,
    onRender : true
};

/**
 * Components are a special kind of `View` that is designed to be easily composable, 
 * making it simple to add child views and build complex user interfaces.  
 * Unlike views, which are render-agnostic, components have a specific set of rendering 
 * guidelines that allow for a more declarative development style.  
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
        // Bind onChange to this to be used as a listener.
        // Store bound version, so it can be removed in the onDestroy method.
        this.onChange = this.onChange.bind(this);
        // Listen to model changes and call onChange.
        if (this.model && this.model.on) this.model.on('change', this.onChange);
        if (this.state && this.state.on) this.state.on('change', this.onChange);
        // Call lifecycle method.
        this.onCreate.apply(this, arguments);
    }

    /*
    * Tell if component is a container.
    * In which case, it will not have an element by itself.
    * It will render a single expression which is expected to return a single component as child.
    * `this.el` will be a reference to that child component's element.
    * @return {boolean}
    */
    isContainer() {
        return !!(!this.tag && this.template);
    }

    /*
     * Override. We don't want to ensure an element on instantiation.
     * We will provide it later.
     */
    ensureElement() {
        // If el is provided, delegate events.
        if (this.el) {
            this.delegateEvents();
        }
    }

    /*
     * Find view's element on parent node, using its data attribute.
     * @param parent {node} The parent node.
     * @return {node} The component's element.
     */
    findElement(parent) {
        return (parent || document).querySelector(`[${Component.DATA_ATTRIBUTE_UID}="${this.uid}"]`);
    }

    /*
     * Eval attributes expressions.
     * @return {object} Object containing add, remove and html properties.
     */
    getAttributes() {
        const add = {};
        const remove = {};
        const html = [];

        if (this.attributes) {
            const attributes = getResult(this.attributes, this, this);

            Object.keys(attributes).forEach(key => {
                // Evaluate attribute value.
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
                    html.push(`${key}="${value}"`);
                }
            });
        }

        return { add, remove, html : html.join(' ') };
    }

    /*
     * Used internally on the render process.
     * Attach the view to the dom element.
     * @param parent {node} The parent node.
     * @return {Rasti.Component} The component instance.
     */
    hydrate(parent) {
        if (!this.isContainer()) {
            this.el = this.findElement(parent);
            this.delegateEvents();
            this.children.forEach(child => child.hydrate(this.el));
        } else {
            this.children[0].hydrate(parent);
            this.el = this.children[0].el;
        }
        // Call `onRender` lifecycle method.
        this.onRender.call(this, Component.RENDER_TYPE_HYDRATE);
        // Return `this` for chaining.
        return this;
    }

    /*
     * Used internally in the render process.
     * Reuse a view that has `key` when its parent is rendered.
     * @param parent {node} The parent node.
     * @return {Rasti.Component} The component instance.
     */
    recycle(parent) {
        // If component is a container, call recycle on its child.
        if (this.isContainer()) return this.children[0].recycle(parent);
        // Find placeholder element to be replaced. It has same data attribute as this component.
        const toBeReplaced = this.findElement(parent);
        // Replace it with this.el.
        toBeReplaced.replaceWith(this.el);
        // Call `onRender` lifecycle method.
        this.onRender.call(this, Component.RENDER_TYPE_RECYCLE);
        // Return `this` for chaining.
        return this;
    }

    /*
     * Override. Add some custom logic to super `destroy` method.
     * @param {object} options Options object or any arguments passed to `destroy` method will be passed to `onDestroy` method.
     */
    destroy() {
        super.destroy.apply(this, arguments);
        // Stop listening to `change`.
        if (this.model && this.model.off) this.model.off('change', this.onChange);
        if (this.state && this.state.off) this.state.off('change', this.onChange);
        // Set destroyed flag to prevent a last render after destroyed.
        this.destroyed = true;
        // Return `this` for chaining.
        return this;
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

    getRecyclePlaceholder() {
        if (this.isContainer()) return this.children[0].getRecyclePlaceholder();
        
        const tag = getResult(this.tag, this, this) || 'div';
        const attributes = `${Component.DATA_ATTRIBUTE_UID}="${this.uid}"`;

        return this.template ?
            `<${tag} ${attributes}></${tag}>` :
            `<${tag} ${attributes} />`;
    }

    /*
     * Treat the whole view as a HTML string.
     */
    toString() {
        // Normally there won't be any children, but if there are, destroy them.
        this.destroyChildren();
        // Replace expressions of inner template.
        const inner = this.template && this.template.call(this, component => {
            // Add child component.
            return this.addChild(component);
        });
        // If component is a container, return inner which will be an expression thats return a single component.
        if (this.isContainer()) return inner;
        // Get tag name.
        const tag = getResult(this.tag, this, this) || 'div';
        // Get attributes.
        const attributes = this.getAttributes().html;
        // Generate outer template.
        return this.template ?
            `<${tag} ${attributes}>${inner}</${tag}>` :
            `<${tag} ${attributes} />`;
    }

    /*
     * View render method.
     */
    render() {
        // Prevent a last re render if view is already destroyed.
        if (this.destroyed) return this;

        if (!this.isContainer()) {
            // If `this.el` is not present, create a new `this.tag` element.
            if (!this.el) {
                this.el = this.createElement(getResult(this.tag, this, this));
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
        }
        // Check for `template` to see if view has innerHTML.
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
                    // If `this.el` is present, replace it with nextEl.
                    if (this.el) this.el.replaceWith(nextEl);
                    // Set `this.el` to nextEl.
                    this.el = nextEl;
                } else if (recycledChildren[0]) {
                    this.addChild(recycledChildren[0]);
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
     * <br><br> &#9888; **Security Notice:** `Component` utilizes `innerHTML` on a document fragment for rendering, which may introduce Cross - Site Scripting (XSS) risks. Ensure that any user-generated content is properly sanitized before inserting it into the DOM. For best practices on secure data handling, refer to the [OWASP's XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html).<br><br>
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
                const fragment = this.prototype.createElement('template');
                // Add html text into element inner html.
                fragment.innerHTML = view;
                // Add to dom.
                el.appendChild(fragment.content.children[0]);
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
     * @param {string} HTML template for the component. Or a function that mounts a sub component.
     * @return {Rasti.Component}
     */
    static create(strings, ...expressions) {
        // Containers can be created using create as a functions instead of a tagged template.
        if (typeof strings === 'function') {
            expressions = [strings];
            strings = ['', ''];
        }

        const saveNl = str => str.replace(/\n/g, Component.PLACEHOLDER_NEW_LINE);
        const revertNl = str => str.replace(new RegExp(Component.PLACEHOLDER_NEW_LINE, 'g'), '\n');
        const removeNl = str => str.replace(new RegExp(Component.PLACEHOLDER_NEW_LINE, 'g'), '');

        const ph = Component.PLACEHOLDER_EXPRESSION('(\\d+)');

        /*
         * Parse match data.
         * @param match {array}
         * @return {object}
         * @property {string} tag The tag.
         * @property {string} inner The inner html.
         * @property {string} close The closing tag.
         * @property {object} attributes Object containing attributes.
         * @property {string} raw The whole match.
         */
        const parseMatch = match => {
            if (!match) return match;

            const [
                all,
                nonVoid,
                openTag,
                openIdx,
                nonVoidAttrs,
                inner,
                closeTag,
                closeIdx,
                ,
                selfEnclosedTag,
                selfEnclosedIdx,
                selfEnclosedAttrs
            ] = match;

            const data = { raw : all, attributes : {} };

            let attributes;

            if (nonVoid) {
                data.tag = typeof openIdx !== 'undefined' ? expressions[openIdx] : removeNl(openTag);
                data.inner = revertNl(inner);
                data.close = typeof closeIdx !== 'undefined' ? expressions[closeIdx] : removeNl(closeTag);
                attributes = removeNl(nonVoidAttrs);
            } else {
                data.tag = typeof selfEnclosedIdx !== 'undefined' ? expressions[selfEnclosedIdx] : removeNl(selfEnclosedTag);
                attributes = removeNl(selfEnclosedAttrs);
            }

            const attributesRegExp = /([\w|data-]+)(?:=["']?((?:.(?!["']?\s+(?:\S+)=|\s*\/?[>"']))+.)["']?)?/g;

            let attributeMatch;
            while ((attributeMatch = attributesRegExp.exec(attributes)) !== null) {
                const value = typeof attributeMatch[2] === 'undefined' ? true : attributeMatch[2];
                const valueMatch = value && value.match && value.match(new RegExp(ph));
                data.attributes[attributeMatch[1]] = valueMatch ? expressions[valueMatch[1]] : value;
            }

            return data;
        };

        /*
         * Replace component tags with expressions.
         * `<${Component} />` or `<${Component}></${Component}>` will be replaced 
         * by a function that mounts the component.
         * Returns the template with component tags replaced by expressions placeholders 
         * modifies the expressions array adding the mount functions.
         * @param main {string} The main template.
         * @return {string} The template with components tags replaced by expressions
         * placeholders.
         */
        const expandComponents = main => {
            // Match component tags.
            return main.replace(
                new RegExp(`(<(${ph})(.*?)>(.*)</(${ph})>)|(<(${ph})(.*?) />)`,'g'),
                function() {
                    const { tag, attributes, inner, close, raw } = parseMatch(arguments);
                    // No component found.
                    if (!(tag.prototype instanceof Component)) return raw;

                    let renderChildren;
                    // Non void component.
                    if (close) {
                        // Close component tag must match open component tag.
                        if (tag !== close) return raw;
                        // Recursively expand inner components.
                        const expanded = expandComponents(saveNl(inner));
                        // Create renderChildren function.
                        renderChildren = function() {
                            const match = removeNl(expanded).match(new RegExp(`^${ph}$`));

                            if (match) return getResult(expressions[match[1]], this, this);

                            return revertNl(expanded).replace(new RegExp(ph, 'g'), (match, idx) => {
                                return getResult(expressions[idx], this, this);
                            });
                        };
                    }
                    // Create mount function.
                    const mount = function() {
                        const options = Object.keys(attributes).reduce((out, key) => {
                            out[key] = getResult(attributes[key], this, this);
                            return out;
                        }, {});
                        // Mount component.
                        return tag.mount(Object.assign({ renderChildren }, options));
                    };
                    // Add mount function to expression.
                    expressions.push(mount);
                    // Replace whole string with expression placeholder.
                    return Component.PLACEHOLDER_EXPRESSION(expressions.length - 1);
                }
            );
        };

        let tag, attributes, events, template;
        // Create output string for main template. Add placeholders for new lines.
        const main = expandComponents(
            saveNl(
                strings.reduce((out, string, i) => {
                    // Add string part.
                    out.push(string);
                    // Add expression placeholders or expression results.
                    if (expressions[i]) {
                        out.push(
                            typeof expressions[i] === 'function' || typeof expressions[i] === 'object' ?
                                Component.PLACEHOLDER_EXPRESSION(i) :
                                expressions[i]
                        );
                    }
                    return out;
                }, []).join('').trim()
            )
        );

        let match = main.match(
            new RegExp(`(^<([a-z]+[1-6]?|${ph})(.*?)>(.*)</(\\2|${ph})>$)|(^<([a-z]+[1-6]?|${ph})(.*?)/>$)`)
        );

        if (match) {
            // It's a component with tag.
            const { tag : tagExpression, attributes : attributesAndEvents, inner, close } = parseMatch(match);
            // Get tag, attributes.
            tag = function() {
                return getResult(tagExpression, this, this);
            };
            // Events to be delegated.
            const onlyEvents = {};
            const onlyAttributes = Object.keys(attributesAndEvents).reduce((out, key) => {
                // Is Event?
                const matchKey = key.match(/on(([A-Z]{1}[a-z]+)+)/);
                // Is event handler. Add to eventTypes object.
                if (matchKey && matchKey[1]) {
                    const eventType = matchKey[1].toLowerCase();
                    onlyEvents[eventType] = attributesAndEvents[key];
                    return out;
                }
                // Is attribute. Add to attributes object.
                out[key] = attributesAndEvents[key];
                return out;
            }, {});
            // Get attributes.
            attributes = function() {
                return Object.keys(onlyAttributes).reduce((out, key) => {
                    out[key] = getResult(onlyAttributes[key], this, this);
                    return out;
                }, { [Component.DATA_ATTRIBUTE_UID] : this.uid });
            };
            // Get events.
            events = function() {
                return Object.keys(onlyEvents).reduce((out, key) => {
                    const typeListeners = getResult(onlyEvents[key], this, this);

                    Object.keys(typeListeners).forEach(selector => {
                        out[`${key}${selector === '&' ? '' : ` ${selector}`}`] = typeListeners[selector];
                    });

                    return out;
                }, {});
            };
            // If there is a closing tag, get template.
            if (close) {
                template = function(addChild) {
                    // Replace expressions.
                    return (inner || '').replace(new RegExp(ph, 'g'), (match, idx) => {
                        // Eval expression. Pass view as argument.
                        const result = getResult(expressions[idx], this, this);
                        // Treat all expressions as arrays.
                        const results = result instanceof Array ? result : [result];
                        // Replace expression with the result of the evaluation.
                        return results.reduce((out, result) => {
                            // Add non falsy results.
                            if (typeof result !== 'undefined' && result !== null && result !== false &&  result !== true) {
                                // If result is a component, add it as a child.
                                out.push(result instanceof Component ? addChild(result) : result);
                            }
                            return out;
                        }, []).join('');
                    });
                };
            }
        } else {
            // It's a container.
            match = removeNl(main).match(new RegExp(`^${ph}$`));

            if (match) {
                // If there is only one expression and no tag, is a container.
                template = function(addChild) {
                    // Replace expressions.
                    return addChild(getResult(expressions[match[1]], this, this)).toString();
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

Component.PLACEHOLDER_EXPRESSION = (idx) => `__RASTI_EXPRESSION_{${idx}}__`;
Component.PLACEHOLDER_NEW_LINE = '__RASTI_NEW_LINE__';
Component.DATA_ATTRIBUTE_UID = 'data-rasti-uid';
Component.RENDER_TYPE_HYDRATE = 'hydrate';
Component.RENDER_TYPE_RECYCLE = 'recycle';
Component.RENDER_TYPE_RENDER = 'render';