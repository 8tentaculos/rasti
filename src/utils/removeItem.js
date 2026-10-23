/**
 * Remove an item from an array, in place, if the array holds it.
 * @param {Array<any>} array The array to remove from.
 * @param {any} item The item to remove.
 * @module
 * @private
 */
const removeItem = (array, item) => {
    const index = array.indexOf(item);
    if (index !== -1) array.splice(index, 1);
};

export default removeItem;
