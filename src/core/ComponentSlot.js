import InterpolationSlot from './InterpolationSlot.js';
import __DEV__ from '../utils/dev.js';
import warnUnsupportedAttribute from '../utils/warnUnsupportedAttribute.js';

/**
 * The live state of one component tag (`<${Comp} .../>`). A component tag is an
 * interpolation whose value is synthesized from its descriptor instead of read from
 * an expression, so it is an `InterpolationSlot` that replaces `evaluate` and stands
 * on the element of the component it mounts instead of on markers: rendering,
 * hydration and reconciliation are otherwise the same, and the child it mounts is
 * recycled like any other.
 * @param {Partial} partial The partial this slot belongs to.
 * @param {ComponentDescriptor} descriptor The descriptor this slot renders from.
 * @private
 */
class ComponentSlot extends InterpolationSlot {
    /**
     * Synthesize the child component from the tag's descriptor. Attributes and
     * slotted inner content are evaluated in the partial's own context: the inner
     * content is wrapped as a nested partial that shares that partial's expressions
     * and owner, so its events belong to that owner, not to the mounted child.
     * @return {object} The mounted child component.
     * @private
     */
    evaluate() {
        const { partial, descriptor } = this;
        if (__DEV__) warnUnsupportedAttribute(partial.constructor, descriptor);
        const tag = partial.expressions[descriptor.expressionIndex];
        const childOptions = {};
        descriptor.attributes.forEach(attribute => attribute.applyTo(childOptions, partial.expressions, partial.owner));
        if (descriptor.inner) {
            const InnerPartial = partial.constructor.fromSkeleton(descriptor.inner);
            // Slotted content is evaluated in the partial's context (its expressions and
            // events belong to that owner), so the inner partial shares the same owner.
            // Its child components, however, become children of whichever component
            // renders it (the host), threaded as `host` at render time.
            childOptions.renderChildren = () => new InnerPartial(partial.expressions, partial.owner);
        }
        return tag.mount(childOptions);
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
        return this.previous.el;
    }
}

export default ComponentSlot;
