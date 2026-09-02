import Constants from './Constants.js';
import SafeHTML from './SafeHTML.js';
import isComponent from './isComponent.js';
import __DEV__ from '../utils/dev.js';
import warnTemplate from '../utils/warnTemplate.js';
import findComment from '../utils/findComment.js';
import parseHTML from '../utils/parseHTML.js';

/**
 * Tell whether a previous child can be recycled for a candidate: keyed children
 * match by key, unkeyed children by constructor (type).
 * @param {object} prev The previous child.
 * @param {object} candidate The candidate child.
 * @return {boolean} True if `prev` can be recycled.
 * @private
 */
const canRecycle = (prev, candidate) => {
    if (candidate.key != null || prev.key != null) return prev.key === candidate.key;
    return prev.constructor === candidate.constructor;
};

/**
 * Resolve the child component a list item stands for, seeing through transparent
 * partials, which contribute no node of their own. Development only.
 * @param {Partial} partial The partial holding the list.
 * @param {any} value The list item.
 * @return {object|null} The child component, or `null` when the item is not one.
 * @private
 */
const listItemChild = (partial, value) => {
    if (!partial.isPartial(value)) return partial.owner.isChild(value) ? value : null;
    if (!value.isTransparent() || !value.slots) return null;
    return listItemChild(partial, value.slots[0].previous);
};

/**
 * Print a warning about one interpolation, resolving its expression off the slot's
 * descriptor (see `warnTemplate`). Development only.
 * @param {InterpolationSlot} slot The slot the warning is about.
 * @param {string} message The warning message.
 * @private
 */
const warn = (slot, message) => {
    const { source } = slot.partial.constructor;
    const expression = source && source.expressions[slot.descriptor.expressionIndex];
    warnTemplate(slot.partial.constructor, slot.descriptor, expression, message);
};

/**
 * Warn about list items that cannot keep their identity across updates. A list is the
 * one place where a child changes position among its siblings, and a key is what
 * identifies it there: an item that is not a keyed component is regenerated on every
 * update, and two items sharing a key cannot both be recycled. Plain values are exempt
 * — a text has no identity to declare. Development only.
 * @param {InterpolationSlot} slot The slot rendering the list.
 * @param {Array<any>} items The rendered list.
 * @private
 */
const checkListItems = (slot, items) => {
    const { partial, descriptor } = slot;
    if (descriptor.warned) return;
    const keys = new Set();
    let unstable = false;
    let duplicated = null;
    const visit = value => {
        if (Array.isArray(value)) return value.forEach(visit);
        // Anything that is not a partial or a child renders as content, not as
        // something with an identity of its own.
        if (!partial.isPartial(value) && !partial.owner.isChild(value)) return;
        const child = listItemChild(partial, value);
        if (!child || child.key == null) unstable = true;
        else if (keys.has(child.key)) duplicated = child.key;
        else keys.add(child.key);
    };
    items.forEach(visit);
    if (unstable) warn(slot,
        'List items must be keyed components\n' +
        'An item that is not a keyed component is regenerated on every update, losing\n' +
        'its state and its DOM nodes. Make the item itself a keyed component:\n' +
        '\n' +
        '  items.map(item => partial`<${Row} key="${item.id}" />`)'
    );
    else if (duplicated != null) warn(slot,
        `Duplicate key "${duplicated}" in a list\n` +
        'Keys identify an item among its siblings, so two items sharing one cannot\n' +
        'both be recycled. Give each item a key of its own.'
    );
};

