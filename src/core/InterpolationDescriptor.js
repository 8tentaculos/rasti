import InterpolationSlot from './InterpolationSlot.js';

/**
 * Compile-time descriptor for a dynamic region (interpolation) in the template.
 * Shared across renders (cached by `strings` identity) and free of DOM state.
 * The partial resolves its `expressionIndex` against the current expressions on
 * every render, and its position in the skeleton's `parts` pairs it with the
 * matching per-render slot. Marker ids come from the emission counter at
 * `toString` time.
 * @param {number} expressionIndex Index of the original expression this slot evaluates.
 * @property {Function} Slot The class of the live state this descriptor renders through.
 *     Inherited by `ComponentDescriptor`, so a component tag gets the same slot.
 * @private
 */
class InterpolationDescriptor {
    constructor(expressionIndex) {
        this.expressionIndex = expressionIndex;
    }
}

InterpolationDescriptor.Slot = InterpolationSlot;

export default InterpolationDescriptor;
