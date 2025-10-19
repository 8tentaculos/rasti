/**
 * Finds the first comment node whose text matches exactly the given `text`.
 * Uses manual DOM traversal. Skips entire subtrees if `shouldSkip(element)` returns true.
 * Starts searching from `startNode` if provided, otherwise from `root.firstChild`.
 * @param {Node} root - Root node or fragment that limits the search scope.
 * @param {string} text - Exact comment text to match.
 * @param {Function} [shouldSkip] - Function that receives an element and returns true if its subtree should be skipped.
 * @param {Node} [startNode] - Node to start searching from (defaults to root.firstChild).
 * @return {Comment|null} The first matching comment node, or null if not found.
 * @module
 * @private
 */
export default function findComment(
    root,
    text,
    shouldSkip = () => false,
    startNode
) {
    let node = startNode || root.firstChild;

    while (node) {
        // Check if current node is a comment with matching text.
        if (node.nodeType === Node.COMMENT_NODE && node.data.trim() === text) {
            return node;
        }
        // Descend into children if allowed and present.
        if (node.nodeType === Node.ELEMENT_NODE && !shouldSkip(node) && node.firstChild) {
            node = node.firstChild;
            continue;
        }
        // Move to next sibling, or climb up until a sibling is found.
        while (node && !node.nextSibling) {
            node = node.parentNode;
            if (!node || node === root) return null;
        }
        if (node) node = node.nextSibling;
    }

    return null;
}
