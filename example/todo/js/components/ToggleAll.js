import { Component } from 'rasti';

const ToggleAll = Component.create`
    <span>
        <input 
            class="toggle-all" 
            id="toggle-all" 
            type="checkbox"
            checked="${({ props }) => props.checked}"
            onChange=${function(ev) { this.props.handleChange(ev.target.checked); }}
         />
        <label for="toggle-all">
            Mark all as complete
        </label>
    </span>
`;

export default ToggleAll;
