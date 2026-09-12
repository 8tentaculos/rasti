/**
 * Wrapper class for HTML strings marked as safe.
 * @param {string} value The HTML string to be marked as safe.
 * @property {string} value The HTML string.
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

export default SafeHTML;
