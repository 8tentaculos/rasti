/**
 * Repeats a string a given number of times.
 * @param {string} string The string to repeat.
 * @param {number} length The number of times to repeat the string.
 * @return {string} The repeated string.
 * @private
 */
const repeat = (string, length, acc = '') => length > 0 ? repeat(string, length - 1, acc + string) : acc;

/**
 * Pads a string to a given length with a given character.
 * @param {string} string The string to pad.
 * @param {number} length The length to pad the string to.
 * @param {string} char The character to pad the string with.
 * @return {string} The padded string.
 * @private
 */
const padEnd = (string, length, char = ' ') => string + repeat(char, length - string.length);

/**
 * The ASCII art cat.
 * @type {string[]}
 * @private
 */
const cat = [
    ' \\|                ',
    '   \\               ',
    '      /\\___/\\      ',
    '     ( o . o )     ',
    '     >   ︵   <     ',
    '     /|     |\\     ',
    '    (_|     |_)    '
];

/**
 * Creates a formatted error message with ASCII art (development version).
 * @param {string} message The error message. Supports \n for multiple lines.
 * @return {string} Formatted error message with ASCII art.
 * @module
 * @private
 */
export default function createDevelopmentErrorMessage(message) {
    const title = 'Something went wrong!';
    const minWidth = 40;
    const lines = message.split('\n');
    const contentWidth = Math.max(minWidth, title.length, ...lines.map(line => line.length));
    const catPadding = Math.floor((contentWidth - cat[0].length) / 2);
    const border = '+' + padEnd('-', contentWidth + 2, '-') + '+';
    return [
        '',
        `  ${border}`,
        `  | ${padEnd(title, contentWidth)} |`,
    ].concat(lines.map(line => `  | ${padEnd(line, contentWidth)} |`))
        .concat([`  ${border}`])
        .concat(cat.map(line => `  ${repeat(' ', catPadding)} ${line}`))
        .concat([''])
        .join('\n');
}
