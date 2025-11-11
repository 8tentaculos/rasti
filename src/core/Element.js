import getAttributesDiff from '../utils/getAttributesDiff.js';

const SYNC_PROPS = ['value', 'checked', 'selected'];

/**
 * Element reference for managing DOM element attributes.
 * @param {Object} options The options object.
 * @param {Function} options.getSelector Function that returns the CSS selector for the element.
 * @param {Function} options.getAttributes Function that returns the attributes object for the element.
 * @private
 */
class Element {
    constructor(options) {
        this.getSelector = options.getSelector;
        this.getAttributes = options.getAttributes;
        this.previousAttributes = {};
    }

    /**
     * Attach the element reference to a DOM element.
     * @param {Node} parent The parent node to search in.
     */
    hydrate(parent) {
        this.ref = parent.querySelector(this.getSelector());
    }

    /**
     * Update the element's attributes based on the difference with previous attributes.
     */
    update() {
        // Attributes diff.
        const attributes = this.getAttributes();
        const { remove, add } = getAttributesDiff(attributes, this.previousAttributes);
        // Store previous attributes.
        this.previousAttributes = attributes;
        // Remove attributes first so later `setAttribute` overrides if needed.
        remove.forEach(attr => {
            this.ref.removeAttribute(attr);
            if (SYNC_PROPS.indexOf(attr) !== -1 && attr in this.ref) {
                // Reset property to default.
                this.ref[attr] = attr === 'value' ? '' : false;
            }
        });
        // Add / update attributes.
        Object.keys(add).forEach(attr => {
            const value = add[attr];
            this.ref.setAttribute(attr, value);
            if (SYNC_PROPS.indexOf(attr) !== -1 && attr in this.ref) {
                this.ref[attr] = attr === 'value' ? value : value !== false && value !== 'false';
            }
        });
    }
}

export default Element;
