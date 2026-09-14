import Constants from './Constants.js';

/**
 * Walk a rendered subtree and index what hydration resolves: elements by their
 * emission id, comments by their text. A `TreeWalker` filtered to those two node types
 * drives the traversal, so the text nodes between them are skipped by the DOM itself.
 * @param {Node} root The node to index, itself included.
 * @param {Map<string, Element>} elements Map to fill with elements by emission id.
 * @param {Map<string, Comment>} comments Map to fill with comments by text.
 * @private
 */
const indexNodes = (root, elements, comments) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT);
    // The walker starts on the root and never returns it, so an element root is taken
    // first: that is what lets a subtree be indexed from the element it stands on.
    let node = root.nodeType === Node.ELEMENT_NODE ? root : walker.nextNode();

    while (node) {
        if (node.nodeType === Node.COMMENT_NODE) {
            comments.set(node.data.trim(), node);
        } else {
            const id = node.getAttribute(Constants.ATTRIBUTE_ELEMENT);
            if (id !== null) elements.set(id, node);
        }
        node = walker.nextNode();
    }
};

/**
 * The index of one hydration: a snapshot of the nodes a render produced, taken before
 * anything is hydrated, so each slot resolves its own nodes with a lookup instead of a
 * search. One traversal answers for the whole subtree — an emission id carries the
 * component's uid, so it is unique across the page and nested components index into
 * the same maps.
 *
 * It belongs to the hydration rather than to a component: it is built where the
 * content is — a freshly parsed fragment, or the element a server rendered — handed
 * down through the subtree, and dropped when the hydration ends. Nothing holds it
 * afterwards, so it cannot go stale and it keeps no DOM alive.
 *
 * Taking the snapshot up front is also what frees hydration from the DOM's current
 * shape: hydrating an occupant runs the user's `onHydrate`, which may move nodes, and
 * the refs resolved after it still come out right.
 * @param {Node} node The node holding the rendered content, itself included.
 * @private
 */
class HydrationIndex {
    constructor(node) {
        this.elements = new Map();
        this.comments = new Map();
        indexNodes(node, this.elements, this.comments);
    }

    /**
     * The element written out under an emission id.
     * @param {string} id The element's emission id.
     * @return {Element|undefined} The element.
     */
    element(id) {
        return this.elements.get(id);
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
