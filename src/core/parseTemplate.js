import LiteralDescriptor from './LiteralDescriptor.js';
import ElementDescriptor from './ElementDescriptor.js';
import InterpolationDescriptor from './InterpolationDescriptor.js';
import ComponentDescriptor from './ComponentDescriptor.js';
import ExpressionDescriptor from './ExpressionDescriptor.js';
import Attribute from './Attribute.js';
import isVoidElement from '../utils/isVoidElement.js';
import __DEV__ from '../utils/dev.js';

/**
 * @module core/parseTemplate
 * Role-agnostic template parser. Turns a tagged template (`strings`,
 * `expressions`) into skeleton data (`parts`) that is independent of the expression
 * values: dynamic parts become descriptors that carry the original expression
 * *indices*, never the resolved values. The same shape is produced for a
 * component's own template and for a `partial`; root treatment (merging the
 * component's `attributes`, resolving `this.el`) is handled by the component when
 * it adopts its root partial.
 *
 * The parser never imports `Component`. Component-tag detection is injected
 * through the `isComponentClass` predicate; the per-component wire values (ids,
 * event data-attributes) come from the partial's owner at render time.
 *
 * Two placeholder namespaces keep the user's `expressions` array pure:
 * - `PLACEHOLDER(i)` marks an original expression at index `i`. After parsing
 *   none survive as placeholders: each becomes an `ExpressionDescriptor` (in an
 *   attribute, or as a part of its own for a dynamic tag) or the
 *   `index` of an interpolation descriptor.
 * - `SLOT_ELEMENT(k)` / `SLOT_INTERPOLATION(k)` are structural: `k` indexes the
 *   parse-time element / interpolation tables so `splitPlaceholders` can swap
 *   the marker for the descriptor instance. Those tables are scaffolding — only
 *   `parts` survives into the skeleton.
 * @private
 */

// Compile-time tokens, local to the parser: they exist only between
// `addPlaceholders` and `splitPlaceholders` and never reach the DOM, unlike the
// wire format in `Constants`.
const PLACEHOLDER = idx => `__RASTI_EXPRESSION_${idx}__`;
const SLOT_ELEMENT = idx => `__RASTI_ELEMENT_${idx}__`;
const SLOT_INTERPOLATION = idx => `__RASTI_INTERPOLATION_${idx}__`;

// Placeholder patterns to embed in the regexes below: one capturing the
// expression index, one anonymous for regexes with their own group numbering.
const PH_CAPTURE = PLACEHOLDER('(\\d+)');
const PH_ANY = PLACEHOLDER('(?:\\d+)');

// The parser's regexes, compiled once. The global ones are safe to share across
// the parser's recursion (a component tag's inner content re-enters `parseMain`
// mid-replace): `String.replace` collects every match before running the
// callbacks, so no `lastIndex` is live by then. The `exec` loops guard
// themselves by resetting `lastIndex` on entry.

/** Placeholder with its expression index captured. @type {RegExp} @private */
const RE_PH = new RegExp(PH_CAPTURE);
/** Global variant of `RE_PH`, for replaces and `exec` loops. @type {RegExp} @private */
const RE_PH_G = new RegExp(PH_CAPTURE, 'g');
/**
 * A placeholder in text content, with an optional `<` / `</` immediately before
 * it captured. The prefix marks a dynamic tag name (`<${tag}`, `</${tag}>`) — the
 * only placeholders legitimately inside a tag by the time interpolations are
 * parsed, since `parseElements` has already absorbed every attribute placeholder.
 * @type {RegExp}
 * @private
 */
const RE_PH_TEXT = new RegExp(`(</?)?${PH_CAPTURE}`, 'g');

