/**
 * Replaces an existing DOM node with a new node, preserving internal DOM state.
 * Uses moveBefore if available, otherwise falls back to before.
 * 
 * @param {Node} oldNode The existing DOM node to replace.
 * @param {Node} newNode The new DOM node to replace the old node with.
 * @module
 * @private
 */
export default function replaceNode(oldNode, newNode) {
    if (Element.prototype.moveBefore) {
        oldNode.parentNode.moveBefore(newNode, oldNode);
        oldNode.parentNode.removeChild(oldNode);
    } else {
        const activeElement = document.activeElement;
        oldNode.parentNode.insertBefore(newNode, oldNode);
        oldNode.parentNode.removeChild(oldNode);
        if (activeElement && activeElement !== document.activeElement && newNode.contains(activeElement)) {
            activeElement.focus();
        }
    }
}
