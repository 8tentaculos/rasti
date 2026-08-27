import LiteralSlot from './LiteralSlot.js';

/**
 * Wrapper class for HTML strings marked as safe.
 * @param {string} value The HTML string to be marked as safe.
 * @property {string} value The HTML string.
 * @property {Function} Slot The class of the live state this part renders through.
 * @private
 */
class SafeHTML {
    constructor(value) {
        this.value = value;
    }

    toString() {
        return this.value;
    }
}

SafeHTML.Slot = LiteralSlot;

export default SafeHTML;
