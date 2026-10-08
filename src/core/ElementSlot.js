import Slot from './Slot.js';
import Constants from './Constants.js';
import getEventType from './getEventType.js';

import getAttributesHTML from '../utils/getAttributesHTML.js';
import getAttributesDiff from '../utils/getAttributesDiff.js';
import warnUnsupportedAttribute from '../utils/warnUnsupportedAttribute.js';
import createDevelopmentErrorMessage from '../utils/createDevelopmentErrorMessage.js';

import __DEV__ from '../utils/dev.js';

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
 * @param {ComponentAdapter} owner The partial's owner.
 * @return {object} Attributes object.
 * @private
 */
const expandEvents = (attributes, owner) => {
    const out = {};
    Object.keys(attributes).forEach(key => {
        // Check if key is an event listener.
        const type = getEventType(key);

        if (type) {
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
 * Reject a node that is not the one the slot wrote. Elements are handed out in
 * document order (see `HydrationIndex`), so a DOM that does not hold what the render
 * produced shifts every slot after it and the mistake surfaces far from its cause.
 * The emission id is still written on every element, and comparing it here keeps the
 * failure where it happens. Development only.
 * @param {ElementSlot} slot The slot being hydrated.
 * @private
 */
const checkHydratedRef = (slot) => {
    const { ref, id } = slot;
    if (ref && ref.getAttribute(Constants.ATTRIBUTE_ELEMENT) === id) return;
    const found = ref ? `"${ref.getAttribute(Constants.ATTRIBUTE_ELEMENT)}"` : 'nothing';
    throw new Error(createDevelopmentErrorMessage(
        'Hydration mismatch\n' +
        'Hydration takes the elements a render wrote in document order, and the DOM\n' +
        `does not hold them: in the place of "${id}" it found ${found}.\n\n` +
        'Hydrating server-rendered markup requires the server and the client to render\n' +
        'the same template from the same version of Rasti, so the markup they produce\n' +
        'matches node for node.'
    ));
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
     * render and capturing the attributes for later diffing. The id is written beside
     * them rather than through them: it never changes, so it needs neither escaping
     * nor a place in the diff.
     * @return {string} The attributes HTML.
     */
    toString() {
        if (this.id == null) this.id = this.partial.owner.nextElementId();
        if (__DEV__) warnUnsupportedAttribute(this.partial.constructor, this.descriptor);
        const sourceKeys = new Set();
        const attributes = this.buildAttributes(sourceKeys);
        this.previousAttributes = attributes;
        // The emission id is written straight out: it never changes, so it is neither
        // escaped nor diffed, and it stays out of what the update compares.
        const html = getAttributesHTML(attributes, sourceKeys);
        const id = `${Constants.ATTRIBUTE_ELEMENT}="${this.id}"`;
        return html ? `${html} ${id}` : id;
    }

    /**
     * Take the rendered node: the next element the render wrote (see `HydrationIndex`).
     * @param {HydrationIndex} index The hydration's node index.
     */
    hydrate(index) {
        this.ref = index.nextElement();
        if (__DEV__) checkHydratedRef(this);
    }

    /**
     * Diff the element's attributes against the swapped expressions and patch the DOM.
     */
    update() {
        // No source keys: `setAttribute` always takes plain text.
        const attributes = this.buildAttributes();
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
     * Build the attributes object the element is rendered and diffed against: its
     * descriptors resolved against the current expressions, events expanded, and the
     * root treatment. The emission id is not among them — it is written out beside
     * them and never changes, so it is nothing to diff.
     *
     * Root treatment: the component's root element — the root partial's first element,
     * marked on its descriptor — merges the owner's `attributes`. Only the root partial carries
     * `rootAttributes`; nested partials never do. Both the render and the update path
     * go through here, so the merged attributes are on both sides of the diff and
     * survive a re-render.
     *
     * Given a set, it collects the keys whose values are HTML source (pure template
     * literals) — kept beside the object, not inside it, so `getAttributesDiff` keeps
     * comparing primitive values by identity. Only serialization reads them: an update
     * writes through `setAttribute`, which always takes plain text. Everything added
     * after the descriptors — events and `rootAttributes` — is plain text, and a
     * `rootAttributes` key colliding with a literal-marked one drops the mark.
     * @param {Set<string>} [sourceKeys] Set collecting the HTML-source keys.
     * @return {object} The attributes.
     * @private
     */
    buildAttributes(sourceKeys) {
        const { partial } = this;
        const attributes = {};
        this.descriptor.attributes.forEach(attribute => attribute.applyTo(attributes, partial.expressions, partial.owner, sourceKeys));
        const out = expandEvents(attributes, partial.owner);
        if (partial.rootAttributes && this.descriptor.isFirst) {
            const rootAttributes = partial.rootAttributes();
            Object.assign(out, rootAttributes);
            if (sourceKeys) Object.keys(rootAttributes).forEach(key => sourceKeys.delete(key));
        }
        return out;
    }
}

export default ElementSlot;
