import createDevelopmentMessage from './createDevelopmentMessage.js';

/**
 * Creates a formatted error message with ASCII art (development version).
 * @param {string} message The error message. Supports \n for multiple lines.
 * @return {string} Formatted error message with ASCII art.
 * @module
 * @private
 */
export default function createDevelopmentErrorMessage(message) {
    return createDevelopmentMessage('Something went wrong!', message);
}
