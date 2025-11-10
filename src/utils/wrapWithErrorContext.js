import createErrorMessage from './createErrorMessage.js';

/**
 * Wraps an operation with error context to provide better error messages.
 * Catches errors and enhances them with custom context.
 * @param {Function} fn The function to execute.
 * @param {string} [errorMessage] Custom error message prefix (optional).
 * @return {any} The result of the function.
 * @throws {Error} Enhanced error with context.
 * @module
 * @private
 */
export default function wrapWithErrorContext(fn, errorMessage) {
    try {
        return fn();
    } catch (error) {
        if (errorMessage && !error.cause) {
            const enhancedError = new Error(
                createErrorMessage(errorMessage, error.message),
                { cause : error }
            );
            enhancedError.stack = error.stack;
            throw enhancedError;
        }
        throw error;
    }
}
