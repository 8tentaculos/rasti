import Constants from './Constants.js';
import getAttributesHTML from '../utils/getAttributesHTML.js';
import getAttributesDiff from '../utils/getAttributesDiff.js';

// Attributes the browser stops reflecting into the DOM once the user interacts with
// the element, so patching the attribute alone is not enough: the property has to be
// written too.
const SYNC_PROPS = ['value', 'checked', 'selected'];

/**
 * Expand events. Delegates listener registration and the event data-attribute to
 * the owner through `registerListener`.
 * @param {object} attributes Attributes object.
 * @param {PartialHandlers} owner The partial's owner.
 * @return {object} Attributes object.
 * @private
 */
const expandEvents = (attributes, owner) => {
    const out = {};
    Object.keys(attributes).forEach(key => {
        // Check if key is an event listener.
        const match = key.match(/on(([A-Z]{1}[a-z]+)+)/);

        if (match && match[1]) {
            const type = match[1].toLowerCase();
            const listener = attributes[key];
            if (listener) {
                const { attribute, index } = owner.registerListener(listener, type);
                // Add event listener index under its data-attribute.
                out[attribute] = index;
            }
        } else {
            // Add attribute.
            out[key] = attributes[key];
        }
    });
    return out;
};

/**
 * The live state of one element with dynamic attributes, paired by position with the
 * `ElementDescriptor` it renders from. It holds the emission id assigned when the
 * element is written out, the DOM node hydration resolves that id to, and the
 * attributes last rendered, which the next update diffs against.
 *
 * The slot reads the current expressions and the owner's handlers off its partial, so
 * only what varies per call travels as an argument.
 * @param {Partial} partial The partial this slot belongs to.
 * @param {ElementDescriptor} descriptor The descriptor this slot renders from.
 * @private
 */
class ElementSlot {
    constructor(partial, descriptor) {
        this.partial = partial;
        this.descriptor = descriptor;
        this.id = null;
        this.ref = null;
        this.previousAttributes = null;
    }

    /**
     * Render the element's opening attributes, assigning its emission id on the first
     * render and capturing the attributes for later diffing.
     * @return {string} The attributes HTML.
     */
    render() {
        if (this.id == null) this.id = this.partial.owner.nextElementId();
        const attributes = this.buildAttributes();
        this.previousAttributes = attributes;
        return getAttributesHTML(attributes);
    }

    /**
     * Resolve the rendered node by its emission id. Ids are unique and deterministic,
     * so the element is found anywhere under `parent`, including a component root,
     * which cannot be found within itself.
     * @param {Node} parent The node the partial's elements were rendered into.
     */
    hydrateRef(parent) {
        this.ref = parent.querySelector(`[${Constants.ATTRIBUTE_ELEMENT}="${this.id}"]`);
    }

    /**
     * Diff the element's attributes against the swapped expressions and patch the DOM.
     */
    update() {
        const attributes = this.buildAttributes();
        const { remove, add } = getAttributesDiff(attributes, this.previousAttributes);
        this.previousAttributes = attributes;
        // Remove attributes first so later `setAttribute` overrides if needed.
        remove.forEach(attr => {
            this.ref.removeAttribute(attr);
            if (SYNC_PROPS.indexOf(attr) !== -1 && attr in this.ref) {
                this.ref[attr] = attr === 'value' ? '' : false;
            }
        });
        // Add / update attributes.
        Object.keys(add).forEach(attr => {
            const value = add[attr];
            this.ref.setAttribute(attr, value);
            if (SYNC_PROPS.indexOf(attr) !== -1 && attr in this.ref) {
                this.ref[attr] = attr === 'value' ? value : value !== false && value !== 'false';
            }
        });
    }

    /**
     * Build the complete attributes object the element is rendered and diffed against:
     * its descriptors resolved against the current expressions, events expanded, the
     * root treatment, and the emission id.
     *
     * Root treatment: the component's root element (emitted first, id ending in `-1`)
     * merges the owner's `attributes`. Only the root partial carries `rootAttributes`;
     * nested partials never do. Both the render and the update path go through here, so
     * the merged attributes are on both sides of the diff and survive a re-render.
     * @return {object} Attributes object, including the emission id.
     * @private
     */
    buildAttributes() {
        const { partial } = this;
        const attributes = {};
        this.descriptor.attributes.forEach(attribute => attribute.applyTo(attributes, partial.expressions, partial.owner));
        const out = expandEvents(attributes, partial.owner);
        if (partial.rootAttributes && /-1$/.test(this.id)) Object.assign(out, partial.rootAttributes());
        out[Constants.ATTRIBUTE_ELEMENT] = this.id;
        return out;
    }
}

export default ElementSlot;
