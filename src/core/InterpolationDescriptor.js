import InterpolationSlot from './InterpolationSlot.js';
import ExpressionDescriptor from './ExpressionDescriptor.js';

/**
 * Compile-time descriptor for a dynamic region (interpolation) in the template.
 * Shared across renders (cached by `strings` identity) and free of DOM state.
 * The partial resolves its `index` against the current expressions on
 * every render, and its position in the skeleton's `parts` pairs it with the
 * matching per-render slot. Marker ids come from the emission counter at
 * render time.
 * @param {number} index Index of the original expression this slot evaluates.
 * @property {Function} Slot The class of the live state this descriptor renders through.
 * @private
 */
class InterpolationDescriptor extends ExpressionDescriptor {}

InterpolationDescriptor.Slot = InterpolationSlot;

export default InterpolationDescriptor;
