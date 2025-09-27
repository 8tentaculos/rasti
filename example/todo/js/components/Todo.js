import { Model } from 'rasti';
import { Component } from 'rasti';

import { ENTER_KEY, ESC_KEY } from '../constants.js';

const getClassName = ({ model, state }) => [
    model.completed ? 'completed' : '',
    state.editing ? 'editing' : ''
].join(' ');

// Single todo.
const Todo = Component.create`
    <li class="${getClassName}">
        <div class="view">
            <input
                class="toggle"
                type="checkbox"
                checked="${({ model }) => model.completed}"
                onClick=${function(ev) {
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
                onClick=${function(ev) {
                    this.options.handleRemove();
                }}
            ></button>
        </div>

        <input
            class="edit"
            value="${({ model }) => model.title}"
            onKeyUp=${function(ev) {
                // Save or cancel editing.
                if (ev.which === ENTER_KEY || ev.which === ESC_KEY) {
                    // Save edited todo.
                    if (ev.which === ENTER_KEY) {
                        const value = this.$('.edit').value;
                        // Set model.
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
    preinitialize() {
        // Internal component state.
        this.state = new Model({ editing : false });
    },
    onHydrate() {
        // Focus if editing.
        if (this.state.editing) this.$('.edit').focus();
    },
    onUpdate() {
        // Focus if editing.
        if (this.state.editing) this.$('.edit').focus();
    }
});

export default Todo;
