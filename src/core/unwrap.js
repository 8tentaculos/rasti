/**
 * Resolve what a value stands for, seeing through transparent partials, which
 * contribute no node of their own and resolve to whatever their single slot holds.
 * A partial that is opaque, or that has not rendered and has no slot to look into,
 * stands for itself.
 * @param {Partial} partial The partial holding the value.
 * @param {any} value The value to resolve.
 * @return {any} The value the given one stands for.
 * @private
 */
const unwrap = (partial, value) => {
    if (!partial.isPartial(value) || !value.isTransparent() || !value.slots) return value;
    return unwrap(partial, value.slots[0].content);
};

export default unwrap;
