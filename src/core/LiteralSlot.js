import Slot from './Slot.js';

/**
 * The live state of a literal chunk of the template, paired by position with the
 * `LiteralDescriptor` it renders from. A literal has nothing to keep between renders: it is
 * emitted as written and never reconciled, so the slot only stands for its part in
 * the partial's slot list, keeping every part paired with a slot that renders it.
 * @param {Partial} partial The partial this slot belongs to.
 * @param {LiteralDescriptor} descriptor The literal this slot renders.
 * @private
 */
class LiteralSlot extends Slot {
    /**
     * Render the literal, as written in the template.
     * @return {string} The literal HTML.
     */
    toString() {
        return this.descriptor.value;
    }
}

export default LiteralSlot;
