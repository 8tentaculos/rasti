import SafeHTML from './SafeHTML.js';
import Constants from './Constants.js';
import ElementDescriptor from './ElementDescriptor.js';
import InterpolationDescriptor from './InterpolationDescriptor.js';
import ComponentDescriptor from './ComponentDescriptor.js';
import RawExpression from './RawExpression.js';
import parseTemplate from './parseTemplate.js';
import isComponent from './isComponent.js';
import getAttributesHTML from '../utils/getAttributesHTML.js';
import getAttributesDiff from '../utils/getAttributesDiff.js';
import parseHTML from '../utils/parseHTML.js';
import findComment from '../utils/findComment.js';

const SYNC_PROPS = ['value', 'checked', 'selected'];

/**
 * Expand events. Delegates listener registration and the event data-attribute to
 * the owner through `registerListener`.
 * @param {object} attributes Attributes object.
 * @param {PartialHandlers} owner The partial's owner.
 * @return {object} Attributes object.
 * @private
 */
const expandEvents = (attributes, owner) => {
    const out = {};
    Object.keys(attributes).forEach(key => {
        // Check if key is an event listener.
        const match = key.match(/on(([A-Z]{1}[a-z]+)+)/);

        if (match && match[1]) {
            const type = match[1].toLowerCase();
            const listener = attributes[key];
            if (listener) {
                const { attr, index } = owner.registerListener(listener, type);
                // Add event listener index under its data-attribute.
                out[attr] = index;
            }
        } else {
            // Add attribute.
            out[key] = attributes[key];
        }
    });
    return out;
};

/**
 * Tell whether a previous child can be recycled for a candidate: keyed children
 * match by key, unkeyed children by constructor (type).
 * @param {object} prev The previous child.
 * @param {object} candidate The candidate child.
 * @param {boolean} [allowUnkeyed=true] Whether unkeyed children may match. False for
 *     the children of a user array, where position carries no identity.
 * @return {boolean} True if `prev` can be recycled.
 * @private
 */
const canRecycle = (prev, candidate, allowUnkeyed = true) => {
    if (candidate.key != null || prev.key != null) return prev.key === candidate.key;
    return allowUnkeyed && prev.constructor === candidate.constructor;
};

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
 * @property {Function} registerListener Register an event listener, `(listener, type) => ({ attr, index })`.
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
 * per call site with the skeleton (`parts`, `elements`, `interpolations`) baked
 * as statics, so two partials from the same call site share one class and are
 * reconciled by `constructor` — the same identity mechanism as components. The
 * same class backs a component's root template and every nested `partial`, so
 * rendering is uniformly recursive: a slot that holds a partial updates it in
 * place, a slot that holds a child component recycles it. Per-render state (ids,
 * refs, previous attributes, slot occupants) is kept as plain objects on the
 * instance, materialized lazily on the first `toString`.
 *
 * @param {Array<any>} expressions The current render expressions.
 * @param {PartialHandlers} owner The handlers of the component this template belongs to.
 * @private
 */
