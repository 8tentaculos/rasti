/**
 * Characters that terminate an attribute name. A name containing any of them
 * would let the rest of the value be parsed as markup instead of as a name.
 * @type {RegExp}
 * @private
 */
const INVALID_ATTRIBUTE_NAME = /[\s"'>/=]/;

/**
 * Escape an attribute value. Values are serialized inside double quotes,
 * so escaping the double quote keeps the value from terminating the attribute.
 * @param {string} value Attribute value.
 * @return {string} Escaped attribute value.
 * @private
 */
const escapeAttributeValue = value => `${value}`.replace(/"/g, '&quot;');

/**
 * Generate HTML string from attributes object.
 * @param {Object} attributes Object containing attribute names and values.
 * @return {string} HTML string of attributes.
 * @module
 * @private
 */
export default function getAttributesHTML(attributes) {
    const html = [];

    Object.keys(attributes).forEach(key => {
        let value = attributes[key];
        // Skip invalid names, they can't be serialized as an attribute.
        if (INVALID_ATTRIBUTE_NAME.test(key)) return;

        if (value === true) {
            html.push(key);
        } else if (value !== false) {
            if (value === null || typeof value === 'undefined') value = '';
            html.push(`${key}="${escapeAttributeValue(value)}"`);
        }
    });

    return html.join(' ');
}
