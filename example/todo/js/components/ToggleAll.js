import { Component } from 'rasti';

const ToggleAll = Component.create`
    <span
        onClick=${{
            // Click on toggle all.
            '.toggle-all' : function(event) {
                this.model.toggleAll(event.target.checked);
            }
        }}
    >
        <input 
            class="toggle-all" 
            id="toggle-all" 
            type="checkbox"
            ${({ model }) => !!model.todos.length && !model.remaining.length ? 'checked' : ''}
         />
        <label for="toggle-all">Mark all as complete</label>
    </span>
`;

export default ToggleAll;
