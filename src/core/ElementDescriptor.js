import ElementSlot from './ElementSlot.js';

/**
 * Compile-time descriptor for an element with dynamic attributes.
 * Shared across every render and iteration of a template (cached by `strings`
 * identity); it holds no DOM state. The partial resolves its `attributes` against
 * the current expressions on every render, and its position in the skeleton's
 * `parts` pairs it with the matching per-render slot; the element id comes from the
 * emission counter at render time, so there is no node index or path here.
 * @param {Array<Attribute>} attributes Attribute descriptors, each holding its key
 *     and value as either a literal or an expression index.
 * @param {boolean} isFirst Whether this is the template's first element, which is the
 *     component's root element when the template is its root.
 * @property {Function} Slot The class of the live state this descriptor renders through.
 * @private
 */
class ElementDescriptor {
    constructor(attributes, isFirst) {
        this.attributes = attributes;
        this.isFirst = isFirst;
    }
}

ElementDescriptor.Slot = ElementSlot;

export default ElementDescriptor;
