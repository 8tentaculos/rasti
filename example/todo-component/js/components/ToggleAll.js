import component from '/lib/component.js';

const ToggleAll = component`
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
