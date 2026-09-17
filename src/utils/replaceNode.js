import moveNode from './moveNode.js';

/**
 * Replaces an existing DOM node with a new node, preserving internal DOM state.
 *
 * @param {Node} oldNode The existing DOM node to replace.
 * @param {Node} newNode The new DOM node to replace the old node with.
 * @module
 * @private
 */
export default function replaceNode(oldNode, newNode) {
    const parent = oldNode.parentNode;
    moveNode(newNode, oldNode);
    parent.removeChild(oldNode);
}
