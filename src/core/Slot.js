/**
 * Live state of one skeleton part, paired by position with the descriptor it
 * renders from. Subclasses add the fields they keep between renders and
 * implement `toString`. `update` is a no-op unless the part is reconciled.
 *
 * Emitting is `toString`, the engine's one rendering contract: a slot, a partial
 * and a component all answer it with the markup they stand for, so each is usable
 * wherever HTML is expected — interpolated, joined from an array, concatenated
 * into a page. Inside the engine the contract is called directly
 * (`slot.toString()`), never through coercion: a known `toString` is faster to
 * call than to coerce, and it leaves `valueOf` out of the picture. Coercion is
 * for values that carry no contract (see `valueToString`).
 * @param {Partial} partial The partial this slot belongs to.
 * @param {any} descriptor The descriptor this slot renders from.
 * @private
 */
class Slot {
    constructor(partial, descriptor) {
        this.partial = partial;
        this.descriptor = descriptor;
    }

    /**
     * Nothing to reconcile by default: the part cannot change between renders.
     */
    update() {}
}

export default Slot;
