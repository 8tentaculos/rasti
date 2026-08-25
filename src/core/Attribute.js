import ExpressionIndex from './ExpressionIndex.js';

/**
 * Resolve a parsed part to its raw value: an `ExpressionIndex` is looked up in
 * `expressions`, anything else is a literal parsed from the template.
 * @param {ExpressionIndex|string} part The key or value to resolve.
 * @param {Array<any>} expressions The current render expressions.
 * @return {any} The expression it points at, or the literal.
 * @private
 */
const resolvePart = (part, expressions) => part instanceof ExpressionIndex ? expressions[part.index] : part;

/**
 * A parsed template attribute. Holds its key and value as either an
 * `ExpressionIndex` or a literal, plus whether the value was quoted, and knows
 * how to resolve itself against the current expressions.
 * @param {ExpressionIndex|string} key Expression reference or literal attribute name.
 * @param {ExpressionIndex|string|undefined} value Expression reference, literal, or `undefined` for a value-less attribute.
 * @param {boolean} quoted Whether the value was quoted (evaluated) or unquoted (passed as-is).
 * @private
 */
class Attribute {
    constructor(key, value, quoted) {
        this.key = key;
        this.value = value;
        this.quoted = quoted;
    }

    /**
     * Resolve this attribute into the attributes object. A value-less attribute
     * expands an object (spread) or sets a boolean; otherwise a quoted value is
     * evaluated and an unquoted one is passed as its raw expression.
     * @param {object} attributes The attributes object to add to.
     * @param {Array<any>} expressions The current render expressions.
     * @param {PartialHandlers} owner The partial's owner (for `evaluate`).
     */
    applyTo(attributes, expressions, owner) {
        const key = owner.evaluate(resolvePart(this.key, expressions), 'element attribute');

        if (typeof this.value === 'undefined') {
            // Value-less attribute: object spread or boolean.
            if (typeof key === 'object') Object.assign(attributes, key);
            else if (typeof key === 'string') attributes[key] = true;
            return;
        }

        attributes[key] = this.quoted ?
            owner.evaluate(resolvePart(this.value, expressions), 'element attribute') :
            resolvePart(this.value, expressions);
    }
}

export default Attribute;
