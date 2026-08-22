import SafeHTML from '../SafeHTML.js';
import Constants from './Constants.js';
import ElementDescriptor from './ElementDescriptor.js';
import InterpolationDescriptor from './InterpolationDescriptor.js';
import ComponentDescriptor from './ComponentDescriptor.js';
import RawExpression from './RawExpression.js';
import Attribute from './Attribute.js';
import __DEV__ from '../../utils/dev.js';

/**
 * @module core/template/parseTemplate
 * Role-agnostic template parser. Turns a tagged template (`strings`,
 * `expressions`) into skeleton data (`parts`, `elements`, `interpolations`) that
 * is independent of the expression values: dynamic parts become descriptors that
 * carry the original expression *indices* (`ExpressionIndex`), never the resolved
 * values. The same shape is produced for a component's own template and for a
 * `partial`; root treatment (single-root validation, `options.attributes` merge,
 * `this.el`) is handled by the component when it adopts its root partial.
 *
 * The parser never imports `Component`. Component-tag detection is injected
 * through the `isComponentClass` predicate; the per-component wire values (ids,
 * event data-attributes) are provided through `options` at render time.
 *
 * Two placeholder namespaces keep the user's `expressions` array pure:
 * - `Constants.PLACEHOLDER(i)` marks an original expression at index `i`. After
 *   parsing none survive loose in `parts`; each lives inside a descriptor as an
 *   `ExpressionIndex` (attributes) or a plain index (interpolations / tags).
 * - `Constants.SLOT_ELEMENT(k)` / `Constants.SLOT_INTERPOLATION(k)` are
 *   structural: `k` (a slot index) indexes the `elements` / `interpolations`
 *   tables so `splitPlaceholders` can swap the marker for the descriptor instance.
 * @private
 */

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
            out.push(Constants.PLACEHOLDER(i));
        }
        return out;
    }, []).join('');

/**
 * Parse attributes string into `Attribute` descriptors. Keys and values are
 * stored as an expression index (`number`) or a literal, so the skeleton stays
 * value-agnostic.
 * @param {string} attributesStr Attributes string from HTML element.
 * @return {Array<Attribute>} Attribute descriptors.
 * @private
 */
const parseAttributes = (attributesStr) => {
    const PH = Constants.PLACEHOLDER('(\\d+)');
    const attributes = [];
    // Parse attributes string with support for placeholders in both names and values.
    const regExp = new RegExp(`(?:${PH}|([\\w-]+))(?:=(["']?)(?:${PH}|((?:.?(?!["']?\\s+(?:\\S+)=|\\s*/>|\\s*[>"']))+.))?\\3)?`, 'g');

    let attributeMatch;
    while ((attributeMatch = regExp.exec(attributesStr)) !== null) {
        const [, attributeIdx, attribute, quotes, valueIdx, value] = attributeMatch;

        const hasQuotes = !!quotes;

        const key = typeof attributeIdx !== 'undefined' ? parseInt(attributeIdx, 10) : attribute;
        let val = typeof valueIdx !== 'undefined' ? parseInt(valueIdx, 10) : value;

        // A quoted attribute with no value renders as an empty string; a bare
        // attribute (no `=`) stays value-less (`undefined`).
        if (hasQuotes && typeof val === 'undefined') {
            val = '';
        }

        attributes.push(new Attribute(key, val, hasQuotes));
    }

    return attributes;
};

/**
 * Replace component tags with structural interpolation placeholders.
 * `<${Component} />` or `<${Component}></${Component}>` become a
 * `ComponentDescriptor` (a component tag is an interpolation that produces a
 * `Component`, so it lives in the `interpolations` table). The component's inner
 * content is parsed into a nested fragment skeleton that shares the parent's
 * expressions.
 * @param {string} main The main template.
 * @param {Array<any>} expressions Array of expressions (read for structural decisions only).
 * @param {Array} interpolations Interpolation descriptor table to append to.
 * @param {Function} isComponentClass Predicate telling whether an expression is a component class.
 * @param {boolean} skipNormalization Skip placeholder normalization (for recursive calls).
 * @return {string} The template with component tags replaced by structural placeholders.
 * @private
 */
