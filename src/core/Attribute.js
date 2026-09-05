import ExpressionIndex from './ExpressionIndex.js';
import valueToString from './valueToString.js';

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
     * expands an object (spread) or sets a boolean; a mixed value joins its parts;
     * otherwise a quoted value is evaluated and an unquoted one is passed as its
     * raw expression.
     *
     * When `sourceKeys` is given, the key of a value that is a *pure literal*
     * written in the template is marked as HTML source; any other write drops the
     * mark, so a spread or a later dynamic value overwriting a literal-marked key
     * serializes as the plain text it is.
     * @param {object} attributes The attributes object to add to.
     * @param {Array<any>} expressions The current render expressions.
     * @param {ComponentAdapter} owner The partial's owner (for `evaluate`).
     * @param {Set<string>} [sourceKeys] Set collecting the keys whose values are HTML source.
     */
    applyTo(attributes, expressions, owner, sourceKeys) {
        const key = owner.evaluate(resolvePart(this.key, expressions), 'element attribute');

        if (typeof this.value === 'undefined') {
            // Value-less attribute: object spread or boolean.
            if (typeof key === 'object') {
                Object.assign(attributes, key);
                // Spread values are runtime data (plain text).
                if (sourceKeys) Object.keys(key).forEach(spreadKey => sourceKeys.delete(spreadKey));
            } else if (typeof key === 'string') {
                attributes[key] = true;
                if (sourceKeys) sourceKeys.delete(key);
            }
            return;
        }

        if (Array.isArray(this.value)) {
            // Mixed value: literal parts are taken as-is; each interpolated part is
            // evaluated like any quoted value, coerced, and the parts join into one
            // string. Mixed values are quoted by construction, and they are plain
            // text including their literal parts: the author is composing a string,
            // not writing markup.
            attributes[key] = this.value.map(part =>
                part instanceof ExpressionIndex ?
                    valueToString(owner.evaluate(resolvePart(part, expressions), 'element attribute')) :
                    part
            ).join('');
            if (sourceKeys) sourceKeys.delete(key);
            return;
        }

        attributes[key] = this.quoted ?
            owner.evaluate(resolvePart(this.value, expressions), 'element attribute') :
            resolvePart(this.value, expressions);

        if (sourceKeys) {
            if (typeof this.value === 'string') sourceKeys.add(key);
            else sourceKeys.delete(key);
        }
    }
}

export default Attribute;
