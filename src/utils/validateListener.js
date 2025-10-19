/**
 * Validates that the listener is a function.
 * @param {Function} listener The listener to validate.
 * @throws {TypeError} If the listener is not a function.
 * @module
 * @private
 */
export default function validateListener(listener) {
    if (typeof listener !== 'function') {
        throw new TypeError('Listener must be a function');
    }
}