const expandComponents = (main, expressions, interpolations, isComponentClass, skipNormalization = false) => {
    const PH = Constants.PLACEHOLDER('(\\d+)');
    const componentRefMap = new Map();
    // Normalize component references to use first placeholder index.
    // Only on first call, not on recursive calls.
    if (!skipNormalization) {
        main = main.replace(
            new RegExp(PH, 'g'),
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
    }
    // Match component tags with backreference to ensure correct pairing.
    return main.replace(
        new RegExp(`<(${PH})([^>]*)/>|<(${PH})([^>]*)>([\\s\\S]*?)</\\4>`, 'g'),
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
                innerSkeleton = parseMain(inner, expressions, isComponentClass, true);
            }
            // Add component descriptor to interpolations table.
            const slotIndex = interpolations.length;
            interpolations.push(new ComponentDescriptor(slotIndex, tagIndex, parseAttributes(attributesStr), innerSkeleton));
            // Replace whole tag with structural interpolation placeholder.
            return Constants.SLOT_INTERPOLATION(slotIndex);
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
const replaceElements = (template, replacer) => {
    const PH = Constants.PLACEHOLDER('(?:\\d+)');
    return template.replace(
        new RegExp(`<(${PH}|[a-z]+[1-6]?)(?:\\s*)((?:"[^"]*"|'[^']*'|[^>])*)(/?>)`, 'gi'),
        replacer
    );
};

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
    const PH = Constants.PLACEHOLDER('(?:\\d+)');
    let first = true;
    // Match all HTML elements including placeholders and self-closed elements.
    return replaceElements(template, (match, tag, attributesStr, ending) => {
        const isFirst = first;
        first = false;
        // Elements with dynamic attributes always get a descriptor. The first
        // (root) element also gets one even without dynamic attributes, so a
        // component can adopt it as `this.el` and hydration can locate it by id.
        if (!isFirst && !attributesStr.match(new RegExp(PH))) {
            return match;
        }
        // Add element descriptor to elements array.
        const slotIndex = elements.length;
        elements.push(new ElementDescriptor(slotIndex, parseAttributes(attributesStr)));
        // Replace attributes with structural placeholder.
        // Preserve original tag ending (> or />)
        return `<${tag} ${Constants.SLOT_ELEMENT(slotIndex)}${ending}`;
    });
};

/**
 * Parse all interpolations in template text content.
 * @param {string} template Template string with placeholders.
 * @param {Array} interpolations Array to store interpolation descriptors.
 * @return {string} Template with interpolation structural placeholders.
 * @private
 */
const parseInterpolations = (template, interpolations) => {
    const PH = Constants.PLACEHOLDER('(\\d+)');
    // Match all expression placeholders.
    return template.replace(
        new RegExp(PH, 'g'),
        function(match, expressionIndex, offset) {
            // Check if this placeholder is inside an element tag (attribute).
            // `offset` is the index of the match in the original string.
            const beforeMatch = template.substring(0, offset);
            const lastOpenTag = beforeMatch.lastIndexOf('<');
            const lastCloseTag = beforeMatch.lastIndexOf('>');
            // If we're inside an element tag, don't process as interpolation.
            if (lastOpenTag > lastCloseTag) {
                return match;
            }
            // Add interpolation descriptor to interpolations array.
            const slotIndex = interpolations.length;
            interpolations.push(new InterpolationDescriptor(slotIndex, parseInt(expressionIndex, 10)));
            // Replace with structural placeholder.
            return Constants.SLOT_INTERPOLATION(slotIndex);
        }
    );
};

/**
 * Generate one dimensional array with strings and descriptor instances.
 * @param main {string} The main template containing structural placeholders.
 * @param {Array} elements Element descriptor table.
 * @param {Array} interpolations Interpolation descriptor table.
 * @return {array} Array containing SafeHTML literals and descriptor instances.
 * @private
 */
const splitPlaceholders = (main, elements, interpolations) => {
    const SLOT = `${Constants.SLOT_ELEMENT('(\\d+)')}|${Constants.SLOT_INTERPOLATION('(\\d+)')}|${Constants.PLACEHOLDER('(\\d+)')}`;
    // Resolve a matched placeholder to its part: an element / interpolation descriptor
    // for a structural slot, or a `RawExpression` for an original expression that
    // survived outside a slot (a dynamic tag name).
    const resolve = match => {
        if (typeof match[1] !== 'undefined') return elements[parseInt(match[1], 10)];
        if (typeof match[2] !== 'undefined') return interpolations[parseInt(match[2], 10)];
        return new RawExpression(parseInt(match[3], 10));
    };

    const matchSinglePlaceholder = main.match(new RegExp(`^(?:${SLOT})$`));
    if (matchSinglePlaceholder) return [resolve(matchSinglePlaceholder)];

    const regExp = new RegExp(SLOT, 'g');
    const out = [];
    let lastIndex = 0;
    let match;
    // Generate one dimensional array with SafeHTML literals and descriptor instances,
    // referencing the same descriptor instances held in the skeleton tables.
    while ((match = regExp.exec(main)) !== null) {
        const before = main.slice(lastIndex, match.index);
        out.push(new SafeHTML(before), resolve(match));
        lastIndex = match.index + match[0].length;
    }
    out.push(new SafeHTML(main.slice(lastIndex)));

    return out;
};

/**
 * Parse a template string (already carrying placeholders) into skeleton data.
 * Shared by the top-level template and by nested component inner content, which
 * re-parses with `skipNormalization` since references are already normalized.
 * @param {string} main Template string with placeholders.
 * @param {Array<any>} expressions Template expressions (used only for structural decisions).
 * @param {Function} isComponentClass Predicate telling whether an expression is a component class.
 * @param {boolean} skipNormalization Skip component reference normalization (for nested content).
 * @param {Object|null} source Original template source for debugging (dev only).
 * @return {{ parts: Array, elements: Array, interpolations: Array, source: Object|null }} Skeleton data.
 * @private
 */
const parseMain = (main, expressions, isComponentClass, skipNormalization, source = null) => {
    // Create elements and interpolations descriptor tables.
    const elements = [], interpolations = [];
    const parts = splitPlaceholders(
        parseInterpolations(
            parseElements(
                expandComponents(
                    main,
                    expressions,
                    interpolations,
                    isComponentClass,
                    skipNormalization
                ),
                elements
            ),
            interpolations
        ),
        elements,
        interpolations
    );

    return { parts, elements, interpolations, source };
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
 * @return {{ parts: Array, elements: Array, interpolations: Array, source: Object|null }} Skeleton data.
 * @private
 */
const parseTemplate = (strings, expressions, isComponentClass = () => false) => {
    // Store original template source for debugging (only in dev mode).
    const source = __DEV__ ? { strings, expressions : [...expressions] } : null;
    return parseMain(addPlaceholders(strings, expressions).trim(), expressions, isComponentClass, false, source);
};

export default parseTemplate;
