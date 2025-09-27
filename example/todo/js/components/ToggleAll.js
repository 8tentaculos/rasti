import { Component } from 'rasti';

const ToggleAll = Component.create`
    <span>
        <input 
            class="toggle-all" 
            id="toggle-all" 
            type="checkbox"
            checked="${({ model }) => !!model.todos.length && !model.remaining.length}"
            onChange=${function(ev) { this.model.toggleAll(ev.target.checked); }}
         />
        <label for="toggle-all">
            Mark all as complete
        </label>
    </span>
`;

export default ToggleAll;
