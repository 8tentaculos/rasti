/**
 * The option keys a view takes as its own: they are extended on the view instance,
 * and a component never extracts them as props.
 * @type {Set<string>}
 * @private
 */
const viewOptions = new Set(['el', 'tag', 'attributes', 'events', 'model', 'template', 'onDestroy']);

export default viewOptions;
