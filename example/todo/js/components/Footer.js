import { Component } from 'rasti';
import Filter from './Filter.js';

/**
 * Footer component for todo app.
 * Shows todo count, filter links, and clear completed button.
 * @class Footer
 */
const Footer = Component.create`
    <footer class="footer">
        <span class="todo-count">
            <strong>${({ model }) => model.remaining.length}</strong> 
            ${({ model }) => model.remaining.length === 1 ? 'item' : 'items'} left
        </span>
        <${Filter}
            currentFilter="${({ model }) => model.filter}"
            handleFilter="${({ model }) => (filter) => {
                model.filter = filter;
            }}"
        />
        ${({ model, partial }) => model.completed.length ?
            partial`
                <button
                    class="clear-completed"
                    onClick=${function() {
                        this.model.removeCompleted();
                    }}
                >
                    Clear completed
                </button>
            ` : null}
    </footer>
`;

export default Footer;
