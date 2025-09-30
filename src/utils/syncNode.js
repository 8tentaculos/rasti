/**
 * Properties that should be mirrored from source to target.
 * @type {string[]}
 * @private
 */
const SYNC_PROPS = ['value', 'checked', 'selected'];

/**
 * Compares two elements to see if their child nodes are structurally equal.
 * @param {Element} a First element to compare.
 * @param {Element} b Second element to compare.
 * @return {boolean} True if all child nodes are deeply equal.
 * @private
 */
const areChildNodesEqual = (a, b) => {
    const aChildren = a.childNodes;
    const bChildren = b.childNodes;
    const aLength = aChildren.length;

    if (aLength !== bChildren.length) return false;

    for (let i = 0; i < aLength; i++) {
        if (!aChildren[i].isEqualNode(bChildren[i])) {
            return false;
        }
    }
    return true;
};

/**
 * Synchronizes attributes and key DOM properties (value, checked, selected).
 * Assumes tagName is already the same.
 * @param {Element} targetEl Target DOM element to update.
 * @param {Element} sourceEl Source DOM element to copy attributes from.
 * @private
 */
const syncAttributes = (targetEl, sourceEl) => {
    // Add, update and remove attributes.
    const srcAttrs = sourceEl.attributes;
    const tgtAttrs = targetEl.attributes;
    const srcAttrNames = new Set();

    for (let i = 0, l = srcAttrs.length; i < l; i++) {
        const { name, value } = srcAttrs[i];
        srcAttrNames.add(name);
        if (targetEl.getAttribute(name) !== value) targetEl.setAttribute(name, value);
    }

    for (let i = tgtAttrs.length - 1; i >= 0; i--) {
        const { name } = tgtAttrs[i];
        if (!srcAttrNames.has(name)) targetEl.removeAttribute(name);
    }
    // Sync key DOM properties.
    for (let i = 0, l = SYNC_PROPS.length; i < l; i++) {
        const prop = SYNC_PROPS[i];
        if (prop in targetEl && targetEl[prop] !== sourceEl[prop]) {
            targetEl[prop] = sourceEl[prop];
        }
    }
};

/**
 * Replaces all child nodes of targetEl with those from sourceEl.
 * Moves the nodes without cloning.
 * @param {Element} targetEl The element whose children will be replaced.
 * @param {Element} sourceEl The element providing new children.
 * @module
 * @private
 */
const syncNodeContent = (targetEl, sourceEl) => {
    const children = Array.from(sourceEl.childNodes);
    targetEl.replaceChildren(...children);
};

/**
 * Synchronizes the contents of one DOM node to match another.
 * It performs a shallow sync: tag name, attributes, properties, and child nodes.
 * If tag names or node types differ, it replaces the node entirely.
 * @param {Node} targetNode The node currently in the DOM to be updated.
 * @param {Node} sourceNode The reference node to sync from (not in the DOM).
 * @private
 */
export default function syncNode(targetNode, sourceNode) {
    // Replace if node types are different (e.g. element vs text).
    if (targetNode.nodeType !== sourceNode.nodeType) {
        targetNode.replaceWith(sourceNode);
        return;
    }
    // Text node: sync value.
    if (targetNode.nodeType === Node.TEXT_NODE) {
        if (targetNode.nodeValue !== sourceNode.nodeValue) {
            targetNode.nodeValue = sourceNode.nodeValue;
        }
        return;
    }
    // Element node: check tag.
    if (targetNode.tagName !== sourceNode.tagName) {
        targetNode.replaceWith(sourceNode);
        return;
    }
    // Sync attributes and DOM properties.
    syncAttributes(targetNode, sourceNode);
    // Sync child nodes if necessary.
    if (!areChildNodesEqual(targetNode, sourceNode)) {
        syncNodeContent(targetNode, sourceNode);
    }
}
