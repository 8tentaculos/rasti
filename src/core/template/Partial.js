import SafeHTML from '../SafeHTML.js';
import Constants from './Constants.js';
import ElementDescriptor from './ElementDescriptor.js';
import InterpolationDescriptor from './InterpolationDescriptor.js';
import parseTemplate from './parseTemplate.js';
import isComponent from './isComponent.js';
import getAttributesHTML from '../../utils/getAttributesHTML.js';
import getAttributesDiff from '../../utils/getAttributesDiff.js';
import findComment from '../../utils/findComment.js';

const SYNC_PROPS = ['value', 'checked', 'selected'];

/**
 * Expand events. Delegates listener registration and the event data-attribute to
 * the owner through `options.registerListener`.
 * @param {object} attributes Attributes object.
 * @param {object} options Owner handlers.
 * @return {object} Attributes object.
 * @private
 */
const expandEvents = (attributes, options) => {
    const out = {};
    Object.keys(attributes).forEach(key => {
        // Check if key is an event listener.
        const match = key.match(/on(([A-Z]{1}[a-z]+)+)/);

        if (match && match[1]) {
            const type = match[1].toLowerCase();
            const listener = attributes[key];
            if (listener) {
                const { attr, index } = options.registerListener(listener, type);
                // Add event listener index under its data-attribute.
                out[attr] = index;
            }
        } else {
            // Add attribute.
            out[key] = attributes[key];
        }
    });
    return out;
};

/**
 * A bound instance of a parsed template. Pairs the render's `expressions` with
 * the owner's `options` (the handlers through which it evaluates expressions,
 * registers events, adds children and mints ids).
 *
 * `Partial` itself is the base engine: `Partial.create` returns a cached subclass
 * per call site with the skeleton (`parts`, `elements`, `interpolations`) baked
 * as statics, so two partials from the same call site share one class and are
 * reconciled by `constructor` — the same identity mechanism as components. The
 * same class backs a component's root template and every nested `partial`, so
 * rendering is uniformly recursive. Per-render state (ids, refs, previous
 * attributes) is kept as plain objects on the instance, materialized lazily on
 * the first `toString`.
 * @param {Array<any>} expressions The current render expressions.
 * @param {object} options The owner's handlers.
 * @private
 */
class Partial {
    constructor(expressions, options) {
        this.expressions = expressions;
        this.options = options;
    }

    /**
     * Return a cached `Partial` subclass for this call site, with the skeleton
     * baked as statics. Analogous to `Component.create`.
     * @param {Array<string>} strings Template string literals.
     * @param {Array<any>} expressions Template expressions.
     * @param {Function} [isComponentClass] Predicate telling whether an expression is a component class.
     * @return {Function} A `Partial` subclass.
     */
    static create(strings, expressions, isComponentClass) {
        let PartialClass = this.cache.get(strings);
        if (!PartialClass) {
            PartialClass = class extends Partial {};
            Object.assign(PartialClass, parseTemplate(strings, expressions, isComponentClass));
            this.cache.set(strings, PartialClass);
        }
        return PartialClass;
    }

    /**
     * Tell whether this partial is a container: the whole template is a single
     * interpolation with no surrounding markup (expected to resolve to one
     * component / partial). A container renders without markers and borrows its
     * child's element.
     * @return {boolean} True if the partial is a container.
     */
    isContainer() {
        const { parts } = this.constructor;
        return parts.length === 1 && parts[0] instanceof InterpolationDescriptor;
    }

    /**
     * Materialize the per-render state objects for elements and interpolations,
     * aligned with the skeleton tables.
     * @private
     */
    materialize() {
        this.elementState = this.constructor.elements.map(() => ({}));
        this.interpolationState = this.constructor.interpolations.map(() => ({}));
    }

    /**
     * Render the partial to an HTML string, materializing its state on first call
     * and assigning each element/interpolation an emission id as it is emitted (so
     * DOM order matches emission order).
     * @return {string} The rendered HTML.
     */
    toString() {
        if (!this.elementState) this.materialize();
        return this.constructor.parts.map(part => this.renderPart(part)).join('');
    }

    /**
     * Render a single skeleton part (literal, element or interpolation).
     * @param {SafeHTML|ElementDescriptor|InterpolationDescriptor} part The part.
     * @return {string} The rendered HTML.
     * @private
     */
    renderPart(part) {
        if (part instanceof SafeHTML) return `${part}`;
        if (part instanceof ElementDescriptor) return this.renderElement(part);
        return this.renderInterpolation(part);
    }

