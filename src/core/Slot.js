/**
 * Live state of one skeleton part, paired by position with the descriptor it
 * renders from. Subclasses add the fields they keep between renders and
 * implement `render`. `update` is a no-op unless the part is reconciled.
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
