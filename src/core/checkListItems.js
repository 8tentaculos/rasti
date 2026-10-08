import unwrap from './unwrap.js';
import warnTemplate from './warnTemplate.js';

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
        '  items.map(item => html`<${Row} key="${item.id}" />`)'
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
        '  items.map(item => html`<${Row} key="${item.id}" />`)'
    );
};

export default checkListItems;