/**
 * One attribute: a name (literal or placeholder) and an optional value in one of
 * three explicit alternatives (double-quoted, single-quoted, unquoted), so a quoted
 * value is "everything up to the closing quote" and may hold the other quote, `>`
 * or whitespace. Unquoted values need not exclude `/`: `replaceElements` hands the
 * tag ending (and the whitespace before it) to its own group, so the attributes
 * string never ends in a slash.
 * @type {RegExp}
 * @private
 */
const RE_ATTRIBUTE = new RegExp(
    `(?:${PH_CAPTURE}|([\\w-]+))` +
    '(?:=(?:' +
        `"(?:${PH_CAPTURE}|([^"]*))"` +
        `|'(?:${PH_CAPTURE}|([^']*))'` +
        `|(?:${PH_CAPTURE}|([^\\s>]+))` +
    '))?',
    'g'
);

/**
 * A tag's attributes region, quote-aware: a quoted value may hold `>` without
 * ending the tag. The inner alternation is non-capturing, so embedding it does not
 * shift the group numbering of the host regex.
 * @type {string}
 * @private
 */
const ATTRIBUTES_PATTERN = '((?:"[^"]*"|\'[^\']*\'|[^>])*?)';

/**
 * A component tag: self-closing (`<PH … />`) or non-void with a backreference
 * (`<PH …>…</PH>`, `\4` pairing the closing tag) to ensure correct pairing.
 * @type {RegExp}
 * @private
 */
const RE_COMPONENT_TAG = new RegExp(
    `<(${PH_CAPTURE})${ATTRIBUTES_PATTERN}/>|<(${PH_CAPTURE})${ATTRIBUTES_PATTERN}>([\\s\\S]*?)</\\4>`,
    'g'
);

/**
 * An HTML element opening tag, its name a literal or a placeholder. The attributes
 * group is lazy so the tag ending, and the whitespace before it, are left for the
 * ending group instead of being swallowed as attribute characters. The ending
 * matters in foreign content (SVG, MathML), where `/>` actually closes the element.
 * @type {RegExp}
 * @private
 */
const RE_ELEMENT = new RegExp(`<(${PH_ANY}|[a-z]+[1-6]?)(?:\\s*)${ATTRIBUTES_PATTERN}(\\s*/?>)`, 'gi');

/**
 * A node boundary, for walking the template's structure: a comment, or an opening
 * or closing tag. Comments are matched so the tags written inside one do not count
 * as markup; a comment match leaves the tag and ending groups undefined.
 * @type {RegExp}
 * @private
 */
const RE_NODE = new RegExp(
    `<!--[\\s\\S]*?-->|<(/)?(${PH_ANY}|[a-z]+[1-6]?)(?:\\s*)${ATTRIBUTES_PATTERN}(\\s*/?>)`,
    'gi'
);

/** Any structural slot token or surviving placeholder, index captured. @type {string} @private */
const SLOT_PATTERN = `${SLOT_ELEMENT('(\\d+)')}|${SLOT_INTERPOLATION('(\\d+)')}|${PH_CAPTURE}`;
/** A string that is exactly one slot token. @type {RegExp} @private */
const RE_SLOT = new RegExp(`^(?:${SLOT_PATTERN})$`);
/** Global variant of `SLOT_PATTERN`, for the split `exec` loop. @type {RegExp} @private */
const RE_SLOT_G = new RegExp(SLOT_PATTERN, 'g');

/**
 * Generate string with placeholders for interpolated expressions.
 * @param {Array<string>} strings Array of strings.
 * @param {Array<any>} expressions Array of expressions.
 * @return {string} String with placeholders.
 * @private
 */
const addPlaceholders = (strings, expressions) =>
    strings.reduce((out, string, i) => {
        // Add string part.
        out.push(string);
        // Add expression placeholders.
        if (typeof expressions[i] !== 'undefined') {
            out.push(PLACEHOLDER(i));
        }
        return out;
    }, []).join('');

