let isChrome, moveBeforeSupported, preserveFocus, resetFocus;

// Browser compatibility notes (as of 2025):
// - Safari: Does not support moveBefore.
// - Firefox: moveBefore preserves focus but loses scroll position.
// - Chrome: moveBefore preserves scroll position but loses focus.
if (typeof document !== 'undefined') {
    isChrome = !!navigator.userAgent.match(/Chrome/);
    moveBeforeSupported = !!Element.prototype.moveBefore;
    preserveFocus = !moveBeforeSupported || isChrome;
    // When using moveBefore, Chrome resets the focus but preserves the active element.
    // So we need to blur the active element before setting the focus again.
    resetFocus = moveBeforeSupported && isChrome;
}

/**
 * Replaces an existing DOM node with a new node, preserving internal DOM state.
 * Uses moveBefore if available, otherwise falls back to insertBefore.
 * 
 * @param {Node} oldNode The existing DOM node to replace.
 * @param {Node} newNode The new DOM node to replace the old node with.
 * @module
 * @private
 */
export default function replaceNode(oldNode, newNode) {
    const activeElement = preserveFocus &&
        document.activeElement &&
        newNode.contains(document.activeElement) ?
        document.activeElement : null;

    if (activeElement && resetFocus) activeElement.blur();

    oldNode.parentNode[moveBeforeSupported ? 'moveBefore' : 'insertBefore'](newNode, oldNode);
    oldNode.parentNode.removeChild(oldNode);

    if (activeElement && activeElement !== document.activeElement && newNode.contains(activeElement)) {
        activeElement.focus();
    }
}
