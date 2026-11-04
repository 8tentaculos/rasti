/**
 * Tell whether a dynamic content value renders nothing. Nullish and boolean values
 * contribute no content, so a condition (`cond && x`) or a skipped item (`null`) can
 * stand where content goes.
 * @param {any} value The value to test.
 * @return {boolean} True if the value renders nothing.
 * @private
 */
const isEmptyContent = value =>
    value === null || typeof value === 'undefined' || typeof value === 'boolean';

export default isEmptyContent;
