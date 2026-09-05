/**
 * Convert a dynamic content value to its rendered form. Nullish and boolean
 * values contribute no content; every other value goes through the supplied
 * stringifier.
 * @param {any} value The value to coerce.
 * @param {Function} [stringify] Conversion applied to non-empty values.
 * @return {string} The rendered content.
 * @private
 */
const valueToString = (value, stringify = value => '' + value) =>
    value === null || typeof value === 'undefined' || typeof value === 'boolean' ?
        '' :
        stringify(value);

export default valueToString;
