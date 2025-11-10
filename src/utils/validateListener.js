import createErrorMessage from './createErrorMessage.js';

/**
 * Validates that the listener is a function.
 * @param {Function} listener The listener to validate.
 * @throws {TypeError} If the listener is not a function.
 * @module
 * @private
 */
export default function validateListener(listener) {
    if (typeof listener !== 'function') {
        throw new TypeError(createErrorMessage(
            'Event listener validation error',
            'Listener must be a function'
        ));
    }
}
