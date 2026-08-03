/**
 * Resolve a slot to its raw value: a `number` is an expression index (looked up
 * in `expressions`), anything else is a literal (attribute names/values parsed
 * from the template are always strings).
 * @param {number|string} slot The slot to resolve.
 * @param {Array<any>} expressions The current render expressions.
 * @return {any} The expression at that index, or the literal.
 * @private
 */
const resolveSlot = (slot, expressions) => typeof slot === 'number' ? expressions[slot] : slot;

/**
 * A parsed template attribute. Holds its key and value as either an expression
 * index (`number`) or a literal, plus whether the value was quoted, and knows
 * how to resolve itself against the current expressions.
 * @param {number|string} key Expression index or literal attribute name.
 * @param {number|string|undefined} value Expression index, literal, or `undefined` for a value-less attribute.
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
     * @param {object} options The owner's handlers (for `evaluate`).
     */
    applyTo(attributes, expressions, options) {
        const key = options.evaluate(resolveSlot(this.key, expressions), 'element attribute');

        if (typeof this.value === 'undefined') {
            // Value-less attribute: object spread or boolean.
            if (typeof key === 'object') Object.assign(attributes, key);
            else if (typeof key === 'string') attributes[key] = true;
            return;
        }

        attributes[key] = this.quoted ?
            options.evaluate(resolveSlot(this.value, expressions), 'element attribute') :
            resolveSlot(this.value, expressions);
    }
}

export default Attribute;
