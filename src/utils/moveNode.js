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
 * Moves a DOM node before another one, preserving internal DOM state.
 * Uses moveBefore if available, otherwise falls back to insertBefore.
 *
 * @param {Node} node The DOM node to move.
 * @param {Node} reference The DOM node to move it before, inside its parent.
 * @module
 * @private
 */
export default function moveNode(node, reference) {
    const activeElement = preserveFocus &&
        document.activeElement &&
        node.contains(document.activeElement) ?
        document.activeElement : null;

    if (activeElement && resetFocus) activeElement.blur();

    reference.parentNode[moveBeforeSupported ? 'moveBefore' : 'insertBefore'](node, reference);

    if (activeElement && activeElement !== document.activeElement && node.contains(activeElement)) {
        activeElement.focus();
    }
}
