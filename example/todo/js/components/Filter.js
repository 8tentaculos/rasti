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
const Filter = Component.create(({ props, html }) => html`
    <ul class="filters">
        ${filters.map(({ name, label }) => html`
            <li>
                <a
                    class="${[name, name === props.currentFilter && 'selected'].filter(Boolean).join(' ')}"
                    onClick=${() => props.handleFilter(name)}
                >
                    ${label}
                </a>
            </li>
        `)}
    </ul>
`);

export default Filter;