    /**
     * Render an element's opening attributes, assigning its emission id and
     * capturing the initial attributes for later diffing.
     * @param {ElementDescriptor} descriptor The element descriptor.
     * @return {string} The attributes HTML.
     * @private
     */
    renderElement(descriptor) {
        const state = this.elementState[descriptor.slotIndex];
        if (state.id == null) state.id = this.options.nextElementId();
        const attributes = this.buildAttributes(descriptor.attrs);
        attributes[Constants.ATTRIBUTE_ELEMENT] = state.id;
        state.previousAttributes = attributes;
        return getAttributesHTML(attributes);
    }

    /**
     * Render an interpolation: its value wrapped between comment markers, except
     * in a container, which is marker-less and anchored to its element.
     * @param {InterpolationDescriptor} descriptor The interpolation descriptor.
     * @return {string} The rendered HTML.
     * @private
     */
    renderInterpolation(descriptor) {
        const state = this.interpolationState[descriptor.slotIndex];
        if (state.id == null) state.id = this.options.nextMarkerId();
        const value = this.renderValue(this.options.evaluate(this.expressions[descriptor.exprIndex], 'interpolation'));
        if (this.isContainer()) return value;
        return `<!--${Constants.MARKER_START(state.id)}-->${value}<!--${Constants.MARKER_END(state.id)}-->`;
    }

    /**
     * Render a dynamic value to a string. Handles the engine's own types
     * (`SafeHTML`, nested `Partial`, arrays); any other value is handed to the
     * owner through `options.renderChild`, which adds a child component or
     * sanitizes the value.
     * @param {any} value The value to render.
     * @return {string} The rendered HTML.
     * @private
     */
    renderValue(value) {
        if (value == null || value === false || value === true) return '';
        if (value instanceof SafeHTML) return `${value}`;
        if (value instanceof Partial) return value.toString();
        if (Array.isArray(value)) return value.map(item => this.renderValue(item)).join('');
        return this.options.renderChild(value);
    }

    /**
     * Build the attributes object for an element from its `Attribute` descriptors,
     * resolving each against the current expressions and expanding events.
     * @param {Array<Attribute>} attrs Attribute descriptors.
     * @return {object} Attributes object (without the emission id).
     * @private
     */
    buildAttributes(attrs) {
        const attributes = {};
        attrs.forEach(attr => attr.applyTo(attributes, this.expressions, this.options));
        return expandEvents(attributes, this.options);
    }

    /**
     * Attach the partial's state to the rendered DOM: locate each element by its
     * emission id and each interpolation by its markers. The first element is the
     * root, searched in `parent`; the remaining elements and the interpolations
     * live inside it, so they are searched within that root.
     * @param {Node} parent The parent node to search in.
     */
    hydrate(parent) {
        if (!this.elementState) this.materialize();
        let scope = parent;
        this.elementState.forEach((state, index) => {
            state.ref = scope.querySelector(`[${Constants.ATTRIBUTE_ELEMENT}="${state.id}"]`);
            if (index === 0) scope = state.ref;
        });
        // Containers render without markers, so there is nothing to locate.
        if (!this.isContainer()) {
            this.interpolationState.forEach(state => {
                const start = findComment(scope, Constants.MARKER_START(state.id), isComponent);
                const end = findComment(scope, Constants.MARKER_END(state.id), isComponent, start);
                state.ref = [start, end];
            });
        }
    }

    /**
     * Swap in a new set of expressions and patch the elements in place.
     * @param {Array<any>} expressions The new render expressions.
     */
    update(expressions) {
        this.expressions = expressions;
        this.constructor.elements.forEach(descriptor => {
            const state = this.elementState[descriptor.slotIndex];
            const attributes = this.buildAttributes(descriptor.attrs);
            attributes[Constants.ATTRIBUTE_ELEMENT] = state.id;
            this.patchElement(state, attributes);
        });
    }

    /**
     * Patch a hydrated element's attributes based on the diff with its previous
     * attributes.
     * @param {object} state The element's per-render state.
     * @param {object} attributes The new attributes object.
     * @private
     */
    patchElement(state, attributes) {
        const { remove, add } = getAttributesDiff(attributes, state.previousAttributes);
        state.previousAttributes = attributes;
        // Remove attributes first so later `setAttribute` overrides if needed.
        remove.forEach(attr => {
            state.ref.removeAttribute(attr);
            if (SYNC_PROPS.indexOf(attr) !== -1 && attr in state.ref) {
                state.ref[attr] = attr === 'value' ? '' : false;
            }
        });
        // Add / update attributes.
        Object.keys(add).forEach(attr => {
            const value = add[attr];
            state.ref.setAttribute(attr, value);
            if (SYNC_PROPS.indexOf(attr) !== -1 && attr in state.ref) {
                state.ref[attr] = attr === 'value' ? value : value !== false && value !== 'false';
            }
        });
    }
}

Partial.cache = new WeakMap();

export default Partial;
