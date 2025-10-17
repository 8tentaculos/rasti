/**
 * Finds the first comment node whose text matches exactly the given `text`,
 * starting from a specific node within the tree.
 * 
 * Uses manual DOM traversal (no TreeWalker, no recursion) for maximum performance.
 * Skips entire subtrees if `shouldSkip(element)` returns true, which is useful
 * for avoiding component subtrees during interpolation marker searches.
 *
 * @param {Node} root - Root node or fragment that limits the search scope.
 * @param {string} text - Exact comment text to match (e.g., "rasti-start-r-123-1").
 * @param {(el: Element) => boolean} shouldSkip - Function that receives an element and returns true if its subtree should be skipped.
 * @param {Map<string, Comment>} [cache] - Optional cache to store already found comments for performance.
 * @param {Node} [startNode] - Optional node to start searching from (defaults to root.firstChild).
 * @return {Comment|null} The first matching comment node, or null if not found.
 * @module
 * @private
 */
export default function findComment(root, text, shouldSkip, cache = new Map(), startNode) {
    let node = startNode || root.firstChild;

    while (node) {
        // Check if current node is a comment with matching text.
        if (node.nodeType === Node.COMMENT_NODE && node.data.trim() === text) {
            cache.set(text, node);
            return node;
        } else if (cache.has(text)) {
            // Return cached result if available.
            return cache.get(text);
        }

        // If it's an element that shouldn't be skipped, traverse into its subtree.
        if (node.nodeType === Node.ELEMENT_NODE && !shouldSkip(node) && node.firstChild) {
            node = node.firstChild;
            continue;
        }

        // Move to next sibling, or traverse up the tree until a sibling is found.
        while (node && !node.nextSibling) {
            node = node.parentNode;
            if (!node || node === root) return null;
        }

        if (node) node = node.nextSibling;
    }

    return null;
}