/**
 * Split a string on a global regex into interleaved literal and match parts, in
 * source order: each literal goes through `literal`, each match through
 * `resolve`. A `literal` returning `undefined` drops that part, so each caller
 * sets its own policy for the empty literals between adjacent matches and at
 * the extremes.
 * @param {string} str The string to split.
 * @param {RegExp} regExp Global regex matching the non-literal parts.
 * @param {Function} resolve Map a regex match to its part.
 * @param {Function} literal Map a literal string to its part, or `undefined` to drop it.
 * @return {Array} The parts.
 * @private
 */
const splitByRegExp = (str, regExp, resolve, literal) => {
    regExp.lastIndex = 0;
    const out = [];
    const pushLiteral = part => {
        const mapped = literal(part);
        if (typeof mapped !== 'undefined') out.push(mapped);
    };
    let lastIndex = 0;
    let match;
    while ((match = regExp.exec(str)) !== null) {
        pushLiteral(str.slice(lastIndex, match.index));
        out.push(resolve(match));
        lastIndex = match.index + match[0].length;
    }
    pushLiteral(str.slice(lastIndex));
    return out;
};

/**
 * Split a quoted literal value still holding placeholders into its parts:
 * literal strings and `ExpressionDescriptor` instances, in template order. Empty
 * literal parts are dropped. A value that is exactly one placeholder never
 * reaches here — the placeholder alternative matches it whole.
 * @param {string} value Literal value holding at least one placeholder.
 * @return {Array<string|ExpressionDescriptor>} The value parts.
 * @private
 */
const splitValueParts = (value) => splitByRegExp(
    value,
    RE_PH_G,
    match => new ExpressionDescriptor(parseInt(match[1], 10)),
    part => part || undefined
);

/**
 * Parse attributes string into `Attribute` descriptors. Keys and values are
 * stored as an `ExpressionDescriptor` or a literal — or, for a quoted value mixing
 * literal text and interpolations, an array of parts — so the skeleton stays
 * value-agnostic.
 * @param {string} attributesStr Attributes string from HTML element.
 * @return {Array<Attribute>} Attribute descriptors.
 * @private
 */
const parseAttributes = (attributesStr) => {
    const attributes = [];
    const regExp = RE_ATTRIBUTE;
    regExp.lastIndex = 0;
    let attributeMatch;
    while ((attributeMatch = regExp.exec(attributesStr)) !== null) {
        const [
            , attributeIdx, attribute,
            doubleQuotedIdx, doubleQuotedValue,
            singleQuotedIdx, singleQuotedValue,
            unquotedIdx, unquotedValue
        ] = attributeMatch;

        // Which alternative matched tells whether the value was quoted. A quoted
        // literal may be the empty string, so presence is checked, not truthiness.
        const isDefined = part => typeof part !== 'undefined';
        const hasQuotes = [doubleQuotedIdx, doubleQuotedValue, singleQuotedIdx, singleQuotedValue].some(isDefined);

        const valueIdx = [doubleQuotedIdx, singleQuotedIdx, unquotedIdx].find(isDefined);
        const value = [doubleQuotedValue, singleQuotedValue, unquotedValue].find(isDefined);

        const key = isDefined(attributeIdx) ? new ExpressionDescriptor(parseInt(attributeIdx, 10)) : attribute;
        let val = isDefined(valueIdx) ? new ExpressionDescriptor(parseInt(valueIdx, 10)) : value;

        // A quoted literal still holding placeholders is a mixed value: split it into
        // parts so `Attribute` can compose them. Unquoted literals are not split — an
        // unquoted value takes a single interpolation.
        if (hasQuotes && typeof val === 'string' && RE_PH.test(val)) {
            val = splitValueParts(val);
        }

        const parsed = new Attribute(key, val, hasQuotes);

        if (__DEV__) {
            // A placeholder surviving in a literal name, or in an unquoted literal
            // value, is one of the two unsupported forms; record the first offending
            // expression so the slot can warn on first render.
            const unsupported = (typeof key === 'string' && key.match(RE_PH)) ||
                (!hasQuotes && typeof val === 'string' && val.match(RE_PH));
            if (unsupported) parsed.unsupportedIndex = parseInt(unsupported[1], 10);
        }

        attributes.push(parsed);
    }

    return attributes;
};

