import isEmptyContent from './isEmptyContent.js';

/**
 * Append the items of an array to a flat list from a given position, descending into
 * every nested array in place and leaving out the items that render nothing.
 * @param {Array<any>} flat The list being filled.
 * @param {Array<any>} items The array to read.
 * @param {number} start The position to read from.
 * @return {Array<any>} The flat list.
 * @private
 */
const appendFlat = (flat, items, start) => {
    for (let i = start; i < items.length; i++) {
        const item = items[i];
        if (Array.isArray(item)) appendFlat(flat, item, 0);
        else if (!isEmptyContent(item)) flat.push(item);
    }
    return flat;
};

/**
 * Turn the value of a list into its items: nested arrays are flattened into a single
 * list, in order and at any depth, and items that render nothing (see
 * `isEmptyContent`) are left out, so they take no position and break no shape. An
 * array that holds neither is returned as is, so the common case allocates nothing.
 *
 * @param {Array<any>} items The array to flatten.
 * @return {Array<any>} The list's items.
 * @module
 * @private
 */
export default function flattenList(items) {
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (Array.isArray(item) || isEmptyContent(item)) return appendFlat(items.slice(0, i), items, i);
    }
    return items;
}
