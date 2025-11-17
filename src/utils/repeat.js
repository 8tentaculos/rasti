/**
 * Repeats a string a given number of times.
 * @param {string} string The string to repeat.
 * @param {number} length The number of times to repeat the string.
 * @param {string} acc Accumulator for recursion.
 * @return {string} The repeated string.
 * @module
 * @private
 */
export default function repeat(string, length, acc = '') {
    return length > 0 ? repeat(string, length - 1, acc + string) : acc;
}