/**
 * Normalize component references: every placeholder resolving to the same
 * component class is rewritten to the first placeholder that named it, so a
 * repeated tag (`<${Comp} /><${Comp} />`) pairs its opening and closing
 * placeholders and `RE_COMPONENT_TAG`'s backreference can match them. Runs once
 * per template, before parsing: the recursion into a component tag's inner
 * content receives references already normalized.
 * @param {string} main The main template.
 * @param {Array<any>} expressions Array of expressions (read for structural decisions only).
 * @param {Function} isComponentClass Predicate telling whether an expression is a component class.
 * @return {string} The template with component references normalized.
 * @private
 */
const normalizeComponentRefs = (main, expressions, isComponentClass) => {
    const componentRefMap = new Map();
    return main.replace(
        RE_PH_G,
        (match, idx) => {
            const expression = expressions[idx];
            if (expression && isComponentClass(expression)) {
                if (componentRefMap.has(expression)) {
                    return componentRefMap.get(expression);
                }
                componentRefMap.set(expression, match);
            }
            return match;
        }
    );
};

/**
 * Replace component tags with structural interpolation placeholders.
 * `<${Component} />` or `<${Component}></${Component}>` become a
 * `ComponentDescriptor` (a component tag is an interpolation that produces a
 * `Component`, so it goes into the interpolation table). The component's inner
 * content is parsed into a nested fragment skeleton that shares the parent's
 * expressions.
 * @param {string} main The main template.
 * @param {Array<any>} expressions Array of expressions (read for structural decisions only).
 * @param {Array} interpolations Interpolation descriptor table to append to.
 * @param {Function} isComponentClass Predicate telling whether an expression is a component class.
 * @return {string} The template with component tags replaced by structural placeholders.
 * @private
 */
const expandComponents = (main, expressions, interpolations, isComponentClass) => {
    return main.replace(
        RE_COMPONENT_TAG,
        (match, selfClosingTag, selfClosingIdx, selfClosingAttrs, openTag, openIdx, nonVoidAttrs, inner) => {
            let tag, attributesStr, tagIndex, innerSkeleton = null;

            if (openTag) {
                tag = expressions[openIdx];
                tagIndex = parseInt(openIdx, 10);
                attributesStr = nonVoidAttrs;
            } else {
                tag = typeof selfClosingIdx !== 'undefined' ? expressions[selfClosingIdx] : selfClosingTag;
                tagIndex = parseInt(selfClosingIdx, 10);
                attributesStr = selfClosingAttrs;
            }
            // No component found.
            if (!isComponentClass(tag)) return match;
            // Non void component. Parse inner content as a nested fragment skeleton
            // that shares the parent's expressions (references already normalized).
            if (openTag) {
                innerSkeleton = parseMain(inner, expressions, isComponentClass);
            }
            // Add component descriptor to interpolations table.
            const index = interpolations.length;
            interpolations.push(new ComponentDescriptor(tagIndex, parseAttributes(attributesStr), innerSkeleton));
            // Replace whole tag with structural interpolation placeholder.
            return SLOT_INTERPOLATION(index);
        }
    );
};

/**
 * Replace elements in template.
 * @param {string} template Template string.
 * @param {Function} replacer Replacer function.
 * @return {string} Template string with replaced elements.
 * @private
 */
const replaceElements = (template, replacer) => template.replace(RE_ELEMENT, replacer);

/**
 * Parse all HTML elements with dynamic attributes and extract element descriptors.
 * Role-agnostic: no single-root validation and no forced root element (that is
 * root treatment, applied when a component adopts its root partial), so only
 * elements that carry a dynamic attribute get a descriptor.
 * @param {string} template Template string with placeholders.
 * @param {Array} elements Array to store element descriptors.
 * @return {string} Template with parsed attributes replaced by structural placeholders.
 * @private
 */
