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

        if (value === true) {
            html.push(key);
        } else if (value !== false) {
            if (value === null || typeof value === 'undefined') value = '';
            html.push(`${key}="${value}"`);
        }
    });

    return html.join(' ');
}
