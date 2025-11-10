const padEnd = (string, length) => string.length < length ? padEnd(string + ' ', length) : string;

/**
 * Creates a formatted error message with ASCII art.
 * @param {string} context The error context.
 * @param {string} message The error message.
 * @return {string} Formatted error message with ASCII art.
 * @module
 */
export default function createErrorMessage(context, message) {
    const lines = [
        '',
        '  +----------------------------------------------------------------------+',
        '  | Something went wrong!                                                |',
        `  | ${padEnd(context, 68)} |`,
        `  | ${padEnd(message, 68)} |`,
        '  +----------------------------------------------------------------------+',
        '                            \\|',
        '                              \\',
        '                                 /\\_/\\',
        '                                ( x.x )',
        '                                 > ^ <',
        '                                /|   |\\',
        '                               (_|   |_)',
        ''
    ];
    return lines.join('\n');
}
