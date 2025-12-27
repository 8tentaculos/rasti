import { Model } from 'rasti';
import { Component } from 'rasti';

/**
 * Get CSS class names for todo item based on completion and editing state.
 * @param {Object} params The parameters object.
 * @param {Object} params.model The todo model.
 * @param {Object} params.state The component state.
 * @return {string} CSS class names.
 * @private
 */
const getClassName = ({ model, state }) => [
    model.completed ? 'completed' : '',
    state.editing ? 'editing' : ''
].join(' ');

/**
 * Single todo item component.
 * Displays a todo with checkbox, label, and delete button.
 * Supports editing mode with inline editing.
 * @class Todo
 */
const Todo = Component.create`
    <li class="${getClassName}">
        <div class="view">
            <input
                name="toggle"
                class="toggle"
                type="checkbox"
                checked="${({ model }) => model.completed}"
                onClick=${function() {
                    this.model.toggle();
                }}
            >
            <label
                onDblClick=${function() {
                    this.state.editing = true;
                }}
            >
                ${({ model }) => model.title}
            </label>
            <button
                class="destroy"
                onClick=${function() {
                    this.props.handleRemove();
                }}
            ></button>
        </div>

        <input
            class="edit"
            value="${({ model }) => model.title}"
            name="edit"
            onKeyUp=${function(ev) {
                // Save or cancel editing.
                if (ev.key === 'Enter' || ev.key === 'Escape') {
                    // Save edited todo.
                    if (ev.key === 'Enter') {
                        const value = ev.target.value;
                        // Set todo title.
                        if (value) {
                            this.model.title = value;
                        }
                    }
                    // Close editing.
                    this.state.editing = false;
                }
            }}
            onFocusOut=${function () {
                this.state.editing = false;
            }}
        />
    </li>
`.extend({
    /**
     * Initialize component before rendering.
     * Sets up internal state for editing mode.
     */
    preinitialize() {
        // Internal component state.
        this.state = new Model({ editing : false });
    },
    /**
     * Called after component update.
     * Focuses the edit input when in editing mode.
     */
    onUpdate() {
        // Focus if editing.
        if (this.state.editing) this.$('input.edit').focus();
    }
});

export default Todo;
