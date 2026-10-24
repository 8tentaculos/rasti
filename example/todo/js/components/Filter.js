import { Component } from 'rasti';

/**
 * The filters, by the name the app model reads them with.
 * @type {Array<{name: string, label: string}>}
 * @private
 */
const filters = [
    { name : 'all', label : 'All' },
    { name : 'remaining', label : 'Remaining' },
    { name : 'completed', label : 'Completed' }
];

/**
 * Filter component for todo app.
 * Renders a link for each filter, marking the current one as selected.
 * @class Filter
 */
class Filter extends Component {
    template() {
        const { currentFilter, handleFilter } = this.props;
        return this.html`
            <ul class="filters">
                ${filters.map(({ name, label }) => this.html`
                    <li>
                        <a
                            class="${[name, name === currentFilter && 'selected'].filter(Boolean).join(' ')}"
                            onClick=${() => handleFilter(name)}
                        >
                            ${label}
                        </a>
                    </li>
                `)}
            </ul>
        `;
    }
}

export default Filter;
