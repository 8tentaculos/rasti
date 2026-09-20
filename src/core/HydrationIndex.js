import Constants from './Constants.js';

/**
 * Index the comments a render wrote, by their text. A `TreeWalker` filtered to
 * comments drives the traversal, so the elements and text nodes between them are
 * skipped by the DOM itself.
 * @param {Node} root The node to index.
 * @param {Map<string, Comment>} comments Map to fill with comments by text.
 * @private
 */
const indexComments = (root, comments) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_COMMENT);
    let node = walker.nextNode();

    while (node) {
        comments.set(node.data.trim(), node);
        node = walker.nextNode();
    }
};

/**
 * The elements a render wrote, in document order. `querySelectorAll` returns a static
 * snapshot and never returns the node it is called on, so an element root carrying an
 * id of its own — the element a server rendered the component into — is put back in
 * front, where the render wrote it.
 * @param {Node} root The node holding the rendered content, itself included.
 * @return {NodeList|Array<Element>} The elements, in document order.
 * @private
 */
const indexElements = (root) => {
    const elements = root.querySelectorAll(`[${Constants.ATTRIBUTE_ELEMENT}]`);
    if (root.nodeType !== Node.ELEMENT_NODE) return elements;
    return root.getAttribute(Constants.ATTRIBUTE_ELEMENT) === null ? elements : [root, ...elements];
};

/**
 * The index of one hydration: a snapshot of the nodes a render produced, taken before
 * anything is hydrated, so each slot attaches to its own nodes instead of searching
 * for them.
 *
 * The two kinds are read differently, because a slot knows them differently.
 * <b>Elements</b> are handed out in order: hydration walks the render in document
 * order (see `Partial#hydrate`), which is the order the elements were written in, so
 * a cursor over the snapshot answers every slot in turn. <b>Comments</b> are looked
 * up by their text — an interpolation's markers, and the placeholder a recycled child
 * stands on — because the slot that wrote them may find them anywhere between the
 * elements.
 *
 * It belongs to the hydration rather than to a component: it is built where the
 * content is — a freshly parsed fragment, or the element a server rendered — handed
 * down through the subtree, and dropped when the hydration ends. Nothing holds it
 * afterwards, so it cannot go stale and it keeps no DOM alive.
 *
 * Taking the snapshot up front is also what frees hydration from the DOM's current
 * shape: hydrating an occupant runs the user's `onHydrate`, which may move nodes, and
 * placing the content moves the recycled children into it, yet the elements handed out
 * afterwards are still the ones the render wrote.
 * @param {Node} node The node holding the rendered content, itself included.
 * @private
 */
class HydrationIndex {
    constructor(node) {
        this.comments = new Map();
        indexComments(node, this.comments);
        this.elements = indexElements(node);
        this.cursor = 0;
    }

    /**
     * The next element the render wrote, in document order.
     * @return {Element|undefined} The element.
     */
    nextElement() {
        return this.elements[this.cursor++];
    }

    /**
     * The comment written out with a given text: an interpolation marker, or the
     * placeholder a recycled child stands on.
     * @param {string} text The comment's exact text.
     * @return {Comment|undefined} The comment.
     */
    comment(text) {
        return this.comments.get(text);
    }
}

export default HydrationIndex;
