import { Model } from 'rasti';
import { Component } from 'rasti';

import { ENTER_KEY, ESC_KEY } from '../constants.js';

const getClassName = ({ model, state }) => [
    model.completed ? 'completed' : '',
    state.editing ? 'editing' : ''
].join(' ');

// Single todo.
const Todo = Component.create`
    <li
        onClick=${{
            '.toggle' : function() {
                this.model.toggle()
            },
            '.destroy' : function() {
                this.options.handleRemove()
            },
        }}
        onDblClick=${{
            'label' : function() {
                this.state.editing = true;
            }
        }}
        onKeyUp=${{ 
            '.edit' : function(ev) {
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
            }
        }}
        onFocusOut=${{
            '.edit' : function () {
                this.state.editing = false;
            }
        }}
        class="${getClassName}"
    >
        <div class="view">
            <input class="toggle" type="checkbox" ${({ model }) => model.completed ? 'checked' : ''}>
            <label>${({ model }) => model.title}</label>
            <button class="destroy"></button>
        </div>
        <input class="edit" value="${({ model }) => model.title}">
    </li>
`.extend({
    preinitialize() {
        // Internal component state.
        this.state = new Model({ editing : false });
    },
    onRender() {
        // Focus if editing.
        if (this.state.editing) this.$('.edit').focus();
    }
});

export default Todo;
