import unwrap from './unwrap.js';

import formatTemplateSource from '../utils/formatTemplateSource.js';
import createDevelopmentErrorMessage from '../utils/createDevelopmentErrorMessage.js';

/**
 * Tell whether a value resolves to a child component, seeing through transparent
 * partials, which contribute no node of their own. A partial that has not rendered yet
 * has no slot to look into, and is taken as resolvable rather than reported.
 * Development only.
 * @param {Partial} partial The partial holding the value.
 * @param {any} value The value to resolve.
 * @return {boolean} True if the value stands for a child component.
 * @private
 */
const resolvesToChild = (partial, value) => {
    const resolved = unwrap(partial, value);
    // A partial that has not rendered yet stands for itself, but will resolve to
    // whatever its slot holds once it does.
    if (partial.isPartial(resolved)) return resolved.isTransparent() && !resolved.slots;
    return partial.owner.isChild(resolved);
};

/**
 * Reject an anchored slot that resolves to no component. An anchored slot writes no
 * markers of its own: its content stands on the element of the component it renders,
 * so a value that mounts none leaves it with nothing to stand on, and the owning
 * component with no element of its own. A component tag always mounts one, so in
 * practice only a container's root interpolation reaches here with something else.
 * Development only.
 * @param {InterpolationSlot} slot The anchored slot.
 * @param {any} value The resolved value.
 * @private
 */
const checkAnchoredContent = (slot, value) => {
    const { partial, descriptor } = slot;
    if (resolvesToChild(partial, value)) return;
    const { source } = partial.constructor;
    const formattedSource = formatTemplateSource(source, source && source.expressions[descriptor.index], 'This interpolation');
    throw new Error(createDevelopmentErrorMessage(
        'Invalid container template\n' +
        'A component whose template is a single interpolation is a container: it has no\n' +
        'element of its own and stands on the element of the component it renders, so\n' +
        'that interpolation must resolve to a component.\n\n' +
        'Valid examples:\n' +
        '- `${({ state }) => state.open ? Dialog.mount(props) : Empty.mount(props)}`\n' +
        '- `<${MyComponent} />`\n\n' +
        'Invalid examples:\n' +
        '- `${({ html }) => html`<div></div>`}`  (markup, not a component)\n' +
        '- `${({ props }) => props.label}`  (a plain value)' +
        (formattedSource ? `\n\nTemplate source:\n\n${formattedSource}` : '')
    ));
};

export default checkAnchoredContent;
