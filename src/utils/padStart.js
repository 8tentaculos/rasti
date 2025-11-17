import repeat from './repeat.js';

/**
 * Pads a string to a given length with a given character at the start.
 * @param {string} string The string to pad.
 * @param {number} length The length to pad the string to.
 * @param {string} char The character to pad the string with.
 * @return {string} The padded string.
 * @module
 * @private
 */
export default function padStart(string, length, char = ' ') {
    return repeat(char, length - string.length) + string;
}
