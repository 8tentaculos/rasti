import Slot from './Slot.js';

/**
 * The live state of a bare expression, paired by position with the `ExpressionIndex`
 * it renders from — an expression that stands on its own, outside of an attribute or
 * an interpolation, which in practice is a dynamic tag name. It is emitted inline,
 * with no markers around it, so it is resolved on every render but never reconciled:
 * a changed tag only takes effect when the element is recreated.
 * @param {Partial} partial The partial this slot belongs to.
 * @param {ExpressionIndex} descriptor The expression reference this slot renders from.
 * @private
 */
class ExpressionSlot extends Slot {
    /**
     * Render the expression, evaluated in the owner's context and sanitized.
     * @return {string} The rendered HTML.
     */
    render() {
        const { partial } = this;
        const { owner } = partial;
        return owner.sanitize(owner.evaluate(partial.expressions[this.descriptor.index], 'dynamic tag'));
    }
}

export default ExpressionSlot;
