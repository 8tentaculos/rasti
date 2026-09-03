import Slot from './Slot.js';
import Constants from './Constants.js';
import getAttributesHTML from '../utils/getAttributesHTML.js';
import getAttributesDiff from '../utils/getAttributesDiff.js';
import __DEV__ from '../utils/dev.js';
import warnUnsupportedAttribute from '../utils/warnUnsupportedAttribute.js';

// Attributes the browser stops reflecting into the DOM once the user interacts with
// the element, so patching the attribute alone is not enough: the property has to be
// written too.
const SYNC_PROPS = ['value', 'checked', 'selected'];

/**
 * Write an attribute's value through to its DOM property when the attribute is one
 * the browser stops reflecting (see `SYNC_PROPS`). `value` takes the string as is;
 * the boolean properties coerce it, with the string `'false'` counting as false.
 * @param {Element} ref The DOM element.
 * @param {string} attr The attribute name.
 * @param {any} value The value to sync, already resolved by the caller.
 * @private
 */
const syncProperty = (ref, attr, value) => {
    if (SYNC_PROPS.indexOf(attr) !== -1 && attr in ref) {
        ref[attr] = attr === 'value' ? value : value !== false && value !== 'false';
    }
};

/**
 * Expand events. Delegates listener registration and the event data-attribute to
 * the owner through `registerListener`.
 * @param {object} attributes Attributes object.
 * @param {PartialOwner} owner The partial's owner.
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
 * The slot reads the current expressions and the owner off its partial, so
 * only what varies per call travels as an argument.
 * @param {Partial} partial The partial this slot belongs to.
 * @param {ElementDescriptor} descriptor The descriptor this slot renders from.
 * @private
 */
class ElementSlot extends Slot {
    constructor(partial, descriptor) {
        super(partial, descriptor);
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
        if (__DEV__) warnUnsupportedAttribute(this.partial.constructor, this.descriptor);
        const { attributes, sourceKeys } = this.buildAttributes();
        this.previousAttributes = attributes;
        return getAttributesHTML(attributes, sourceKeys);
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
        // The source keys are ignored here: `setAttribute` always takes plain text.
        const { attributes } = this.buildAttributes();
        const { remove, add } = getAttributesDiff(attributes, this.previousAttributes);
        this.previousAttributes = attributes;
        // Remove attributes first so later `setAttribute` overrides if needed.
        remove.forEach(attr => {
            this.ref.removeAttribute(attr);
            syncProperty(this.ref, attr, attr === 'value' ? '' : false);
        });
        // Add / update attributes.
        Object.keys(add).forEach(attr => {
            const value = add[attr];
            this.ref.setAttribute(attr, value);
            syncProperty(this.ref, attr, value);
        });
    }

    /**
     * Build the complete attributes object the element is rendered and diffed against:
     * its descriptors resolved against the current expressions, events expanded, the
     * root treatment, and the emission id.
     *
     * Root treatment: the component's root element — the root partial's first element
     * slot — merges the owner's `attributes`. Only the root partial carries
     * `rootAttributes`; nested partials never do. Both the render and the update path
     * go through here, so the merged attributes are on both sides of the diff and
     * survive a re-render.
     *
     * Alongside the attributes it returns the keys whose values are HTML source (pure
     * template literals) — kept beside the object, not inside it, so `getAttributesDiff`
     * keeps comparing primitive values by identity. Everything added after the
     * descriptors — events, `rootAttributes`, the element id — is plain text, and a
     * `rootAttributes` key colliding with a literal-marked one drops the mark.
     * @return {{ attributes: object, sourceKeys: Set<string> }} Attributes (including
     *     the emission id) and the HTML-source key set.
     * @private
     */
    buildAttributes() {
        const { partial } = this;
        const attributes = {};
        const sourceKeys = new Set();
        this.descriptor.attributes.forEach(attribute => attribute.applyTo(attributes, partial.expressions, partial.owner, sourceKeys));
        const out = expandEvents(attributes, partial.owner);
        if (partial.rootAttributes && partial.firstSlot(ElementSlot) === this) {
            const rootAttributes = partial.rootAttributes();
            Object.assign(out, rootAttributes);
            Object.keys(rootAttributes).forEach(key => sourceKeys.delete(key));
        }
        out[Constants.ATTRIBUTE_ELEMENT] = this.id;
        return { attributes : out, sourceKeys };
    }
}

export default ElementSlot;