/**
 * The live state of one interpolation, paired by position with the
 * `InterpolationDescriptor` it renders from. It holds the emission id assigned when
 * the interpolation is written out, the comment markers hydration resolves that id
 * to, and the value currently occupying the slot.
 *
 * It also carries the reconciliation of that region, which is the engine's core
 * algorithm: an interpolation can resolve to anything — a primitive, a nested
 * partial, a child component, an array of them — so an update either updates a
 * retained partial in place, recycles a retained child, or regenerates the content
 * and patches the DOM between the markers. Recycling is slot-local: a candidate only
 * matches against the children this slot held before.
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
     * Resolve the slot's value by evaluating its expression in the owner's context.
     * `ComponentSlot` overrides this to synthesize a child component instead, so the
     * rest of the algorithm never has to tell the two apart.
     * @return {any} The resolved value.
     * @private
     */
    evaluate() {
        const { partial, descriptor } = this;
        return partial.owner.evaluate(partial.expressions[descriptor.expressionIndex], 'interpolation');
    }

    /**
     * Render the interpolation: its value wrapped between comment markers, except in an
     * anchored partial, which is marker-less and stands on its component's element.
     * Records the value as the slot's occupant for the next render's reconciliation.
     * @param {object} [pass] Reconcile pass (see `Partial#render`).
     * @return {string} The rendered HTML.
     */
    render(pass) {
        const { partial } = this;
        if (this.id == null) this.id = partial.owner.nextMarkerId();
        const value = this.evaluate();
        this.previous = value;
        const rendered = this.renderValue(value, pass);
        if (partial.isAnchored()) return rendered;
        return `<!--${Constants.MARKER_START(this.id)}-->${rendered}<!--${Constants.MARKER_END(this.id)}-->`;
    }

    /**
     * Render a dynamic value to a string. Handles the engine's own types
     * (`SafeHTML`, nested `Partial`, arrays); a child component is added to the host
     * (matched against the pass's previous occupants during an update); any other
     * value is sanitized.
     * @param {any} value The value to render.
     * @param {object} [pass] Reconcile pass (see `Partial#render`).
     * @return {string} The rendered HTML.
     * @private
     */
    renderValue(value, pass) {
        if (value == null || value === false || value === true) return '';
        if (value instanceof SafeHTML) return `${value}`;
        if (this.partial.isPartial(value)) {
            // A nested partial renders under the same host as the partial holding it.
            value.host = this.partial.host;
            return value.render(pass);
        }
        if (Array.isArray(value)) {
            const rendered = value.map(item => this.renderValue(item, pass)).join('');
            // Checked after rendering, when the items have resolved their own occupants.
            if (__DEV__) checkListItems(this, value);
            return rendered;
        }
        return this.renderChild(value, pass);
    }

    /**
     * Render a leaf value that is either a child component or a primitive. During
     * an update (a `pass` is present) a child is matched against the slot's
     * previous occupants: a match is recycled (its placeholder marker is emitted
     * and its real nodes are moved into place later), otherwise it is a new child.
     * A primitive is sanitized.
     * @param {any} value The leaf value.
     * @param {object} [pass] Reconcile pass (see `Partial#render`).
     * @return {string} The rendered HTML.
     * @private
     */
    renderChild(value, pass) {
        const { owner, host } = this.partial;
        if (!owner.isChild(value)) return owner.sanitize(value);
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
     * @param {object} pass Reconcile pass holding `previous` and `used`.
     * @return {object|null} The claimed previous child, or `null`.
     * @private
     */
    claimRecyclable(candidate, pass) {
        for (let i = 0; i < pass.previous.length; i++) {
            const prev = pass.previous[i];
            if (pass.used.has(prev)) continue;
            if (canRecycle(prev, candidate)) {
                pass.used.add(prev);
                return prev;
            }
        }
        return null;
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
     * Recurse hydration into the slot's occupant (see `hydrateValue`).
     * @param {Node} parent The node the elements were rendered into.
     * @param {Node} root The owning component's root, scoping marker lookup.
     * @param {boolean} [fresh=true] Hydrate child components too (see `Partial#hydrate`).
     */
    hydrateOccupant(parent, root, fresh = true) {
        this.hydrateValue(this.previous, parent, root, fresh);
    }

    /**
     * Recurse hydration into a value: a nested partial hydrates its own refs and,
     * on a fresh subtree, a child component is hydrated in place through the owner's
     * handlers; arrays recurse. Primitives carry no refs and are skipped.
     * @param {any} value The value to hydrate.
     * @param {Node} parent The node the elements were rendered into.
     * @param {Node} root The owning component's root, scoping marker lookup.
     * @param {boolean} [fresh=true] Hydrate child components too (see `Partial#hydrate`).
     * @private
     */
    hydrateValue(value, parent, root, fresh = true) {
        const { owner } = this.partial;
        if (this.partial.isPartial(value)) value.hydrate(parent, root, fresh);
        else if (Array.isArray(value)) value.forEach(item => this.hydrateValue(item, parent, root, fresh));
        else if (fresh && owner.isChild(value)) owner.hydrateChild(value, parent);
    }

    /**
     * Reconcile the slot against its previous occupant.
     */
    update() {
        const { partial } = this;
        const value = this.evaluate();
        const prev = this.previous;
        // Retained nested partial: same call site → update in place, recursively. Every
        // partial has somewhere to patch: its own markers, or, when anchored, the
        // element of the component it renders.
        if (partial.isPartial(value) && partial.isPartial(prev) && value.constructor === prev.constructor) {
            prev.update(value.expressions);
            return;
        }
        // Retained single child: same key/type → recycle in place, without moving the DOM.
        if (partial.owner.isChild(value) && partial.owner.isChild(prev) && canRecycle(prev, value)) {
            this.recycleInPlace(prev, value);
            return;
        }
        // Anything else: regenerate the slot's content and patch the DOM. An anchored
        // partial has no markers, so its content is placed on its current element.
        if (partial.isAnchored()) this.replaceAnchored(value);
        else this.replaceSlot(value);
    }

    /**
     * Recycle a retained single child without moving its DOM: re-register it,
     * run its recycle hook, queue its new props, and discard the freshly
     * synthesized candidate.
     * @param {object} prev The retained child (kept).
     * @param {object} next The candidate child (discarded).
     * @private
     */
    recycleInPlace(prev, next) {
        const { host } = this.partial;
        host.addChild(prev);
        host.moveChild(prev, null);
        host.updateChild(prev, host.childProps(next));
        host.destroyChild(next);
    }

    /**
     * Regenerate the slot's content and patch it between its markers: render the new
     * value (recycling matched children, mounting new ones), insert the fragment,
     * then move recycled children into place, hydrate new children and nested
     * partials, and reconcile props.
     * @param {any} value The new value.
     * @private
     */
    replaceSlot(value) {
        const pass = this.makePass(value);
        const fragment = parseHTML(this.renderValue(value, pass));
        const parent = this.ref[1].parentNode;

        this.patchMarkers(fragment, () => this.placeChildren(pass, value, parent));

        this.finishPass(pass);
        this.previous = this.resolvePrevious(value, pass);
    }

    /**
     * Regenerate an anchored partial's single slot and swap it for the current
     * element. Such a partial has no markers, so its content stands on that element
     * (which can be moved around the DOM by hand); the new content replaces it in
     * place.
     * @param {any} value The new value.
     * @private
     */
    replaceAnchored(value) {
        const element = this.partial.rootElement();
        const parent = element.parentNode;
        const pass = this.makePass(value);
        const fragment = parseHTML(this.renderValue(value, pass));

        const divider = document.createComment('');
        parent.insertBefore(divider, element.nextSibling);
        parent.insertBefore(fragment, divider.nextSibling);

        this.placeChildren(pass, value, parent);

        if (element.nextSibling === divider) parent.removeChild(element);
        parent.removeChild(divider);

        this.finishPass(pass);
        this.previous = this.resolvePrevious(value, pass);
    }

    /**
     * Insert a fresh fragment between the slot's markers, run the handler to place
     * child components, then remove the old content.
     * @param {DocumentFragment} fragment The new content.
     * @param {Function} handleChildren Places recycled / new children in the fragment.
     * @private
     */
    patchMarkers(fragment, handleChildren) {
        const [start, end] = this.ref;
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
     * Build a reconcile pass. Its pool is seeded only when the new value is a list:
     * that is the one case where a child changes position among its siblings and has
     * to be carried over to the regenerated content. Anywhere else an occupant is
     * either retained in place (see `update`) or mounted anew, so there is nothing to
     * claim.
     * @param {any} value The new value.
     * @return {object} The reconcile pass.
     * @private
     */
    makePass(value) {
        return {
            previous : Array.isArray(value) ? this.collectChildren(this.previous) : [],
            used : new Set(),
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
     * @private
     */
    placeChildren(pass, value, parent) {
        const { host } = this.partial;
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
     * @private
     */
    finishPass(pass) {
        const { host } = this.partial;
        pass.recycled.forEach(([found, discarded]) => {
            host.updateChild(found, host.childProps(discarded));
            host.destroyChild(discarded);
        });
    }

    /**
     * Collect the keyed child components a value mounted, descending through
     * transparent (container) partials and arrays. Used to build the slot-local pool
     * of recyclable children: in a list a key is what identifies a child among its
     * siblings, so an unkeyed one has no identity to be claimed by.
     * @param {any} value The value.
     * @return {Array<object>} The keyed child components.
     * @private
     */
    collectChildren(value) {
        if (Array.isArray(value)) return value.reduce((out, item) => out.concat(this.collectChildren(item)), []);
        if (this.partial.isPartial(value)) {
            if (value.isTransparent()) return this.collectChildren(value.slots[0].previous);
            return [];
        }
        if (this.partial.owner.isChild(value) && value.key != null) return [value];
        return [];
    }

    /**
     * Resolve the live occupants the slot must remember for the next render. Each
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
     * @param {any} value The value.
     * @param {Map} retained Map from candidate child to retained instance.
     * @return {any} The resolved value.
     * @private
     */
    resolveOccupant(value, retained) {
        if (Array.isArray(value)) return value.map(item => this.resolveOccupant(item, retained));
        if (this.partial.isPartial(value)) {
            if (value.isTransparent()) return this.resolveOccupant(value.slots[0].previous, retained);
            return value;
        }
        if (this.partial.owner.isChild(value)) return retained.get(value) || value;
        return value;
    }
}

export default InterpolationSlot;
