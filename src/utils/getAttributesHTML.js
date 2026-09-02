/**
 * Match a name that is legal for an HTML attribute. Excludes whitespace, quotes,
 * `>`, `/`, `=` and control characters, which would otherwise end the attribute
 * or the tag when the name is interpolated into markup. An empty name is excluded
 * as well, since it can't be serialized as a name.
 * @type {RegExp}
 * @private
 */
// eslint-disable-next-line no-control-regex
const VALID_ATTRIBUTE_NAME = /^[^\s"'>/=\u0000-\u001F\u007F-\u009F]+$/;

/**
 * Escape an attribute value. Values are serialized inside double quotes, so
 * escaping the double quote keeps the value from terminating the attribute on
 * every value. A plain-text value also escapes the ampersand — first, or it
 * would double-escape the `&quot;` just produced — so it reaches the DOM as
 * written, matching what `setAttribute` does on update. An HTML-source value
 * (a pure template literal) keeps its character references as written.
 * @param {string} value Attribute value.
 * @param {boolean} isSource Whether the value is HTML source.
 * @return {string} Escaped attribute value.
 * @private
 */
const escapeAttributeValue = (value, isSource) => {
    let out = `${value}`;
    if (!isSource) out = out.replace(/&/g, '&amp;');
    return out.replace(/"/g, '&quot;');
};

/**
 * Generate HTML string from attributes object. Values are plain text unless
 * their key is in `sourceKeys` (pure template literals, serialized as written).
 * @param {Object} attributes Object containing attribute names and values.
 * @param {Set<string>} [sourceKeys] Keys whose values are HTML source.
 * @return {string} HTML string of attributes.
 * @module
 * @private
 */
export default function getAttributesHTML(attributes, sourceKeys) {
    const html = [];

    Object.keys(attributes).forEach(key => {
        let value = attributes[key];
        // Skip invalid names, they can't be serialized as an attribute.
        if (!VALID_ATTRIBUTE_NAME.test(key)) return;

        if (value === true) {
            html.push(key);
        } else if (value !== false) {
            if (value === null || typeof value === 'undefined') value = '';
            html.push(`${key}="${escapeAttributeValue(value, !!sourceKeys && sourceKeys.has(key))}"`);
        }
    });

    return html.join(' ');
}
