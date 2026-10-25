/**
 * @module core/Constants
 * Wire-format strings used by the render engine. Every attribute and marker a
 * component writes to the DOM comes from here, so this module describes the whole
 * wire format in one place. It is internal: server and client match because they run
 * the same version of Rasti.
 *
 * Emission ids are part of the wire format too, by convention rather than by entry
 * here: an element id is `${uid}-${n}` with `n` counting from 1 in emission order, so
 * a component's root element — emitted first — always carries the `-1` suffix. The uid
 * makes the id unique across the page, which is what lets a server-rendered component
 * be located in the container it was rendered into.
 * @private
 */

/**
 * Data-attribute carrying an element's emission id.
 * @type {string}
 * @private
 */
export const ATTRIBUTE_ELEMENT = 'data-rst-el';

/**
 * Event data-attribute, given event type and component uid.
 * @type {Function}
 * @private
 */
export const ATTRIBUTE_EVENT = (type, uid) => `data-rst-on-${type}-${uid}`;

/**
 * Interpolation start marker, given the emission id.
 * @type {Function}
 * @private
 */
export const MARKER_START = id => `rst-s-${id}`;

/**
 * Interpolation end marker, given the emission id.
 * @type {Function}
 * @private
 */
export const MARKER_END = id => `rst-e-${id}`;

/**
 * Placeholder marker for a recycled component, given its uid.
 * @type {Function}
 * @private
 */
export const MARKER_RECYCLED = uid => `rst-r-${uid}`;
