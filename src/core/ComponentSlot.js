import InterpolationSlot from './InterpolationSlot.js';
import warnUnsupportedAttribute from './warnUnsupportedAttribute.js';

import __DEV__ from '../utils/dev.js';

/**
 * The live state of one component tag (`<${Comp} .../>`). A component tag is an
 * interpolation whose value is synthesized from its descriptor instead of read from
 * an expression, so it is an `InterpolationSlot` that stands on the element of the
 * component it mounts instead of on markers: placement, hydration and reconciliation
 * are otherwise the same, and the child it mounts is recycled like any other.
 *
 * What it synthesizes is known before anything is built — the class and the options
 * to mount it with — so the component is only built when no previous child can be
 * recycled in its place. Otherwise the options go straight to the retained child as
 * its new props.
 * @param {Partial} partial The partial this slot belongs to.
 * @param {ComponentDescriptor} descriptor The descriptor this slot renders from.
 * @private
 */
class ComponentSlot extends InterpolationSlot {
    constructor(partial, descriptor) {
        super(partial, descriptor);
        // Whether the last render claimed a previous child instead of mounting one.
        this.claimed = false;
    }

    /**
     * The component class the tag mounts.
     * @return {Function} The component class.
     * @private
     */
    tag() {
        return this.partial.expressions[this.descriptor.index];
    }

    /**
     * Synthesize the options the tag mounts its component with. Attributes and slotted
     * inner content are evaluated in the partial's own context: the inner content is
     * wrapped as a nested partial that shares that partial's expressions and owner, so
     * its events belong to that owner, not to the mounted child.
     * @return {object} The options.
     * @private
     */
    evaluate() {
        const { partial, descriptor } = this;
        if (__DEV__) warnUnsupportedAttribute(partial.constructor, descriptor);
        const options = {};
        descriptor.attributes.forEach(attribute => attribute.applyTo(options, partial.expressions, partial.owner));
        if (descriptor.inner) {
            const InnerPartial = partial.constructor.fromSkeleton(descriptor.inner);
            // Slotted content is evaluated in the partial's context (its expressions and
            // events belong to that owner), so the inner partial shares the same owner.
            // Its child components, however, become children of whichever component
            // renders it (the host), threaded as `host` at render time.
            options.renderChildren = () => new InnerPartial(partial.expressions, partial.owner);
        }
        return options;
    }

    /**
     * Render the tag: claim the previous child the pass holds under the tag's key, or
     * mount a new one. Either way the slot holds a live child from here on.
     * @param {ReconcilePass} [pass] Reconcile pass (see `Partial#toString`).
     * @return {string} The rendered HTML.
     */
    toString(pass) {
        const options = this.evaluate();
        const found = pass ? this.claimRecyclable(options, pass) : null;
        this.claimed = !!found;
        if (found) {
            this.content = found;
            return this.renderClaimed(found, options, pass);
        }
        this.content = this.tag().mount(options);
        return this.renderMounted(this.content, pass);
    }

    /**
     * Hydrate the child the last render mounted. A claimed child is already live, and
     * the pass moves it onto its placeholder.
     * @param {HydrationIndex} index The hydration's node index.
     */
    hydrate(index) {
        if (!this.claimed) this.partial.owner.hydrateChild(this.content, index);
    }

    /**
     * Reconcile the tag against the child it holds: recycle it in place when the tag
     * still matches it, or mount the new one and regenerate.
     */
    update() {
        const options = this.evaluate();
        const prev = this.content;
        const tag = this.tag();
        if (this.canRecycle(prev, tag, options.key)) this.recycleInPlace(prev, options);
        else this.regenerate(tag.mount(options));
    }

    /**
     * A component tag is always anchored: it resolves to a single component, so it
     * needs no markers of its own and stands on that component's element.
     * @return {boolean} Always true.
     * @private
     */
    isAnchored() {
        return true;
    }

    /**
     * The element of the component currently occupying the slot.
     * @return {Node} The anchor element.
     * @private
     */
    anchorElement() {
        return this.content.el;
    }
}

export default ComponentSlot;
