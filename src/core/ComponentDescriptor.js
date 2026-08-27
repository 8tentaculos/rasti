import InterpolationDescriptor from './InterpolationDescriptor.js';
import ComponentSlot from './ComponentSlot.js';

/**
 * Compile-time descriptor for a component tag (`<${Comp} .../>`).
 * A component tag is an interpolation that produces a `Component`, so it extends
 * `InterpolationDescriptor` and is handled as one everywhere (which keeps
 * `isContainer` counting it). Its `expressionIndex` points at the component class,
 * and it carries the rest of what the `mount` is synthesized from at render
 * time: the tag's attribute descriptors and the inner content skeleton (slotted
 * children, evaluated in the parent context), or `null` when self-closing.
 * @param {number} expressionIndex Index of the expression holding the component class.
 * @param {Array<Attribute>} attributes Attribute descriptors for the tag.
 * @param {Object|null} inner Inner content skeleton, or `null` when self-closing.
 * @property {Function} Slot The class of the live state this descriptor renders through,
 *     overriding the one inherited from `InterpolationDescriptor`.
 * @private
 */
class ComponentDescriptor extends InterpolationDescriptor {
    constructor(expressionIndex, attributes, inner) {
        super(expressionIndex);
        this.attributes = attributes;
        this.inner = inner;
    }
}

ComponentDescriptor.Slot = ComponentSlot;

export default ComponentDescriptor;
