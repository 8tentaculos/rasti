import repeat from './repeat.js';
import padEnd from './padEnd.js';

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
 * Creates a formatted message with ASCII art (development version).
 * @param {string} title The title shown at the top of the box.
 * @param {string} message The message. Supports \n for multiple lines.
 * @return {string} Formatted message with ASCII art.
 * @module
 * @private
 */
export default function createDevelopmentMessage(title, message) {
    const minWidth = 40;
    const lines = message.split('\n');
    const contentWidth = Math.max(minWidth, title.length, ...lines.map(line => line.length));
    const catPadding = Math.floor((contentWidth - cat[0].length) / 2);
    const border = '+' + padEnd('-', contentWidth + 2, '-') + '+';
    return [
        '',
        `  ${border}`,
        `  | ${padEnd(title, contentWidth)} |`,
        `  | ${padEnd('', contentWidth)} |`,
    ].concat(lines.map(line => `  | ${padEnd(line, contentWidth)} |`))
        .concat([`  ${border}`])
        .concat(cat.map(line => `  ${repeat(' ', catPadding)} ${line}`))
        .concat([''])
        .join('\n');
}
