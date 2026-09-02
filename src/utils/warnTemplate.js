import createDevelopmentWarningMessage from './createDevelopmentWarningMessage.js';
import formatTemplateSource from './formatTemplateSource.js';

/**
 * Print a warning about one dynamic part of a template, pointing at the offending
 * expression in the template source, and silence further ones from the same call
 * site: the descriptor comes from the skeleton, which every partial from that call
 * site shares. When the source is unavailable (production, or a component tag's
 * inner skeleton) the message prints without the source block. Development only.
 * @param {Function} PartialClass The partial subclass (carries the template source).
 * @param {object} descriptor The descriptor the warning is about.
 * @param {any} expression The offending expression.
 * @param {string} message The warning message.
 * @module
 * @private
 */
export default function warnTemplate(PartialClass, descriptor, expression, message) {
    const formattedSource = formatTemplateSource(PartialClass.source, expression, 'This interpolation');
    descriptor.warned = true;
    console.warn(createDevelopmentWarningMessage(
        message + (formattedSource ? `\n\nTemplate source:\n\n${formattedSource}` : '')
    ));
}
