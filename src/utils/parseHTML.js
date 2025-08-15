/**
 * Map of tags to their required parsing context element.
 * @private
 */
const PARSE_CONTEXT = {
    thead : 'table', tbody : 'table', tfoot : 'table', tr : 'table',
    td : 'table', th : 'table', colgroup : 'table', col : 'table', caption : 'table',
    option : 'select', optgroup : 'select'
};

/**
 * Parse HTML string to a DocumentFragment using Range.createContextualFragment().
 * Faster than template.innerHTML approach with minimal context element creation.
 * @param {string} html The HTML string to parse.
 * @return {DocumentFragment} The parsed DocumentFragment.
 * @private
 */
const parseHTML = (html) => {
    const htmlString = `${html}`.trim();

    const tagMatch = htmlString.match(/<\s*([a-z0-9]+)/i);
    const firstTag = tagMatch ? tagMatch[1].toLowerCase() : '';

    const range = document.createRange();
    const context = PARSE_CONTEXT[firstTag] ? document.createElement(PARSE_CONTEXT[firstTag]) : document.body;
    range.selectNode(context);

    return range.createContextualFragment(htmlString);
};

export default parseHTML;