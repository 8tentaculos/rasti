/**
 * Wire-format strings and template tokens used by the render engine. Every attribute
 * and marker a component writes to the DOM comes from here, so this object describes
 * the whole wire format in one place.
 *
 * It is a plain mutable object: any value can be overridden (for example
 * `Constants.ATTRIBUTE_ELEMENT = 'data-x'`) before anything renders, and as long as it
 * is done identically on server and client, so hydration keeps matching.
 *
 * Emission ids are part of the wire format too, by convention rather than by entry
 * here: an element id is `${uid}-${n}` with `n` counting from 1 in emission order, so
 * a component's root element — emitted first — always carries the `-1` suffix. The uid
 * makes the id unique across the page, which is what lets one index resolve a whole
 * subtree of nested components.
 * @property {string} ATTRIBUTE_ELEMENT Data-attribute carrying an element's emission id.
 * @property {Function} ATTRIBUTE_EVENT Event data-attribute, given event type and component uid.
 * @property {Function} MARKER_START Interpolation start marker, given the emission id.
 * @property {Function} MARKER_END Interpolation end marker, given the emission id.
 * @property {Function} MARKER_RECYCLED Placeholder marker for a recycled component, given its uid.
 * @private
 */
const Constants = {
    ATTRIBUTE_ELEMENT : 'data-rst-el',
    ATTRIBUTE_EVENT : (type, uid) => `data-rst-on-${type}-${uid}`,
    MARKER_START : id => `rst-s-${id}`,
    MARKER_END : id => `rst-e-${id}`,
    MARKER_RECYCLED : uid => `rst-r-${uid}`
};

export default Constants;
