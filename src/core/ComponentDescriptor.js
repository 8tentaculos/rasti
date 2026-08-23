import InterpolationDescriptor from './InterpolationDescriptor.js';

/**
 * Compile-time descriptor for a component tag (`<${Comp} .../>`).
 * A component tag is an interpolation that produces a `Component`, so it extends
 * `InterpolationDescriptor` and lives in the skeleton's `interpolations` array
 * (which keeps `isContainer` counting it). Instead of an `exprIndex`, it carries
 * what the `mount` is synthesized from at `toString` time: the tag expression
 * index, its attribute descriptors, and the inner content skeleton (slotted
 * children, evaluated in the parent context), or `null` when self-closing.
 * @param {number} slotIndex Position in the skeleton's `interpolations` array.
 * @param {number} tagIndex Index of the expression holding the component class.
 * @param {Array<Object>} attrs Attribute descriptors for the tag.
 * @param {Object|null} inner Inner content skeleton, or `null` when self-closing.
 * @private
 */
class ComponentDescriptor extends InterpolationDescriptor {
    constructor(slotIndex, tagIndex, attrs, inner) {
        super(slotIndex, null);
        this.tagIndex = tagIndex;
        this.attrs = attrs;
        this.inner = inner;
    }
}

export default ComponentDescriptor;
