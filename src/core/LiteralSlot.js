/**
 * The live state of a literal chunk of the template, paired by position with the
 * `SafeHTML` it renders from. A literal has nothing to keep between renders: it is
 * emitted as written and never reconciled, so the slot only stands for its part in
 * the partial's slot list, keeping every part paired with a slot that renders it.
 * @param {Partial} partial The partial this slot belongs to.
 * @param {SafeHTML} descriptor The literal this slot renders.
 * @private
 */
class LiteralSlot {
    constructor(partial, descriptor) {
        this.partial = partial;
        this.descriptor = descriptor;
    }

    /**
     * Render the literal, as written in the template.
     * @return {string} The literal HTML.
     */
    render() {
        return `${this.descriptor}`;
    }

    /**
     * Nothing to reconcile: the literal cannot change between renders.
     */
    update() {}
}

export default LiteralSlot;
