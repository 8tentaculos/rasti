import ComponentDescriptor from './ComponentDescriptor.js';
import InterpolationDescriptor from './InterpolationDescriptor.js';
import LiteralDescriptor from './LiteralDescriptor.js';
import ElementSlot from './ElementSlot.js';
import InterpolationSlot from './InterpolationSlot.js';
import parseTemplate from './parseTemplate.js';

/**
 * A literal holding nothing but the opening of the element that follows it, up to the
 * attributes that element's descriptor carries. It writes no node of its own, so the
 * element is still the first node the template renders.
 * @type {RegExp}
 * @private
 */
const OPENING_TAG = /^<[a-zA-Z][^>]*$/;

/**
 * The object through which a partial reaches the component world. The engine never
 * imports `Component`: everything component-specific arrives here, so the same code
 * drives real components in the app and fakes in tests.
 *
 * A partial sees it in two roles. Its <b>owner</b> is the component whose template it
 * comes from: expressions are evaluated in that component's context, and its ids and
 * event listeners belong to it. Its <b>host</b> is the component currently rendering,
 * whose `children` the rendered child components join. They are the same component
 * except for slotted content, which a parent writes but a host renders.
 *
 * The child-lifecycle handlers are the same for every component, so reaching them
 * through the owner or through the host is equivalent; each call site uses whichever
 * role it has at hand.
 *
 * The handlers cover what only the component can do; the wire format stays with the
 * engine, which writes it from `Constants`. A child component is the one value the
 * engine reads fields off: its `el` and its `uid`.
 * @typedef {object} ComponentAdapter
 * @property {Function} evaluate Evaluate an expression in the owner's context, `(expression, meta) => value`.
 * @property {Function} registerListener Register an event listener, `(listener, type) => ({ attribute, index })`.
 * @property {Function} nextElementId Mint the owner's next element id.
 * @property {Function} nextMarkerId Mint the owner's next interpolation marker id.
 * @property {Function} isChild Tell whether a value is a child component.
 * @property {Function} sanitize Escape a plain value for HTML.
 * @property {Function} addChild Adopt a child component into the host, returning it to render.
 * @property {Function} moveChild Move a recycled child onto its placeholder, `(child, placeholder)`.
 * @property {Function} hydrateChild Hydrate a freshly rendered child, `(child, index)`.
 * @property {Function} updateChild Queue a recycled child's new props, `(child, props)`.
 * @property {Function} childProps Read the props a discarded candidate carried.
 * @property {Function} destroyChild Destroy a discarded child.
 * @private
 */

/**
 * A bound instance of a parsed template. Pairs the render's `expressions` with its
 * owner.
 *
 * `Partial` itself is the base engine: `Partial.create` returns a cached subclass
 * per call site with the skeleton (`parts`) baked as a static, so two partials from
 * the same call site share one class and are reconciled by `constructor` — the same
 * identity mechanism as components. The same class backs a component's root template
 * and every nested `partial`, so rendering is uniformly recursive: a slot that holds
 * a partial updates it in place, a slot that holds a child component recycles it.
 * The skeleton is static and shared by every partial from that call site; everything
 * that changes as the partial renders (ids, refs, previous attributes, slot
 * occupants) lives on the instance in `this.slots`, created lazily on the first
 * render. Every part gets a slot, in the same order, so a part and its slot are
 * paired by position alone and the slot list is the whole live view of the template:
 * a literal's slot simply has nothing to keep.
 *
 * Each slot is an instance of the class its part names in `Slot`, and owns the
 * rendering, hydration and reconciliation of its own region. What is left here is the
 * orchestration: walking the slots in document order, and driving them through the
 * three phases of a render (emit, hydrate, update).
 *
 * @param {Array<any>} expressions The current render expressions.
 * @param {ComponentAdapter} owner The adapter for the component this template belongs to.
 * @property {ComponentAdapter} host The adapter for the component this partial renders
 *     under, whose `children` its child components join. The same as the owner except
 *     for slotted content, which a parent writes but a host renders: the slot that
 *     renders a nested partial hands it its own host, so a whole slotted subtree lands
 *     in the component that renders it.
 * @private
 */
