import InterpolationDescriptor from './InterpolationDescriptor.js';

/**
 * Compile-time descriptor for a component tag (`<${Comp} .../>`).
 * A component tag is an interpolation that produces a `Component`, so it extends
 * `InterpolationDescriptor` and lives in the skeleton's `interpolations` array
 * (which keeps `isContainer` counting it). Its `expressionIndex` points at the
 * component class, and it carries the rest of what the `mount` is synthesized from
 * at `toString` time: the tag's attribute descriptors and the inner content skeleton
 * (slotted children, evaluated in the parent context), or `null` when self-closing.
 * @param {number} slotIndex Position in the skeleton's `interpolations` array.
 * @param {number} expressionIndex Index of the expression holding the component class.
 * @param {Array<Attribute>} attributes Attribute descriptors for the tag.
 * @param {Object|null} inner Inner content skeleton, or `null` when self-closing.
 * @private
 */
class ComponentDescriptor extends InterpolationDescriptor {
    constructor(slotIndex, expressionIndex, attributes, inner) {
        super(slotIndex, expressionIndex);
        this.attributes = attributes;
        this.inner = inner;
    }
}

export default ComponentDescriptor;
