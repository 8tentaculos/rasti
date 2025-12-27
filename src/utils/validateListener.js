import createDevelopmentErrorMessage from './createDevelopmentErrorMessage.js';
import createProductionErrorMessage from './createProductionErrorMessage.js';
import __DEV__ from './dev.js';

/**
 * Validates that the listener is a function.
 * @param {Function} listener The listener to validate.
 * @throws {TypeError} If the listener is not a function.
 * @module
 * @private
 */
export default function validateListener(listener) {
    if (typeof listener !== 'function') {
        const message = 'Event listener must be a function';
        throw new TypeError(__DEV__ ? createDevelopmentErrorMessage(message) : createProductionErrorMessage(message));
    }
}