class Partial {
    constructor(expressions, owner) {
        this.expressions = expressions;
        this.owner = owner;
        // The component currently rendering this partial, whose `children` its child
        // components join. Same as the owner except for slotted content, where the
        // slot that renders it sets the host it renders under.
        this.host = owner;
        // Whether this is the component's own root partial, set when the component
        // adopts it. A transparent one makes that component a container: see
        // `isAnchored`.
        this.isRoot = false;
    }

    /**
     * Tell whether a value is another partial: a bound template, which the engine
     * renders, hydrates and updates recursively instead of treating it as content.
     * The check lives here, next to the class, and the slots reach it through their
     * partial — the same way they reach the component-world checks through the
     * owner.
     * @param {any} value The value to check.
     * @return {boolean} True if the value is a partial.
     */
    isPartial(value) {
        return value instanceof Partial;
    }

    /**
     * Tell whether the template is a single interpolation with no surrounding markup,
     * so the partial contributes no node of its own: whatever its interpolation
     * resolves to lands directly where the partial was written. The engine sees
     * through it when collecting the children a value mounted, and when resolving the
     * element a value stands on.
     * @return {boolean} True if the partial adds no markup of its own.
     */
    isTransparent() {
        const { parts } = this.constructor;
        return parts.length === 1 && parts[0] instanceof InterpolationDescriptor;
    }

    /**
     * Tell whether the whole template is a single component tag (`<${Comp} />`), which
     * always renders a component and nothing else.
     * @return {boolean} True if the partial is a lone component tag.
     */
    isComponentTag() {
        const { parts } = this.constructor;
        return parts.length === 1 && parts[0] instanceof ComponentDescriptor;
    }

    /**
     * Tell whether the partial stands for the component it renders: it writes no
     * markers of its own and is anchored to that component's element, which the DOM
     * can then move around freely. True for a component's transparent root partial,
     * whose component adopts that element as its own and is therefore a container, and
     * for a lone component tag, which makes `partial`<${Comp} />`` equivalent to
     * mounting the component. Every other partial writes markers, which is where its
     * interpolations are patched.
     * @return {boolean} True if the partial renders anchored to a component.
     */
    isAnchored() {
        return this.isTransparent() && (this.isRoot || this.isComponentTag());
    }

    /**
     * Render the partial to an HTML string, creating its slot state on first
     * call and assigning each element/interpolation an emission id as it is emitted
     * (so DOM order matches emission order). It is the `toString` contract every
     * part answers (see `Slot`), which is what makes `${partial}` render.
     *
     * The render context travels here as the optional `pass`, invisible to a plain
     * coercion, and never crosses a component: a child component renders with its
     * own handlers (see `Component#toString`).
     * @param {object} [pass] Reconcile pass threaded through nested partials during
     *     an update, so child components rendered anywhere in the subtree are
     *     matched against the owning slot's previous occupants. Absent on a plain
     *     first render.
     * @return {string} The rendered HTML.
     */
    toString(pass) {
        // The slot list is created on the first render: a partial that is synthesized
        // but never rendered (a discarded update candidate) allocates nothing. From
        // then on it is the partial's live view of the skeleton — one slot per part,
        // in document order — so rendering, hydration and updates all walk it and
        // never the skeleton.
        if (!this.slots) this.slots = this.constructor.parts.map(part => new part.constructor.Slot(this, part));
        return this.slots.map(slot => slot.toString(pass)).join('');
    }

    /**
     * Run a callback over the slots of one kind, in document order. `ComponentSlot`
     * extends `InterpolationSlot`, so selecting the latter takes component tags along.
     * @param {Function} Slot The slot class selecting the slots to visit.
     * @param {Function} callback Called with each matching slot.
     * @private
     */
    eachSlot(Slot, callback) {
        this.slots.forEach(slot => {
            if (slot instanceof Slot) callback(slot);
        });
    }

    /**
     * The first slot of a given kind, or `undefined` when the template has none.
     * @param {Function} Slot The slot class selecting the slot.
     * @return {object|undefined} The slot.
     * @private
     */
    firstSlot(Slot) {
        return this.slots.find(slot => slot instanceof Slot);
    }

