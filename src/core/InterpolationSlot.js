import Slot from './Slot.js';
import Constants from './Constants.js';
import SafeHTML from './SafeHTML.js';
import HydrationIndex from './HydrationIndex.js';

import valueToString from './valueToString.js';
import warnTemplate from '../utils/warnTemplate.js';
import formatTemplateSource from '../utils/formatTemplateSource.js';
import createDevelopmentErrorMessage from '../utils/createDevelopmentErrorMessage.js';
import parseHTML from '../utils/parseHTML.js';
import moveNode from '../utils/moveNode.js';
import increasingSubsequence from '../utils/increasingSubsequence.js';

import __DEV__ from '../utils/dev.js';

/**
 * The context of one reconcile pass, created by the slot that regenerates and threaded
 * through every partial the render descends into (see `Partial#toString`). It carries
 * what the previous render left, what this one is collecting, and what the placement
 * that follows will need.
 * @typedef {object} ReconcilePass
 * @property {Map<any, object>|null} previous The pool of claimable children, by key,
 *     left by the slot's previous render.
 * @property {Map<any, object>|null} keyed The innermost list collecting this render's
 *     keyed children; swapped as lists open and close (see `render`).
 * @property {Array<object>|null} placed The children the previous render left standing
 *     between the slot's markers, in document order.
 * @property {Array<object>|null} order The children the innermost list resolves, in the
 *     order this render puts them in.
 * @property {Map<object, object>} recycled The previous children this render claimed, by
 *     the candidate each replaced. A child this render mounts anew is the complement:
 *     hydration takes whatever the pass did not claim.
 * @property {HydrationIndex|null} index The index of the content this pass renders.
 * @private
 */

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
 * Tell whether a value is safe to compare by identity: an immutable value renders the
 * same characters for as long as it is `===` to itself, which an object or a function
 * does not — its string form can change while the reference stays the same.
 * @param {any} value The value to test.
 * @return {boolean} True if the value is immutable.
 * @private
 */
const isImmutable = (value) => {
    const type = typeof value;
    return value === null || type === 'undefined' || type === 'boolean' ||
        type === 'string' || type === 'number' || type === 'bigint';
};

/**
 * Tell whether a value renders to a text node. Nullish and boolean values render
 * nothing (see `valueToString`), so they leave no node to patch.
 * @param {any} value The value to test.
 * @return {boolean} True if the value renders as non-empty text.
 * @private
 */
const rendersText = (value) => {
    const type = typeof value;
    return type === 'number' || type === 'bigint' || (type === 'string' && value !== '');
};

/**
 * Render a value as the text a parsed render would have produced. The HTML parser
 * normalizes carriage returns to line feeds while reading its input, and patching a
 * text node writes the value straight into the DOM, bypassing that pass.
 * @param {any} value The value to render.
 * @return {string} The text to write.
 * @private
 */
const toText = (value) => `${value}`.replace(/\r\n?/g, '\n');

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
 * The shapes a list can have, by what its items are. A <b>components</b> list holds
 * nothing but components, each with an identity of its own, so it is placed by
 * walking its children. A <b>uniform</b> list is one template repeated, each item
 * owning the nodes it renders: the items have no identity, but they are
 * interchangeable by position and can be patched where they stand. Anything else is
 * regenerated between the slot's markers.
 * @private
 */
const LIST_COMPONENTS = 'components';
const LIST_UNIFORM = 'uniform';
const LIST_OTHER = 'other';

/**
 * Classify a list by the shape of its items, in one walk. It is a question about the
 * shape alone, answered before any item renders, which is what lets the slot decide
 * how to reconcile before it evaluates anything: an item stands for a component when
 * it is a mounted child or a component tag, and a transparent partial, which only
 * answers once evaluated, is left out of both shapes. An empty list holds no content
 * of its own and is taken as components.
 * @param {Partial} partial The partial holding the list.
 * @param {Array<any>} items The list.
 * @return {string} The list's shape.
 * @private
 */
const classifyList = (partial, items) => {
    const ItemClass = items.length ? items[0].constructor : null;
    let components = true;
    // A transparent item stands for whatever its interpolation holds, and the
    // components under it belong to the list holding it rather than to the item (see
    // `renderValue`), so patching it by position would cut them off from the pool they
    // are claimed through.
    let uniform = items.length > 0 && partial.isPartial(items[0]) && !items[0].isTransparent();
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const isPartial = partial.isPartial(item);
        if (components && !(isPartial ? item.isComponentTag() : partial.owner.isChild(item))) components = false;
        if (uniform && !(isPartial && item.constructor === ItemClass)) uniform = false;
        if (!components && !uniform) return LIST_OTHER;
    }
    return components ? LIST_COMPONENTS : uniform ? LIST_UNIFORM : LIST_OTHER;
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
 * Tell whether a value holds a keyed component somewhere under a partial's markup,
 * without crossing into a component of its own. Development only.
 * @param {Partial} partial The partial holding the list.
 * @param {any} value The value to search.
 * @return {boolean} True if a keyed component is held under markup.
 * @private
 */
