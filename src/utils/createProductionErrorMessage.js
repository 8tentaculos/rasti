/**
 * Production version: returns the message as-is without formatting.
 * @param {string} message The error message.
 * @return {string} Plain error message.
 * @module
 * @private
 */
export default function createProductionErrorMessage(message) {
    return message;
}
