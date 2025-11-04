/**
 * Moves an existing DOM node to replace a placeholder node, preserving internal DOM state.
 * Uses moveBefore if available, otherwise falls back to insertBefore.
 * 
 * @param {Node} placeholder The placeholder node that will be replaced.
 * @param {Node} nodeToMove The existing DOM node to move to the placeholder's position.
 * @module
 * @private
 */
export default function moveNodeToPlaceholder(placeholder, nodeToMove) {
    if (Element.prototype.moveBefore) {
        placeholder.parentNode.moveBefore(nodeToMove, placeholder);
        placeholder.remove();
    } else {
        const activeElement = document.activeElement;
        placeholder.parentNode.insertBefore(nodeToMove, placeholder);
        placeholder.remove();
        if (activeElement && activeElement !== document.activeElement && nodeToMove.contains(activeElement)) {
            activeElement.focus();
        }
    }
}