const holdsKeyedChild = (partial, value) => {
    if (Array.isArray(value)) return value.some(item => holdsKeyedChild(partial, item));
    if (partial.owner.isChild(value)) return value.key != null;
    if (!partial.isPartial(value) || !value.slots) return false;
    return value.slots.some(slot => holdsKeyedChild(partial, slot.content));
};

/**
 * Warn about the keys of a list. A list is the one place where a component changes
 * position among its siblings, and a key is what identifies it there: one without a
 * key is built again on every update, two sharing a key cannot both be recycled, and
 * a key written under markup identifies nothing, because the markup around it is a
 * boundary and the component belongs to the item holding it.
 *
 * A list of markup carries no keys at all: its items have no identity and are updated
 * where they stand, which is a shape of its own and not a mistake. Plain values are
 * exempt for the same reason — a text has no identity to declare.
 * Development only.
 * @param {InterpolationSlot} slot The slot rendering the list.
 * @param {Array<any>} items The rendered list.
 * @private
 */
const checkListItems = (slot, items) => {
    const { partial, descriptor } = slot;
    if (descriptor.warned) return;
    const keys = new Set();
    let unkeyed = false;
    let duplicated = null;
    let underMarkup = false;
    const visit = value => {
        if (Array.isArray(value)) return value.forEach(visit);
        // Anything that is not a partial or a child renders as content, not as
        // something with an identity of its own.
        if (!partial.isPartial(value) && !partial.owner.isChild(value)) return;
        const child = unwrap(partial, value);
        if (!partial.owner.isChild(child)) underMarkup = underMarkup || holdsKeyedChild(partial, child);
        else if (child.key == null) unkeyed = true;
        else if (keys.has(child.key)) duplicated = child.key;
        else keys.add(child.key);
    };
    items.forEach(visit);
    if (unkeyed) warn(slot,
        'Component in a list without a key\n' +
        'A list is where a component changes position among its siblings, and a key is\n' +
        'what identifies it there: without one it is built again on every update, losing\n' +
        'its state and its DOM nodes. Give each one a key:\n' +
        '\n' +
        '  items.map(item => partial`<${Row} key="${item.id}" />`)'
    );
    else if (duplicated != null) warn(slot,
        `Duplicate key "${duplicated}" in a list\n` +
        'Keys identify an item among its siblings, so two items sharing one cannot\n' +
        'both be recycled. Give each item a key of its own.'
    );
    else if (underMarkup) warn(slot,
        'Key under markup in a list item\n' +
        'Markup around a component is a boundary: the component belongs to the item that\n' +
        'holds it, not to the list, so a key written there identifies nothing among the\n' +
        'list\'s siblings. Put the component in the list itself:\n' +
        '\n' +
        '  items.map(item => partial`<${Row} key="${item.id}" />`)'
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
        // What the last render left behind, and what the next one reconciles against:
        // the keyed children it mounted, by key, and, when the value was a list of
        // components, those same children in document order.
        this.keyed = null;
        this.order = null;
        // The shape of the last rendered list (see `classifyList`), or null when the
        // occupant was not a list.
        this.strategy = null;
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
     * @param {ReconcilePass} [pass] Reconcile pass (see `Partial#toString`).
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
     * Render the slot's value, collecting the children of a list as it goes. A list is
     * the one place where a child changes position among its siblings, so the slot
     * remembers the ones it mounted: by key, to claim them again on its next render,
     * and, when every item stands for a component, in document order, which is then
     * the whole of what the slot holds and is how the next render places it. Anywhere
     * else an occupant is either retained in place (see `update`) or mounted anew, and
     * has neither a key to be found by nor a position of its own.
     * @param {any} value The value to render.
     * @param {ReconcilePass} [pass] Reconcile pass (see `Partial#toString`).
     * @return {string} The rendered HTML.
     * @private
     */
    render(value, pass) {
        // Only a list collects: the map it fills becomes the slot's pool for the next
        // render. Anything else holds no child worth finding again by key.
        this.keyed = Array.isArray(value) ? new Map() : null;
        if (!this.keyed) {
            this.order = null;
            this.strategy = null;
            return this.renderValue(value, pass);
        }
        this.strategy = classifyList(this.partial, value);
        // The pass carries the list that is collecting right now, so a nested list
        // takes over while it renders and gives the enclosing one back when it closes.
        const outerKeyed = pass.keyed;
        const outerOrder = pass.order;
        pass.keyed = this.keyed;
        // Positions are only worth collecting for a list of components: it is the one
        // shape whose children are placed by walking them (see `placeInOrder`).
        pass.order = this.strategy === LIST_COMPONENTS ? [] : null;
        const rendered = this.renderValue(value, pass);
        // What the render collected is what the slot now holds.
        this.order = pass.order;
        // An enclosing list holds the same children, one level up, so it takes them
        // once the nested one is closed: whichever of the two regenerates reconciles
        // against the same children.
        if (outerKeyed) this.keyed.forEach((child, key) => outerKeyed.set(key, child));
        pass.keyed = outerKeyed;
        pass.order = outerOrder;
        return rendered;
    }

    /**
     * Render a dynamic value to a string. Handles the engine's own types
     * (`SafeHTML`, nested `Partial`, arrays); a child component is added to the host
     * (matched against the pass's previous occupants during an update); any other
     * value is sanitized. The engine's own types render through `toString`, called
     * directly: only a value with no such contract is coerced (see `valueToString`).
     * @param {any} value The value to render.
     * @param {ReconcilePass} [pass] Reconcile pass (see `Partial#toString`).
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
                // The previous child this candidate claims, when the slot held one
                // under its key; null when there is nothing to recycle.
                const found = this.claimRecyclable(value, pass);
                // The list records whichever instance ends up standing here: the
                // retained one when there is one, the candidate otherwise.
                if (pass.order) pass.order.push(found || value);
                if (found) {
                    host.addChild(found);
                    pass.recycled.set(value, found);
                    this.recordKeyed(pass, value.key, found);
                    // A child the slot places itself is already standing where the walk
                    // will find it, so it writes no placeholder to be replaced. Both
                    // orders are needed: the one standing in the DOM and the one this
                    // render is collecting.
                    if (pass.placed && pass.order) return '';
                    return `<!--${Constants.MARKER_RECYCLED(found.uid)}-->`;
                }
                this.recordKeyed(pass, value.key, value);
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
     * @param {ReconcilePass} pass Reconcile pass holding the pool.
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
     * @param {ReconcilePass} pass The reconcile pass holding the list.
     * @param {any} key The child's key.
     * @param {object} child The child component.
     * @private
     */
    recordKeyed(pass, key, child) {
        if (key != null && pass.keyed) pass.keyed.set(key, child);
    }

    /**
     * Resolve the slot's comment markers and recurse into its occupant. An anchored
     * slot writes no markers, so there is nothing to locate.
     * @param {HydrationIndex} index The hydration's node index.
     * @param {ReconcilePass} [pass] The reconcile pass (see `Partial#hydrate`).
     */
    hydrate(index, pass) {
        if (!this.isAnchored()) {
            this.ref = [index.comment(Constants.MARKER_START(this.id)), index.comment(Constants.MARKER_END(this.id))];
        }
        this.hydrateValue(this.content, index, pass);
    }

    /**
     * Recurse hydration into a value, hydrating the child components it holds where the
     * walk reaches them: a nested partial hydrates its own slots and arrays recurse,
     * so the whole occupant is attached in document order. Primitives carry no refs
     * and are skipped.
     *
     * A child the render claimed from the previous one is left alone: it is already
     * live, and the pass moves it onto the placeholder that stands for it. Every other
     * child was mounted by this render and hydrates from the same index, its nodes
     * having been written out by it.
     * @param {any} value The value to hydrate.
     * @param {HydrationIndex} index The hydration's node index.
     * @param {ReconcilePass} [pass] The reconcile pass (see `Partial#hydrate`).
     * @private
     */
    hydrateValue(value, index, pass) {
        const { owner } = this.partial;
        if (this.partial.isPartial(value)) value.hydrate(index, pass);
        else if (Array.isArray(value)) value.forEach(item => this.hydrateValue(item, index, pass));
        else if (owner.isChild(value) && !(pass && pass.recycled.has(value))) owner.hydrateChild(value, index);
    }

    /**
     * Reconcile the slot against its previous occupant.
     */
    update() {
        const { partial } = this;
        const value = this.evaluate();
        if (__DEV__ && this.isAnchored()) checkAnchoredContent(this, value);
        const prev = this.content;
        // Retained text: an immutable value renders the same characters for as long as
        // it is `===` to itself, so an unchanged one leaves the DOM already correct —
        // whether it holds a text node or, for a value that renders nothing, no node at
        // all. A changed one is written into the node the previous render left, which
        // both values having text to render is what guarantees is there. An anchored
        // slot never takes this path: it resolves to a component, which is not immutable.
        if (isImmutable(value) && isImmutable(prev)) {
            if (value === prev) return;
            if (rendersText(value) && rendersText(prev) && this.updateText(value)) return;
        }
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
        // Retained list of one template repeated: its items have no identity of their
        // own, so each is patched where it stands and the content moves through the DOM.
        if (this.canUpdateItems(value)) {
            this.updateItems(value);
            return;
        }
        // Anything else: regenerate the slot's content and patch the DOM.
        this.regenerate(value);
    }

    /**
     * Write a value into the text node the slot's previous render left between its
     * markers. The region has to be that node and nothing else: a render that put
     * anything more there is not one this can patch.
     * @param {any} value The new value.
     * @return {boolean} True if the text was patched.
     * @private
     */
    updateText(value) {
        const [start, end] = this.ref;
        const node = start.nextSibling;
        if (node !== end.previousSibling || node.nodeType !== Node.TEXT_NODE) return false;
        node.nodeValue = toText(value);
        this.content = value;
        return true;
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
     * Tell whether the slot can update a new list where its items stand: both renders
     * are the same template repeated, so the items are interchangeable by position,
     * and a list that lost items can say where the ones it dropped begin.
     * @param {any} value The new value.
     * @return {boolean} True if the list can be updated in place.
     * @private
     */
    canUpdateItems(value) {
        const items = this.content;
        if (this.strategy !== LIST_UNIFORM || !Array.isArray(value)) return false;
        if (classifyList(this.partial, value) !== LIST_UNIFORM) return false;
        if (value[0].constructor !== items[0].constructor) return false;
        return value.length >= items.length || !!items[value.length].firstNode();
    }

    /**
     * Update a list of partials where they stand. The items are one template repeated,
     * so the ones both renders hold are patched in place with the new expressions, in
     * order; a longer list renders what it gained before the end marker, and a shorter
     * one drops the nodes of the items it no longer holds.
     *
     * Nothing is claimed by identity here, because an item has none: its DOM stays with
     * its position and the content moves through it. An item that must keep its
     * identity has to be a keyed component, which the list then holds directly.
     * @param {Array<Partial>} value The new list.
     * @private
     */
    updateItems(value) {
        const items = this.content;
        const overlap = Math.min(items.length, value.length);
        for (let i = 0; i < overlap; i++) items[i].update(value[i].expressions);
        if (value.length > overlap) this.appendItems(value.slice(overlap));
        else if (items.length > overlap) this.dropItems(items[overlap]);
        // The retained items are the live ones; the candidates that matched them are
        // read for their expressions and discarded.
        this.content = items.slice(0, overlap).concat(value.slice(overlap));
    }

    /**
     * Render the items a list gained and place them at its end, before the slot's end
     * marker.
     * @param {Array<Partial>} items The items to add.
     * @private
     */
    appendItems(items) {
        const pass = this.makePass();
        const fragment = parseHTML(items.map(item => this.renderValue(item, pass)).join(''));
        pass.index = new HydrationIndex(fragment);
        const end = this.ref[1];
        end.parentNode.insertBefore(fragment, end);
        this.hydrateValue(items, pass.index, pass);
    }

    /**
     * Remove the nodes of the items a list dropped: everything from where the first of
     * them begins to the slot's end marker. The components they held are destroyed with
     * the rest of the ones this render left out of the host's children.
     * @param {Partial} first The first item the list no longer holds.
     * @private
     */
    dropItems(first) {
        const end = this.ref[1];
        const range = document.createRange();
        range.setStartBefore(first.firstNode());
        range.setEndBefore(end);
        range.deleteContents();
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
        // The keyed children of the previous render are the pool this one claims from.
        const pass = this.makePass(this.keyed);
        // The children of a list the slot placed itself stand between its markers, in
        // that order, so a render that resolves to a list of components again keeps
        // them where they are instead of rendering them back into position.
        pass.placed = this.order;
        // Renders the new value, which replaces `this.keyed` and `this.order` with what
        // it collects: from here on `pass.placed` is the old order and `this.order` the
        // new one.
        const fragment = parseHTML(this.render(value, pass));
        // Indexed before the fragment is inserted, so the walk covers the new content
        // alone: it answers both for the placeholders of the recycled children and for
        // the refs of everything mounted anew.
        pass.index = new HydrationIndex(fragment);
        // A walk is worth what the render kept: with nothing claimed the whole region
        // is rewritten, which the marker path does in a single call.
        if (this.isAnchored()) this.placeAnchored(fragment, pass, value);
        // Both renders resolved to a list of components and this one kept some of the
        // previous children: the walk moves them instead of rewriting the region.
        else if (pass.placed && this.order && pass.recycled.size) this.placeInOrder(fragment, pass, value);
        else this.placeBetweenMarkers(fragment, pass, value);
        this.finishPass(pass);
        // A recycled candidate is discarded in `finishPass`, so the slot remembers the
        // retained instance it matched instead: the next update reconciles against a
        // live occupant. A list is never read back — it reconciles through the keyed
        // pool, not through the occupant — so only a single child is resolved.
        this.content = pass.recycled.get(value) || value;
    }

    /**
     * Place a list of components by walking it. What stands between the slot's markers
     * is its children's elements and nothing else, so each child is taken to its place
     * instead of being rendered back into one: the ones the render kept move only when
     * the order moved them, the ones it mounted arrive in the fragment, and the ones it
     * dropped are removed.
     * @param {DocumentFragment} fragment The new content.
     * @param {ReconcilePass} pass The reconcile pass.
     * @param {any} value The rendered value.
     * @private
     */
    placeInOrder(fragment, pass, value) {
        const { host } = this.partial;
        // The order this render resolved, against the one standing in the DOM.
        const { order } = this;
        const { placed } = pass;
        const end = this.ref[1];
        const parent = end.parentNode;
        // Recycle the children that stay: they are reused whether or not they move.
        pass.recycled.forEach(found => host.moveChild(found, null));
        // The new children arrive together at the end of the slot, where they hydrate
        // before being taken to their place.
        parent.insertBefore(fragment, end);
        this.hydrateValue(value, pass.index, pass);
        // The same children in the same order: nothing to place, nothing to remove.
        if (placed.length === order.length && order.every((child, i) => placed[i] === child)) return;
        // Where each child stood. A child the render mounted has none, so it never
        // counts as being in place.
        const previousIndex = new Map();
        placed.forEach((child, i) => previousIndex.set(child, i));
        // The new order read as previous positions, and a mark on every previous child
        // the render kept; a mounted child has no position and reads as -1.
        const kept = [];
        const sequence = order.map(child => {
            const index = previousIndex.get(child);
            if (index === undefined) return -1;
            kept[index] = true;
            return index;
        });
        // Remove what the list dropped first, so what is left is what the walk reads.
        // Destroying a child does not touch the DOM, and the component destroys the
        // ones this render left out of its children.
        placed.forEach((child, i) => {
            if (!kept[i]) child.el.parentNode.removeChild(child.el);
        });
        // The children whose previous positions already ascend are the ones that can
        // stay put, and the longest such run is the fewest moves the order can be
        // reached in. Every other child is moved before the one that follows it, which
        // is placed by the time it is reached. `stable` holds those positions, which
        // are positions into `order`, ascending.
        const stable = increasingSubsequence(sequence);
        let last = stable.length - 1;
        // Walked from the end, so `next` is always the child already in place.
        let next = end;
        for (let i = order.length - 1; i >= 0; i--) {
            const { el } = order[i];
            if (last >= 0 && stable[last] === i) last--;
            else if (el.nextSibling !== next) moveNode(el, next);
            next = el;
        }
    }

    /**
     * Place a fresh fragment between the slot's markers, put the pass's children in
     * it, and remove the old content once they are in place.
     * @param {DocumentFragment} fragment The new content.
     * @param {ReconcilePass} pass The reconcile pass.
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
        // Move the recycled children onto the placeholders that stand for them.
        pass.recycled.forEach(found => host.moveChild(found, index.comment(Constants.MARKER_RECYCLED(found.uid))));
        // Attach the new content: the nested partials' refs and the children this
        // render mounted, which the walk hydrates where it reaches them.
        this.hydrateValue(value, index, pass);
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
     * @param {ReconcilePass} pass The reconcile pass.
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
        this.hydrateValue(value, pass.index, pass);
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
     * @return {ReconcilePass} The reconcile pass.
     * @private
     */
    makePass(previous = null) {
        // `previous` is what the last render left; `keyed`, `order` and `recycled` are
        // filled as this one walks (see `render` and `renderValue`); `placed` and
        // `index` are set by `regenerate`, around the render.
        return {
            previous,
            keyed : null,
            placed : null,
            order : null,
            recycled : new Map(),
            index : null
        };
    }

    /**
     * Reconcile props of recycled children and discard the candidates they
     * replaced.
     * @param {ReconcilePass} pass The reconcile pass.
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
