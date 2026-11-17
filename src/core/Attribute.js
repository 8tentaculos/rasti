import ExpressionDescriptor from './ExpressionDescriptor.js';
import valueToString from './valueToString.js';
import getEventType from './getEventType.js';

import removeItem from '../utils/removeItem.js';

/**
 * Resolve a parsed part to its raw value: an `ExpressionDescriptor` is looked up in
 * `expressions`, anything else is a literal parsed from the template.
 * @param {ExpressionDescriptor|string} part The key or value to resolve.
 * @param {Array<any>} expressions The current render expressions.
 * @return {any} The expression it points at, or the literal.
 * @private
 */
const resolvePart = (part, expressions) => part instanceof ExpressionDescriptor ? expressions[part.index] : part;

/**
 * Write one resolved attribute. On an element (a `host` is given), an event
 * attribute registers its listener with the host and is written as the
 * data-attribute that carries the listener's index. A falsy listener gets no index,
 * which leaves the data-attribute out, so the last write of an event wins, as for
 * any other attribute. Anything else is written as it is.
 * @param {object} attributes The attributes object to add to.
 * @param {string} key The attribute name.
 * @param {any} value The resolved value.
 * @param {string|null} type The event type the attribute binds, or `null`.
 * @param {ComponentAdapter} owner The partial's owner, the listener runs as it.
 * @param {ComponentAdapter} [host] The partial's host, which delegates the listener.
 * @private
 */
const write = (attributes, key, value, type, owner, host) => {
    if (type && host) {
        const { attribute, index } = host.registerListener(value, type, owner);
        attributes[attribute] = index;
    } else {
        attributes[key] = value;
    }
};

/**
 * A parsed template attribute. Holds its key and value as either an
 * `ExpressionDescriptor` or a literal — or, for a mixed value, an array of literal
 * and `ExpressionDescriptor` parts — plus whether the value was quoted, and knows
 * how to resolve itself against the current expressions.
 * @param {ExpressionDescriptor|string} key Expression reference or literal attribute name.
 * @param {ExpressionDescriptor|string|Array<string|ExpressionDescriptor>|undefined} value Expression
 *     reference, literal, mixed-value parts, or `undefined` for a value-less attribute.
 * @param {boolean} quoted Whether the value was quoted (evaluated) or unquoted (passed as-is).
 * @private
 */
class Attribute {
    constructor(key, value, quoted) {
        this.key = key;
        this.value = value;
        this.quoted = quoted;
        // A literal name binds the same event on every render: read it once.
        this.eventType = typeof key === 'string' ? getEventType(key) : null;
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
     * @param {ComponentAdapter} [host] The partial's host, given on an element: it
     *     delegates the event listeners (see `write`).
     * @param {Array<string>} [sourceKeys] Array collecting the keys whose values are HTML source.
     */
    applyTo(attributes, expressions, owner, host, sourceKeys) {
        const key = owner.evaluate(resolvePart(this.key, expressions), 'element attribute');
        // An interpolated name is only known now.
        const type = host ? (typeof this.key === 'string' ? this.eventType : getEventType(key)) : null;

        if (typeof this.value === 'undefined') {
            // Value-less attribute: object spread or boolean.
            if (key && typeof key === 'object') {
                const keys = Object.keys(key);
                for (let i = 0; i < keys.length; i++) {
                    const spreadKey = keys[i];
                    write(attributes, spreadKey, key[spreadKey], host ? getEventType(spreadKey) : null, owner, host);
                    // Spread values are runtime data (plain text).
                    if (sourceKeys) removeItem(sourceKeys, spreadKey);
                }
            } else if (typeof key === 'string') {
                write(attributes, key, true, type, owner, host);
                if (sourceKeys) removeItem(sourceKeys, key);
            }
            return;
        }

        if (Array.isArray(this.value)) {
            // Mixed value: literal parts are taken as-is; each interpolated part is
            // evaluated like any quoted value, coerced, and the parts join into one
            // string. Mixed values are quoted by construction, and they are plain
            // text including their literal parts: the author is composing a string,
            // not writing markup.
            write(attributes, key, this.value.map(part =>
                part instanceof ExpressionDescriptor ?
                    valueToString(owner.evaluate(resolvePart(part, expressions), 'element attribute')) :
                    part
            ).join(''), type, owner, host);
            if (sourceKeys) removeItem(sourceKeys, key);
            return;
        }

        write(attributes, key, this.quoted ?
            owner.evaluate(resolvePart(this.value, expressions), 'element attribute') :
            resolvePart(this.value, expressions), type, owner, host);

        if (sourceKeys && !type) {
            if (typeof this.value !== 'string') removeItem(sourceKeys, key);
            else if (!sourceKeys.includes(key)) sourceKeys.push(key);
        }
    }
}

export default Attribute;
