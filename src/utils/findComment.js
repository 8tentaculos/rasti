/**
 * Finds the first comment node whose text matches exactly the given `text`,
 * starting from a specific node within the tree.
 * Traverses the DOM manually (no TreeWalker, no recursion) for maximum performance.
 * Skips entire subtrees if `shouldSkip(element)` returns true.
 *
 * @param {Node} root - Root node or fragment that limits the search scope.
 * @param {string} text - Exact comment text to match.
 * @param {(el: Element) => boolean} shouldSkip - Function that receives an element and returns true if its subtree should be skipped.
 * @param {Node} [startNode] - Optional node to start searching from (defaults to root.firstChild).
 * @return {Comment|null} The first matching comment node, or null if not found.
 * @module
 * @private
 */
export default function findComment(root, text, shouldSkip, startNode) {
    let node = startNode || root.firstChild;

    while (node) {
        // If it's a comment and the text matches exactly
        if (node.nodeType === Node.COMMENT_NODE && node.data.trim() === text) {
            return node;
        }

        // If it's an element and should not be skipped, go down to its first child
        if (node.nodeType === Node.ELEMENT_NODE && !shouldSkip(node) && node.firstChild) {
            node = node.firstChild;
            continue;
        }

        // Otherwise, move to the next sibling or go up until one exists
        while (node && !node.nextSibling) {
            node = node.parentNode;
            if (!node || node === root) return null;
        }

        if (node) node = node.nextSibling;
    }

    return null;
}
