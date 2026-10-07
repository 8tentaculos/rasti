/**
 * A camel-cased `on*` attribute name, its event type captured.
 * @type {RegExp}
 * @private
 */
const RE_EVENT_ATTRIBUTE = /^on([A-Z][a-zA-Z]*)$/;

/**
 * Read the event type a template attribute binds a handler for. Only a camel-cased
 * `on*` name binds one (`onClick` → `click`); any other name, the lowercase `onclick`
 * included, is a plain attribute.
 * @param {string} name The attribute name.
 * @return {string|null} The event type, or `null` when the attribute binds none.
 * @private
 */
const getEventType = (name) => {
    const match = RE_EVENT_ATTRIBUTE.exec(name);
    return match ? match[1].toLowerCase() : null;
};

export default getEventType;
