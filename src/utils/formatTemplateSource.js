import repeat from './repeat.js';
import padStart from './padStart.js';

/**
 * Converts an expression to its string representation for display.
 * @param {any} expr The expression to convert.
 * @return {string} String representation of the expression.
 * @private
 */
function expressionToString(expr) {
    if (typeof expr.toString === 'function') {
        const source = expr.toString();
        // Keep single line or show first line for multi-line.
        return '${' + (source.includes('\n') ? source.split('\n')[0] + '...' : source) + '}';
    }
    return '${' + String(expr) + '}';
}

/**
 * Formats the template source with line numbers and highlights the specific error expression.
 * @param {Object} source The original template source object with strings and expressions.
 * @param {any} errorExpression The expression that caused the error.
 * @return {string} Formatted template source.
 * @module
 * @private
 */
export default function formatTemplateSource(source, errorExpression) {
    if (!source || !source.strings || !source.expressions || !errorExpression) return '';

    const { strings, expressions } = source;

    // Find the index of the error expression in the expressions array.
    const expressionIndex = expressions.indexOf(errorExpression);
    if (expressionIndex === -1) return '';

    // Build the template source and calculate the error position directly.
    let templateSource = '';
    let errorPosition = -1;

    for (let i = 0; i < strings.length; i++) {
        templateSource += strings[i];

        if (i < expressions.length) {
            // Mark the position before adding the error expression.
            if (i === expressionIndex) {
                errorPosition = templateSource.length;
            }
            templateSource += expressionToString(expressions[i]);
        }
    }

    if (errorPosition === -1) return '';

    // Find the line and column of the error position.
    const lines = templateSource.split('\n');
    const formattedLines = [];
    const maxLineNumWidth = String(lines.length).length;

    let errorLineNum = -1;
    let errorStartCol = -1;
    let charCount = 0;

    for (let i = 0; i < lines.length; i++) {
        const lineLength = lines[i].length + 1; // +1 for newline character.
        if (charCount + lineLength > errorPosition) {
            errorLineNum = i;
            errorStartCol = errorPosition - charCount;
            break;
        }
        charCount += lineLength;
    }

    if (errorLineNum === -1) return '';

    // Get the expression string to determine marker length.
    const expressionStr = expressionToString(errorExpression);

    // Format output with context.
    const contextStart = Math.max(0, errorLineNum - 2);
    const contextEnd = Math.min(lines.length - 1, errorLineNum + 2);

    for (let i = contextStart; i <= contextEnd; i++) {
        const lineNum = i + 1;
        const lineNumStr = padStart(String(lineNum), maxLineNumWidth, ' ');
        const isErrorLine = i === errorLineNum;
        const linePrefix = isErrorLine ? ` ${lineNumStr} > ` : ` ${lineNumStr} | `;

        formattedLines.push(linePrefix + lines[i]);

        // Add pointer on error line.
        if (isErrorLine) {
            const markerPos = linePrefix.length + errorStartCol;
            const markerLen = expressionStr.length;
            const pointerLine = repeat(' ', markerPos) + repeat('^', markerLen) + ' <-- Error here!';
            formattedLines.push(pointerLine);
        }
    }

    // If error expression is multi-line, show full details.
    if (typeof errorExpression === 'function') {
        const fullSource = errorExpression.toString();
        if (fullSource.match(/\n/)) {
            formattedLines.push('');
            formattedLines.push('     | Expression details:');
            fullSource.split('\n').forEach(line => {
                formattedLines.push('     |     ' + line);
            });
        }
    }

    return formattedLines.join('\n');
}
