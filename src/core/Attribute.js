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
 * Coerce a resolved mixed-value part for string composition, with the same rule
 * content interpolations use: nullish and boolean values render as the empty
 * string, anything else as its string form.
 * @param {any} value The resolved part.
 * @return {string} The part's contribution to the joined value.
 * @private
 */
const coercePart = value =>
    value === null || typeof value === 'undefined' || typeof value === 'boolean' ? '' : `${value}`;

/**
 * A parsed template attribute. Holds its key and value as either an
 * `ExpressionIndex` or a literal — or, for a mixed value, an array of literal
 * and `ExpressionIndex` parts — plus whether the value was quoted, and knows
 * how to resolve itself against the current expressions.
 * @param {ExpressionIndex|string} key Expression reference or literal attribute name.
 * @param {ExpressionIndex|string|Array<string|ExpressionIndex>|undefined} value Expression
 *     reference, literal, mixed-value parts, or `undefined` for a value-less attribute.
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

        if (Array.isArray(this.value)) {
            // Mixed value: literal parts are taken as-is; each interpolated part is
            // evaluated like any quoted value, coerced, and the parts join into one
            // string. Mixed values are quoted by construction.
            attributes[key] = this.value.map(part =>
                part instanceof ExpressionIndex ?
                    coercePart(owner.evaluate(resolvePart(part, expressions), 'element attribute')) :
                    part
            ).join('');
            return;
        }

        attributes[key] = this.quoted ?
            owner.evaluate(resolvePart(this.value, expressions), 'element attribute') :
            resolvePart(this.value, expressions);
    }
}

export default Attribute;