    /**
     * Attach the partial's slots to the rendered DOM and recurse into them: the nested
     * partials and, on a fresh hydrate, the child components they hold — so a whole new
     * subtree hydrates from one call. Each slot resolves its own nodes out of the
     * index, which already holds every node the render produced.
     * @param {HydrationIndex} index The hydration's node index, shared by the whole
     *     subtree.
     * @param {boolean} [fresh=true] Whether this is a brand-new subtree, in which case
     *     the child components in the slots are hydrated too. False during an update's
     *     slot replacement, where the reconcile pass hydrates new children and moves
     *     recycled ones, so only structural refs are set here.
     */
    hydrate(index, fresh = true) {
        // The occupants are hydrated in a pass of their own, after every ref in the
        // partial is resolved: hydrating one runs the user's `onHydrate`, which may
        // move nodes around, and the partial's own structure is better read whole.
        this.eachSlot(ElementSlot, slot => slot.hydrateRef(index));
        // Each slot knows whether it wrote markers: an anchored one has none to locate.
        this.eachSlot(InterpolationSlot, slot => slot.hydrateMarkers(index));
        this.eachSlot(InterpolationSlot, slot => slot.hydrateOccupant(index, fresh));
    }

    /**
     * The root DOM element this partial resolves to: its first element, or, for a
     * transparent one, the element of whatever its single slot resolves to
     * (recursively descending nested partials).
     * @return {Node} The root element.
     */
    rootElement() {
        if (!this.isTransparent()) return this.firstSlot(ElementSlot).ref;
        // A transparent partial is a single interpolation, so its slot is the first one.
        return this.slotElement(this.slots[0].content);
    }

    /**
     * Resolve the root element of a transparent partial's slot value, descending
     * through nested transparent partials. A transparent partial stands on the element
     * of the component it renders, so what it resolves to is a component.
     * @param {any} value The slot value.
     * @return {Node} The resolved element.
     * @private
     */
    slotElement(value) {
        if (this.isPartial(value)) return value.rootElement();
        // A child component: its own element.
        return value.el;
    }

    /**
     * The first DOM node the partial renders, or `null` when the template starts with
     * literal markup: the engine writes a literal out and keeps no reference to it, so
     * a node it renders cannot be located afterwards. The usual shape does have one —
     * a template opening with an element or an interpolation, both of which own their
     * nodes.
     * @return {Node|null} The first node, or `null` when it cannot be located.
     */
    firstNode() {
        const { parts } = this.constructor;
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (!(part instanceof LiteralDescriptor)) {
                const slot = this.slots[i];
                // An element stands on its own node; every other slot writes markers.
                return slot instanceof ElementSlot ? slot.ref : slot.ref && slot.ref[0];
            }
            if (part.value !== '' && !OPENING_TAG.test(part.value)) return null;
        }
        return null;
    }

    /**
     * Swap in a new set of expressions and patch in place: every slot updates itself
     * against them, in document order — an interpolation reconciles its occupant
     * (child recycle / nested-partial update / content replace), an element diffs its
     * attributes.
     * @param {Array<any>} expressions The new render expressions.
     */
    update(expressions) {
        this.expressions = expressions;
        this.slots.forEach(slot => slot.update());
    }

    /**
     * Return a cached `Partial` subclass for this call site, with the skeleton
     * baked as statics. Analogous to `Component.create`.
     * @param {Array<string>} strings Template string literals.
     * @param {Array<any>} expressions Template expressions.
     * @param {Function} [isComponentClass] Predicate telling whether an expression is a component class.
     * @return {Function} A `Partial` subclass.
     */
    static create(strings, expressions, isComponentClass) {
        let PartialClass = this.cache.get(strings);
        if (!PartialClass) {
            PartialClass = this.fromSkeleton(parseTemplate(strings, expressions, isComponentClass));
            this.cache.set(strings, PartialClass);
        }
        return PartialClass;
    }

    /**
     * Return a cached `Partial` subclass for a skeleton, baking it as statics.
     * Cached by the skeleton's identity so a component tag's inner content (a
     * nested skeleton, stable across renders) always yields the same subclass and
     * therefore reconciles by `constructor` when re-rendered through
     * `renderChildren`.
     * @param {{ parts: Array, source: Object|null }} skeleton Skeleton data.
     * @return {Function} A `Partial` subclass.
     */
    static fromSkeleton(skeleton) {
        let PartialClass = this.skeletonCache.get(skeleton);
        if (!PartialClass) {
            PartialClass = class extends Partial {};
            Object.assign(PartialClass, skeleton);
            this.skeletonCache.set(skeleton, PartialClass);
        }
        return PartialClass;
    }
}

Partial.cache = new WeakMap();
Partial.skeletonCache = new WeakMap();

export default Partial;
