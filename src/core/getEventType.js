/**
 * A camel-cased `on*` attribute name, its event type captured.
 * @type {RegExp}
 * @private
 */
const RE_EVENT_ATTRIBUTE = /^on([A-Z][a-zA-Z]*)$/;

/**
 * An `on:` attribute name, its event type captured as written.
 * @type {RegExp}
 * @private
 */
const RE_LITERAL_EVENT_ATTRIBUTE = /^on:(.+)$/;

/**
 * Read the event type a template attribute binds a handler for. A camel-cased `on*`
 * name binds the event in lowercase (`onClick` → `click`), as native events are
 * named; an `on:` name binds the event exactly as written after it (`on:sl-change`,
 * `on:ionChange`). Any other name, the lowercase `onclick` included, is a plain
 * attribute.
 * @param {string} name The attribute name.
 * @return {string|null} The event type, or `null` when the attribute binds none.
 * @private
 */
const getEventType = (name) => {
    const match = RE_EVENT_ATTRIBUTE.exec(name);
    if (match) return match[1].toLowerCase();
    const literal = RE_LITERAL_EVENT_ATTRIBUTE.exec(name);
    return literal ? literal[1] : null;
};

export default getEventType;
