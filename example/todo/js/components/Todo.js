import { Model } from 'https://esm.run/rasti';
import { Component } from 'https://esm.run/rasti';

import { ENTER_KEY, ESC_KEY } from '../constants.js';

// Single todo.
const Todo = Component.create`
    <li
        onClick=${{
            '.toggle' : function() { this.model.toggle() },
            '.destroy' : function() { this.options.handleRemove() },
        }}
        onDblClick=${{ 'label' : function() { this.state.editing = true } }}
        onKeyUp=${{ 
            '.edit' : function(event) { 
                if (event.which === ENTER_KEY) this.close(true);
                else if (event.which === ESC_KEY) this.close();
            }
        }}
        onFocusOut=${{ '.edit' : function () { this.close() } }}
        class="${({ state }) => state.editing && 'editing'}"
    >
        <div class="view${({ model }) => model.completed ? ' completed' : ''}">
            <input class="toggle" type="checkbox" checked="${({ model }) => model.completed}">
            <label>${({ model }) => model.title}</label>
            <button class="destroy"></button>
        </div>
        <input class="edit" value="${({ model }) => model.title}">
    </li>
`.extend({
    preinitialize() {
        // Internal component state.
        this.state = new Model({ editing: false });
    },
    onRender() {
        // Focus if editing.
        if (this.state.editing) this.$('.edit').focus();
    },
    // Close the 'editing' mode. Save or discard changes.
    close(save) {
        if (save) {
            const value = this.$('.edit').value;
            // Set model.
            if (value) {
                this.model.title = value;
            }
        }
        // Unset 'editing'.
        this.state.editing = false;
    }
});

export default Todo;
