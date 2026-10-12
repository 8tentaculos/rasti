/**
 * Append the items of an array to a flat list from a given position, descending into
 * every nested array in place.
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
        else flat.push(item);
    }
    return flat;
};

/**
 * Flatten nested arrays into a single list, in order and at any depth. An array that
 * holds no array is returned as is, so the common case allocates nothing.
 *
 * @param {Array<any>} items The array to flatten.
 * @return {Array<any>} The flat list.
 * @module
 * @private
 */
export default function flatten(items) {
    for (let i = 0; i < items.length; i++) {
        if (Array.isArray(items[i])) return appendFlat(items.slice(0, i), items, i);
    }
    return items;
}
