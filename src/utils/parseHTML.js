/**
 * Parse HTML string to a DocumentFragment.
 *
 * The string is parsed as written. A component's markup already reaches here
 * without surrounding whitespace, and the content of an interpolation is the
 * rendered value itself, whose leading and trailing whitespace is significant.
 * @param {string} html The HTML string to parse.
 * @return {DocumentFragment} The parsed DocumentFragment.
 * @module
 * @private
 */
export default function parseHTML(html) {
    const fragment = document.createElement('template');
    fragment.innerHTML = `${html}`;
    return fragment.content;
}
