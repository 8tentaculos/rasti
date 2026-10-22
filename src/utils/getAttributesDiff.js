/**
 * Get difference between current and previous attributes. Both are plain objects,
 * walked with `for-in`: inherited enumerable keys would be taken as attributes.
 * @param {Object} attributes Current attributes object.
 * @param {Object} previous Previous attributes object.
 * @return {Object} Object with add and remove properties.
 * @module
 * @private
 */
export default function getAttributesDiff(attributes, previous = {}) {
    const add = {};
    const remove = [];
    // Find attributes to add/update.
    for (const key in attributes) {
        const value = attributes[key];
        // Only add if the value is different from previous. `true` sets the attribute
        // empty; `false`, `null` and `undefined` are removed below.
        if (value !== previous[key]) {
            if (value === true) {
                add[key] = '';
            } else if (value !== false && value != null) {
                add[key] = value;
            }
        }
    }
    // Find attributes to remove: gone, or changed to a value that leaves them out.
    for (const key in previous) {
        const value = attributes[key];
        if (!(key in attributes) || (previous[key] !== value && (value === false || value == null))) {
            remove.push(key);
        }
    }

    return { add, remove };
}