const parseElements = (template, elements) => {
    let first = true;
    // Match all HTML elements including placeholders and self-closed elements.
    return replaceElements(template, (match, tag, attributesStr, ending) => {
        const isFirst = first;
        first = false;
        // Elements with dynamic attributes always get a descriptor. The first
        // (root) element also gets one even without dynamic attributes, so a
        // component can adopt it as `this.el` and hydration can locate it by id.
        if (!isFirst && !attributesStr.match(RE_PH)) {
            return match;
        }
        // Add element descriptor to elements array.
        const index = elements.length;
        elements.push(new ElementDescriptor(parseAttributes(attributesStr)));
        // Replace attributes with structural placeholder.
        // Preserve original tag ending (> or />)
        return `<${tag} ${SLOT_ELEMENT(index)}${ending}`;
    });
};

/**
 * Parse all interpolations in template text content. A placeholder immediately
 * after `<` or `</` is a dynamic tag name and stays, to survive as an
 * `ExpressionDescriptor` part; every other placeholder is an interpolation.
 * @param {string} template Template string with placeholders.
 * @param {Array} interpolations Array to store interpolation descriptors.
 * @return {string} Template with interpolation structural placeholders.
 * @private
 */
const parseInterpolations = (template, interpolations) =>
    template.replace(RE_PH_TEXT, (match, tagPrefix, expressionIdx) => {
        if (tagPrefix) return match;
        // Add interpolation descriptor to interpolations array.
        const index = interpolations.length;
        interpolations.push(new InterpolationDescriptor(parseInt(expressionIdx, 10)));
        // Replace with structural placeholder.
        return SLOT_INTERPOLATION(index);
    });

/**
 * Generate one dimensional array with strings and descriptor instances. Every
 * literal is kept, empty ones included: a template that is a single
 * interpolation must yield exactly one part (`isTransparent` counts parts), so
 * that case short-circuits before the split.
 * @param main {string} The main template containing structural placeholders.
 * @param {Array} elements Element descriptor table.
 * @param {Array} interpolations Interpolation descriptor table.
 * @return {array} Array containing descriptor instances.
 * @private
 */
const splitPlaceholders = (main, elements, interpolations) => {
    // Resolve a matched placeholder to its part: an element / interpolation descriptor
    // for a structural slot, or an `ExpressionDescriptor` for an original expression that
    // survived outside a slot (a dynamic tag name).
    const resolve = match => {
        if (typeof match[1] !== 'undefined') return elements[parseInt(match[1], 10)];
        if (typeof match[2] !== 'undefined') return interpolations[parseInt(match[2], 10)];
        return new ExpressionDescriptor(parseInt(match[3], 10));
    };

    const matchSinglePlaceholder = main.match(RE_SLOT);
    if (matchSinglePlaceholder) return [resolve(matchSinglePlaceholder)];

    return splitByRegExp(main, RE_SLOT_G, resolve, part => new LiteralDescriptor(part));
};

/**
 * Tell whether the template renders a single root element holding everything else:
 * it opens exactly one element at the top level, closes it, and writes nothing
 * beside it — no text, no interpolation, no comment. A structural fact, not a rule:
 * only a component's root template is required to satisfy it, and that is the
 * component's call when it adopts the partial as its root. Development only.
 *
 * Walks the template with a depth counter rather than matching the root and its
 * closing tag as a pair, which cannot tell `<div></div>` from `<div></div><div></div>`.
 * Void elements and self-closed tags hold nothing, so they never open a level; a
 * dynamic tag name is assumed to be neither.
 *
 * Reports a second node only on seeing one, never from an unbalanced count: the
 * optional closing tags HTML fills in (`<ul><li>a<li>b</ul>`) leave the walk inside
 * the root, where anything that follows is out of reach. So the answer is
 * conservative — it can miss a sibling written after such markup, and never invents
 * one.
 * @param {string} template Template string with structural placeholders.
 * @return {boolean} True if the template has a single root element.
 * @private
 */
