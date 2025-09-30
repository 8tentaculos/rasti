/**
 * Get difference between current and previous attributes.
 * @param {Object} attributes Current attributes object
 * @param {Object} previous Previous attributes object
 * @return {Object} Object with add and remove properties
 * @module
 * @private
 */
export default function getAttributesDiff(attributes, previous = {}) {
    const add = {};
    const remove = [];
    // Find attributes to add/update.
    Object.keys(attributes).forEach(key => {
        let value = attributes[key];
        
        if (value === true) {
            add[key] = '';
        } else if (value !== false) {
            if (value === null || typeof value === 'undefined') value = '';
            add[key] = value;
        }
    });
    // Find attributes to remove.
    Object.keys(previous).forEach(key => {
        if (!(key in attributes) || ((previous[key] !== attributes[key]) && attributes[key] === false)) {
            remove.push(key);
        }
    });

    return { add, remove };
}
