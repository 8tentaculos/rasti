/**
 * Compile-time descriptor for an element with dynamic attributes.
 * Shared across every render and iteration of a template (cached by `strings`
 * identity); it holds no DOM state. The per-render bound `Element` reads its
 * `attrs` against the current expressions. `slotIndex` locates the bound in the
 * partial's `elements` array; the element id comes from the emission counter at
 * `toString` time, so there is no node index or path here.
 * @param {number} slotIndex Position in the skeleton's `elements` array.
 * @param {Array<Object>} attrs Attribute descriptors: `{ key, value, quoted }`,
 *     where `key`/`value` are either a literal string or an `{ expr }` index.
 * @private
 */
class ElementDescriptor {
    constructor(slotIndex, attrs) {
        this.slotIndex = slotIndex;
        this.attrs = attrs;
    }
}

export default ElementDescriptor;
