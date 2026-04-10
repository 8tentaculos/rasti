import { Component } from 'rasti';

/**
 * Get CSS class names for filter links based on current filter.
 * @param {string} filter The filter name.
 * @param {string} current The current active filter.
 * @return {string} CSS class names.
 * @private
 */
const getFilterClassName = (filter, current) => [
    filter,
    filter === current ? 'selected' : ''
].join(' ');

/**
 * Filter component for todo app.
 * Renders all three filter links (All, Remaining, Completed) in a list.
 * @class Filter
 */
const Filter = Component.create`
    <ul class="filters">
        <li>
            <a
                class="${({ props }) => getFilterClassName('all', props.currentFilter)}"
                onClick=${function() {
                    this.props.handleFilter('all');
                }}
            >
                All
            </a>
        </li>
        <li>
            <a
                class="${({ props }) => getFilterClassName('remaining', props.currentFilter)}"
                onClick=${function() {
                    this.props.handleFilter('remaining');
                }}
            >
                Remaining
            </a>
        </li>
        <li>
            <a
                class="${({ props }) => getFilterClassName('completed', props.currentFilter)}"
                onClick=${function() {
                    this.props.handleFilter('completed');
                }}
            >
                Completed
            </a>
        </li>
    </ul>
`;

export default Filter;
