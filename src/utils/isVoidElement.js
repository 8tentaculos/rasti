/**
 * The HTML elements that cannot have content, and are therefore written without a
 * closing tag.
 * @type {Array<string>}
 * @private
 */
const voidElements = [
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img',
    'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'
];

/**
 * Tell whether a tag is a void element. Used to build an element from a tag name,
 * where the markup must be chosen before knowing what the tag is.
 * @param {string} tag Tag name.
 * @return {boolean} True if the tag is a void element.
 * @module
 * @private
 */
const isVoidElement = (tag) => voidElements.indexOf(`${tag}`.toLowerCase()) !== -1;

export default isVoidElement;
