import createDevelopmentMessage from './createDevelopmentMessage.js';

/**
 * Creates a formatted warning message with ASCII art (development version).
 * @param {string} message The warning message. Supports \n for multiple lines.
 * @return {string} Formatted warning message with ASCII art.
 * @module
 * @private
 */
export default function createDevelopmentWarningMessage(message) {
    return createDevelopmentMessage('Heads up!', message);
}
