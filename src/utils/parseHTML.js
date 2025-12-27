/**
 * Parse HTML string to a DocumentFragment.
 * @param {string} html The HTML string to parse.
 * @return {DocumentFragment} The parsed DocumentFragment.
 * @module
 * @private
 */
export default function parseHTML(html) {
    const fragment = document.createElement('template');
    fragment.innerHTML = `${html}`.trim();
    return fragment.content;
}
