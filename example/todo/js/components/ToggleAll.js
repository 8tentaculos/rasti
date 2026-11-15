import { Component } from 'rasti';

/**
 * Toggle all todos component.
 * Checkbox to mark all todos as complete or incomplete.
 * @class ToggleAll
 */
const ToggleAll = Component.create(({ props, html }) => html`
    <span>
        <input
            class="toggle-all"
            id="toggle-all"
            type="checkbox"
            checked="${props.checked}"
            onChange=${({ target }) => props.handleChange(target.checked)}
        />
        <label for="toggle-all">
            Mark all as complete
        </label>
    </span>
`);

export default ToggleAll;
