/**
 * Compile-time descriptor for a dynamic region (interpolation) in the template.
 * Shared across renders (cached by `strings` identity) and free of DOM state.
 * The partial resolves its `expressionIndex` against the current expressions on
 * every render, and `slotIndex` pairs it with the matching per-render state.
 * Marker ids come from the emission counter at `toString` time.
 * @param {number} slotIndex Position in the skeleton's `interpolations` array.
 * @param {number} expressionIndex Index of the original expression this slot evaluates.
 * @private
 */
class InterpolationDescriptor {
    constructor(slotIndex, expressionIndex) {
        this.slotIndex = slotIndex;
        this.expressionIndex = expressionIndex;
    }
}

export default InterpolationDescriptor;
