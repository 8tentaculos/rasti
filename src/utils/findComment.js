/**
 * Finds the first comment node whose text matches exactly the given `text`.
 * Uses manual DOM traversal for maximum performance. Caches all encountered
 * comments in the provided cache map for O(1) subsequent lookups.
 * @param {Node} root - Root node or fragment that limits the search scope.
 * @param {string} text - Exact comment text to match.
 * @param {(el: Element) => boolean} [shouldSkip] - Function that returns true if subtree should be skipped.
 * @param {Map<string, Comment>} [cache] - Cache map to store found comments for performance.
 * @param {Node} [startNode] - Node to start searching from (defaults to root.firstChild).
 * @return {Comment|null} The first matching comment node, or null if not found.
 * @module
 * @private
 */
export default function findComment(
    root,
    text,
    shouldSkip = () => false,
    cache = new Map(),
    startNode
) {
    // Fast path: comment already cached for this text.
    if (cache.has(text)) return cache.get(text);

    let node = startNode || root.firstChild;

    while (node) {
        // Cache every comment encountered along the way.
        if (node.nodeType === Node.COMMENT_NODE) {
            const key = node.data.trim();
            cache.set(key, node);
            if (key === text) return node;
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
