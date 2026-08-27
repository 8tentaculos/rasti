import Constants from './Constants.js';
import isComponent from './isComponent.js';
import findComment from '../utils/findComment.js';

/**
 * The live state of one interpolation, paired by position with the
 * `InterpolationDescriptor` it renders from. It holds the emission id assigned when
 * the interpolation is written out, the comment markers hydration resolves that id
 * to, and the value currently occupying the slot, which the next update reconciles
 * against.
 *
 * The slot reads the current expressions and the owner's handlers off its partial, so
 * only what varies per call travels as an argument.
 * @param {Partial} partial The partial this slot belongs to.
 * @param {InterpolationDescriptor} descriptor The descriptor this slot renders from.
 * @private
 */
class InterpolationSlot {
    constructor(partial, descriptor) {
        this.partial = partial;
        this.descriptor = descriptor;
        this.id = null;
        this.ref = null;
        this.previous = null;
    }

    /**
     * Render the interpolation: its value wrapped between comment markers, except in a
     * container, which is marker-less and anchored to its element. Records the value as
     * the slot's occupant for the next render's reconciliation.
     * @param {PartialHandlers} host Handlers of the component rendering (see `Partial#toString`).
     * @param {object} [pass] Reconcile pass (see `Partial#toString`).
     * @return {string} The rendered HTML.
     */
    render(host, pass) {
        const { partial } = this;
        if (this.id == null) this.id = partial.owner.nextMarkerId();
        const value = partial.evaluate(this.descriptor);
        this.previous = value;
        const rendered = partial.renderValue(value, host, pass);
        if (partial.isContainer()) return rendered;
        return `<!--${Constants.MARKER_START(this.id)}-->${rendered}<!--${Constants.MARKER_END(this.id)}-->`;
    }

    /**
     * Resolve the slot's comment markers. They are located by a structural traversal
     * that skips nested component subtrees, so the search is scoped to the owning
     * component's root.
     * @param {Node} root The owning component's root.
     */
    hydrateMarkers(root) {
        const start = findComment(root, Constants.MARKER_START(this.id), isComponent);
        const end = findComment(root, Constants.MARKER_END(this.id), isComponent, start);
        this.ref = [start, end];
    }

    /**
     * Reconcile the slot against its previous occupant.
     * @param {PartialHandlers} host Handlers of the component rendering (see `Partial#toString`).
     */
    update(host) {
        this.partial.updateInterpolation(this, host);
    }
}

export default InterpolationSlot;
