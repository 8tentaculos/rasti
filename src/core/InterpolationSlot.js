import Slot from './Slot.js';
import Constants from './Constants.js';
import SafeHTML from './SafeHTML.js';
import valueToString from './valueToString.js';
import __DEV__ from '../utils/dev.js';
import warnTemplate from '../utils/warnTemplate.js';
import formatTemplateSource from '../utils/formatTemplateSource.js';
import createDevelopmentErrorMessage from '../utils/createDevelopmentErrorMessage.js';
import HydrationIndex from './HydrationIndex.js';
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
 * Resolve what a value stands for, seeing through transparent partials, which
 * contribute no node of their own and resolve to whatever their single slot holds.
 * A partial that is opaque, or that has not rendered and has no slot to look into,
 * stands for itself.
 * @param {Partial} partial The partial holding the value.
 * @param {any} value The value to resolve.
 * @return {any} The value the given one stands for.
 * @private
 */
const unwrap = (partial, value) => {
    if (!partial.isPartial(value) || !value.isTransparent() || !value.slots) return value;
    return unwrap(partial, value.slots[0].content);
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
    const expression = source && source.expressions[slot.descriptor.index];
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
        const child = unwrap(partial, value);
        if (!partial.owner.isChild(child) || child.key == null) unstable = true;
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
 * Tell whether a value resolves to a child component, seeing through transparent
 * partials, which contribute no node of their own. A partial that has not rendered yet
 * has no slot to look into, and is taken as resolvable rather than reported.
 * Development only.
 * @param {Partial} partial The partial holding the value.
 * @param {any} value The value to resolve.
 * @return {boolean} True if the value stands for a child component.
 * @private
 */
const resolvesToChild = (partial, value) => {
    const resolved = unwrap(partial, value);
    // A partial that has not rendered yet stands for itself, but will resolve to
    // whatever its slot holds once it does.
    if (partial.isPartial(resolved)) return resolved.isTransparent() && !resolved.slots;
    return partial.owner.isChild(resolved);
};

/**
 * Reject an anchored slot that resolves to no component. An anchored slot writes no
 * markers of its own: its content stands on the element of the component it renders,
 * so a value that mounts none leaves it with nothing to stand on, and the owning
 * component with no element of its own. A component tag always mounts one, so in
 * practice only a container's root interpolation reaches here with something else.
 * Development only.
 * @param {InterpolationSlot} slot The anchored slot.
 * @param {any} value The resolved value.
 * @private
 */
const checkAnchoredContent = (slot, value) => {
    const { partial, descriptor } = slot;
    if (resolvesToChild(partial, value)) return;
    const { source } = partial.constructor;
    const formattedSource = formatTemplateSource(source, source && source.expressions[descriptor.index], 'This interpolation');
    throw new Error(createDevelopmentErrorMessage(
        'Invalid container template\n' +
        'A component whose template is a single interpolation is a container: it has no\n' +
        'element of its own and stands on the element of the component it renders, so\n' +
        'that interpolation must resolve to a component.\n\n' +
        'Valid examples:\n' +
        '- `${({ state }) => state.open ? Dialog.mount(props) : Empty.mount(props)}`\n' +
        '- `<${MyComponent} />`\n\n' +
        'Invalid examples:\n' +
        '- `${({ partial }) => partial`<div></div>`}`  (markup, not a component)\n' +
        '- `${({ props }) => props.label}`  (a plain value)' +
        (formattedSource ? `\n\nTemplate source:\n\n${formattedSource}` : '')
    ));
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
 * The slot reads the current expressions and the owner off its partial, so
 * only what varies per call travels as an argument.
 * @param {Partial} partial The partial this slot belongs to.
 * @param {InterpolationDescriptor} descriptor The descriptor this slot renders from.
 * @private
 */
class InterpolationSlot extends Slot {
    constructor(partial, descriptor) {
        super(partial, descriptor);
        this.id = null;
        this.ref = null;
        this.content = null;
        this.keyed = null;
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
        return partial.owner.evaluate(partial.expressions[descriptor.index], 'interpolation');
    }

    /**
     * Tell whether the slot is anchored to an element instead of to markers: it writes
     * no markers of its own and patches around the element its content stands on. True
     * inside an anchored partial, which stands on the element of the component it
     * renders; `ComponentSlot` overrides it, since a component tag always resolves to
     * a single component and can stand on its element too.
     * @return {boolean} True if the slot is anchored to an element.
     * @private
     */
    isAnchored() {
        return this.partial.isAnchored();
    }

    /**
     * The element the slot's content currently stands on, around which an anchored
     * slot patches. Only meaningful while the slot is anchored.
     * @return {Node} The anchor element.
     * @private
     */
    anchorElement() {
        return this.partial.rootElement();
    }

    /**
     * Render the interpolation: its value wrapped between comment markers, except when
     * the slot is anchored, in which case it is marker-less and stands on an element.
     * Records the value as the slot's occupant for the next render's reconciliation.
     * @param {object} [pass] Reconcile pass (see `Partial#toString`).
     * @return {string} The rendered HTML.
     */
    toString(pass) {
        const { partial } = this;
        if (this.id == null && !this.isAnchored()) this.id = partial.owner.nextMarkerId();
        const value = this.evaluate();
        this.content = value;
        // A first render carries no pass of its own; a list opens one, to collect the
        // keyed children it mounts (see `render`).
        const rendered = this.render(value, pass || (Array.isArray(value) ? this.makePass() : null));
        // Checked after rendering, once a nested partial has resolved its own content.
        if (__DEV__ && this.isAnchored()) checkAnchoredContent(this, value);
        if (this.isAnchored()) return rendered;
        return `<!--${Constants.MARKER_START(this.id)}-->${rendered}<!--${Constants.MARKER_END(this.id)}-->`;
    }

    /**
     * Render the slot's value, collecting the keyed children of a list as it goes. A
     * list is the one place where a child changes position among its siblings, so the
     * slot remembers the ones it mounted by key, to claim them again on its next
     * render; anywhere else an occupant is either retained in place (see `update`) or
     * mounted anew, and has no key to be found by.
     * @param {any} value The value to render.
     * @param {object} [pass] Reconcile pass (see `Partial#toString`).
     * @return {string} The rendered HTML.
     * @private
     */
    render(value, pass) {
        this.keyed = Array.isArray(value) ? new Map() : null;
        if (!this.keyed) return this.renderValue(value, pass);
        const outer = pass.keyed;
        pass.keyed = this.keyed;
        const rendered = this.renderValue(value, pass);
        // An enclosing list holds the same children, one level up, so it takes them
        // once the nested one is closed: whichever of the two regenerates reconciles
        // against the same children.
        if (outer) this.keyed.forEach((child, key) => outer.set(key, child));
        pass.keyed = outer;
        return rendered;
    }

    /**
     * Render a dynamic value to a string. Handles the engine's own types
     * (`SafeHTML`, nested `Partial`, arrays); a child component is added to the host
     * (matched against the pass's previous occupants during an update); any other
     * value is sanitized. The engine's own types render through `toString`, called
     * directly: only a value with no such contract is coerced (see `valueToString`).
     * @param {any} value The value to render.
     * @param {object} [pass] Reconcile pass (see `Partial#toString`).
     * @return {string} The rendered HTML.
     * @private
     */
    renderValue(value, pass) {
        if (value instanceof SafeHTML) return value.toString();

        if (Array.isArray(value)) {
            const rendered = value.map(item => this.renderValue(item, pass)).join('');
            // Checked after rendering, when the items have resolved their own occupants.
            if (__DEV__) checkListItems(this, value);
            return rendered;
        }

        const { owner, host } = this.partial;

        if (this.partial.isPartial(value)) {
            // A nested partial renders under the same host as the partial holding it.
            value.host = host;
            if (!pass || value.isTransparent()) return value.toString(pass);
            // A partial that contributes markup of its own holds its children in its
            // own interpolations, where they are local: the list being collected
            // neither reaches them nor lends them its own, and only what lands directly
            // in it keeps an identity there. The pass itself still descends: whatever
            // the markup mounts is part of the fragment being placed.
            const { previous, keyed } = pass;
            pass.previous = pass.keyed = null;
            const rendered = value.toString(pass);
            pass.previous = previous;
            pass.keyed = keyed;
            return rendered;
        }

        if (owner.isChild(value)) {
            if (pass) {
                const found = this.claimRecyclable(value, pass);
                if (found) {
                    host.addChild(found);
                    pass.recycled.set(value, found);
                    this.recordKeyed(pass, value.key, found);
                    return `<!--${Constants.MARKER_RECYCLED(found.uid)}-->`;
                }
                this.recordKeyed(pass, value.key, value);
                pass.next.push(value);
            }
            return host.addChild(value).toString();
        }

        return valueToString(value, owner.sanitize);
    }

    /**
     * Claim a recyclable previous occupant for a candidate child: the one the slot held
     * under the candidate's key, taken out of the pool so no other candidate claims it
     * again. Claiming is slot-local: the pool only holds this slot's own previous
     * occupants, and is out of reach inside a partial that contributes markup, whose
     * children are local to it (see `renderValue`).
     * @param {object} candidate The candidate child component.
     * @param {object} pass Reconcile pass holding the pool.
     * @return {object|null} The claimed previous child, or `null`.
     * @private
     */
    claimRecyclable(candidate, pass) {
        if (candidate.key == null || !pass.previous) return null;
        const prev = pass.previous.get(candidate.key);
        if (!prev) return null;
        pass.previous.delete(candidate.key);
        return prev;
    }

    /**
     * Record a child under its key in the list being collected around it (see
     * `render`). An unkeyed child has no identity among its siblings, and outside a
     * list there is nothing collecting: neither is recorded.
     * @param {object} pass The reconcile pass holding the list.
     * @param {any} key The child's key.
     * @param {object} child The child component.
     * @private
     */
    recordKeyed(pass, key, child) {
        if (key != null && pass.keyed) pass.keyed.set(key, child);
    }

    /**
     * Resolve the slot's comment markers out of the hydration index. An anchored slot
     * writes no markers, so there is nothing to locate.
     * @param {HydrationIndex} index The hydration's node index.
     */
    hydrateMarkers(index) {
        if (this.isAnchored()) return;
        this.ref = [index.comment(Constants.MARKER_START(this.id)), index.comment(Constants.MARKER_END(this.id))];
    }

    /**
     * Recurse hydration into the slot's occupant (see `hydrateValue`).
     * @param {HydrationIndex} index The hydration's node index.
     * @param {boolean} [fresh=true] Hydrate child components too (see `Partial#hydrate`).
     */
    hydrateOccupant(index, fresh = true) {
        this.hydrateValue(this.content, index, fresh);
    }

    /**
     * Recurse hydration into a value: a nested partial hydrates its own refs and,
     * on a fresh subtree, a child component is hydrated in place through the owner's
     * handlers; arrays recurse. Primitives carry no refs and are skipped.
     *
     * A child component hydrates from the same index: its nodes were written out by
     * the same render, so they are already in it.
     * @param {any} value The value to hydrate.
     * @param {HydrationIndex} index The hydration's node index.
     * @param {boolean} [fresh=true] Hydrate child components too (see `Partial#hydrate`).
     * @private
     */
    hydrateValue(value, index, fresh = true) {
        const { owner } = this.partial;
        if (this.partial.isPartial(value)) value.hydrate(index, fresh);
        else if (Array.isArray(value)) value.forEach(item => this.hydrateValue(item, index, fresh));
        else if (fresh && owner.isChild(value)) owner.hydrateChild(value, index);
    }

    /**
     * Reconcile the slot against its previous occupant.
     */
    update() {
        const { partial } = this;
        const value = this.evaluate();
        if (__DEV__ && this.isAnchored()) checkAnchoredContent(this, value);
        const prev = this.content;
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
        // Anything else: regenerate the slot's content and patch the DOM.
        this.regenerate(value);
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
     * Regenerate the slot's content: render the new value (recycling matched
     * children, mounting new ones), place the fragment, then hydrate and
     * reconcile props. Placement is the only fork — markers vs the anchored
     * element's parent.
     * @param {any} value The new value.
     * @private
     */
    regenerate(value) {
        const pass = this.makePass(this.keyed);
        const fragment = parseHTML(this.render(value, pass));
        // Indexed before the fragment is inserted, so the walk covers the new content
        // alone: it answers both for the placeholders of the recycled children and for
        // the refs of everything mounted anew.
        pass.index = new HydrationIndex(fragment);
        if (this.isAnchored()) this.placeAnchored(fragment, pass, value);
        else this.placeBetweenMarkers(fragment, pass, value);
        this.finishPass(pass);
        // A recycled candidate is discarded in `finishPass`, so the slot remembers the
        // retained instance it matched instead: the next update reconciles against a
        // live occupant. A list is never read back — it reconciles through the keyed
        // pool, not through the occupant — so only a single child is resolved.
        this.content = pass.recycled.get(value) || value;
    }

    /**
     * Place a fresh fragment between the slot's markers, put the pass's children in
     * it, and remove the old content once they are in place.
     * @param {DocumentFragment} fragment The new content.
     * @param {object} pass The reconcile pass.
     * @param {any} value The rendered value.
     * @private
     */
    placeBetweenMarkers(fragment, pass, value) {
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
        // Place the children.
        const { host } = this.partial;
        const { index } = pass;
        // Move the recycled children.
        pass.recycled.forEach(found => host.moveChild(found, index.comment(Constants.MARKER_RECYCLED(found.uid))));
        pass.next.forEach(child => host.hydrateChild(child, index));
        // Structural pass: set the nested partials' refs, but leave the children to
        // the reconcile above (new ones hydrated, recycled ones moved).
        this.hydrateValue(value, index, false);
        // Remove the old content.
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
     * Place a fresh fragment next to the slot's anchor element and swap it in. An
     * anchored slot has no markers, so its content stands on that element (which can
     * be moved around the DOM by hand).
     * @param {DocumentFragment} fragment The new content.
     * @param {object} pass The reconcile pass.
     * @param {any} value The rendered value.
     * @private
     */
    placeAnchored(fragment, pass, value) {
        const element = this.anchorElement();
        const parent = element.parentNode;
        const divider = document.createComment('');
        // Insert the new content.
        parent.insertBefore(divider, element.nextSibling);
        parent.insertBefore(fragment, divider.nextSibling);
        // Place the child. An anchored slot resolves to a single component, and it is
        // mounted anew: a retained one is recycled in place and never reaches here.
        this.partial.host.hydrateChild(pass.next[0], pass.index);
        this.hydrateValue(value, pass.index, false);
        // Remove the old content.
        if (element.nextSibling === divider) parent.removeChild(element);
        parent.removeChild(divider);
    }

    /**
     * Build a reconcile pass around a pool of claimable children, the keyed ones the
     * slot collected on its previous render. The pool belongs to the slot doing the
     * regenerating, and every keyed child under it claims from it, however deep;
     * collecting is per list instead (see `render`). Null where there is nothing to
     * claim: a first render, or a slot whose previous occupant was not a list.
     * @param {Map<any, object>} [previous] The keyed children of the previous render.
     * @return {object} The reconcile pass.
     * @private
     */
    makePass(previous = null) {
        return {
            previous,
            // The innermost list collecting this render's keyed children (see `render`).
            keyed : null,
            recycled : new Map(),
            next : [],
            // The index of the content this pass renders, built in `regenerate`.
            index : null
        };
    }

    /**
     * Reconcile props of recycled children and discard the candidates they
     * replaced.
     * @param {object} pass The reconcile pass.
     * @private
     */
    finishPass(pass) {
        const { host } = this.partial;
        pass.recycled.forEach((found, discarded) => {
            host.updateChild(found, host.childProps(discarded));
            host.destroyChild(discarded);
        });
    }
}

export default InterpolationSlot;
