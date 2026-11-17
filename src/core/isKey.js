/**
 * Tell whether a value identifies a component by key: anything but `null` and
 * `undefined`, which leave it unkeyed.
 * @param {any} key The key to test.
 * @return {boolean} True if the value is a key.
 * @private
 */
const isKey = key => key !== null && typeof key !== 'undefined';

export default isKey;
