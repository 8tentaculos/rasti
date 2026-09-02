import warnTemplate from './warnTemplate.js';

/**
 * Warn once per call site about an attribute using one of the two interpolation
 * forms that stay unsupported: a placeholder in an attribute name, or an unquoted
 * mixed value. Both survive parsing as a literal still holding a placeholder, whose
 * expression index the parser records on the `Attribute`. Development only.
 * @param {Function} PartialClass The partial subclass (carries the template source).
 * @param {object} descriptor The element or component descriptor holding the attributes.
 * @module
 * @private
 */
export default function warnUnsupportedAttribute(PartialClass, descriptor) {
    if (descriptor.warned) return;
    const attribute = descriptor.attributes.find(attr => typeof attr.unsupportedIndex !== 'undefined');
    if (!attribute) return;
    const { source } = PartialClass;
    warnTemplate(
        PartialClass,
        descriptor,
        source && source.expressions[attribute.unsupportedIndex],
        'Unsupported interpolation in an attribute\n' +
        'Attribute names must be literal, and an unquoted value takes a single\n' +
        'interpolation. Quoted values compose:\n' +
        '\n' +
        '  data-${x}="1"   ❌ attribute names must be literal\n' +
        '  attr=x${fn}     ❌ unquoted values take a single interpolation\n' +
        '  attr="x ${fn}"  ✅ quoted values compose\n' +
        '  attr=${fn}      ✅ unquoted passes the reference as-is'
    );
}
