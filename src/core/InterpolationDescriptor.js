/**
 * Compile-time descriptor for a dynamic region (interpolation) in the template.
 * Shared across renders (cached by `strings` identity) and free of DOM state.
 * The per-render bound `Interpolation` resolves `exprIndex` against the current
 * expressions; `slotIndex` locates the bound in the partial's `interpolations`
 * array. Marker ids come from the emission counter at `toString` time.
 * @param {number} slotIndex Position in the skeleton's `interpolations` array.
 * @param {number} exprIndex Index of the original expression this slot evaluates.
 * @private
 */
class InterpolationDescriptor {
    constructor(slotIndex, exprIndex) {
        this.slotIndex = slotIndex;
        this.exprIndex = exprIndex;
    }
}

export default InterpolationDescriptor;
