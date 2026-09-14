import Constants from './Constants.js';

/**
 * Walk a rendered subtree and index what hydration resolves: elements by their
 * emission id, comments by their text. The root node is indexed too, so a subtree can
 * be indexed from the element it stands on.
 * @param {Node} root The node to index, itself included.
 * @param {Map<string, Element>} elements Map to fill with elements by emission id.
 * @param {Map<string, Comment>} comments Map to fill with comments by text.
 * @private
 */
const indexNodes = (root, elements, comments) => {
    let node = root;

    while (node) {
        if (node.nodeType === Node.COMMENT_NODE) {
            comments.set(node.data.trim(), node);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const id = node.getAttribute(Constants.ATTRIBUTE_ELEMENT);
            if (id !== null) elements.set(id, node);
        }
        // Descend into children if present.
        if (node.firstChild) {
            node = node.firstChild;
            continue;
        }
        // Move to next sibling, or climb up until a sibling is found.
        while (node !== root && !node.nextSibling) node = node.parentNode;
        if (node === root) return;
        node = node.nextSibling;
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
