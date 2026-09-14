/**
 * Finds the comment nodes whose text matches one of the given `texts`, in a single
 * traversal. Uses manual DOM traversal. Skips entire subtrees if `shouldSkip(element)`
 * returns true, and stops as soon as every text has been found.
 * @param {Node} root - Root node or fragment that limits the search scope.
 * @param {Set<string>} texts - Exact comment texts to match.
 * @param {Function} [shouldSkip] - Function that receives an element and returns true if its subtree should be skipped.
 * @return {Map<string, Comment>} The matching comment nodes, keyed by their text.
 * @module
 * @private
 */
export default function findComments(root, texts, shouldSkip = () => false) {
    const found = new Map();
    let node = root.firstChild;

    while (node && found.size < texts.size) {
        // Check if current node is a comment with one of the searched texts.
        if (node.nodeType === Node.COMMENT_NODE) {
            const text = node.data.trim();
            if (texts.has(text)) found.set(text, node);
        }
        // Descend into children if allowed and present.
        if (node.nodeType === Node.ELEMENT_NODE && !shouldSkip(node) && node.firstChild) {
            node = node.firstChild;
            continue;
        }
        // Move to next sibling, or climb up until a sibling is found.
        while (node && !node.nextSibling) {
            node = node.parentNode;
            if (!node || node === root) return found;
        }
        if (node) node = node.nextSibling;
    }

    return found;
}
