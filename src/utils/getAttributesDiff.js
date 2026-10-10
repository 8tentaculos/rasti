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
        let value = attributes[key];
        // Only add if the value is different from previous.
        if (value !== previous[key]) {
            if (value === true) {
                add[key] = '';
            } else if (value !== false) {
                if (value === null || typeof value === 'undefined') value = '';
                add[key] = value;
            }
        }
    }
    // Find attributes to remove.
    for (const key in previous) {
        if (!(key in attributes) || ((previous[key] !== attributes[key]) && attributes[key] === false)) {
            remove.push(key);
        }
    }

    return { add, remove };
}
