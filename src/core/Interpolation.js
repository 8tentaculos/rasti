import syncNode from '../utils/syncNode.js';
import findComment from '../utils/findComment.js';

/**
 * Interpolation reference for managing dynamic content between comment markers.
 * Handles the lifecycle of content that can change between renders, including
 * component recycling and DOM synchronization.
 * @param {Object} options The options object.
 * @param {Function} options.getStart Function that returns the start comment marker text.
 * @param {Function} options.getEnd Function that returns the end comment marker text.
 * @param {any} options.expression The expression to be evaluated for the interpolation.
 * @param {Function} options.isComponent Function that checks if an element is a component root element.
 * @param {Function} options.isElement Function that checks if an element has the Rasti data attribute.
 * @private
 */
class Interpolation {
    constructor(options) {
        this.getStart = options.getStart;
        this.getEnd = options.getEnd;
        this.expression = options.expression;
        this.isComponent = options.isComponent;
        this.isElement = options.isElement;
    }

    /**
     * Attach the interpolation reference to comment markers in the DOM.
     * Searches for start and end comment markers, skipping component subtrees.
     * @param {Node} parent The parent node to search in.
     * @param {Map<string, Comment>} interpolationMarkers Cache for found comment markers.
     */
    hydrate(parent, interpolationMarkers) {
        const startComment = findComment(parent, this.getStart(), this.isComponent, interpolationMarkers);
        const endComment = findComment(parent, this.getEnd(), this.isComponent, interpolationMarkers, startComment);
        this.ref = [
            startComment, 
            endComment
        ];
    }

    /**
     * Update the interpolation content with a new fragment.
     * Optimizes updates by syncing single non-component elements or replacing content entirely.
     * @param {DocumentFragment} fragment The new content fragment to insert.
     */
    update(fragment) {
        const [startComment, endComment] = this.ref;

        const currentFirstElement = startComment.nextSibling;
        const currentSingleChildElement = currentFirstElement.nextSibling === endComment;
        const currentEmpty = currentFirstElement == endComment;
        const fragmentChildren = fragment.children;

        if (currentSingleChildElement && fragmentChildren.length === 1 && !this.isElement(currentFirstElement)) {
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
