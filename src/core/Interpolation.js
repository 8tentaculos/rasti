import PathManager from './PathManager.js';
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
 * @param {Function} options.containsComponent Function that checks if an element contains a component.
 * @private
 */
class Interpolation {
    constructor(options) {
        this.getStart = options.getStart;
        this.getEnd = options.getEnd;
        this.expression = options.expression;
        this.shouldSkipFind = options.shouldSkipFind;
        this.shouldSkipSync = options.shouldSkipSync;
        this.tracker = new PathManager();
    }

    /**
     * Attach the interpolation reference to comment markers in the DOM.
     * Searches for start and end comment markers, skipping component subtrees.
     * @param {Node} parent The parent node to search in.
     */
    hydrate(parent) {
        const startMark = findComment(parent, this.getStart(), this.shouldSkipFind);
        const endMark = findComment(parent, this.getEnd(), this.shouldSkipFind, startMark);

        this.ref = [
            startMark,
            endMark
        ];
    }

    /**
     * Update the interpolation content with a new fragment.
     * Optimizes updates by syncing single non-component elements or replacing content entirely.
     * @param {DocumentFragment} fragment The new content fragment to insert.
     * @param {Element} targetElement The target element to replace with the new fragment.
     */
    update(fragment, handleComponents) {
        let divider;
        // Reference to marker elements.
        const [startMark, endMark] = this.ref;

        const currentFirstElement = startMark.nextSibling;
        // Check if the interpolation is empty.
        const currentEmpty = currentFirstElement === endMark;
        // Check if the interpolation has a single child element.
        const currentSingleChildElement = !currentEmpty && currentFirstElement.nextSibling === endMark;

        if (currentEmpty) {
            // The interpolation is empty. Insert the fragment.
            endMark.parentNode.insertBefore(fragment, endMark);
        } else if (
            currentSingleChildElement &&
            fragment.children.length === 1 &&
            !this.shouldSkipSync(currentFirstElement) &&
            !this.shouldSkipSync(fragment.firstChild)
        ) {
            // The interpolation has a single child element and the new fragment has a single child element.
            // The elements doesn't contain a component. Sync node attributes and content.
            syncNode(currentFirstElement, fragment.firstChild);
        } else {
            // The interpolation has multiple child elements or the new fragment has multiple child elements.
            // Insert a divider comment before the end marker and insert the new fragment after the divider.
            divider = document.createComment('');
            endMark.parentNode.insertBefore(divider, endMark);
            endMark.parentNode.insertBefore(fragment, endMark);
        }
        // Handle the components in the fragment. Execute the handler function.
        handleComponents();

        if (divider) {
            // Remove old content and divider.
            const startMark = this.ref[0];
            if (startMark.nextSibling === divider) {
                divider.parentNode.removeChild(divider);
            } else {
                const range = document.createRange();
                range.setStartAfter(this.ref[0]);
                range.setEndAfter(divider);
                range.deleteContents();
            }
        }
    }

    /**
     * Update the interpolation content with a new fragment. This is used for container components.
     * @param {Element} element The element to replace with the new fragment.
     * @param {DocumentFragment} fragment The new content fragment to insert.
     * @param {Function} handleComponents Function to handle the components in the fragment before removing the old content.
     */
    updateElement(element, fragment, handleComponents) {
        const divider = document.createComment('');
        element.parentNode.insertBefore(divider, element.nextSibling);
        divider.parentNode.insertBefore(fragment.firstChild, divider.nextSibling);
        handleComponents();
        if (element.nextSibling === divider) element.parentNode.removeChild(element);
        divider.parentNode.removeChild(divider);
    }
}

export default Interpolation;
