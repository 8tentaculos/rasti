/**
 * The root element of each foreign namespace, by namespace URI. Markup is parsed in
 * that namespace only below its root element.
 * @type {Object<string, string>}
 * @private
 */
const FOREIGN_ROOTS = {
    'http://www.w3.org/2000/svg' : 'svg',
    'http://www.w3.org/1998/Math/MathML' : 'math'
};

/**
 * Parse HTML string to a DocumentFragment.
 *
 * The string is parsed as written. A component's markup already reaches here
 * without surrounding whitespace, and the content of an interpolation is the
 * rendered value itself, whose leading and trailing whitespace is significant.
 *
 * Markup bound for an SVG or MathML element is parsed inside a copy of that element,
 * under its namespace's root, so it takes the namespace the browser would give it
 * there: SVG content stays SVG, and an integration point such as `foreignObject`
 * holds HTML.
 * @param {string} html The HTML string to parse.
 * @param {Node} [context] The node the parsed content will be inserted into.
 * @return {DocumentFragment} The parsed DocumentFragment.
 * @module
 * @private
 */
export default function parseHTML(html, context) {
    const template = document.createElement('template');
    const root = context && FOREIGN_ROOTS[context.namespaceURI];

    if (!root) {
        template.innerHTML = html;
        return template.content;
    }
    // The namespace's root, then the context element itself unless it is that root.
    const wrapper = context.localName === root ? [root] : [root, context.localName];
    template.innerHTML = wrapper.map(tag => `<${tag}>`).join('') + html;

    const fragment = template.content;
    const outer = fragment.firstChild;
    let parent = fragment;
    wrapper.forEach(() => { parent = parent.firstChild; });
    // Take the parsed content out of the wrapper.
    while (parent.firstChild) fragment.insertBefore(parent.firstChild, outer);
    fragment.removeChild(outer);
    return fragment;
}
