import InterpolationDescriptor from './InterpolationDescriptor.js';
import ElementSlot from './ElementSlot.js';
import InterpolationSlot from './InterpolationSlot.js';
import parseTemplate from './parseTemplate.js';

/**
 * The handlers through which a partial reaches the component world. The engine never
 * imports `Component`: everything component-specific arrives here, so the same code
 * drives real components in the app and fakes in tests.
 *
 * A partial sees them in two roles. Its <b>owner</b> is the component whose template it
 * comes from: expressions are evaluated in that component's context, and its ids and
 * event listeners belong to it. Its <b>host</b> is the component currently rendering,
 * whose `children` the rendered child components join. They are the same component
 * except for slotted content, which a parent writes but a host renders.
 *
 * The child-lifecycle handlers are the same for every component, so reaching them
 * through the owner or through the host is equivalent; each call site uses whichever
 * role it has at hand.
 * @typedef {object} PartialHandlers
 * @property {Function} evaluate Evaluate an expression in the owner's context, `(expression, meta) => value`.
 * @property {Function} registerListener Register an event listener, `(listener, type) => ({ attribute, index })`.
 * @property {Function} nextElementId Mint the owner's next element id.
 * @property {Function} nextMarkerId Mint the owner's next interpolation marker id.
 * @property {Function} isChild Tell whether a value is a child component.
 * @property {Function} sanitize Escape a plain value for HTML.
 * @property {Function} addChild Adopt a child component into the host, returning it to render.
 * @property {Function} recycleMarker The placeholder marker emitted in place of a recycled child.
 * @property {Function} moveChild Move a recycled child onto its placeholder, `(child, parent)`.
 * @property {Function} hydrateChild Hydrate a freshly rendered child, `(child, parent)`.
 * @property {Function} updateChild Queue a recycled child's new props, `(child, props)`.
 * @property {Function} childProps Read the props a discarded candidate carried.
 * @property {Function} destroyChild Destroy a discarded child.
 * @private
 */

/**
 * A bound instance of a parsed template. Pairs the render's `expressions` with its
 * owner's handlers.
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
 * @param {PartialHandlers} owner The handlers of the component this template belongs to.
 * @property {PartialHandlers} host The handlers of the component this partial renders
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
    }

    /**
     * Tell whether a value is another partial: a bound template, which the engine
     * renders, hydrates and updates recursively instead of treating it as content.
     * The check lives here, next to the class, and the slots reach it through their
     * partial — the same way they reach the component-world checks through the
     * owner's handlers.
     * @param {any} value The value to check.
     * @return {boolean} True if the value is a partial.
     * @private
     */
    isPartial(value) {
        return value instanceof Partial;
    }

    /**
     * Tell whether this partial is a container: the whole template is a single
     * interpolation with no surrounding markup (expected to resolve to one
     * component / partial). A container renders without markers and borrows its
     * child's element.
     * @return {boolean} True if the partial is a container.
     */
    isContainer() {
        const { parts } = this.constructor;
        return parts.length === 1 && parts[0] instanceof InterpolationDescriptor;
    }

    /**
     * Render the partial to an HTML string, creating its slot state on first
     * call and assigning each element/interpolation an emission id as it is emitted
     * (so DOM order matches emission order).
     *
     * This is the engine's internal path, the one that carries the render context.
     * The context never crosses a component: a child component is emitted by
     * coercing it to a string, and renders with its own handlers (see `toString`).
     * @param {object} [pass] Reconcile pass threaded through nested partials during
     *     an update, so child components rendered anywhere in the subtree are
     *     matched against the owning slot's previous occupants. Absent on a plain
     *     first render.
     * @return {string} The rendered HTML.
     */
    render(pass) {
        // The slot list is created on the first render: a partial that is synthesized
        // but never rendered (a discarded update candidate) allocates nothing. From
        // then on it is the partial's live view of the skeleton — one slot per part,
        // in document order — so rendering, hydration and updates all walk it and
        // never the skeleton.
        if (!this.slots) this.slots = this.constructor.parts.map(part => new part.constructor.Slot(this, part));
        return this.slots.map(slot => slot.render(pass)).join('');
    }

    /**
     * Render the partial with no reconcile pass, for wherever a string is expected: an
     * interpolated `${partial}`, an array joined into HTML, a fragment parsed from it.
     * @return {string} The rendered HTML.
     */
    toString() {
        return this.render();
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
     * subtree hydrates from one call. Each slot resolves its own nodes; elements and
     * markers are looked up in different scopes, hence the two arguments.
     * @param {Node} parent The node the partial's elements were rendered into.
     * @param {Node} [root] The owning component's root, scoping marker lookup. Passed
     *     down to nested partials; defaults to this partial's own root (its first
     *     element, or `parent` for a container, which has no root of its own).
     * @param {boolean} [fresh=true] Whether this is a brand-new subtree, in which case
     *     the child components in the slots are hydrated too. False during an update's
     *     slot replacement, where the reconcile pass hydrates new children and moves
     *     recycled ones, so only structural refs are set here.
     */
    hydrate(parent, root, fresh = true) {
        // Three passes, in this order. The element refs must all be resolved before any
        // marker is looked up, since `root` comes from the first of them and an
        // interpolation can precede it in the document. The values are then hydrated in
        // a pass of their own, because hydrating one runs the user's `onHydrate`, which
        // may move nodes and break a marker lookup still pending.
        this.eachSlot(ElementSlot, slot => slot.hydrateRef(parent));
        if (!root) root = this.isContainer() ? parent : this.firstSlot(ElementSlot).ref;
        // Containers render without markers, so there is nothing to locate here.
        if (!this.isContainer()) this.eachSlot(InterpolationSlot, slot => slot.hydrateMarkers(root));
        this.eachSlot(InterpolationSlot, slot => slot.hydrateOccupant(parent, root, fresh));
    }

    /**
     * The root DOM element this partial resolves to: its first element, or, for a
     * container, the element of whatever its single slot resolves to (recursively
     * descending nested partials).
     * @return {Node} The root element.
     */
    rootElement() {
        if (!this.isContainer()) return this.firstSlot(ElementSlot).ref;
        // A container is a single interpolation, so its slot is the first one.
        return this.slotElement(this.slots[0].previous);
    }

    /**
     * Resolve the root element of a container's slot value, descending through a
     * nested partial or the first item of an array.
     * @param {any} value The slot value.
     * @return {Node} The resolved element.
     * @private
     */
    slotElement(value) {
        if (this.isPartial(value)) return value.rootElement();
        if (Array.isArray(value)) return this.slotElement(value[0]);
        // A child component: its own element.
        return value.el;
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