class Partial {
    constructor(expressions, owner) {
        this.expressions = expressions;
        this.owner = owner;
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
     * Materialize the per-render state objects for elements and interpolations,
     * aligned with the skeleton tables.
     * @private
     */
    materialize() {
        this.elementState = this.constructor.elements.map(() => ({}));
        this.interpolationState = this.constructor.interpolations.map(() => ({}));
    }

    /**
     * Render the partial to an HTML string, materializing its state on first call
     * and assigning each element/interpolation an emission id as it is emitted (so
     * DOM order matches emission order).
     * @param {PartialHandlers} [host] Handlers of the component currently rendering (the
     *     one whose `children` the rendered child components join). Defaults to this
     *     partial's own owner; propagated unchanged into nested partials, so slotted
     *     content adds its children to the host that renders it.
     * @param {object} [pass] Reconcile pass threaded through nested partials during
     *     an update, so child components rendered anywhere in the subtree are
     *     matched against the owning slot's previous occupants. Absent on a plain
     *     first render.
     * @return {string} The rendered HTML.
     */
    toString(host = this.owner, pass) {
        if (!this.elementState) this.materialize();
        return this.constructor.parts.map(part => this.renderPart(part, host, pass)).join('');
    }

    /**
     * Render a single skeleton part (literal, element or interpolation).
     * @param {SafeHTML|ElementDescriptor|InterpolationDescriptor} part The part.
     * @param {PartialHandlers} host Handlers of the component rendering (see `toString`).
     * @param {object} [pass] Reconcile pass (see `toString`).
     * @return {string} The rendered HTML.
     * @private
     */
    renderPart(part, host, pass) {
        if (part instanceof SafeHTML) return `${part}`;
        if (part instanceof ElementDescriptor) return this.renderElement(part);
        if (part instanceof RawExpression) return this.owner.sanitize(this.owner.evaluate(this.expressions[part.exprIndex], 'dynamic tag'));
        return this.renderInterpolation(part, host, pass);
    }

    /**
     * Render an element's opening attributes, assigning its emission id and
     * capturing the initial attributes for later diffing.
     * @param {ElementDescriptor} descriptor The element descriptor.
     * @return {string} The attributes HTML.
     * @private
     */
    renderElement(descriptor) {
        const state = this.elementState[descriptor.slotIndex];
        if (state.id == null) state.id = this.owner.nextElementId();
        const attributes = this.buildAttributes(descriptor.attrs);
        // Root treatment: the component's root element (emitted first, id ending
        // in `-1`) merges the owner's `attributes`. Only the root partial carries
        // `rootAttributes`; nested partials never do.
        if (this.rootAttributes && /-1$/.test(state.id)) Object.assign(attributes, this.rootAttributes());
        attributes[Constants.ATTRIBUTE_ELEMENT] = state.id;
        state.previousAttributes = attributes;
        return getAttributesHTML(attributes);
    }

    /**
     * Render an interpolation: its value wrapped between comment markers, except
     * in a container, which is marker-less and anchored to its element. Records
     * the value as the slot's occupant for the next render's reconciliation.
     * @param {InterpolationDescriptor} descriptor The interpolation descriptor.
     * @param {PartialHandlers} host Handlers of the component rendering (see `toString`).
     * @param {object} [pass] Reconcile pass (see `toString`).
     * @return {string} The rendered HTML.
     * @private
     */
    renderInterpolation(descriptor, host, pass) {
        const state = this.interpolationState[descriptor.slotIndex];
        if (state.id == null) state.id = this.owner.nextMarkerId();
        const value = this.evaluate(descriptor);
        state.previous = value;
        const rendered = this.renderValue(value, host, pass);
        if (this.isContainer()) return rendered;
        return `<!--${Constants.MARKER_START(state.id)}-->${rendered}<!--${Constants.MARKER_END(state.id)}-->`;
    }

    /**
     * Resolve an interpolation's value. A component tag synthesizes a `mount` from
     * its descriptor (evaluating attributes and slotted children in this owner's
     * context); a plain interpolation evaluates its expression.
     * @param {InterpolationDescriptor} descriptor The interpolation descriptor.
     * @return {any} The resolved value.
     * @private
     */
    evaluate(descriptor) {
        if (descriptor instanceof ComponentDescriptor) return this.mountComponent(descriptor);
        return this.owner.evaluate(this.expressions[descriptor.exprIndex], 'interpolation');
    }

    /**
     * Synthesize a child component from a component-tag descriptor. Attributes and
     * slotted inner content are evaluated in this partial's own context: the inner
     * content is wrapped as a nested partial that shares this partial's expressions
     * and owner, so its events belong to that owner, not to the mounted child.
     * @param {ComponentDescriptor} descriptor The component-tag descriptor.
     * @return {object} The mounted child component.
     * @private
     */
    mountComponent(descriptor) {
        const tag = this.expressions[descriptor.tagIndex];
        const childOptions = {};
        descriptor.attrs.forEach(attr => attr.applyTo(childOptions, this.expressions, this.owner));
        if (descriptor.inner) {
            const InnerPartial = Partial.fromSkeleton(descriptor.inner);
            // Slotted content is evaluated in this partial's context (its expressions and
            // events belong to this owner), so the inner partial shares the same owner.
            // Its child components, however, become children of whichever component
            // renders it (the host), threaded as `host` at render time.
            childOptions.renderChildren = () => new InnerPartial(this.expressions, this.owner);
        }
        return tag.mount(childOptions);
    }

    /**
     * Render a dynamic value to a string. Handles the engine's own types
     * (`SafeHTML`, nested `Partial`, arrays); a child component is added to the host
     * (matched against the pass's previous occupants during an update); any other
     * value is sanitized.
     * @param {any} value The value to render.
     * @param {PartialHandlers} host Handlers of the component rendering (see `toString`).
     * @param {object} [pass] Reconcile pass (see `toString`).
     * @return {string} The rendered HTML.
     * @private
     */
    renderValue(value, host, pass) {
        if (value == null || value === false || value === true) return '';
        if (value instanceof SafeHTML) return `${value}`;
        if (value instanceof Partial) return value.toString(host, pass);
        if (Array.isArray(value)) return value.map(item => this.renderValue(item, host, pass)).join('');
        return this.renderChild(value, host, pass);
    }

    /**
     * Render a leaf value that is either a child component or a primitive. During
     * an update (a `pass` is present) a child is matched against the slot's
     * previous occupants: a match is recycled (its placeholder marker is emitted
     * and its real nodes are moved into place later), otherwise it is a new child.
     * A primitive is sanitized.
     * @param {any} value The leaf value.
     * @param {PartialHandlers} host Handlers of the component rendering (see `toString`).
     * @param {object} [pass] Reconcile pass (see `toString`).
     * @return {string} The rendered HTML.
     * @private
     */
    renderChild(value, host, pass) {
        if (!this.owner.isChild(value)) return this.owner.sanitize(value);
        if (pass) {
            const found = this.claimRecyclable(value, pass);
            if (found) {
                host.addChild(found);
                pass.recycled.push([found, value]);
                return `<!--${host.recycleMarker(found)}-->`;
            }
            pass.next.push(value);
        }
        return `${host.addChild(value)}`;
    }

    /**
     * Claim a recyclable previous occupant for a candidate child: the first one the
     * pass has not handed out yet (see `canRecycle`), marked as used so no other
     * candidate takes it. Claiming is slot-local: it only considers this slot's own
     * previous occupants.
     * @param {object} candidate The candidate child component.
     * @param {object} pass Reconcile pass holding `previous`, `used` and `allowUnkeyed`.
     * @return {object|null} The claimed previous child, or `null`.
     * @private
     */
    claimRecyclable(candidate, pass) {
        for (let i = 0; i < pass.previous.length; i++) {
            const prev = pass.previous[i];
            if (pass.used.has(prev)) continue;
            if (canRecycle(prev, candidate, pass.allowUnkeyed)) {
                pass.used.add(prev);
                return prev;
            }
        }
        return null;
    }

    /**
     * Build the attributes object for an element from its `Attribute` descriptors,
     * resolving each against the current expressions and expanding events.
     * @param {Array<Attribute>} attrs Attribute descriptors.
     * @return {object} Attributes object (without the emission id).
     * @private
     */
    buildAttributes(attrs) {
        const attributes = {};
        attrs.forEach(attr => attr.applyTo(attributes, this.expressions, this.owner));
        return expandEvents(attributes, this.owner);
    }

    /**
     * Attach the partial's state to the rendered DOM and recurse into its slots: the
     * nested partials and, on a fresh hydrate, the child components they hold — so a
     * whole new subtree hydrates from one call. Elements and markers use different
     * scopes: elements carry unique, deterministic ids and are located anywhere under
     * `parent` (including a component root, which cannot be found within itself);
     * markers are located by a structural traversal that skips nested component
     * subtrees, so they must be scoped within the owning component's root.
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
        if (!this.elementState) this.materialize();
        this.elementState.forEach(state => {
            state.ref = parent.querySelector(`[${Constants.ATTRIBUTE_ELEMENT}="${state.id}"]`);
        });
        if (!root) root = this.isContainer() ? parent : this.elementState[0].ref;
        // Containers render without markers, so there is nothing to locate here.
        if (!this.isContainer()) {
            this.interpolationState.forEach(state => {
                const start = findComment(root, Constants.MARKER_START(state.id), isComponent);
                const end = findComment(root, Constants.MARKER_END(state.id), isComponent, start);
                state.ref = [start, end];
            });
        }
        this.interpolationState.forEach(state => this.hydrateValue(state.previous, parent, root, fresh));
    }

    /**
     * Recurse hydration into a slot value: a nested partial hydrates its own refs and,
     * on a fresh subtree, a child component is hydrated in place through the owner's
     * handlers; arrays recurse. Primitives carry no refs and are skipped.
     * @param {any} value The slot value.
     * @param {Node} parent The node the elements were rendered into.
     * @param {Node} root The owning component's root, scoping marker lookup.
     * @param {boolean} [fresh=true] Hydrate child components too (see `hydrate`).
     * @private
     */
    hydrateValue(value, parent, root, fresh = true) {
        if (value instanceof Partial) value.hydrate(parent, root, fresh);
        else if (Array.isArray(value)) value.forEach(item => this.hydrateValue(item, parent, root, fresh));
        else if (fresh && this.owner.isChild(value)) this.owner.hydrateChild(value, parent);
    }

    /**
     * The root DOM element this partial resolves to: its first element, or, for a
     * container, the element of whatever its single slot resolves to (recursively
     * descending nested partials).
     * @return {Node} The root element.
     */
    rootElement() {
        if (!this.isContainer()) return this.elementState[0].ref;
        return this.slotElement(this.interpolationState[0].previous);
    }

    /**
     * Resolve the root element of a container's slot value, descending through a
     * nested partial or the first item of an array.
     * @param {any} value The slot value.
     * @return {Node} The resolved element.
     * @private
     */
    slotElement(value) {
        if (value instanceof Partial) return value.rootElement();
        if (Array.isArray(value)) return this.slotElement(value[0]);
        // A child component: its own element.
        return value.el;
    }

    /**
     * Swap in a new set of expressions and patch in place: reconcile every
     * interpolation (child recycle / nested-partial update / content replace) and
     * diff every element's attributes.
     * @param {Array<any>} expressions The new render expressions.
     * @param {PartialHandlers} [host] Handlers of the component rendering (see
     *     `toString`). Defaults to this partial's own owner.
     */
    update(expressions, host = this.owner) {
        this.expressions = expressions;
        this.constructor.interpolations.forEach(descriptor => this.updateInterpolation(descriptor, host));
        this.constructor.elements.forEach(descriptor => this.updateElement(descriptor));
    }

    /**
     * Reconcile one interpolation against its previous occupant.
     * @param {InterpolationDescriptor} descriptor The interpolation descriptor.
     * @param {PartialHandlers} host Handlers of the component rendering (see `toString`).
     * @private
     */
    updateInterpolation(descriptor, host) {
        const state = this.interpolationState[descriptor.slotIndex];
        const value = this.evaluate(descriptor);
        const prev = state.previous;
        // Retained nested partial with its own structure (and markers): same call site
        // → update in place, recursively. A transparent (container) partial has no
        // markers of its own, so it is re-rendered by this slot instead (below), which
        // still recycles the single component it may wrap.
        if (value instanceof Partial && prev instanceof Partial && value.constructor === prev.constructor && !value.isContainer()) {
            prev.update(value.expressions, host);
            return;
        }
        // Retained single child: same key/type → recycle in place, without moving the DOM.
        if (this.owner.isChild(value) && this.owner.isChild(prev) && canRecycle(prev, value)) {
            this.recycleInPlace(prev, value, host);
            return;
        }
        // Anything else: regenerate the slot's content and patch the DOM. A container
        // has no markers, so its content is anchored to its current element instead.
        if (this.isContainer()) this.replaceContainer(state, value, host);
        else this.replaceSlot(state, value, host);
    }

    /**
     * Recycle a retained single child without moving its DOM: re-register it,
     * run its recycle hook, queue its new props, and discard the freshly
     * synthesized candidate.
     * @param {object} prev The retained child (kept).
     * @param {object} next The candidate child (discarded).
     * @param {PartialHandlers} host Handlers of the component rendering (see `toString`).
     * @private
     */
    recycleInPlace(prev, next, host) {
        host.addChild(prev);
        host.moveChild(prev, null);
        host.updateChild(prev, host.childProps(next));
        host.destroyChild(next);
    }

    /**
     * Regenerate an interpolation's content and patch it between the slot markers:
     * render the new value (recycling matched children, mounting new ones), insert
     * the fragment, then move recycled children into place, hydrate new children
     * and nested partials, and reconcile props.
     * @param {object} state The interpolation's per-render state.
     * @param {any} value The new value.
     * @param {PartialHandlers} host Handlers of the component rendering (see `toString`).
     * @private
     */
    replaceSlot(state, value, host) {
        const pass = this.makePass(state.previous, value);
        const fragment = parseHTML(this.renderValue(value, host, pass));
        const parent = state.ref[1].parentNode;

        this.patchMarkers(state, fragment, () => this.placeChildren(pass, value, parent, host));

        this.finishPass(pass, host);
        state.previous = this.resolvePrevious(value, pass);
    }

    /**
     * Regenerate a container's single slot and swap it for the current element.
     * A container has no markers, so its content is anchored to its element (which
     * can be moved around the DOM by hand); the new content replaces it in place.
     * @param {object} state The interpolation's per-render state.
     * @param {any} value The new value.
     * @param {PartialHandlers} host Handlers of the component rendering (see `toString`).
     * @private
     */
    replaceContainer(state, value, host) {
        const element = this.rootElement();
        const parent = element.parentNode;
        const pass = this.makePass(state.previous, value);
        const fragment = parseHTML(this.renderValue(value, host, pass));

        const divider = document.createComment('');
        parent.insertBefore(divider, element.nextSibling);
        parent.insertBefore(fragment, divider.nextSibling);

        this.placeChildren(pass, value, parent, host);

        if (element.nextSibling === divider) parent.removeChild(element);
        parent.removeChild(divider);

        this.finishPass(pass, host);
        state.previous = this.resolvePrevious(value, pass);
    }

    /**
     * Build a reconcile pass seeded with a slot's previous children.
     * @param {any} previousValue The slot's previous value.
     * @param {any} value The new value (arrays disable unkeyed recycling).
     * @return {object} The reconcile pass.
     * @private
     */
    makePass(previousValue, value) {
        return {
            previous : this.collectChildren(previousValue),
            used : new Set(),
            allowUnkeyed : !Array.isArray(value),
            recycled : [],
            next : []
        };
    }

    /**
     * Place the pass's children in the freshly inserted content: move recycled
     * ones onto their placeholder markers, hydrate new ones, and hydrate any nested
     * partials.
     * @param {object} pass The reconcile pass.
     * @param {any} value The rendered value.
     * @param {Node} parent The node the content was inserted into.
     * @param {PartialHandlers} host Handlers of the component rendering (see `toString`).
     * @private
     */
    placeChildren(pass, value, parent, host) {
        pass.recycled.forEach(([found]) => host.moveChild(found, parent));
        pass.next.forEach(child => host.hydrateChild(child, parent));
        // Structural pass: set the nested partials' refs, but leave the children to
        // the reconcile above (new ones hydrated, recycled ones moved).
        this.hydrateValue(value, parent, parent, false);
    }

    /**
     * Reconcile props of recycled children and discard the candidates they
     * replaced.
     * @param {object} pass The reconcile pass.
     * @param {PartialHandlers} host Handlers of the component rendering (see `toString`).
     * @private
     */
    finishPass(pass, host) {
        pass.recycled.forEach(([found, discarded]) => {
            host.updateChild(found, host.childProps(discarded));
            host.destroyChild(discarded);
        });
    }

    /**
     * Collect the child components a slot value mounted, descending through
     * transparent (container) partials and arrays. Used to build the slot-local
     * pool of recyclable children.
     * @param {any} value The slot value.
     * @return {Array<object>} The child components.
     * @private
     */
    collectChildren(value) {
        if (Array.isArray(value)) return value.reduce((out, item) => out.concat(this.collectChildren(item)), []);
        if (value instanceof Partial) {
            if (value.isContainer()) return this.collectChildren(value.interpolationState[0].previous);
            return [];
        }
        if (this.owner.isChild(value)) return [value];
        return [];
    }

    /**
     * Resolve the live occupants a slot must remember for the next render. Each
     * recycled candidate is replaced by the retained instance it matched (the
     * candidates are discarded in `finishPass`), and a transparent partial is
     * unwrapped to the child it holds. Without this the slot would remember the
     * freshly synthesized candidates, and the next render would match its
     * candidates against those dead instances.
     * @param {any} value The rendered value (holding the candidates).
     * @param {object} pass The reconcile pass (holds the recycled pairs).
     * @return {any} The value with candidates replaced by retained instances.
     * @private
     */
    resolvePrevious(value, pass) {
        const retained = new Map(pass.recycled.map(([found, candidate]) => [candidate, found]));
        return this.resolveOccupant(value, retained);
    }

    /**
     * Replace recycled candidates with their retained instances within a value,
     * descending arrays and unwrapping transparent partials to the child they wrap
     * (the only occupant they contribute to the pool).
     * @param {any} value The slot value.
     * @param {Map} retained Map from candidate child to retained instance.
     * @return {any} The resolved value.
     * @private
     */
    resolveOccupant(value, retained) {
        if (Array.isArray(value)) return value.map(item => this.resolveOccupant(item, retained));
        if (value instanceof Partial) {
            if (value.isContainer()) return this.resolveOccupant(value.interpolationState[0].previous, retained);
            return value;
        }
        if (this.owner.isChild(value)) return retained.get(value) || value;
        return value;
    }

    /**
     * Insert a fresh fragment between the slot's markers, run the handler to place
     * child components, then remove the old content.
     * @param {object} state The interpolation's per-render state (`ref` is `[start, end]`).
     * @param {DocumentFragment} fragment The new content.
     * @param {Function} handleChildren Places recycled / new children in the fragment.
     * @private
     */
    patchMarkers(state, fragment, handleChildren) {
        const [start, end] = state.ref;
        let divider;
        if (start.nextSibling === end) {
            // The slot is empty: insert directly before the end marker.
            end.parentNode.insertBefore(fragment, end);
        } else {
            // Insert a divider so the old content can be removed after the children are placed.
            divider = document.createComment('');
            end.parentNode.insertBefore(divider, end);
            end.parentNode.insertBefore(fragment, end);
        }
        handleChildren();
        if (divider) {
            if (start.nextSibling === divider) {
                divider.parentNode.removeChild(divider);
            } else {
                const range = document.createRange();
                range.setStartAfter(start);
                range.setEndAfter(divider);
                range.deleteContents();
            }
        }
    }

    /**
     * Diff and patch one element's attributes against the swapped expressions.
     * @param {ElementDescriptor} descriptor The element descriptor.
     * @private
     */
    updateElement(descriptor) {
        const state = this.elementState[descriptor.slotIndex];
        const attributes = this.buildAttributes(descriptor.attrs);
        attributes[Constants.ATTRIBUTE_ELEMENT] = state.id;
        const { remove, add } = getAttributesDiff(attributes, state.previousAttributes);
        state.previousAttributes = attributes;
        // Remove attributes first so later `setAttribute` overrides if needed.
        remove.forEach(attr => {
            state.ref.removeAttribute(attr);
            if (SYNC_PROPS.indexOf(attr) !== -1 && attr in state.ref) {
                state.ref[attr] = attr === 'value' ? '' : false;
            }
        });
        // Add / update attributes.
        Object.keys(add).forEach(attr => {
            const value = add[attr];
            state.ref.setAttribute(attr, value);
            if (SYNC_PROPS.indexOf(attr) !== -1 && attr in state.ref) {
                state.ref[attr] = attr === 'value' ? value : value !== false && value !== 'false';
            }
        });
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
     * @param {{ parts: Array, elements: Array, interpolations: Array }} skeleton Skeleton data.
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
