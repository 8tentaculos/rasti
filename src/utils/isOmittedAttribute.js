/**
 * Tell whether an attribute value leaves the attribute out: `false`, `null` and
 * `undefined` do, and `true` writes it with no value. Content follows a different
 * rule, where `true` renders nothing as well (see `core/isEmptyContent`).
 * @param {any} value The resolved attribute value.
 * @return {boolean} True if the attribute is left out.
 * @module
 * @private
 */
const isOmittedAttribute = value =>
    value === null || typeof value === 'undefined' || value === false;

export default isOmittedAttribute;
