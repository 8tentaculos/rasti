import syncNode from '../utils/syncNode.js';

/**
 * Interpolation reference for managing dynamic content between comment markers.
 * @param {Object} options The options object.
 * @param {Function} options.getUid Function that returns the unique identifier for the interpolation.
 * @param {any} options.expression The expression to be evaluated for the interpolation.
 * @private
 */
class Interpolation {
    constructor(options) {
        this.getStart = options.getStart;
        this.getEnd = options.getEnd;
        this.expression = options.expression;
    }

    /**
     * Attach the interpolation reference to comment markers in the DOM.
     * @param {Node} parent The parent node to search in.
     */
    hydrate(parent) {
        const commentMap = new Map();
        const walker = document.createTreeWalker(parent, NodeFilter.SHOW_COMMENT);

        let node;
        while ((node = walker.nextNode())) {
            commentMap.set(node.textContent, node);
        }

        this.ref = [
            commentMap.get(this.getStart()), 
            commentMap.get(this.getEnd())
        ];
    }

    /**
     * Update the interpolation content with a new fragment.
     * @param {DocumentFragment} fragment The new content fragment to insert.
     */
    update(fragment) {
        const [startComment, endComment] = this.ref;

        const currentFirstElement = startComment.nextSibling;
        const currentSingleChildElement = currentFirstElement.nextSibling === endComment;
        const currentEmpty = currentFirstElement == endComment;
        const fragmentChildren = fragment.children;

        if (currentSingleChildElement && fragmentChildren.length === 1 && !currentFirstElement.getAttribute('data-rasti-el')) {
            // There is a single child element that is not a component's root element. Sync node attributes and content.
            syncNode(currentFirstElement, fragmentChildren[0]);
        } else if (currentEmpty) {
            // Interpolation is empty. Insert the fragment.
            endComment.parentNode.insertBefore(fragment, endComment);
        } else {
            // Interpolation is not empty. Replace the interpolation content.
            const range = document.createRange();
            range.setStartAfter(startComment);
            range.setEndBefore(endComment);
            range.deleteContents();
            range.insertNode(fragment);
        }
    }
}

export default Interpolation;
