const repeat = (string, length) => new Array(length).fill(string).join('');
const padEnd = (string, length, char = ' ') => string + repeat(char, length - string.length);

/**
 * Creates a formatted error message with ASCII art.
 * @param {string} context The error context.
 * @param {string} message The error message.
 * @return {string} Formatted error message with ASCII art.
 * @module
 */
export default function createErrorMessage(context, message) {
    const title = 'Something went wrong!';
    const minWidth = 40;
    const catWidth = 15;
    const contentWidth = Math.max(minWidth, title.length, context.length, message.length);
    const catPadding = Math.floor((contentWidth - catWidth) / 2);
    const border = '+' + padEnd('-', contentWidth + 2, '-') + '+';
    
    const lines = [
        '',
        `  ${border}`,
        `  | ${padEnd(title, contentWidth)} |`,
        `  | ${padEnd(context, contentWidth)} |`,
        `  | ${padEnd(message, contentWidth)} |`,
        `  ${border}`,
        `  ${repeat(' ', catPadding)} \\|`,
        `  ${repeat(' ', catPadding)}  \\`,
        `  ${repeat(' ', catPadding)}     /\\___/\\`,
        `  ${repeat(' ', catPadding)}    ( o . o )`,
        `  ${repeat(' ', catPadding)}    >   ︵   <`,
        `  ${repeat(' ', catPadding)}    /|     |\\`,
        `  ${repeat(' ', catPadding)}   (_|     |_)`,
        ''
    ];
    return lines.join('\n');
}
