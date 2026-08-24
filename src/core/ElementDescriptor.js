/**
 * Compile-time descriptor for an element with dynamic attributes.
 * Shared across every render and iteration of a template (cached by `strings`
 * identity); it holds no DOM state. The partial resolves its `attributes` against
 * the current expressions on every render, and `slotIndex` pairs it with the
 * matching per-render state; the element id comes from the emission counter at
 * `toString` time, so there is no node index or path here.
 * @param {number} slotIndex Position in the skeleton's `elements` array.
 * @param {Array<Attribute>} attributes Attribute descriptors, each holding its key
 *     and value as either a literal or an expression index.
 * @private
 */
class ElementDescriptor {
    constructor(slotIndex, attributes) {
        this.slotIndex = slotIndex;
        this.attributes = attributes;
    }
}

export default ElementDescriptor;
