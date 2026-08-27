/**
 * Wire-format strings and template tokens used by the render engine. Every attribute,
 * dataset key and marker a component writes to the DOM comes from here, so this object
 * describes the whole wire format in one place.
 *
 * It is a plain mutable object: any value can be overridden (for example
 * `Constants.ATTRIBUTE_ELEMENT = 'data-x'`) before anything renders, and as long as it
 * is done identically on server and client, so hydration keeps matching.
 * @property {string} ATTRIBUTE_ELEMENT Data-attribute carrying an element's emission id.
 * @property {Function} ATTRIBUTE_EVENT Event data-attribute, given event type and component uid.
 * @property {string} DATASET_ELEMENT Dataset key matching `ATTRIBUTE_ELEMENT` (component-root detection).
 * @property {Function} MARKER_START Interpolation start marker, given the emission id.
 * @property {Function} MARKER_END Interpolation end marker, given the emission id.
 * @property {Function} MARKER_RECYCLED Placeholder marker for a recycled component, given its uid.
 * @property {Function} PLACEHOLDER Compile placeholder for an original expression, given its index.
 * @property {Function} SLOT_ELEMENT Structural placeholder for an element slot, given its index.
 * @property {Function} SLOT_INTERPOLATION Structural placeholder for an interpolation slot, given its index.
 * @private
 */
const Constants = {
    ATTRIBUTE_ELEMENT : 'data-rst-el',
    ATTRIBUTE_EVENT : (type, uid) => `data-rst-on-${type}-${uid}`,
    DATASET_ELEMENT : 'rstEl',
    MARKER_START : id => `rst-s-${id}`,
    MARKER_END : id => `rst-e-${id}`,
    MARKER_RECYCLED : uid => `rst-r-${uid}`,
    PLACEHOLDER : idx => `__RASTI_PLACEHOLDER_${idx}__`,
    SLOT_ELEMENT : idx => `__RASTI_ELEMENT_${idx}__`,
    SLOT_INTERPOLATION : idx => `__RASTI_INTERPOLATION_${idx}__`
};

export default Constants;
