import isEmptyContent from './isEmptyContent.js';

/**
 * Convert a dynamic content value to its rendered form. Nullish and boolean
 * values contribute no content (see `isEmptyContent`); every other value goes
 * through the supplied stringifier.
 * @param {any} value The value to coerce.
 * @param {Function} [stringify] Conversion applied to non-empty values.
 * @return {string} The rendered content.
 * @private
 */
const valueToString = (value, stringify = value => '' + value) =>
    isEmptyContent(value) ? '' : stringify(value);

export default valueToString;
