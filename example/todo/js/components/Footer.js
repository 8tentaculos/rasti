import { Component } from 'rasti';

import Filter from './Filter.js';

/**
 * Footer component for todo app.
 * Shows todo count, filter links, and clear completed button.
 * @class Footer
 */
class Footer extends Component {
    // Created once per instance, so a render of the footer does not re-render `Filter`.
    handleFilter = (filter) => {
        this.model.filter = filter;
    };

    template() {
        const { model } = this;
        const count = model.remaining.length;
        return this.html`
            <footer class="footer">
                <span class="todo-count">
                    <strong>${count}</strong> ${count === 1 ? 'item' : 'items'} left
                </span>

                <${Filter} currentFilter="${model.filter}" handleFilter=${this.handleFilter} />

                ${model.completed.length > 0 && this.html`
                    <button class="clear-completed" onClick=${() => model.removeCompleted()}>
                        Clear completed
                    </button>
                `}
            </footer>
        `;
    }
}

export default Footer;