const hasSingleRoot = (template) => {
    const regExp = RE_NODE;
    regExp.lastIndex = 0;
    let depth = 0, roots = 0, lastIndex = 0, match;
    // Everything but whitespace between nodes at the top level is a sibling of the root.
    const isEmpty = (from, to) => !template.slice(from, to).trim();

    while ((match = regExp.exec(template)) !== null) {
        const [, closing, tag, , ending] = match;
        if (!depth && !isEmpty(lastIndex, match.index)) return false;
        lastIndex = regExp.lastIndex;
        // A comment: a node of its own at the top level, and inert anywhere else.
        if (!tag) {
            if (!depth) return false;
            continue;
        }
        if (closing) {
            // A closing tag with nothing open is the one the parser drops.
            if (depth) depth--;
            continue;
        }
        if (!depth) roots++;
        if (ending.indexOf('/') === -1 && !isVoidElement(tag)) depth++;
    }

    // Left inside the root, the rest of the template cannot be read: report what was
    // seen up to there.
    return roots === 1 && (depth > 0 || isEmpty(lastIndex, template.length));
};

/**
 * Parse a template string (already carrying placeholders, with component
 * references already normalized) into skeleton data. Shared by the top-level
 * template and by nested component inner content.
 * @param {string} main Template string with placeholders.
 * @param {Array<any>} expressions Template expressions (used only for structural decisions).
 * @param {Function} isComponentClass Predicate telling whether an expression is a component class.
 * @param {Object|null} source Original template source for debugging (dev only).
 * @return {{ parts: Array, source: Object|null, singleRoot: boolean }} Skeleton data.
 * @private
 */
const parseMain = (main, expressions, isComponentClass, source = null) => {
    // Descriptor tables local to the parse: the structural placeholders index them so
    // `splitPlaceholders` can resolve each one to its descriptor. Once `parts` holds
    // those instances the tables are no longer needed.
    const elements = [], interpolations = [];
    // Structure is read off the parsed template, where component tags and
    // interpolations are already single tokens and attributes cannot be mistaken
    // for markup.
    const parsed = parseInterpolations(
        parseElements(
            expandComponents(
                main,
                expressions,
                interpolations,
                isComponentClass
            ),
            elements
        ),
        interpolations
    );

    return {
        parts : splitPlaceholders(parsed, elements, interpolations),
        source,
        // Only a component's root template is required to have a single root, and a
        // template is authored, not data-driven: like `source`, the fact is computed
        // in development only, and the component checks it there.
        singleRoot : __DEV__ ? hasSingleRoot(parsed) : null,
    };
};

/**
 * Parse a tagged template into skeleton data. Role-agnostic: the same output
 * shape is produced whether the skeleton is later adopted as a component root or
 * mounted as a nested partial.
 * @param {Array<string>} strings Template string literals.
 * @param {Array<any>} expressions Template expressions (used only for structural
 *     decisions; their values are not stored in the skeleton).
 * @param {Function} [isComponentClass] Predicate telling whether an expression is a
 *     component class. Defaults to treating nothing as a component (elements /
 *     interpolations only).
 * @return {{ parts: Array, source: Object|null, singleRoot: boolean }} Skeleton data.
 * @private
 */
const parseTemplate = (strings, expressions, isComponentClass = () => false) => {
    // Store original template source for debugging (only in dev mode).
    const source = __DEV__ ? { strings, expressions : [...expressions] } : null;
    const main = normalizeComponentRefs(
        addPlaceholders(strings, expressions).trim(),
        expressions,
        isComponentClass
    );
    return parseMain(main, expressions, isComponentClass, source);
};

export default parseTemplate;
