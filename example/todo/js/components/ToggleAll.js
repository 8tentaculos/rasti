import { Component } from 'https://unpkg.com/rasti@2.0.0-alpha.0/es/';

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
            checked="${({ model }) => !!model.todos.length && !model.remaining.length}"
         />
        <label for="toggle-all">Mark all as complete</label>
    </span>
`;

export default ToggleAll;
