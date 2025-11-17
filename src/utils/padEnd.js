import repeat from './repeat.js';

/**
 * Pads a string to a given length with a given character.
 * @param {string} string The string to pad.
 * @param {number} length The length to pad the string to.
 * @param {string} char The character to pad the string with.
 * @return {string} The padded string.
 * @module
 * @private
 */
export default function padEnd(string, length, char = ' ') {
    return string + repeat(char, length - string.length);
}
